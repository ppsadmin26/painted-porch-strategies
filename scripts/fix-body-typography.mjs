#!/usr/bin/env node
/**
 * Body Typography Auto-Fixer
 *
 * Companion to validate-body-typography.mjs. For every <p>/<li>/<blockquote>:
 *   - raw size utility   → mapped to the closest body token (in place)
 *   - missing body token → prepend `text-body` (the safe default)
 *   - no className       → add `className="text-body"`
 *
 * Skips elements whose className is a JSX expression `{...}` — those need
 * human review and remain as validator violations.
 *
 * Quotes (>) inside <blockquote> default to text-pullquote; <p> and <li>
 * default to text-body. Map raw sizes as:
 *   text-xs   → text-caption
 *   text-sm   → text-body-sm
 *   text-base → text-body
 *   text-lg   → text-lead
 *   text-xl   → text-lead   (or text-pullquote in <blockquote>)
 *   text-2xl  → text-pullquote
 *   text-3xl  → text-pullquote
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SCAN_DIRS = ["src/pages/pps", "src/components/pps"];
const TAGS = ["p", "li", "blockquote"];
const RAW_SIZE = /\btext-(xs|sm|base|lg|xl|2xl|3xl)\b/g;
const BODY_TOKEN = /\btext-(?:lead|body|body-sm|caption|pullquote)\b/;

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
    case "xs":
      return "text-caption";
    case "sm":
      return "text-body-sm";
    case "base":
      return "text-body";
    case "lg":
      return "text-lead";
    case "xl":
      return tag === "blockquote" ? "text-pullquote" : "text-lead";
    case "2xl":
    case "3xl":
      return "text-pullquote";
  }
  return "text-body";
}

function defaultToken(tag) {
  return tag === "blockquote" ? "text-pullquote" : "text-body";
}

// Match opening tag: capture (1) tag, (2) attrs blob, (3) self-close slash.
// Non-greedy on attrs so we stop at the first matching '>'. Avoid matching
// strings that contain '>' inside braces by using a simple but conservative
// pattern: attrs don't include unescaped '>' or '{}' braces top-level. For
// our codebase this is good enough — anything weird stays as a violation.
const tagOpen = /<(p|li|blockquote)\b([^>]*?)(\/?)>/g;
const classNameAttr =
  /(\sclassName=)("([^"]*)"|`([^`]*)`|\{([^}]*)\})/;

let totalEdits = 0;
let totalFiles = 0;
const summary = [];

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  let out = "";
  let cursor = 0;
  let edits = 0;
  let skippedExpr = 0;
  tagOpen.lastIndex = 0;
  let m;
  while ((m = tagOpen.exec(src)) !== null) {
    const [full, tag, attrs, selfClose] = m;
    out += src.slice(cursor, m.index);
    cursor = m.index + full.length;

    if (selfClose === "/") {
      out += full;
      continue;
    }

    const cnMatch = attrs.match(classNameAttr);
    if (!cnMatch) {
      // No className → add one.
      const token = defaultToken(tag);
      const insert = ` className="${token}"`;
      out += `<${tag}${attrs}${insert}>`;
      edits++;
      continue;
    }

    const [cnFull, prefix, , dq, bt, expr] = cnMatch;
    const isExpr = expr !== undefined;
    const cls = dq ?? bt ?? expr ?? "";

    let nextCls = cls;
    // Rule 1: map raw sizes
    nextCls = nextCls.replace(RAW_SIZE, (_, size) => mapRaw(size, tag));
    // Rule 2: if still no body token, prepend default
    if (!BODY_TOKEN.test(nextCls)) {
      if (isExpr) {
        // Don't touch expressions — leave for human review.
        skippedExpr++;
        out += full;
        continue;
      }
      const token = defaultToken(tag);
      nextCls = nextCls ? `${token} ${nextCls}` : token;
    }

    if (nextCls === cls) {
      out += full;
      continue;
    }

    // Rebuild className attribute preserving its quote style.
    let newCnVal;
    if (dq !== undefined) newCnVal = `"${nextCls}"`;
    else if (bt !== undefined) newCnVal = `\`${nextCls}\``;
    else newCnVal = `{${nextCls}}`; // unreachable (skipped above)

    const newAttrs =
      attrs.slice(0, cnMatch.index) +
      prefix +
      newCnVal +
      attrs.slice(cnMatch.index + cnFull.length);
    out += `<${tag}${newAttrs}>`;
    edits++;
  }
  out += src.slice(cursor);

  if (edits > 0) {
    totalEdits += edits;
    totalFiles++;
    summary.push({ file: path.relative(ROOT, file), edits, skippedExpr });
    if (!dry) fs.writeFileSync(file, out);
  } else if (skippedExpr > 0) {
    summary.push({ file: path.relative(ROOT, file), edits: 0, skippedExpr });
  }
}

summary.sort((a, b) => b.edits - a.edits);
console.log(`${dry ? "DRY RUN" : "APPLIED"} — ${totalEdits} edits across ${totalFiles} files`);
for (const s of summary.slice(0, 25)) {
  console.log(
    `  ${s.edits.toString().padStart(4)}  ${s.file}${s.skippedExpr ? `  (expr skipped: ${s.skippedExpr})` : ""}`,
  );
}
const totalSkipped = summary.reduce((a, s) => a + s.skippedExpr, 0);
if (totalSkipped) console.log(`\nClassName expressions skipped (manual review): ${totalSkipped}`);
