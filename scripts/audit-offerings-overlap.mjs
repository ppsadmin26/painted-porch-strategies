#!/usr/bin/env node
/**
 * Phase 1 read-only audit: list every PPS path_finder_offerings row alongside
 * every Blue Door offerings row, with naive overlap matches and a topic-candidate
 * section (PPS rows that share a normalized base name across multiple deliveries).
 *
 * Writes:
 *   - docs/offerings-duplication-audit.md   (human-readable report)
 *   - docs/offerings-duplication-audit.json (sidecar consumed by /admin/offerings-coverage)
 *
 * Usage (Blue Door creds optional — script runs PPS-only when absent):
 *   PPS_URL=https://<pps-ref>.supabase.co \
 *   PPS_SERVICE_KEY=... \
 *   [BLUEDOOR_URL=https://<bd-ref>.supabase.co] \
 *   [BLUEDOOR_SERVICE_KEY=...] \
 *   node scripts/audit-offerings-overlap.mjs
 *
 * Falls back to SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY for the PPS connection
 * when PPS_URL / PPS_SERVICE_KEY are not set.
 *
 * Read-only. Never writes to either database.
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const PPS_URL = process.env.PPS_URL || process.env.SUPABASE_URL;
const PPS_SERVICE_KEY = process.env.PPS_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const BLUEDOOR_URL = process.env.BLUEDOOR_URL || process.env.BLUEDOOR_SUPABASE_URL;
const BLUEDOOR_SERVICE_KEY =
  process.env.BLUEDOOR_SERVICE_KEY || process.env.BLUEDOOR_SUPABASE_SERVICE_ROLE_KEY;

if (!PPS_URL || !PPS_SERVICE_KEY) {
  console.error("Missing PPS credentials (PPS_URL/PPS_SERVICE_KEY or SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY)");
  process.exit(1);
}
const hasBlueDoor = Boolean(BLUEDOOR_URL && BLUEDOOR_SERVICE_KEY);
if (!hasBlueDoor) {
  console.warn("Blue Door credentials not set — running in PPS-only mode (no cross-project overlap).");
}

const pps = createClient(PPS_URL, PPS_SERVICE_KEY, { auth: { persistSession: false } });
const bd = hasBlueDoor
  ? createClient(BLUEDOOR_URL, BLUEDOOR_SERVICE_KEY, { auth: { persistSession: false } })
  : null;

const norm = (s) => (s ?? "").toString().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// Strip common delivery-format suffixes so "AI EI Oh Workshop" and
// "AI EI Oh Keynote" collapse to the same topic base.
const FORMAT_WORDS = new Set([
  "workshop", "keynote", "talk", "speaking", "course", "lab", "labs",
  "masterclass", "intensive", "cohort", "sprint", "session", "program",
]);
const baseName = (s) =>
  norm(s)
    .split(" ")
    .filter((w) => w && !FORMAT_WORDS.has(w))
    .join(" ");

async function main() {
  const [ppsRes, bdRes] = await Promise.all([
    pps
      .from("path_finder_offerings")
      .select("offering_key,name,tier,facilitator,current_url,dedicated_url,is_live,sort_order")
      .order("sort_order"),
    hasBlueDoor
      ? bd
          .from("offerings")
          .select("offering_number,name,catalog_segment,facilitator,offering_type,status")
          .order("offering_number")
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (ppsRes.error) throw ppsRes.error;
  if (bdRes.error) throw bdRes.error;

  const ppsRows = ppsRes.data ?? [];
  const bdRows = bdRes.data ?? [];

  // Naive name match: each PPS row → first Blue Door row with same normalized name.
  const matched = ppsRows.map((p) => {
    const pn = norm(p.name);
    const m = bdRows.find((b) => norm(b.name) === pn);
    return { pps: p, bd: m ?? null };
  });
  const bdMatchedNums = new Set(matched.filter((r) => r.bd).map((r) => r.bd.offering_number));
  const bdOrphans = bdRows.filter((b) => !bdMatchedNums.has(b.offering_number));

  // Topic candidates: PPS rows that share a base name across multiple deliveries.
  const byBase = new Map();
  for (const p of ppsRows) {
    const k = baseName(p.name);
    if (!k) continue;
    if (!byBase.has(k)) byBase.set(k, []);
    byBase.get(k).push(p);
  }
  const topicCandidates = [...byBase.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([base, list]) => ({ base, deliveries: list }));

  const matchedCount = matched.filter((r) => r.bd).length;
  const ppsOnlyCount = matched.length - matchedCount;

  // ----- Markdown -----
  const out = [];
  out.push("# Offerings Duplication Audit");
  out.push("");
  out.push(`Generated: ${new Date().toISOString()}`);
  out.push("");
  out.push(
    `PPS rows: ${ppsRows.length} · Blue Door rows: ${bdRows.length} · ` +
      `Matched: ${matchedCount} · PPS-only: ${ppsOnlyCount} · BD-only: ${bdOrphans.length} · ` +
      `Topic candidates: ${topicCandidates.length}` +
      (hasBlueDoor ? "" : "  _(Blue Door not connected — re-run with creds for full picture)_"),
  );
  out.push("");

  out.push("## PPS rows (with naive Blue Door match)");
  out.push("");
  out.push("| PPS key | PPS name | Tier | Live | BD # | BD name | Segment | BD status | Manual review |");
  out.push("|---|---|---|---|---|---|---|---|---|");
  for (const { pps: p, bd: b } of matched) {
    out.push(
      `| \`${p.offering_key}\` | ${p.name} | ${p.tier ?? ""} | ${p.is_live ? "Y" : "n"} | ${b?.offering_number ?? ""} | ${b?.name ?? ""} | ${b?.catalog_segment ?? ""} | ${b?.status ?? ""} |  |`,
    );
  }
  out.push("");

  out.push("## Blue Door rows with no PPS match");
  out.push("");
  if (!hasBlueDoor) {
    out.push("_Blue Door not connected._");
  } else if (bdOrphans.length === 0) {
    out.push("_None._");
  } else {
    out.push("| BD # | BD name | Segment | Type | Status | Manual review |");
    out.push("|---|---|---|---|---|---|");
    for (const b of bdOrphans) {
      out.push(
        `| ${b.offering_number} | ${b.name} | ${b.catalog_segment ?? ""} | ${(b.offering_type ?? []).join(", ")} | ${b.status ?? ""} |  |`,
      );
    }
  }
  out.push("");

  out.push("## Topic candidates (PPS rows sharing a base name across deliveries)");
  out.push("");
  if (topicCandidates.length === 0) {
    out.push("_None detected._");
  } else {
    out.push("These are the seed list for the Phase 2 topic + delivery split.");
    out.push("");
    for (const { base, deliveries } of topicCandidates) {
      out.push(`### ${base}`);
      out.push("");
      out.push("| Key | Name | Tier | Live |");
      out.push("|---|---|---|---|");
      for (const d of deliveries) {
        out.push(`| \`${d.offering_key}\` | ${d.name} | ${d.tier ?? ""} | ${d.is_live ? "Y" : "n"} |`);
      }
      out.push("");
    }
  }
  out.push("");
  out.push(
    "> Fill the **Manual review** column with: `same` (same concept, different format), `merge`, `pps-only`, `bd-only`, or `archive`. This drives the Phase 2 backfill.",
  );

  const mdPath = "docs/offerings-duplication-audit.md";
  mkdirSync(dirname(mdPath), { recursive: true });
  writeFileSync(mdPath, out.join("\n"));
  console.log(`Wrote ${mdPath}`);

  // ----- JSON sidecar (consumed by /admin/offerings-coverage) -----
  const json = {
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
      .map((r) => ({
        pps_key: r.pps.offering_key,
        pps_name: r.pps.name,
        bd_number: r.bd.offering_number,
        bd_name: r.bd.name,
        bd_segment: r.bd.catalog_segment ?? null,
        bd_status: r.bd.status ?? null,
      })),
    topic_candidates: topicCandidates.map(({ base, deliveries }) => ({
      base,
      deliveries: deliveries.map((d) => ({
        offering_key: d.offering_key,
        name: d.name,
        tier: d.tier ?? null,
        is_live: !!d.is_live,
      })),
    })),
  };
  const jsonPath = "docs/offerings-duplication-audit.json";
  writeFileSync(jsonPath, JSON.stringify(json, null, 2));
  console.log(`Wrote ${jsonPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
