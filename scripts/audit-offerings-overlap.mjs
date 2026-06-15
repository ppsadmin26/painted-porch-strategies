#!/usr/bin/env node
/**
 * Phase 1 read-only audit: list every PPS path_finder_offerings row alongside
 * every Blue Door offerings row, with a naive overlap match. Writes a
 * markdown table to docs/offerings-duplication-audit.md for manual review.
 *
 * Usage:
 *   PPS_URL=https://<pps-ref>.supabase.co \
 *   PPS_SERVICE_KEY=... \
 *   BLUEDOOR_URL=https://<bd-ref>.supabase.co \
 *   BLUEDOOR_SERVICE_KEY=... \
 *   node scripts/audit-offerings-overlap.mjs
 *
 * Read-only. Never writes to either database.
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const PPS_URL = process.env.PPS_URL;
const PPS_SERVICE_KEY = process.env.PPS_SERVICE_KEY;
const BLUEDOOR_URL = process.env.BLUEDOOR_URL;
const BLUEDOOR_SERVICE_KEY = process.env.BLUEDOOR_SERVICE_KEY;

function need(name, val) {
  if (!val) {
    console.error(`Missing env: ${name}`);
    process.exit(1);
  }
}
need("PPS_URL", PPS_URL);
need("PPS_SERVICE_KEY", PPS_SERVICE_KEY);
need("BLUEDOOR_URL", BLUEDOOR_URL);
need("BLUEDOOR_SERVICE_KEY", BLUEDOOR_SERVICE_KEY);

const pps = createClient(PPS_URL, PPS_SERVICE_KEY, { auth: { persistSession: false } });
const bd = createClient(BLUEDOOR_URL, BLUEDOOR_SERVICE_KEY, { auth: { persistSession: false } });

const norm = (s) => (s ?? "").toString().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

async function main() {
  const [ppsRes, bdRes] = await Promise.all([
    pps.from("path_finder_offerings").select("offering_key,name,tier,facilitator,current_url,dedicated_url,is_live").order("sort_order"),
    bd.from("offerings").select("offering_number,name,catalog_segment,facilitator,offering_type,status").order("offering_number"),
  ]);
  if (ppsRes.error) throw ppsRes.error;
  if (bdRes.error) throw bdRes.error;

  const ppsRows = ppsRes.data ?? [];
  const bdRows = bdRes.data ?? [];

  // Naive match: every PPS row → best Blue Door row by normalized-name overlap.
  const rows = ppsRows.map((p) => {
    const pn = norm(p.name);
    const match = bdRows.find((b) => norm(b.name) === pn);
    return { pps: p, bd: match ?? null };
  });

  // Blue Door rows not matched by any PPS row
  const bdMatched = new Set(rows.filter((r) => r.bd).map((r) => r.bd.offering_number));
  const bdOrphans = bdRows.filter((b) => !bdMatched.has(b.offering_number));

  const out = [];
  out.push("# Offerings Duplication Audit");
  out.push("");
  out.push(`Generated: ${new Date().toISOString()}`);
  out.push("");
  out.push(`PPS rows: ${ppsRows.length} · Blue Door rows: ${bdRows.length} · Naive matches: ${rows.filter((r) => r.bd).length}`);
  out.push("");
  out.push("## PPS rows (with naive Blue Door match)");
  out.push("");
  out.push("| PPS key | PPS name | Tier | Live | BD # | BD name | Segment | BD status | Manual review |");
  out.push("|---|---|---|---|---|---|---|---|---|");
  for (const { pps: p, bd: b } of rows) {
    out.push(`| \`${p.offering_key}\` | ${p.name} | ${p.tier} | ${p.is_live ? "Y" : "n"} | ${b?.offering_number ?? ""} | ${b?.name ?? ""} | ${b?.catalog_segment ?? ""} | ${b?.status ?? ""} |  |`);
  }
  out.push("");
  out.push("## Blue Door rows with no PPS match");
  out.push("");
  out.push("| BD # | BD name | Segment | Type | Status | Manual review |");
  out.push("|---|---|---|---|---|---|");
  for (const b of bdOrphans) {
    out.push(`| ${b.offering_number} | ${b.name} | ${b.catalog_segment} | ${(b.offering_type ?? []).join(", ")} | ${b.status} |  |`);
  }
  out.push("");
  out.push("> Fill the **Manual review** column with: `same` (same concept, just split format), `merge`, `pps-only`, `bd-only`, or `archive`. This drives the Phase 2 backfill.");

  const outPath = "docs/offerings-duplication-audit.md";
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, out.join("\n"));
  console.log(`Wrote ${outPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
