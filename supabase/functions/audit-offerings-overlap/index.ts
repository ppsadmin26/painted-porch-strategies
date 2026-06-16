import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const PPS_URL = Deno.env.get("SUPABASE_URL")!;
const PPS_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BLUEDOOR_URL = Deno.env.get("BLUEDOOR_SUPABASE_URL");
const BLUEDOOR_SERVICE_KEY = Deno.env.get("BLUEDOOR_SUPABASE_SERVICE_ROLE_KEY");

const FORMAT_WORDS = new Set([
  "workshop", "keynote", "talk", "speaking", "course", "lab", "labs",
  "masterclass", "intensive", "cohort", "sprint", "session", "program",
]);
const norm = (s: unknown) =>
  (s ?? "").toString().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const baseName = (s: unknown) =>
  norm(s).split(" ").filter((w) => w && !FORMAT_WORDS.has(w)).join(" ");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Admin gate: verify caller is admin in PPS
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(PPS_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: userRes } = await userClient.auth.getUser();
    if (!userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(PPS_URL, PPS_SERVICE_KEY, { auth: { persistSession: false } });
    const { data: isAdmin } = await admin.rpc("is_admin", { _user_id: userRes.user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hasBlueDoor = Boolean(BLUEDOOR_URL && BLUEDOOR_SERVICE_KEY);
    const bd = hasBlueDoor
      ? createClient(BLUEDOOR_URL!, BLUEDOOR_SERVICE_KEY!, { auth: { persistSession: false } })
      : null;

    const [ppsRes, bdRes] = await Promise.all([
      admin
        .from("path_finder_offerings")
        .select("offering_key,name,tier,facilitator,current_url,dedicated_url,is_live,sort_order")
        .order("sort_order"),
      bd
        ? bd
            .from("offerings")
            .select("offering_number,name,catalog_segment,facilitator,offering_type,status")
            .order("offering_number")
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (ppsRes.error) throw ppsRes.error;
    if (bdRes.error) throw bdRes.error;

    const ppsRows = ppsRes.data ?? [];
    const bdRows = (bdRes.data ?? []) as any[];

    const matched = ppsRows.map((p: any) => {
      const pn = norm(p.name);
      const m = bdRows.find((b: any) => norm(b.name) === pn);
      return { pps: p, bd: m ?? null };
    });
    const bdMatchedNums = new Set(
      matched.filter((r) => r.bd).map((r) => (r.bd as any).offering_number),
    );
    const bdOrphans = bdRows.filter((b: any) => !bdMatchedNums.has(b.offering_number));

    const byBase = new Map<string, any[]>();
    for (const p of ppsRows as any[]) {
      const k = baseName(p.name);
      if (!k) continue;
      if (!byBase.has(k)) byBase.set(k, []);
      byBase.get(k)!.push(p);
    }
    const topicCandidates = [...byBase.entries()]
      .filter(([, list]) => list.length > 1)
      .map(([base, list]) => ({
        base,
        deliveries: list.map((d) => ({
          offering_key: d.offering_key,
          name: d.name,
          tier: d.tier ?? null,
          is_live: !!d.is_live,
        })),
      }));

    const matchedCount = matched.filter((r) => r.bd).length;
    const ppsOnlyCount = matched.length - matchedCount;

    const result = {
      generated_at: new Date().toISOString(),
      blue_door_connected: hasBlueDoor,
      counts: {
        pps_rows: ppsRows.length,
        bd_rows: bdRows.length,
        matched: matchedCount,
        pps_only: ppsOnlyCount,
        bd_only: bdOrphans.length,
        topic_candidates: topicCandidates.length,
      },
      matched: matched
        .filter((r) => r.bd)
        .map((r: any) => ({
          pps_key: r.pps.offering_key,
          pps_name: r.pps.name,
          bd_number: r.bd.offering_number,
          bd_name: r.bd.name,
          bd_segment: r.bd.catalog_segment ?? null,
          bd_status: r.bd.status ?? null,
        })),
      bd_orphans: bdOrphans.map((b: any) => ({
        bd_number: b.offering_number,
        bd_name: b.name,
        bd_segment: b.catalog_segment ?? null,
        bd_type: b.offering_type ?? null,
        bd_status: b.status ?? null,
      })),
      topic_candidates: topicCandidates,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
