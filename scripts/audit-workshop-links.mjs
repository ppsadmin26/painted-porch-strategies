#!/usr/bin/env node
/**
 * Source-tree link audit for workshop / speaking routes.
 *
 * Runs without DB / network. Complements
 * `scripts/validate-workshop-routing.mjs` (which audits DB rows).
 * This script catches source-tree regressions:
 *
 *   1. No stray "accordion" references in the workshop/speaking pages.
 *      The old accordion layout on /partner/amplify/workshops was
 *      reverted in favor of the /speaking/topics page — those files
 *      must not reference it (shadcn accordion primitive elsewhere is
 *      still fine).
 *   2. Any hardcoded `/partner/amplify/workshops#<anchor>` link uses
 *      an anchor that AmplifyWorkshops.tsx actually renders.
 *   3. Any hardcoded `/speaking/topics#<slug>` link uses a slug that
 *      matches the kebab-case pattern used by anchor_id / topic_slug.
 *      (Existence-of-slug is enforced against the DB by the routing
 *      validator; this pass just catches typos like camelCase leftovers.)
 *
 * Exit 0 on clean, 1 on any violation.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["src", "public"];
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", "__tests__"]);
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".md", ".mdx", ".txt", ".xml", ".json", ".html"]);

// Featured workshop anchors currently rendered on AmplifyWorkshops.tsx.
// Keep in sync with FEATURED_ANCHORS in src/lib/workshopRoutingValidation.ts.
const FEATURED_ANCHORS = new Set([
  "architect-change",
  "architectureOfOrganizationalShift",
  "pathToLastingChange",
  "cultivatingChangeResilience",
  "leadershipOM",
  "createExtraordinaryTeams",
  "masterYourMessageB2B",
  "radicalMindfulnessB2B",
  "stoicismB2B",
]);

// Files legitimately mentioning "accordion" for unrelated reasons.
const ACCORDION_ALLOW = new Set([
  "src/components/ui/accordion.tsx",
  "src/components/ui/sidebar.tsx",
]);

const violations = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (EXTS.has(extname(p))) auditFile(p);
  }
}

function auditFile(path) {
  const rel = path.replace(/\\/g, "/");
  const text = readFileSync(path, "utf8");

  // 1. Accordion regressions on the reverted workshops/speaking pages.
  if (
    /pages\/pps\/(partner\/amplify\/AmplifyWorkshops|SpeakingWorkshopTopics|speaking\/)/.test(rel) &&
    !ACCORDION_ALLOW.has(rel) &&
    /\baccordion\b/i.test(text)
  ) {
    violations.push({ file: rel, rule: "accordion-removed", detail: "Accordion layout was reverted; this page must not reference it." });
  }

  // 2. Anchored workshop URLs must use a known featured anchor.
  for (const m of text.matchAll(/\/partner\/amplify\/workshops#([A-Za-z0-9_-]+)/g)) {
    if (!FEATURED_ANCHORS.has(m[1])) {
      violations.push({ file: rel, rule: "unknown-workshop-anchor", detail: `#${m[1]} is not a featured workshop anchor.` });
    }
  }

  // 3. Speaking topic slugs must be kebab-case (topic_slug convention).
  for (const m of text.matchAll(/\/speaking\/topics#([A-Za-z0-9_-]+)/g)) {
    const slug = m[1];
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      violations.push({ file: rel, rule: "malformed-topic-slug", detail: `#${slug} is not kebab-case; topic_slug uses kebab-case.` });
    }
  }
}

for (const r of ROOTS) walk(r);

if (violations.length === 0) {
  console.log(`[link-audit] clean (${FEATURED_ANCHORS.size} featured anchors).`);
  process.exit(0);
}

console.error(`[link-audit] ${violations.length} violation(s):`);
for (const v of violations) {
  console.error(`  ${v.rule.padEnd(28)} ${v.file}\n    ${v.detail}`);
}
process.exit(1);
