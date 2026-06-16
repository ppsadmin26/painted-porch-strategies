#!/usr/bin/env node
/**
 * Anchor coverage audit.
 *
 * For every path_finder_offerings row that carries an anchor (either an
 * explicit anchor_id column, or a `#fragment` in current_url/dedicated_url),
 * verifies that the referenced anchor id exists somewhere in the rendered
 * source tree (src/pages + src/components). This catches offerings whose
 * quiz/recommendation links would land on a page but fail to scroll to the
 * intended masterclass / course / assessment / lab / resource / speaker
 * topic card because the id was renamed, removed, or never added.
 *
 * Writes:
 *   - docs/anchor-coverage-audit.json (consumed by /admin/offerings-coverage)
 *
 * Read-only. Never writes to the database.
 *
 * Usage:
 *   PPS_URL=... PPS_SERVICE_KEY=... node scripts/audit-anchor-coverage.mjs
 *   (falls back to SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

const PPS_URL = process.env.PPS_URL || process.env.SUPABASE_URL;
const PPS_SERVICE_KEY = process.env.PPS_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!PPS_URL || !PPS_SERVICE_KEY) {
  console.error("Missing PPS credentials (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
  process.exit(1);
}

const ROOTS = ["src/pages", "src/components"];
const EXT = /\.(tsx?|jsx?)$/;

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    const p = join(dir, name);
    let s;
    try { s = statSync(p); } catch { continue; }
    if (s.isDirectory()) walk(p, out);
    else if (EXT.test(name)) out.push(p);
  }
  return out;
}

// Collect every id="..." literal in the source tree. Also captures
// id={`...`} template strings with no interpolation, and known patterns
// from the codebase: id={cohort.slug}, id={anchorSlug}, etc. — for those
// we instead match by sourcing the data arrays where slugs are defined.
function collectIds() {
  const ids = new Set();
  const dynamicSlugSources = []; // raw file text from data files
  const files = ROOTS.flatMap((r) => walk(r));
  // Static "id" literals
  const STATIC = /\bid\s*=\s*"([^"\s{}]+)"/g;
  // Template id={`literal`} with no ${} interpolation
  const TEMPLATE = /\bid\s*=\s*\{\s*`([^`${}]+)`\s*\}/g;
  for (const f of files) {
    let text;
    try { text = readFileSync(f, "utf8"); } catch { continue; }
    for (const m of text.matchAll(STATIC)) ids.add(m[1]);
    for (const m of text.matchAll(TEMPLATE)) ids.add(m[1]);
    // Heuristic: if file declares id={something.slug} or id={anchorSlug},
    // collect every string literal that looks like a slug from that file
    // so dynamically-rendered card ids are still considered "present".
    if (/\bid\s*=\s*\{[^}]+\}/.test(text)) {
      dynamicSlugSources.push(text);
    }
  }
  // Pull plausible anchor literals out of data-bearing files: any quoted
  // string of slug-shape (kebab, snake, camel, dot) up to 80 chars assigned
  // to a slug-ish key or sitting in an array of card definitions.
  const SLUGLIKE = /["'`]([a-zA-Z][a-zA-Z0-9_\-]{2,80})["'`]/g;
  // Only harvest from files that already render dynamic ids — keeps noise down.
  for (const text of dynamicSlugSources) {
    // bias toward slug / id / anchor / key contexts
    const SLUG_CTX = /(?:slug|anchor(?:Id|Slug)?|key|id)\s*[:=]\s*["'`]([a-zA-Z][a-zA-Z0-9_\-]{2,80})["'`]/g;
    for (const m of text.matchAll(SLUG_CTX)) ids.add(m[1]);
    // Also general literals — wider net but bounded by slug shape
    for (const m of text.matchAll(SLUGLIKE)) {
      const v = m[1];
      if (/^[a-z][a-zA-Z0-9_\-]{3,}$/.test(v) || /^topic-/.test(v) || /^mc-/.test(v) || /^lab-/.test(v)) {
        ids.add(v);
      }
    }
  }
  return ids;
}

function hashOf(url) {
  if (!url) return null;
  const i = url.indexOf("#");
  if (i < 0) return null;
  const frag = url.slice(i + 1).trim();
  return frag || null;
}

async function main() {
  const supa = createClient(PPS_URL, PPS_SERVICE_KEY, { auth: { persistSession: false } });
  const { data, error } = await supa
    .from("path_finder_offerings")
    .select("offering_key, name, tier, current_url, dedicated_url, anchor_id, is_live");
  if (error) {
    console.error("Failed to read path_finder_offerings:", error.message);
    process.exit(1);
  }

  const ids = collectIds();
  console.log(`Collected ${ids.size} candidate ids across ${ROOTS.join(", ")}`);

  const rows = data ?? [];
  const anchored = [];
  for (const r of rows) {
    const anchors = new Set();
    if (r.anchor_id && r.anchor_id.trim()) anchors.add(r.anchor_id.trim());
    const h1 = hashOf(r.current_url);
    if (h1) anchors.add(h1);
    const h2 = hashOf(r.dedicated_url);
    if (h2) anchors.add(h2);
    if (anchors.size === 0) continue;
    const dest =
      (r.is_live && r.dedicated_url ? r.dedicated_url : r.current_url) || r.dedicated_url || null;
    for (const a of anchors) {
      anchored.push({
        offering_key: r.offering_key,
        name: r.name,
        tier: r.tier,
        anchor: a,
        destination: dest ? dest.split("#")[0] : null,
        is_live: r.is_live,
        present: ids.has(a),
      });
    }
  }

  const missing = anchored.filter((a) => !a.present);
  const present = anchored.length - missing.length;

  // Group missing by destination so reviewers can fix one page at a time.
  const byPage = {};
  for (const m of missing) {
    const k = m.destination ?? "(no destination)";
    (byPage[k] ||= []).push({ offering_key: m.offering_key, anchor: m.anchor, name: m.name, tier: m.tier });
  }

  const report = {
    generated_at: new Date().toISOString(),
    roots: ROOTS,
    total_anchored: anchored.length,
    present,
    missing: missing.length,
    missing_by_destination: byPage,
    missing_detail: missing,
  };

  const out = "docs/anchor-coverage-audit.json";
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(`Wrote ${out}: ${present}/${anchored.length} anchors present, ${missing.length} missing.`);
  if (missing.length) {
    console.log("Missing anchors:");
    for (const m of missing) {
      console.log(`  - ${m.tier.padEnd(10)} ${m.offering_key}  #${m.anchor}  → ${m.destination ?? "(no dest)"}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
