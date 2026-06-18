#!/usr/bin/env node
/**
 * Body Typography Auto-Fixer
 *
 * Companion to validate-body-typography.mjs. Applies the universal rule:
 *
 *   Standard section <p>/<li>  →  text-body (only)
 *   Stylized contexts (inside Card/Alert/Tooltip/Dialog/blockquote/etc.)
 *                              →  must own a body token; preserved as-is
 *
 * What it does on each <p>/<li>/<blockquote>:
 *   - raw size utility           → mapped to a body token (then re-evaluated)
 *   - section element            → forced to `text-body`, other tokens stripped
 *   - stylized w/o token         → prepended with `text-body` (or text-pullquote
 *                                  for <blockquote>) as a safe default
 *   - no className               → added with the chosen token
 *
 * Skips elements whose className is a JSX expression `{...}` — those need
 * manual review.
 *
 * Usage:
 *   node scripts/fix-body-typography.mjs              # apply
 *   node scripts/fix-body-typography.mjs --dry        # report only
 *   node scripts/fix-body-typography.mjs --paths f1 f2
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { shouldSkipFileForAudit } from "./_page-categories.mjs";
import {
  walkBodyElements,
  CLASSNAME_RE,
  BODY_TOKEN_RE,
  hasBodyAllowOverride,
} from "./_body-context.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SCAN_DIRS = ["src/pages/pps", "src/components/pps"];
const RAW_SIZE_G = /\btext-(xs|sm|base|lg|xl|2xl|3xl)\b/g;

const args = process.argv.slice(2);
const dry = args.includes("--dry");
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
const files = rawFiles.filter((f) => !shouldSkipFileForAudit(path.relative(ROOT, f)));

function mapRaw(size, tag) {
  switch (size) {
    case "xs": return "text-caption";
    case "sm": return "text-body-sm";
    case "base": return "text-body";
    case "lg": return "text-lead";
    case "xl": return tag === "blockquote" ? "text-pullquote" : "text-lead";
    case "2xl":
    case "3xl": return "text-pullquote";
  }
  return "text-body";
}

function defaultStylizedToken(tag) {
  return tag === "blockquote" ? "text-pullquote" : "text-body";
}

let totalEdits = 0;
let totalFiles = 0;
let skippedExpr = 0;
const summary = [];

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");

  // Collect edits as [absStart, absEnd, replacement] then apply right-to-left
  // so offsets stay valid.
  const edits = [];
  let fileSkipped = 0;

  for (const el of walkBodyElements(src)) {
    if (el.selfClose) continue;
    if (hasBodyAllowOverride(el.attrs)) continue;

    const cnMatch = el.attrs.match(CLASSNAME_RE);

    // No className → add the right default.
    if (!cnMatch) {
      const token = el.exempt ? defaultStylizedToken(el.tag) : "text-body";
      // Insert ` className="<token>"` right before the `>` (or `/>`)
      const insertAt = el.attrEnd - (el.selfClose ? 1 : 0);
      edits.push([insertAt, insertAt, ` className="${token}"`]);
      continue;
    }

    const [cnFull, dq, bt, expr] = cnMatch;
    const isExpr = expr !== undefined;
    const cls = dq ?? bt ?? expr ?? "";

    // Step 1: map raw sizes (always safe — works for exprs too via string rewrite)
    let nextCls = cls.replace(RAW_SIZE_G, (_, size) => mapRaw(size, el.tag));

    // Step 2: apply universal rule
    const tokens = [...nextCls.matchAll(BODY_TOKEN_RE)].map((m) => m[0]);

    if (el.exempt) {
      // Stylized — just guarantee a token exists.
      if (tokens.length === 0) {
        if (isExpr) { fileSkipped++; skippedExpr++; continue; }
        const token = defaultStylizedToken(el.tag);
        nextCls = nextCls ? `${token} ${nextCls}` : token;
      }
    } else {
      // Standard section — force text-body, strip other size tokens.
      if (isExpr) {
        // Expression — only do raw-size mapping; flag if still wrong-tokened.
        if (nextCls === cls) continue;
        // fall through to write
      } else {
        // Remove every body-size token, then prepend text-body.
        let stripped = nextCls.replace(BODY_TOKEN_RE, "").replace(/\s+/g, " ").trim();
        nextCls = stripped ? `text-body ${stripped}` : "text-body";
      }
    }

    if (nextCls === cls) continue;

    // Rebuild className value with the original quote style.
    let newCnVal;
    if (dq !== undefined) newCnVal = `"${nextCls}"`;
    else if (bt !== undefined) newCnVal = `\`${nextCls}\``;
    else newCnVal = `{${nextCls}}`;

    // Compute absolute offsets of the className value inside the file.
    const cnRelStart = el.attrs.indexOf(cnFull);
    if (cnRelStart === -1) continue;
    const absStart = el.attrStart + cnRelStart;
    const absEnd = absStart + cnFull.length;
    edits.push([absStart, absEnd, `className=${newCnVal}`]);
  }

  if (edits.length === 0) {
    if (fileSkipped > 0) summary.push({ file: path.relative(ROOT, file), edits: 0, skipped: fileSkipped });
    continue;
  }

  // Apply right-to-left.
  edits.sort((a, b) => b[0] - a[0]);
  let out = src;
  for (const [s, e, replacement] of edits) {
    out = out.slice(0, s) + replacement + out.slice(e);
  }

  totalEdits += edits.length;
  totalFiles++;
  summary.push({ file: path.relative(ROOT, file), edits: edits.length, skipped: fileSkipped });
  if (!dry) fs.writeFileSync(file, out);
}

summary.sort((a, b) => b.edits - a.edits);
console.log(`${dry ? "DRY RUN" : "APPLIED"} — ${totalEdits} edits across ${totalFiles} files`);
for (const s of summary.slice(0, 30)) {
  console.log(
    `  ${s.edits.toString().padStart(4)}  ${s.file}${s.skipped ? `  (expr skipped: ${s.skipped})` : ""}`,
  );
}
if (skippedExpr) console.log(`\nClassName expressions skipped (manual review): ${skippedExpr}`);
