#!/usr/bin/env node
/**
 * Brand Trademark Linter
 *
 * Enforces the rule: ONE ™ per page total, on the primary mention of the
 * page's main concept (optionally repeated once at the final CTA).
 *
 * Scope:
 *   - Scans page files under src/pages/**
 *   - SKIPS shared components (src/components/**) — they render across many
 *     pages and would multiply ™ marks. Shared components must contain ZERO ™.
 *
 * Modes:
 *   node scripts/validate-trademarks.mjs           -> report only (exit 0/1)
 *   node scripts/validate-trademarks.mjs --fix     -> interactive prompt to
 *                                                    pick which mention to keep
 *
 * Counts each unique trademarked term separately, but reports the total
 * page count too. The "primary" mention is whichever you choose to keep.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { createInterface } from "node:readline";

const ROOT = process.cwd();
const PAGES_DIR = join(ROOT, "src/pages");
const SHARED_DIRS = [join(ROOT, "src/components"), join(ROOT, "src/layouts")];

const TM = "\u2122"; // ™
const TM_RE = /\u2122/g;
const FIX = process.argv.includes("--fix");

// ---------- Utilities ----------

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_archive") || entry === "node_modules") continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (/\.(tsx?|jsx?|mdx?)$/.test(entry)) {
      // Skip internal (admin) and archived files — they're out of scope.
      const rel = relative(ROOT, full);
      if (
        rel.includes("/admin/") ||
        /Archive[a-zA-Z0-9]*\.tsx$/.test(rel) ||
        /Verbatim\.tsx$/.test(rel)
      ) continue;
      files.push(full);
    }
  }
  return files;
}

function findMentions(content) {
  const mentions = [];
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    let m;
    const re = /(\S{1,30}?)\u2122/g;
    while ((m = re.exec(line)) !== null) {
      mentions.push({
        line: i + 1,
        col: m.index + 1,
        term: m[1],
        snippet: line.trim().slice(0, 120),
      });
    }
  });
  return mentions;
}

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => rl.question(question, (a) => { rl.close(); res(a.trim()); }));
}

// ---------- Scan ----------

const pageFiles = walk(PAGES_DIR);
const sharedFiles = SHARED_DIRS.flatMap((d) => {
  try { return walk(d); } catch { return []; }
});

const pageViolations = [];   // pages with > 2 ™ (allow 1 primary + 1 final CTA)
const sharedViolations = []; // any ™ in shared components

for (const file of pageFiles) {
  const content = readFileSync(file, "utf8");
  const mentions = findMentions(content);
  if (mentions.length > 2) {
    pageViolations.push({ file, mentions, content });
  }
}

for (const file of sharedFiles) {
  const content = readFileSync(file, "utf8");
  const mentions = findMentions(content);
  if (mentions.length > 0) {
    sharedViolations.push({ file, mentions });
  }
}

// ---------- Report ----------

const C = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

console.log(C.bold("\n🛡  Brand Trademark Checklist"));
console.log(C.dim("Rule: ONE ™ per page (primary mention), optional second at final CTA. ZERO ™ in shared components.\n"));

if (pageViolations.length === 0 && sharedViolations.length === 0) {
  console.log(C.green("✓ All pages and shared components comply with the trademark rule.\n"));
  process.exit(0);
}

if (sharedViolations.length > 0) {
  console.log(C.red(`✗ ${sharedViolations.length} shared component(s) contain ™ (must be 0):`));
  for (const v of sharedViolations) {
    console.log(`  ${C.cyan(relative(ROOT, v.file))} — ${v.mentions.length} mark(s)`);
    for (const m of v.mentions) {
      console.log(C.dim(`    L${m.line}: …${m.term}${TM} — ${m.snippet}`));
    }
  }
  console.log("");
}

if (pageViolations.length > 0) {
  console.log(C.yellow(`⚠ ${pageViolations.length} page(s) have more than 2 ™ marks:`));
  for (const v of pageViolations) {
    console.log(`\n  ${C.cyan(relative(ROOT, v.file))} — ${C.bold(v.mentions.length)} marks found`);
    v.mentions.forEach((m, i) => {
      console.log(`    ${C.bold(`[${i + 1}]`)} L${m.line}: …${m.term}${TM}`);
      console.log(C.dim(`         ${m.snippet}`));
    });
  }
  console.log("");
}

// ---------- Fix mode ----------

if (FIX && pageViolations.length > 0) {
  console.log(C.bold("\n— Interactive fix mode —"));
  console.log(C.dim("For each page, enter the mention numbers to KEEP (comma-separated, max 2). Empty = keep none. Type 's' to skip.\n"));

  for (const v of pageViolations) {
    console.log(C.cyan(`\n${relative(ROOT, v.file)}`));
    v.mentions.forEach((m, i) => {
      console.log(`  [${i + 1}] L${m.line}: ${m.term}${TM} — ${C.dim(m.snippet)}`);
    });
    const ans = await ask(C.bold("  Keep which? (e.g. '1' or '1,5' or 's' to skip): "));
    if (ans.toLowerCase() === "s") continue;

    const keep = new Set(
      ans.split(",").map((x) => parseInt(x.trim(), 10) - 1).filter((n) => !Number.isNaN(n))
    );

    // Strip ™ from non-kept mentions by walking line-by-line.
    const lines = v.content.split("\n");
    let stripped = 0;
    let mentionIdx = 0;
    for (let li = 0; li < lines.length; li++) {
      lines[li] = lines[li].replace(TM_RE, () => {
        const keepThis = keep.has(mentionIdx);
        mentionIdx++;
        if (keepThis) return TM;
        stripped++;
        return "";
      });
    }
    writeFileSync(v.file, lines.join("\n"), "utf8");
    console.log(C.green(`  ✓ Stripped ${stripped} mark(s), kept ${keep.size}.`));
  }
  console.log(C.green("\nDone. Re-run without --fix to verify.\n"));
}

// Shared components: auto-suggest stripping all (don't auto-write — too risky)
if (sharedViolations.length > 0) {
  console.log(C.dim("Shared components must have ZERO ™. Edit them manually or extend --fix to handle them.\n"));
}

process.exit(pageViolations.length > 0 || sharedViolations.length > 0 ? 1 : 0);
