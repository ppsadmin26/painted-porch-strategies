#!/usr/bin/env node
/**
 * Source-tree link audit for workshop / speaking routes.
 *
 * Runs without DB / network. Enforces:
 *   1. No references to the removed "accordion" workshop layout in
 *      workshop or speaking pages (shadcn accordion primitive itself
 *      is still allowed elsewhere).
 *   2. Every hardcoded `/partner/amplify/workshops` reference in
 *      src/ or public/ is either:
 *        - the plain hub URL (no fragment), OR
 *        - `#<anchor>` where <anchor> is a known featured anchor.
 *   3. Every hardcoded `/speaking/topics#<slug>` reference uses a slug
 *      rendered on src/pages/pps/SpeakingWorkshopTopics.tsx.
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

// Files legitimately referencing the accordion primitive by name (unrelated to workshops).
const ACCORDION_ALLOW_FILES = new Set([
  "src/components/ui/accordion.tsx",
  "src/components/ui/sidebar.tsx",
]);

// Files allowed to link to the bare /partner/amplify/workshops URL (no anchor required).
const BARE_WORKSHOPS_ALLOW = /(?:sitemap|llms|SiteSearch|PPSFooter|PageStatusManager|Sitemap\.tsx|workshopRoutingValidation|generate-sitemap)/i;

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

function loadTopicSlugs() {
  const src = readFileSync("src/pages/pps/SpeakingWorkshopTopics.tsx", "utf8");
  const slugs = new Set();
  for (const m of src.matchAll(/\bslug:\s*["']([a-z0-9-]+)["']/g)) slugs.add(m[1]);
  for (const m of src.matchAll(/\banchor_id:\s*["']([a-z0-9-]+)["']/g)) slugs.add(m[1]);
  return slugs;
}
const TOPIC_SLUGS = loadTopicSlugs();

function auditFile(path) {
  const rel = path.replace(/\\/g, "/");
  const text = readFileSync(path, "utf8");

  // 1. Accordion references in workshop/speaking pages.
  if (/pages\/pps\/(partner\/amplify\/AmplifyWorkshops|SpeakingWorkshopTopics|speaking\/)/.test(rel)) {
    if (/\baccordion\b/i.test(text) && !ACCORDION_ALLOW_FILES.has(rel)) {
      violations.push({ file: rel, rule: "accordion-removed", detail: "Accordion layout was reverted; this page must not reference it." });
    }
  }

  // 2. /partner/amplify/workshops references.
  for (const m of text.matchAll(/\/partner\/amplify\/workshops(#[A-Za-z0-9_-]+)?/g)) {
    const anchor = m[1]?.slice(1);
    if (!anchor) {
      // Bare URL - only allowed on hub/index/search/footer/sitemap files.
      if (!BARE_WORKSHOPS_ALLOW.test(rel) && !/AmplifyWorkshops\.tsx$/.test(rel)) {
        violations.push({ file: rel, rule: "workshop-link-missing-anchor", detail: `Link to /partner/amplify/workshops needs #anchor for a featured card.` });
      }
    } else if (!FEATURED_ANCHORS.has(anchor)) {
      violations.push({ file: rel, rule: "unknown-workshop-anchor", detail: `#${anchor} is not a featured workshop anchor.` });
    }
  }

  // 3. /speaking/topics#<slug> references.
  for (const m of text.matchAll(/\/speaking\/topics#([A-Za-z0-9_-]+)/g)) {
    const slug = m[1];
    if (!TOPIC_SLUGS.has(slug)) {
      violations.push({ file: rel, rule: "unknown-topic-slug", detail: `#${slug} is not rendered on SpeakingWorkshopTopics.` });
    }
  }
}

for (const r of ROOTS) walk(r);

if (violations.length === 0) {
  console.log(`[link-audit] clean — ${TOPIC_SLUGS.size} topic slugs, ${FEATURED_ANCHORS.size} featured anchors.`);
  process.exit(0);
}

console.error(`[link-audit] ${violations.length} violation(s):`);
for (const v of violations) {
  console.error(`  ${v.rule.padEnd(28)} ${v.file}\n    ${v.detail}`);
}
process.exit(1);
