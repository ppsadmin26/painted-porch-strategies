#!/usr/bin/env node
/**
 * Body Typography Validator
 *
 * Enforces a single, universal body size for STANDARD section text:
 *   <p>, <li>   (not inside an exempt ancestor)   →   must use `text-body`
 *
 * Stylized contexts may use any token from the 5-token scale:
 *   .text-lead | .text-body | .text-body-sm | .text-caption | .text-pullquote
 * An element is "stylized" when an ancestor is exempt (Card, Alert, Tooltip,
 * Dialog, Sheet, blockquote, table, Eyebrow, TierBadge, ParallaxCTA, …) OR
 * when the opening tag carries `data-body-allow`.
 *
 * Also: NO raw Tailwind size utilities (text-xs / sm / base / lg / xl / 2xl /
 * 3xl) on any <p>/<li>/<blockquote>.
 *
 * Usage:
 *   node scripts/validate-body-typography.mjs
 *   node scripts/validate-body-typography.mjs --json
 *   node scripts/validate-body-typography.mjs --paths src/pages/pps/PPSHome.tsx
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { shouldSkipFileForAudit } from "./_page-categories.mjs";
import {
  walkBodyElements,
  CLASSNAME_RE,
  RAW_SIZE,
  BODY_TOKEN_RE,
  hasBodyAllowOverride,
} from "./_body-context.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SCAN_DIRS = ["src/pages/pps", "src/components/pps"];

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const includeAll = args.includes("--all");
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

const violations = [];
let scanned = 0;
let elementsChecked = 0;

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  scanned++;
  for (const el of walkBodyElements(src)) {
    if (el.selfClose) continue;
    elementsChecked++;
    const cnMatch = el.attrs.match(CLASSNAME_RE);
    const cls = cnMatch ? cnMatch[1] ?? cnMatch[2] ?? cnMatch[3] ?? "" : "";
    const fileRel = path.relative(ROOT, file);
    const snippet = cls.length > 80 ? cls.slice(0, 77) + "…" : cls;

    // Rule 1: raw size utility (always banned)
    const raw = cls.match(RAW_SIZE);
    if (raw) {
      violations.push({ file: fileRel, line: el.line, tag: el.tag, kind: "raw-size", detail: raw[0], snippet });
      continue;
    }

    // Explicit override skips token rules.
    if (hasBodyAllowOverride(el.attrs)) continue;

    const tokens = [...cls.matchAll(BODY_TOKEN_RE)].map((m) => m[0]);

    if (el.exempt) {
      // Stylized context — any of the 5 tokens is fine. But still require one
      // to exist on <p>/<li> so siblings inside the same card stay aligned.
      if (el.tag !== "blockquote" && tokens.length === 0) {
        violations.push({
          file: fileRel, line: el.line, tag: el.tag,
          kind: cnMatch ? "missing-token" : "no-classname",
          detail: `stylized (${el.exemptReason ?? "exempt"}) — pick a body token`,
          snippet: cls || "(no className)",
        });
      }
      continue;
    }

    // Standard section body — must include text-body, must NOT include any
    // of the other size tokens.
    const hasBody = tokens.includes("text-body");
    const wrong = tokens.filter((t) => t !== "text-body");
    if (!hasBody) {
      violations.push({
        file: fileRel, line: el.line, tag: el.tag,
        kind: cnMatch ? "missing-text-body" : "no-classname",
        detail: tokens.length ? `has ${tokens.join("+")}, needs text-body` : "needs text-body",
        snippet: cls || "(no className)",
      });
      continue;
    }
    if (wrong.length) {
      violations.push({
        file: fileRel, line: el.line, tag: el.tag,
        kind: "wrong-token",
        detail: `section <${el.tag}> uses ${wrong.join("+")} — must be text-body only`,
        snippet,
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
console.log("=".repeat(72));
if (violations.length === 0) {
  console.log("✓ Standard section <p>/<li> use text-body; stylized elements own their token; no raw text-sizes.");
  process.exit(0);
}

const byKind = violations.reduce((acc, v) => {
  acc[v.kind] = (acc[v.kind] || 0) + 1;
  return acc;
}, {});
console.log("\nViolations by kind:");
for (const [k, v] of Object.entries(byKind).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(20)} ${v}`);
}

console.log(`\nFiles with violations: ${byFile.size}`);
const topFiles = [...byFile.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 20);
console.log("\nTop files (count):");
for (const [f, list] of topFiles) {
  console.log(`  ${list.length.toString().padStart(4)}  ${f}`);
}

console.log(`\nTotal violations: ${violations.length}`);
console.log("\nFix guidance:");
console.log("  raw-size            → drop Tailwind text-xs/sm/base/lg/xl/2xl/3xl on <p>/<li>/<blockquote>.");
console.log("  wrong-token         → section <p>/<li> must be `text-body`. If you need a different size,");
console.log("                        wrap it in a Card/Alert/Tooltip/blockquote/etc. or add data-body-allow.");
console.log("  missing-text-body   → add `text-body` to this standard section element.");
console.log("  missing-token       → stylized container — pick one of text-lead/body/body-sm/caption/pullquote.");
console.log("  no-classname        → every body element must own its size token (or data-body-allow).");
process.exit(1);
