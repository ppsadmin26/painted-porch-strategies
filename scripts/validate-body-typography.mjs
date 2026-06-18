#!/usr/bin/env node
/**
 * Body Typography Validator
 *
 * Enforces the 5-token body-text scale defined in src/index.css:
 *   .text-lead | .text-body | .text-body-sm | .text-caption | .text-pullquote
 *
 * Flags raw Tailwind size utilities (text-xs / text-sm / text-base / text-lg /
 * text-xl / text-2xl / text-3xl) used directly on <p>, <li>, or <blockquote>
 * tags. Headings (h1-h6) and small UI primitives are not checked here.
 *
 * Usage:
 *   node scripts/validate-body-typography.mjs           # report only
 *   node scripts/validate-body-typography.mjs --json    # machine-readable
 *   node scripts/validate-body-typography.mjs --paths src/pages/pps/PPSHome.tsx
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SCAN_DIRS = ["src/pages/pps", "src/components/pps"];
const TAGS = ["p", "li", "blockquote"];
const RAW_SIZE = /\btext-(?:xs|sm|base|lg|xl|2xl|3xl)\b/;
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const pathsArg = args.indexOf("--paths");
const explicitPaths =
  pathsArg !== -1 ? args.slice(pathsArg + 1).filter((a) => !a.startsWith("--")) : null;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (full.endsWith(".tsx")) out.push(full);
  }
  return out;
}

const files = explicitPaths
  ? explicitPaths.map((p) => path.resolve(ROOT, p))
  : SCAN_DIRS.flatMap((d) => walk(path.resolve(ROOT, d)));

const tagOpen = new RegExp(`<(${TAGS.join("|")})\\b[^>]*className=["\`]([^"\`]+)["\`]`, "g");
const violations = [];
let scanned = 0;

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  scanned++;
  let m;
  while ((m = tagOpen.exec(src)) !== null) {
    const [, tag, cls] = m;
    const match = cls.match(RAW_SIZE);
    if (!match) continue;
    const line = src.slice(0, m.index).split("\n").length;
    violations.push({
      file: path.relative(ROOT, file),
      line,
      tag,
      rawClass: match[0],
      snippet: cls.length > 80 ? cls.slice(0, 77) + "…" : cls,
    });
  }
}

if (asJson) {
  console.log(JSON.stringify({ scanned, violations }, null, 2));
  process.exit(violations.length > 0 ? 1 : 0);
}

// Pretty report
const byFile = new Map();
for (const v of violations) {
  if (!byFile.has(v.file)) byFile.set(v.file, []);
  byFile.get(v.file).push(v);
}

console.log(`\nBody Typography Audit  —  scanned ${scanned} files`);
console.log("=".repeat(60));
if (violations.length === 0) {
  console.log("✓ No raw text-size utilities on <p>/<li>/<blockquote>.");
  process.exit(0);
}

const byClass = violations.reduce((acc, v) => {
  acc[v.rawClass] = (acc[v.rawClass] || 0) + 1;
  return acc;
}, {});
console.log("\nViolations by class:");
for (const [k, v] of Object.entries(byClass).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(12)} ${v}`);
}

console.log(`\nFiles with violations: ${byFile.size}`);
const topFiles = [...byFile.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 15);
console.log("\nTop 15 files (count):");
for (const [f, list] of topFiles) {
  console.log(`  ${list.length.toString().padStart(4)}  ${f}`);
}

console.log(`\nTotal violations: ${violations.length}`);
console.log("\nReplace with the body typography tokens defined in src/index.css:");
console.log("  text-xs   → text-caption");
console.log("  text-sm   → text-body-sm  (compact contexts) OR text-body (paragraphs)");
console.log("  text-base → text-body");
console.log("  text-lg / text-xl → text-lead  (hero subheads, section intros)");
console.log("  text-xl / text-2xl on quotes → text-pullquote");
process.exit(1);
