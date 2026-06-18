#!/usr/bin/env node
/**
 * Body Typography Validator
 *
 * Enforces the 5-token body-text scale defined in src/index.css:
 *   .text-lead | .text-body | .text-body-sm | .text-caption | .text-pullquote
 *
 * Two rules per <p>, <li>, <blockquote>:
 *   1. NO raw Tailwind size utilities (text-xs / text-sm / text-base / text-lg /
 *      text-xl / text-2xl / text-3xl).
 *   2. MUST include one of the five body tokens explicitly on the element.
 *      Tokens on ancestor wrappers don't count — every body element owns its
 *      size decision so siblings can't drift apart (the EMBODY bug).
 *
 * Headings (h1-h6) and small UI primitives are not checked here.
 *
 * Usage:
 *   node scripts/validate-body-typography.mjs           # report only
 *   node scripts/validate-body-typography.mjs --json    # machine-readable
 *   node scripts/validate-body-typography.mjs --paths src/pages/pps/PPSHome.tsx
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { shouldSkipFileForAudit } from "./_page-categories.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SCAN_DIRS = ["src/pages/pps", "src/components/pps"];
const TAGS = ["p", "li", "blockquote"];
const RAW_SIZE = /\btext-(?:xs|sm|base|lg|xl|2xl|3xl)\b/;
const BODY_TOKEN = /\btext-(?:lead|body|body-sm|caption|pullquote)\b/;
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const includeAll = args.includes("--all"); // bypass internal/archived skip
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

const rawFiles = explicitPaths
  ? explicitPaths.map((p) => path.resolve(ROOT, p))
  : SCAN_DIRS.flatMap((d) => walk(path.resolve(ROOT, d)));
const files = includeAll
  ? rawFiles
  : rawFiles.filter((f) => !shouldSkipFileForAudit(path.relative(ROOT, f)));

// Locate opening tags of <p>/<li>/<blockquote>, then read their attribute
// blob with brace/quote/backtick awareness so `>` inside `${i > 0}` doesn't
// prematurely close the tag.
const tagStart = new RegExp(`<(${TAGS.join("|")})(?=[\\s/>])`, "g");
const classNameAttr = /className=(?:"([^"]*)"|`([^`]*)`|\{([\s\S]*)\})/;

function readAttrs(src, start) {
  // start points at the char after the tag name. Walk until the matching '>'
  // that closes the tag, tracking JSX-expression braces, quoted strings, and
  // template literals (which may themselves contain ${...} expressions).
  let i = start;
  let braceDepth = 0;
  const len = src.length;
  while (i < len) {
    const c = src[i];
    if (braceDepth === 0) {
      if (c === ">") return { end: i, selfClose: src[i - 1] === "/" };
      if (c === "{") { braceDepth++; i++; continue; }
      if (c === '"' || c === "'") {
        i++;
        while (i < len && src[i] !== c) i += src[i] === "\\" ? 2 : 1;
        i++; continue;
      }
      if (c === "`") {
        i++;
        while (i < len) {
          if (src[i] === "\\") { i += 2; continue; }
          if (src[i] === "`") { i++; break; }
          if (src[i] === "$" && src[i + 1] === "{") { braceDepth++; i += 2; break; }
          i++;
        }
        continue;
      }
      i++; continue;
    }
    // inside an expression — track nested braces, strings, templates
    if (c === "{") { braceDepth++; i++; continue; }
    if (c === "}") { braceDepth--; i++; continue; }
    if (c === '"' || c === "'") {
      i++;
      while (i < len && src[i] !== c) i += src[i] === "\\" ? 2 : 1;
      i++; continue;
    }
    if (c === "`") {
      i++;
      while (i < len) {
        if (src[i] === "\\") { i += 2; continue; }
        if (src[i] === "`") { i++; break; }
        if (src[i] === "$" && src[i + 1] === "{") { braceDepth++; i += 2; break; }
        i++;
      }
      continue;
    }
    i++;
  }
  return null;
}

const violations = [];
let scanned = 0;
let elementsChecked = 0;

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  scanned++;
  let m;
  tagStart.lastIndex = 0;
  while ((m = tagStart.exec(src)) !== null) {
    const tag = m[1];
    const attrStart = m.index + 1 + tag.length;
    const closed = readAttrs(src, attrStart);
    if (!closed) continue;
    const attrs = src.slice(attrStart, closed.end - (closed.selfClose ? 1 : 0));
    if (closed.selfClose) continue;
    elementsChecked++;
    const line = src.slice(0, m.index).split("\n").length;
    const cnMatch = attrs.match(classNameAttr);
    const cls = cnMatch ? cnMatch[1] ?? cnMatch[2] ?? cnMatch[3] ?? "" : "";


    // Rule 1: raw size utility
    const raw = cls.match(RAW_SIZE);
    if (raw) {
      violations.push({
        file: path.relative(ROOT, file),
        line,
        tag,
        kind: "raw-size",
        detail: raw[0],
        snippet: cls.length > 80 ? cls.slice(0, 77) + "…" : cls,
      });
      continue;
    }

    // Rule 2: missing explicit body token
    if (!BODY_TOKEN.test(cls)) {
      violations.push({
        file: path.relative(ROOT, file),
        line,
        tag,
        kind: cnMatch ? "missing-token" : "no-classname",
        detail: cnMatch ? "no body token" : "no className",
        snippet: cls
          ? cls.length > 80
            ? cls.slice(0, 77) + "…"
            : cls
          : full.length > 80
            ? full.slice(0, 77) + "…"
            : full,
      });
    }
  }
}

if (asJson) {
  console.log(JSON.stringify({ scanned, elementsChecked, violations }, null, 2));
  process.exit(violations.length > 0 ? 1 : 0);
}

const byFile = new Map();
for (const v of violations) {
  if (!byFile.has(v.file)) byFile.set(v.file, []);
  byFile.get(v.file).push(v);
}

console.log(`\nBody Typography Audit  —  scanned ${scanned} files, ${elementsChecked} body elements`);
console.log("=".repeat(70));
if (violations.length === 0) {
  console.log("✓ Every <p>/<li>/<blockquote> has an explicit body token; no raw text-size utilities.");
  process.exit(0);
}

const byKind = violations.reduce((acc, v) => {
  acc[v.kind] = (acc[v.kind] || 0) + 1;
  return acc;
}, {});
console.log("\nViolations by kind:");
for (const [k, v] of Object.entries(byKind).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(16)} ${v}`);
}

console.log(`\nFiles with violations: ${byFile.size}`);
const topFiles = [...byFile.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 15);
console.log("\nTop 15 files (count):");
for (const [f, list] of topFiles) {
  console.log(`  ${list.length.toString().padStart(4)}  ${f}`);
}

console.log(`\nTotal violations: ${violations.length}`);
console.log("\nFix guidance:");
console.log("  raw-size       → swap the Tailwind size for a body token:");
console.log("                   text-xs → text-caption");
console.log("                   text-sm → text-body-sm (compact) OR text-body");
console.log("                   text-base → text-body");
console.log("                   text-lg / text-xl → text-lead");
console.log("                   text-xl / text-2xl on quotes → text-pullquote");
console.log("  missing-token  → add ONE of text-lead/text-body/text-body-sm/text-caption/text-pullquote.");
console.log("  no-classname   → same — every body element must own its size token.");
process.exit(1);
