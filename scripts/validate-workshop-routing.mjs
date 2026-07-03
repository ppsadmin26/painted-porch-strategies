#!/usr/bin/env node
/**
 * Workshop / Keynote / Speaking routing validator.
 *
 * Read-only. Applies the same rules as
 * `src/lib/workshopRoutingValidation.ts` against every row in
 * `path_finder_offerings`, plus a source-tree check that every featured
 * workshop's anchor_id is actually rendered on
 * `src/pages/pps/partner/amplify/AmplifyWorkshops.tsx`.
 *
 * Optional `--live` flag: probes the target URLs against a running Vite
 * preview on http://localhost:8080 to catch 404s.
 *
 * Outputs:
 *   docs/workshop-routing-audit.json
 * Exit code:
 *   0 on clean, 1 on any error.
 *
 * Usage:
 *   PPS_URL=... PPS_SERVICE_KEY=... node scripts/validate-workshop-routing.mjs [--live]
 *   (falls back to SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const PPS_URL = process.env.PPS_URL || process.env.SUPABASE_URL;
const PPS_SERVICE_KEY = process.env.PPS_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const OUT_PATH = "docs/workshop-routing-audit.json";
const LIVE = process.argv.includes("--live");
const LIVE_BASE = process.env.PPS_LIVE_BASE || "http://localhost:8080";

if (!PPS_URL || !PPS_SERVICE_KEY) {
  console.error("[routing] Missing PPS credentials — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  // Skip cleanly in local dev where secrets aren't wired; CI provides them.
  writeReport({ skipped: "missing-credentials", rows: [], summary: emptySummary() });
  process.exit(0);
}

/**
 * The validator library is TS. We reimplement its exact rule set here to
 * avoid pulling ts-node into the build. Kept structurally identical to
 * `src/lib/workshopRoutingValidation.ts` — update in lockstep.
 */
const DEDICATED_LANDING_KEYS = new Set(["stracticalLeader", "kickTheHabit"]);
const SPEAKER_PAGE_URLS = new Set(["/speaking/amy", "/speaking/rob"]);
const ROUTING_FORMATS = new Set(["workshop", "keynote", "speaking"]);
const WORKSHOPS_URL = "/partner/amplify/workshops";
const SPEAKING_TOPICS_URL = "/speaking/topics";

function isRoutingRelevant(r) {
  return (
    ROUTING_FORMATS.has((r.delivery_format || "").toLowerCase()) ||
    !!r.include_in_workshops ||
    !!r.is_keynote ||
    !!r.include_on_speaker_page
  );
}

function validateRow(row, featuredAnchorIds) {
  const issues = [];
  if (!isRoutingRelevant(row)) return issues;

  const current = (row.current_url || "").trim();
  const anchor = (row.anchor_id || "").trim();
  const topicSlug = (row.topic_slug || "").trim();
  const isDedicated = DEDICATED_LANDING_KEYS.has(row.offering_key);

  if (row.include_in_workshops) {
    if (current !== WORKSHOPS_URL) {
      issues.push({ level: "error", code: "FEATURED_WRONG_URL", message: `Featured workshop must route to ${WORKSHOPS_URL} (got "${current || "∅"}").` });
    }
    if (!anchor) {
      issues.push({ level: "error", code: "FEATURED_MISSING_ANCHOR", message: "Featured workshop is missing anchor_id." });
    } else if (featuredAnchorIds && !featuredAnchorIds.has(anchor)) {
      issues.push({ level: "error", code: "FEATURED_ANCHOR_UNRENDERED", message: `anchor_id "${anchor}" is not rendered on /partner/amplify/workshops.` });
    }
    return issues;
  }

  if (row.include_on_speaker_page) {
    if (!SPEAKER_PAGE_URLS.has(current)) {
      issues.push({ level: "error", code: "SPEAKER_WRONG_URL", message: `Speaker-page row has current_url "${current || "∅"}" — not a registered speaker page.` });
    }
    if (!anchor) {
      issues.push({ level: "warning", code: "SPEAKER_MISSING_ANCHOR", message: "Speaker-page row is missing anchor_id." });
    }
    return issues;
  }

  if (isDedicated) return issues;

  if (current !== SPEAKING_TOPICS_URL) {
    issues.push({ level: "error", code: "TOPIC_WRONG_URL", message: `Workshop/keynote/speaking rows must route to ${SPEAKING_TOPICS_URL} (got "${current || "∅"}").` });
  }
  if (!topicSlug) {
    issues.push({ level: "error", code: "TOPIC_SLUG_MISSING", message: "topic_slug is required." });
  }
  if (topicSlug && anchor && anchor !== topicSlug) {
    issues.push({ level: "error", code: "TOPIC_SLUG_MISMATCH", message: `anchor_id "${anchor}" must match topic_slug "${topicSlug}".` });
  }
  if (topicSlug && !anchor) {
    issues.push({ level: "error", code: "TOPIC_ANCHOR_MISSING", message: `anchor_id must be set to "${topicSlug}".` });
  }
  return issues;
}

function validatePairs(rows) {
  const bySlug = new Map();
  for (const r of rows) {
    if (!r.topic_slug) continue;
    if (DEDICATED_LANDING_KEYS.has(r.offering_key)) continue;
    if (r.include_in_workshops || r.include_on_speaker_page) continue;
    const list = bySlug.get(r.topic_slug) ?? [];
    list.push(r);
    bySlug.set(r.topic_slug, list);
  }
  const out = new Map();
  for (const [slug, group] of bySlug) {
    if (group.length < 2) continue;
    const urls = new Set(group.map((r) => (r.current_url || "").trim()));
    const anchors = new Set(group.map((r) => (r.anchor_id || "").trim()));
    if (urls.size > 1 || anchors.size > 1) {
      for (const r of group) {
        const list = out.get(r.offering_key) ?? [];
        list.push({ level: "error", code: "TOPIC_PAIR_DIVERGES", message: `Rows sharing topic_slug "${slug}" must share current_url and anchor_id.` });
        out.set(r.offering_key, list);
      }
    }
  }
  return out;
}

/**
 * Extract the set of anchor ids that would render on
 * /partner/amplify/workshops. Combines:
 *  - the live DB set (offerings where include_in_workshops=true → their anchor_id)
 *  - the FALLBACK_THUMB keys from AmplifyWorkshops.tsx (safety net)
 */
function loadFeaturedAnchorPool(dbRows) {
  const pool = new Set();
  for (const r of dbRows) {
    if (r.include_in_workshops && r.anchor_id) pool.add(r.anchor_id);
  }
  try {
    const src = readFileSync("src/pages/pps/partner/amplify/AmplifyWorkshops.tsx", "utf8");
    // Match id={anchor} patterns and known static ids from the page.
    for (const m of src.matchAll(/id=\{[^}]*\}|id="([^"]+)"/g)) {
      if (m[1]) pool.add(m[1]);
    }
  } catch {
    /* file optional */
  }
  return pool;
}

async function probeUrl(pathname) {
  try {
    const res = await fetch(`${LIVE_BASE}${pathname}`, { redirect: "manual" });
    return { ok: res.status < 400, status: res.status };
  } catch (e) {
    return { ok: false, status: 0, error: String(e?.message || e) };
  }
}

function emptySummary() {
  return { total: 0, errors: 0, warnings: 0, byCode: {} };
}

function writeReport(report) {
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));
}

async function main() {
  const supabase = createClient(PPS_URL, PPS_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("path_finder_offerings")
    .select(
      "offering_key, name, delivery_format, current_url, anchor_id, topic_slug, include_in_workshops, include_on_speaker_page, is_keynote, is_published",
    );
  if (error) {
    console.error("[routing] DB query failed:", error.message);
    process.exit(1);
  }

  const rows = (data || []).filter(isRoutingRelevant);
  const anchors = loadFeaturedAnchorPool(rows);
  const pairs = validatePairs(rows);

  const perRow = [];
  const summary = emptySummary();
  for (const r of rows) {
    const issues = validateRow(r, anchors).concat(pairs.get(r.offering_key) ?? []);
    if (!issues.length) continue;
    perRow.push({
      offering_key: r.offering_key,
      name: r.name,
      current_url: r.current_url,
      anchor_id: r.anchor_id,
      topic_slug: r.topic_slug,
      is_published: !!r.is_published,
      issues,
    });
    summary.total += 1;
    for (const i of issues) {
      if (i.level === "error") summary.errors += 1;
      else summary.warnings += 1;
      summary.byCode[i.code] = (summary.byCode[i.code] || 0) + 1;
    }
  }

  // Optional live-URL probing.
  let liveProbes = null;
  if (LIVE) {
    liveProbes = [];
    const targets = new Set(rows.map((r) => r.current_url).filter(Boolean));
    for (const t of targets) {
      const res = await probeUrl(t);
      liveProbes.push({ url: t, ...res });
      if (!res.ok) summary.errors += 1;
    }
  }

  const report = {
    generated_at: new Date().toISOString(),
    live: LIVE,
    summary,
    rows: perRow,
    liveProbes,
  };
  writeReport(report);

  console.log(
    `[routing] scanned ${rows.length} routing-relevant rows — ${summary.errors} error(s), ${summary.warnings} warning(s) across ${perRow.length} row(s).`,
  );
  if (perRow.length) {
    for (const r of perRow) {
      console.log(`  ${r.offering_key} (${r.name || "?"}) → ${r.current_url || "∅"}`);
      for (const i of r.issues) console.log(`    [${i.level}] ${i.code}: ${i.message}`);
    }
  }
  if (LIVE && liveProbes) {
    for (const p of liveProbes) {
      if (!p.ok) console.log(`  [live] ${p.url} → HTTP ${p.status} ${p.error || ""}`);
    }
  }
  console.log(`[routing] report written to ${OUT_PATH}`);
  if (summary.errors > 0) process.exit(1);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error("[routing] fatal:", e);
    process.exit(1);
  });
}
