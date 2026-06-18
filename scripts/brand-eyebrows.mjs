#!/usr/bin/env node
/**
 * brand:eyebrows linter
 *
 * Flags hand-rolled eyebrow markup outside the shared <Eyebrow> component.
 * See mem://style/eyebrow-usage for the rule.
 *
 * What we flag:
 *   - `inline-block ... rounded-full ... uppercase ... tracking-` (pill eyebrow)
 *   - `inline-block ... uppercase ... tracking-(widest|[0.2em])` (plain eyebrow)
 *     when used as a section label (not a card tag or status badge).
 *
 * What we ALLOW (skipped):
 *   - src/components/pps/Eyebrow.tsx
 *   - src/components/ui/**       (shadcn)
 *   - **/_archive*                (archived components)
 *   - src/pages/pps/Sitemap.tsx, src/pages/pps/admin/**  (status/category chips)
 *   - lines containing "absolute"  (positioned ribbons like "Most Popular")
 *   - lines containing "badgeColor" (data-driven speaker/category chips)
 *   - lines containing "pillClass"  (data-driven sitemap chips)
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const SKIP_DIRS = new Set(["node_modules", "dist", "build", ".git"]);
const SKIP_PATH_FRAGMENTS = [
  "src/components/pps/Eyebrow.tsx",
  "src/components/ui/",
  "src/pages/pps/Sitemap.tsx",
  "src/pages/pps/admin/",
  "_archive",
];

const LINE_SKIP_TOKENS = ["absolute", "badgeColor", "pillClass", "<Eyebrow"];

const PILL_RE =
  /inline-(block|flex)[^"`]*rounded-full[^"`]*uppercase|uppercase[^"`]*rounded-full/;
const PLAIN_RE =
  /(uppercase[^"`]*tracking-(widest|\[0\.2em\]))|(tracking-(widest|\[0\.2em\])[^"`]*uppercase)/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(tsx|jsx)$/.test(name)) out.push(p);
  }
  return out;
}

function shouldSkipFile(rel) {
  return SKIP_PATH_FRAGMENTS.some((frag) => rel.includes(frag));
}

const findings = [];
for (const file of walk(SRC)) {
  const rel = relative(ROOT, file);
  if (shouldSkipFile(rel)) continue;
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (LINE_SKIP_TOKENS.some((t) => line.includes(t))) return;
    let kind = null;
    if (PILL_RE.test(line)) kind = "pill";
    else if (PLAIN_RE.test(line)) kind = "plain";
    if (!kind) return;
    findings.push({ file: rel, line: i + 1, kind, text: line.trim().slice(0, 140) });
  });
}

if (findings.length === 0) {
  console.log("✓ brand:eyebrows — no hand-rolled eyebrows found.");
  process.exit(0);
}

console.log(
  `⚠ brand:eyebrows — ${findings.length} hand-rolled eyebrow(s) found. Migrate to <Eyebrow> from @/components/pps/Eyebrow.\n`
);
for (const f of findings) {
  console.log(`  [${f.kind}] ${f.file}:${f.line}`);
  console.log(`      ${f.text}`);
}
console.log(
  `\nSee mem://style/eyebrow-usage for the two-tier rule. Run \`npm run brand:eyebrows\` after migration.`
);
process.exit(1);
