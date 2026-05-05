// Phased migration export — avoids CPU limits by doing small chunks per request.
// Output goes to backups bucket as a FOLDER (no zip): backups/<folder>/tables.json,
// backups/<folder>/manifest.json, backups/<folder>/storage/<bucket>/<path>.
//
// Phases:
//   POST { phase: "tables" }
//     -> { folder, buckets: { [bucket]: [{path,size}, ...] }, table_rows }
//   POST { phase: "copy_batch", folder, bucket, paths: string[] }
//     -> { copied, failed, errors }
//   POST { phase: "finalize", folder, buckets, table_rows }
//     -> { ok, folder, manifest_path }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const TABLES = [
  "blog_categories",
  "blog_post_categories",
  "blog_posts",
  "media_appearance_categories",
  "media_appearances",
  "page_status",
  "profiles",
  "site_video_slots",
  "site_videos",
  "youtube_video_categories",
  "youtube_videos",
];

const BUCKETS = ["blog-images", "email-assets", "site-videos"];

function admin() {
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function isCallerAdmin(req: Request): Promise<boolean> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: u } = await userClient.auth.getUser();
  if (!u?.user) return false;
  const { data } = await admin().from("profiles").select("role").eq("id", u.user.id).maybeSingle();
  return data?.role === "admin";
}

async function fetchAllRows(sb: ReturnType<typeof admin>, table: string) {
  const PAGE = 1000;
  const all: Record<string, unknown>[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await sb.from(table).select("*").range(from, from + PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    if (!data?.length) break;
    all.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

async function listBucket(sb: ReturnType<typeof admin>, bucket: string) {
  const all: { path: string; size: number }[] = [];
  async function walk(prefix: string) {
    let offset = 0;
    while (true) {
      const { data, error } = await sb.storage
        .from(bucket)
        .list(prefix, { limit: 1000, offset, sortBy: { column: "name", order: "asc" } });
      if (error) throw new Error(`list ${bucket}/${prefix}: ${error.message}`);
      if (!data?.length) break;
      for (const obj of data) {
        if (obj.id === null) {
          await walk(prefix ? `${prefix}/${obj.name}` : obj.name);
        } else {
          all.push({
            path: prefix ? `${prefix}/${obj.name}` : obj.name,
            size: (obj.metadata?.size as number) ?? 0,
          });
        }
      }
      if (data.length < 1000) break;
      offset += 1000;
    }
  }
  await walk("");
  return all;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!(await isCallerAdmin(req))) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({} as any));
    const phase: string = body.phase ?? "tables";
    const sb = admin();

    // ---------- PHASE 1: tables + listing ----------
    if (phase === "tables") {
      const stamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19) + "Z";
      const folder = body.folder ?? `pps-migrate-${stamp}`;

      const tables: Record<string, unknown[]> = {};
      const rowCounts: Record<string, number> = {};
      for (const t of TABLES) {
        const rows = await fetchAllRows(sb, t);
        tables[t] = rows;
        rowCounts[t] = rows.length;
      }

      const tablesPath = `${folder}/tables.json`;
      const tablesBlob = new Blob([JSON.stringify(tables)], { type: "application/json" });
      const { error: upErr } = await sb.storage
        .from("backups")
        .upload(tablesPath, tablesBlob, { contentType: "application/json", upsert: true });
      if (upErr) throw new Error(`upload tables.json: ${upErr.message}`);

      const buckets: Record<string, { path: string; size: number }[]> = {};
      for (const b of BUCKETS) {
        try { buckets[b] = await listBucket(sb, b); }
        catch (e) { console.warn(`list ${b}: ${e}`); buckets[b] = []; }
      }

      return new Response(JSON.stringify({
        ok: true, folder, table_rows: rowCounts, buckets,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ---------- PHASE 2: copy a batch of storage files cross-bucket ----------
    if (phase === "copy_batch") {
      const folder: string = body.folder;
      const bucket: string = body.bucket;
      const paths: string[] = body.paths ?? [];
      if (!folder || !bucket) throw new Error("folder and bucket required");

      let copied = 0, failed = 0;
      const errors: string[] = [];
      for (const p of paths) {
        const dest = `${folder}/storage/${bucket}/${p}`;
        // Try cross-bucket copy first (fast, no download).
        const { error: cpErr } = await sb.storage
          .from(bucket)
          .copy(p, dest, { destinationBucket: "backups" } as any);
        if (!cpErr) { copied++; continue; }

        // Fallback: download + re-upload (works on older supabase-js too).
        const { data: blob, error: dlErr } = await sb.storage.from(bucket).download(p);
        if (dlErr || !blob) { failed++; errors.push(`${bucket}/${p}: ${dlErr?.message ?? cpErr.message}`); continue; }
        const { error: upErr } = await sb.storage
          .from("backups")
          .upload(dest, blob, { upsert: true, contentType: blob.type || "application/octet-stream" });
        if (upErr) { failed++; errors.push(`${bucket}/${p}: ${upErr.message}`); }
        else copied++;
      }

      return new Response(JSON.stringify({ ok: true, copied, failed, errors }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---------- PHASE 2.5: schema dump (full SQL: enums, tables, fns, triggers, policies, indexes) ----------
    if (phase === "schema") {
      const folder: string = body.folder;
      if (!folder) throw new Error("folder required");

      const { data: dump, error: dErr } = await sb.rpc("admin_dump_schema");
      if (dErr) throw new Error(`dump_schema: ${dErr.message}`);
      const { data: counts, error: cErr } = await sb.rpc("admin_schema_object_counts");
      if (cErr) throw new Error(`schema_counts: ${cErr.message}`);

      const sqlText = String(dump ?? "");
      const sqlPath = `${folder}/schema.sql`;
      const { error: upErr } = await sb.storage
        .from("backups")
        .upload(sqlPath, new Blob([sqlText], { type: "application/sql" }), {
          contentType: "application/sql", upsert: true,
        });
      if (upErr) throw new Error(`upload schema.sql: ${upErr.message}`);

      // Audit: count what's IN the dump and compare against live DB.
      const found = {
        enums:    (sqlText.match(/CREATE TYPE public\./g) ?? []).length,
        tables:   (sqlText.match(/CREATE TABLE IF NOT EXISTS public\./g) ?? []).length,
        functions:(sqlText.match(/^CREATE OR REPLACE FUNCTION /gm) ?? []).length,
        triggers: (sqlText.match(/^CREATE TRIGGER /gm) ?? []).length,
        policies: (sqlText.match(/^CREATE POLICY /gm) ?? []).length,
        indexes:  (sqlText.match(/^CREATE INDEX IF NOT EXISTS /gm) ?? []).length,
      };
      const expected = counts as Record<string, number>;
      const missing: Record<string, { expected: number; found: number }> = {};
      for (const k of Object.keys(found)) {
        if ((expected[k] ?? 0) !== (found as any)[k]) {
          missing[k] = { expected: expected[k] ?? 0, found: (found as any)[k] };
        }
      }
      const audit = {
        complete: Object.keys(missing).length === 0,
        expected, found, missing,
        bytes: sqlText.length,
        sql_path: sqlPath,
      };
      await sb.storage
        .from("backups")
        .upload(`${folder}/schema-audit.json`, new Blob([JSON.stringify(audit, null, 2)], { type: "application/json" }), {
          contentType: "application/json", upsert: true,
        });

      return new Response(JSON.stringify({ ok: true, ...audit }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---------- PHASE 2.6: non-secret config dump (storage buckets, storage RLS, realtime) ----------
    if (phase === "config") {
      const folder: string = body.folder;
      if (!folder) throw new Error("folder required");
      const { data: dump, error: dErr } = await sb.rpc("admin_dump_config");
      if (dErr) throw new Error(`dump_config: ${dErr.message}`);
      const sqlText = String(dump ?? "");
      const sqlPath = `${folder}/config.sql`;
      const { error: upErr } = await sb.storage
        .from("backups")
        .upload(sqlPath, new Blob([sqlText], { type: "application/sql" }), {
          contentType: "application/sql", upsert: true,
        });
      if (upErr) throw new Error(`upload config.sql: ${upErr.message}`);
      return new Response(JSON.stringify({ ok: true, bytes: sqlText.length, sql_path: sqlPath }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    if (phase === "finalize") {
      const folder: string = body.folder;
      const manifest = {
        version: 3,
        format: "folder",
        generated_at: new Date().toISOString(),
        schema_sql: `${folder}/schema.sql`,
        schema_audit: `${folder}/schema-audit.json`,
        config_sql: `${folder}/config.sql`,
        tables: body.table_rows ?? {},
        buckets: body.buckets ?? {},
      };
      const { error: upErr } = await sb.storage
        .from("backups")
        .upload(`${folder}/manifest.json`, new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" }), {
          contentType: "application/json", upsert: true,
        });
      if (upErr) throw new Error(`manifest: ${upErr.message}`);

      return new Response(JSON.stringify({ ok: true, folder, manifest_path: `${folder}/manifest.json` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `unknown phase: ${phase}` }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("migrate-export error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
