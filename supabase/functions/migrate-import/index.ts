// Phased migration import — reads a migrate-export folder from `backups`
// and rehydrates DB tables + storage files into THIS project.
//
// Phases:
//   POST { phase: "manifest", folder } -> { manifest, table_order }
//   POST { phase: "table", folder, table, upsert? } -> { rows }
//   POST { phase: "copy_batch", folder, bucket, paths[] } -> { copied, failed, errors }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { ZipReader, BlobReader, TextWriter } from "https://deno.land/x/zipjs@v2.7.45/index.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Order matters: parents before children.
const TABLE_ORDER = [
  "profiles",
  "blog_categories",
  "blog_posts",
  "blog_post_categories",
  "media_appearances",
  "media_appearance_categories",
  "youtube_videos",
  "youtube_video_categories",
  "site_video_slots",
  "site_videos",
  "page_status",
];

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

function guessContentType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif",
    webp: "image/webp", svg: "image/svg+xml", mp4: "video/mp4", mov: "video/quicktime",
    webm: "video/webm", pdf: "application/pdf", json: "application/json",
    html: "text/html", txt: "text/plain", css: "text/css",
  };
  return map[ext] ?? "application/octet-stream";
}

// Columns that reference auth.users.id and must be remapped (old id -> new id)
// when restoring into a fresh project.
const USER_FK_COLUMNS: Record<string, string[]> = {
  profiles: ["id"],
  blog_posts: ["author_id"],
  page_status: ["updated_by"],
  site_videos: ["updated_by"],
  site_video_slots: ["created_by"],
  backup_settings: ["updated_by"],
};

// Junction tables without an `id` PK — upsert must use composite key
const JUNCTION_CONFLICT_KEYS: Record<string, string> = {
  blog_post_categories: "post_id,category_id",
  media_appearance_categories: "appearance_id,category_id",
  youtube_video_categories: "video_id,category_id",
};

function remapUserIds(table: string, rows: any[], idMap: Record<string, string> | undefined) {
  if (!idMap || !rows?.length) return rows;
  const cols = USER_FK_COLUMNS[table];
  if (!cols?.length) return rows;
  const out: any[] = [];
  for (const r of rows) {
    const next = { ...r };
    let drop = false;
    for (const c of cols) {
      const v = next[c];
      if (typeof v === "string" && v) {
        if (idMap[v]) {
          next[c] = idMap[v];
        } else if (c === "id" && table === "profiles") {
          // No mapping for this profile -> the auth user wasn't recreated.
          // Skip it rather than violating the FK.
          drop = true;
          break;
        } else {
          // Nullable FK without mapping -> null it
          next[c] = null;
        }
      }
    }
    if (!drop) out.push(next);
  }
  return out;
}

async function recreateAuthUsers(
  sb: ReturnType<typeof admin>,
  users: { id: string; email: string | null; raw_user_meta_data?: any; full_name?: string | null; avatar_url?: string | null }[],
  opts: { sendInvites: boolean },
): Promise<{ idMap: Record<string, string>; created: number; matched: number; skipped: number; failures: { email: string | null; error: string }[] }> {
  const idMap: Record<string, string> = {};
  let created = 0, matched = 0, skipped = 0;
  const failures: { email: string | null; error: string }[] = [];

  // Build email -> existing user lookup once.
  const existingByEmail = new Map<string, string>();
  let page = 1;
  while (true) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) break;
    const list = data?.users ?? [];
    for (const u of list) {
      if (u.email) existingByEmail.set(u.email.toLowerCase(), u.id);
    }
    if (list.length < 1000) break;
    page++;
  }

  for (const u of users) {
    if (!u.email) { skipped++; continue; }
    const email = u.email.toLowerCase();
    const existingId = existingByEmail.get(email);
    if (existingId) {
      idMap[u.id] = existingId;
      matched++;
      continue;
    }
    try {
      const meta = u.raw_user_meta_data ?? {
        full_name: u.full_name ?? undefined,
        avatar_url: u.avatar_url ?? undefined,
      };
      if (opts.sendInvites) {
        const { data, error } = await sb.auth.admin.inviteUserByEmail(u.email, { data: meta });
        if (error || !data?.user) throw new Error(error?.message ?? "invite failed");
        idMap[u.id] = data.user.id;
      } else {
        const { data, error } = await sb.auth.admin.createUser({
          email: u.email,
          email_confirm: true,
          user_metadata: meta,
        });
        if (error || !data?.user) throw new Error(error?.message ?? "create failed");
        idMap[u.id] = data.user.id;
      }
      created++;
    } catch (err) {
      failures.push({ email: u.email, error: String((err as Error)?.message ?? err) });
    }
  }
  return { idMap, created, matched, skipped, failures };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!(await isCallerAdmin(req))) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({} as any));
    const phase: string = body.phase ?? "manifest";
    const sb = admin();

    // ----- PHASE 1: read manifest -----
    if (phase === "manifest") {
      const folder: string = body.folder;
      if (!folder) throw new Error("folder required");
      const { data: blob, error } = await sb.storage.from("backups").download(`${folder}/manifest.json`);
      if (error || !blob) throw new Error(`manifest: ${error?.message}`);
      const manifest = JSON.parse(await blob.text());
      return new Response(JSON.stringify({ ok: true, manifest, table_order: TABLE_ORDER }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ----- PHASE 1.5: apply full schema dump on the destination project -----
    if (phase === "schema") {
      const folder: string = body.folder;
      if (!folder) throw new Error("folder required");
      const path = body.sqlPath ?? `${folder}/schema.sql`;
      const { data: blob, error } = await sb.storage.from("backups").download(path);
      if (error || !blob) throw new Error(`schema.sql: ${error?.message}`);
      const sqlText = await blob.text();
      if (!sqlText.trim()) throw new Error("empty schema.sql");

      const { data, error: rErr } = await sb.rpc("admin_apply_sql", { _sql: sqlText });
      if (rErr) throw new Error(`apply: ${rErr.message}`);

      const { data: counts } = await sb.rpc("admin_schema_object_counts");
      return new Response(JSON.stringify({ ok: true, applied: data, post_counts: counts, bytes: sqlText.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ----- PHASE 1.6: apply non-secret config (storage buckets, storage RLS, realtime) -----
    if (phase === "config") {
      const folder: string = body.folder;
      if (!folder) throw new Error("folder required");
      const path = body.sqlPath ?? `${folder}/config.sql`;
      const { data: blob, error } = await sb.storage.from("backups").download(path);
      if (error || !blob) {
        // config.sql is optional — older backups don't have it.
        return new Response(JSON.stringify({ ok: true, skipped: true, reason: "no config.sql" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const sqlText = await blob.text();
      if (!sqlText.trim()) {
        return new Response(JSON.stringify({ ok: true, skipped: true, reason: "empty config.sql" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data, error: rErr } = await sb.rpc("admin_apply_sql", { _sql: sqlText });
      if (rErr) throw new Error(`apply config: ${rErr.message}`);
      return new Response(JSON.stringify({ ok: true, applied: data, bytes: sqlText.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    // Zip layout: json/<table>.json, csv/<table>.csv, storage-manifest.json,
    //             lovable-snapshot.json, schema.mmd, README.txt
    async function openZip(zipPath: string) {
      const { data: blob, error } = await sb.storage.from("backups").download(zipPath);
      if (error || !blob) throw new Error(`zip download: ${error?.message}`);
      const reader = new ZipReader(new BlobReader(blob));
      const entries = await reader.getEntries();
      return { reader, entries };
    }


    // ----- INTEGRITY VERIFY -----
    // Compares restored row counts (and storage object counts when available)
    // against the backup manifest/snapshot. Returns per-item status.
    // Body: { phase: "verify", folder?, zipPath?, buckets?: string[] }
    if (phase === "verify") {
      const folder: string | undefined = body.folder;
      const zipPath: string | undefined = body.zipPath;
      const checkBuckets: string[] = body.buckets ?? ["blog-images", "email-assets", "site-videos"];

      let expectedTables: Record<string, number> = {};
      let expectedBuckets: Record<string, { count: number; bytes?: number }> = {};
      let source: "folder" | "zip";
      if (zipPath) {
        source = "zip";
        const { reader, entries } = await openZip(zipPath);
        const snap = entries.find((e) => !e.directory && e.filename === "lovable-snapshot.json");
        const sman = entries.find((e) => !e.directory && e.filename === "storage-manifest.json");
        if (snap) {
          try {
            const j = JSON.parse(await snap.getData!(new TextWriter()));
            if (j.table_row_counts) expectedTables = j.table_row_counts;
          } catch { /* ignore */ }
        }
        if (sman) {
          try {
            const j = JSON.parse(await sman.getData!(new TextWriter()));
            if (j.buckets) expectedBuckets = j.buckets;
          } catch { /* ignore */ }
        }
        if (!Object.keys(expectedTables).length) {
          for (const e of entries) {
            if (e.directory) continue;
            if (e.filename.startsWith("json/") && e.filename.endsWith(".json")) {
              const t = e.filename.slice(5, -5);
              try {
                const arr = JSON.parse(await e.getData!(new TextWriter()));
                expectedTables[t] = Array.isArray(arr) ? arr.length : 0;
              } catch { /* ignore */ }
            }
          }
        }
        await reader.close();
      } else if (folder) {
        source = "folder";
        const { data: mblob, error: mErr } = await sb.storage.from("backups").download(`${folder}/manifest.json`);
        if (mErr || !mblob) throw new Error(`manifest: ${mErr?.message}`);
        const manifest = JSON.parse(await mblob.text());
        if (manifest?.tables) {
          for (const [t, rows] of Object.entries<any>(manifest.tables)) {
            expectedTables[t] = Array.isArray(rows) ? rows.length : 0;
          }
        }
        if (manifest?.buckets) {
          for (const [b, objs] of Object.entries<any>(manifest.buckets)) {
            expectedBuckets[b] = {
              count: Array.isArray(objs) ? objs.length : 0,
              bytes: Array.isArray(objs) ? objs.reduce((s: number, o: any) => s + (o?.size ?? 0), 0) : 0,
            };
          }
        }
      } else {
        throw new Error("folder or zipPath required");
      }

      const tables: any[] = [];
      const tableNames = Array.from(new Set([...Object.keys(expectedTables), ...TABLE_ORDER]));
      for (const t of tableNames) {
        const expected = expectedTables[t] ?? 0;
        try {
          const { count, error } = await sb.from(t).select("*", { head: true, count: "exact" });
          if (error) {
            tables.push({ table: t, expected, actual: 0, diff: -expected, status: "error", error: error.message });
            continue;
          }
          const actual = count ?? 0;
          const diff = actual - expected;
          let status: "ok" | "missing" | "extra" = "ok";
          if (diff < 0) status = "missing";
          else if (diff > 0) status = "extra";
          tables.push({ table: t, expected, actual, diff, status });
        } catch (e: any) {
          tables.push({ table: t, expected, actual: 0, diff: -expected, status: "error", error: e?.message || String(e) });
        }
      }

      async function countBucket(bucket: string): Promise<{ count: number; bytes: number; error?: string }> {
        let count = 0, bytes = 0;
        async function walk(prefix: string) {
          let offset = 0;
          while (true) {
            const { data, error } = await sb.storage.from(bucket).list(prefix, {
              limit: 1000, offset, sortBy: { column: "name", order: "asc" },
            });
            if (error) throw new Error(error.message);
            if (!data?.length) return;
            for (const item of data) {
              const isFolder = item.id === null;
              const path = prefix ? `${prefix}/${item.name}` : item.name;
              if (isFolder) await walk(path);
              else { count++; bytes += (item.metadata as any)?.size ?? 0; }
            }
            if (data.length < 1000) return;
            offset += data.length;
          }
        }
        try { await walk(""); return { count, bytes }; }
        catch (e: any) { return { count, bytes, error: e?.message || String(e) }; }
      }

      const buckets: any[] = [];
      const allBuckets = Array.from(new Set([...checkBuckets, ...Object.keys(expectedBuckets)]));
      for (const b of allBuckets) {
        const exp = expectedBuckets[b];
        const r = await countBucket(b);
        const expected = exp?.count ?? 0;
        const diff = r.count - expected;
        let status: "ok" | "missing" | "extra" | "unknown" | "error" = "ok";
        if (r.error) status = "error";
        else if (!exp) status = "unknown";
        else if (diff < 0) status = "missing";
        else if (diff > 0) status = "extra";
        buckets.push({
          bucket: b, expected, actual: r.count, diff,
          expected_bytes: exp?.bytes, actual_bytes: r.bytes,
          status, error: r.error,
        });
      }

      const summary = {
        tables_checked: tables.length,
        tables_ok: tables.filter((t) => t.status === "ok").length,
        tables_mismatch: tables.filter((t) => t.status !== "ok").length,
        buckets_checked: buckets.length,
        buckets_ok: buckets.filter((b) => b.status === "ok").length,
        buckets_mismatch: buckets.filter((b) => b.status !== "ok" && b.status !== "unknown").length,
      };

      return new Response(JSON.stringify({ ok: true, source: source!, tables, buckets, summary }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (phase === "zip_manifest") {
      const zipPath: string = body.zipPath;
      if (!zipPath) throw new Error("zipPath required");
      const { reader, entries } = await openZip(zipPath);
      const tables: string[] = [];
      const tableRows: Record<string, number> = {};
      let snapshot: any = null;
      let storageManifest: any = null;
      for (const e of entries) {
        if (e.directory) continue;
        const name = e.filename;
        if (name.startsWith("json/") && name.endsWith(".json")) {
          const t = name.slice(5, -5);
          tables.push(t);
          // Row count via parsing — keep cheap-ish, snapshot has counts too
        } else if (name === "lovable-snapshot.json") {
          const txt = await e.getData!(new TextWriter());
          try { snapshot = JSON.parse(txt); } catch { /* ignore */ }
        } else if (name === "storage-manifest.json") {
          const txt = await e.getData!(new TextWriter());
          try { storageManifest = JSON.parse(txt); } catch { /* ignore */ }
        }
      }
      await reader.close();
      if (snapshot?.table_row_counts) {
        for (const [t, n] of Object.entries(snapshot.table_row_counts)) {
          tableRows[t] = n as number;
        }
      }
      const ordered = TABLE_ORDER.filter((t) => tables.includes(t));
      const extras = tables.filter((t) => !TABLE_ORDER.includes(t));
      return new Response(JSON.stringify({
        ok: true,
        tables: ordered,
        extras,
        table_order: TABLE_ORDER,
        table_rows: tableRows,
        snapshot,
        storage_manifest: storageManifest,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ----- AUTH USERS: recreate users in this project from auth-users.json -----
    // Returns an idMap (old_user_id -> new_user_id) the caller must pass back
    // into subsequent table phases so profile/author_id rows land correctly.
    if (phase === "zip_auth_users" || phase === "auth_users") {
      const sendInvites = body.sendInvites !== false; // default: invite via email
      let users: any[] = [];
      if (phase === "zip_auth_users") {
        const zipPath: string = body.zipPath;
        if (!zipPath) throw new Error("zipPath required");
        const { reader, entries } = await openZip(zipPath);
        const target = entries.find((e) => !e.directory && e.filename === "auth-users.json");
        if (!target) {
          await reader.close();
          return new Response(JSON.stringify({ ok: true, skipped: true, reason: "auth-users.json not in zip", idMap: {}, created: 0, matched: 0, skipped: 0, failures: [] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const txt = await target.getData!(new TextWriter());
        await reader.close();
        users = JSON.parse(txt);
      } else {
        const folder: string = body.folder;
        if (!folder) throw new Error("folder required");
        const { data: blob, error } = await sb.storage.from("backups").download(`${folder}/auth-users.json`);
        if (error || !blob) {
          return new Response(JSON.stringify({ ok: true, skipped: true, reason: `auth-users.json not found: ${error?.message}`, idMap: {}, created: 0, matched: 0, skipped: 0, failures: [] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        users = JSON.parse(await blob.text());
      }
      if (!Array.isArray(users)) users = [];
      const result = await recreateAuthUsers(sb, users, { sendInvites });
      return new Response(JSON.stringify({ ok: true, total: users.length, ...result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (phase === "zip_table") {
      const zipPath: string = body.zipPath;
      const table: string = body.table;
      const upsert = body.upsert !== false;
      const idMap: Record<string, string> | undefined = body.idMap;
      if (!zipPath || !table) throw new Error("zipPath and table required");
      const { reader, entries } = await openZip(zipPath);
      const target = entries.find((e) => !e.directory && e.filename === `json/${table}.json`);
      if (!target) {
        await reader.close();
        return new Response(JSON.stringify({ ok: true, rows: 0, skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const txt = await target.getData!(new TextWriter());
      await reader.close();
      let rows = JSON.parse(txt);
      if (!Array.isArray(rows) || rows.length === 0) {
        return new Response(JSON.stringify({ ok: true, rows: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const before = rows.length;
      rows = remapUserIds(table, rows, idMap);
      const dropped = before - rows.length;
      const CHUNK = 200;
      const conflictKey = JUNCTION_CONFLICT_KEYS[table] ?? "id";
      for (let i = 0; i < rows.length; i += CHUNK) {
        const slice = rows.slice(i, i + CHUNK);
        const { error: e } = upsert
          ? await sb.from(table).upsert(slice, { onConflict: conflictKey })
          : await sb.from(table).insert(slice);
        if (e) throw new Error(`${table}: ${e.message}`);
      }
      return new Response(JSON.stringify({ ok: true, rows: rows.length, dropped_unmapped: dropped }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (phase === "table") {
      const folder: string = body.folder;
      const table: string = body.table;
      const upsert = body.upsert !== false;
      const idMap: Record<string, string> | undefined = body.idMap;
      if (!folder || !table) throw new Error("folder and table required");

      const { data: blob, error } = await sb.storage.from("backups").download(`${folder}/tables.json`);
      if (error || !blob) throw new Error(`tables.json: ${error?.message}`);
      const tables = JSON.parse(await blob.text());
      let rows = tables[table] ?? [];
      if (!Array.isArray(rows) || rows.length === 0) {
        return new Response(JSON.stringify({ ok: true, rows: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const before = rows.length;
      rows = remapUserIds(table, rows, idMap);
      const dropped = before - rows.length;

      const CHUNK = 200;
      const conflictKey2 = JUNCTION_CONFLICT_KEYS[table] ?? "id";
      for (let i = 0; i < rows.length; i += CHUNK) {
        const slice = rows.slice(i, i + CHUNK);
        const { error: e } = upsert
          ? await sb.from(table).upsert(slice, { onConflict: conflictKey2 })
          : await sb.from(table).insert(slice);
        if (e) throw new Error(`${table}: ${e.message}`);
      }
      return new Response(JSON.stringify({ ok: true, rows: rows.length, dropped_unmapped: dropped }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ----- CROSS-PROJECT PULL -----
    // Pull a backup folder/zip from a SOURCE project's `backups` bucket into THIS
    // project's `backups` bucket — no manual download/upload required.
    //
    // Two sub-phases (chunked to avoid edge timeouts on large folders):
    //   pull_list   { sourceUrl, sourceToken, path }            -> { files: [{name,size,url}] }
    //   pull_batch  { files: [{url, destPath}], upsert? }       -> { copied, failed, errors, bytes }
    //
    // sourceUrl   = source project's functions base, e.g. "https://abc.functions.supabase.co"
    // sourceToken = admin JWT from the source project (used to call its auto-backup function)
    // path        = either a folder ("pps-backup-2025-...") or a single zip ("pps-restore-...zip")
    async function callSourceAutoBackup(sourceUrl: string, sourceToken: string, body: any) {
      const base = sourceUrl.replace(/\/+$/, "");
      const url = base.endsWith("/auto-backup") ? base : `${base}/auto-backup`;
      const r = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sourceToken}`,
        },
        body: JSON.stringify(body),
      });
      const text = await r.text();
      let json: any = {};
      try { json = JSON.parse(text); } catch { /* ignore */ }
      if (!r.ok || json?.error) {
        throw new Error(`source auto-backup ${r.status}: ${json?.error ?? text.slice(0, 200)}`);
      }
      return json;
    }

    if (phase === "pull_list") {
      const sourceUrl: string = body.sourceUrl;
      const sourceToken: string = body.sourceToken;
      const path: string = body.path ?? "";
      const sourceBucket: string = body.sourceBucket ?? "backups";
      if (!sourceUrl || !sourceToken) {
        throw new Error("sourceUrl and sourceToken required");
      }
      if (sourceBucket === "backups" && !path) {
        throw new Error("path required when listing the backups bucket");
      }
      const result = await callSourceAutoBackup(sourceUrl, sourceToken, {
        action: "list-files",
        path,
        bucket: sourceBucket,
      });
      const files = (result.files ?? []).filter((f: any) => f.url && !f.name.endsWith("/__state.json"));
      return new Response(JSON.stringify({
        ok: true,
        folder: result.folder ?? path,
        bucket: result.bucket ?? sourceBucket,
        files: files.map((f: any) => ({ name: f.name, size: f.size ?? 0, url: f.url })),
        total: files.length,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (phase === "pull_batch") {
      const files: { url: string; destPath: string }[] = body.files ?? [];
      const upsert = body.upsert !== false;
      const destBucket: string = body.destBucket ?? "backups";
      if (!Array.isArray(files) || !files.length) {
        return new Response(JSON.stringify({ ok: true, copied: 0, failed: 0, bytes: 0, errors: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      let copied = 0, failed = 0, bytes = 0;
      const errors: string[] = [];
      for (const f of files) {
        try {
          const r = await fetch(f.url);
          if (!r.ok) throw new Error(`fetch ${r.status}`);
          const blob = await r.blob();
          bytes += blob.size;
          const ct = r.headers.get("content-type") || guessContentType(f.destPath);
          const { error: upErr } = await sb.storage
            .from(destBucket)
            .upload(f.destPath, blob, { contentType: ct, upsert });
          if (upErr) throw new Error(upErr.message);
          copied++;
        } catch (err) {
          failed++;
          errors.push(`${f.destPath}: ${(err as Error)?.message ?? err}`);
        }
      }
      return new Response(JSON.stringify({ ok: true, copied, failed, bytes, errors }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ----- PHASE 3: copy a batch of storage files from backups/<folder>/storage/<bucket>/<path> back to <bucket>/<path> -----
    if (phase === "copy_batch") {
      const folder: string = body.folder;
      const bucket: string = body.bucket;
      const paths: string[] = body.paths ?? [];
      if (!folder || !bucket) throw new Error("folder and bucket required");

      let copied = 0, failed = 0;
      const errors: string[] = [];
      for (const p of paths) {
        const src = `${folder}/storage/${bucket}/${p}`;
        // Cross-bucket copy from backups -> <bucket>
        const { error: cpErr } = await sb.storage
          .from("backups")
          .copy(src, p, { destinationBucket: bucket } as any);
        if (!cpErr) { copied++; continue; }

        // Fallback: download + upload
        const { data: blob, error: dlErr } = await sb.storage.from("backups").download(src);
        if (dlErr || !blob) { failed++; errors.push(`${bucket}/${p}: ${dlErr?.message ?? cpErr.message}`); continue; }
        const { error: upErr } = await sb.storage.from(bucket).upload(p, blob, {
          contentType: guessContentType(p), upsert: true,
        });
        if (upErr) { failed++; errors.push(`${bucket}/${p}: ${upErr.message}`); }
        else copied++;
      }
      return new Response(JSON.stringify({ ok: true, copied, failed, errors }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `unknown phase: ${phase}` }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("migrate-import error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
