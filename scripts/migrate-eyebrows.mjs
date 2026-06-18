#!/usr/bin/env node
/**
 * One-shot migration: rewrite hand-rolled eyebrows to <Eyebrow variant="pill|plain">.
 *
 * Conservative — only rewrites well-formed single-line eyebrows whose tone we
 * can infer from a `bg-X`/`text-X` class on the same element. Anything ambiguous
 * is left for manual migration (the brand:eyebrows linter will still flag it).
 *
 * Run with: node scripts/migrate-eyebrows.mjs
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
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

// Maps the dominant color class on the element to an Eyebrow `tone`.
function inferTone(cls) {
  const order = [
    ["bluedoor", "cobalt"],
    ["raspberry", "raspberry"],
    ["purple", "purple"],
    ["gold", "gold"],
    ["lime", "lime"],
    ["teal", "teal"],
    ["navy", "navy"],
    ["white", "white"],
    ["muted", "muted"],
    ["primary", "primary"],
    ["foreground", "foreground"],
    ["pps-gold", "gold"],
    ["pps-teal", "teal"],
    ["pps-navy", "navy"],
    ["muted-foreground", "muted"],
  ];
  const bgMatch = cls.match(/bg-([a-z-]+)(?:\/\d+)?/);
  const textMatch = cls.match(/text-([a-z-]+)(?:\/\d+)?/g);
  // For plain variant the dominant tone is in the text-X token; prefer a
  // recognised color token over generic size tokens like text-caption/text-sm.
  for (const [key, tone] of order) {
    if (bgMatch && bgMatch[1] === key) return tone;
  }
  if (textMatch) {
    for (const raw of textMatch) {
      const k = raw.replace(/^text-/, "").replace(/\/\d+$/, "");
      const hit = order.find(([key]) => key === k);
      if (hit) return hit[1];
    }
  }
  return null;
}

function shouldSkipFile(rel) {
  return SKIP_PATH_FRAGMENTS.some((frag) => rel.includes(frag));
}

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

// Matches a single eyebrow element (possibly spanning lines) with literal classes.
// Captures: tag, className contents, inner text.
const ELEM_RE =
  /<(span|p)\s+className="([^"`{}]+)"\s*>\s*([^<>{}]+?)\s*<\/(span|p)>/g;

function isPillClasses(cls) {
  return /inline-(block|flex)/.test(cls) && /rounded-full/.test(cls) && /uppercase/.test(cls);
}
function isPlainClasses(cls) {
  if (/rounded-full/.test(cls)) return false;
  if (!/uppercase/.test(cls)) return false;
  return /tracking-(widest|\[0\.2em\])/.test(cls);
}

let totalChanges = 0;
const changedFiles = [];

for (const file of walk(SRC)) {
  const rel = relative(ROOT, file);
  if (shouldSkipFile(rel)) continue;
  const src = readFileSync(file, "utf8");
  let needsImport = false;
  let fileChanges = 0;
  const out = src.replace(ELEM_RE, (full, tag, cls, inner) => {
    let variant = null;
    if (isPillClasses(cls)) variant = "pill";
    else if (isPlainClasses(cls)) variant = "plain";
    if (!variant) return full;
    // Skip if line contains tokens we explicitly leave alone.
    if (
      /absolute|badgeColor|pillClass|items-center gap|aria-hidden/.test(cls) ||
      /\$\{/.test(cls)
    ) {
      return full;
    }
    const tone = inferTone(cls);
    if (!tone) return full;
    needsImport = true;
    fileChanges++;
    const asAttr = tag === "p" ? ` as="p"` : "";
    return `<Eyebrow variant="${variant}" tone="${tone}"${asAttr}>${inner.trim()}</Eyebrow>`;
  });
  if (fileChanges === 0) continue;
  let final = out;
  if (needsImport && !/from\s+["']@\/components\/pps\/Eyebrow["']/.test(final)) {
    // Insert after the last top-level import — never inside a multi-line import.
    // We walk imports as whole statements: an `import ... from "..."` line, or
    // an `import {` block that spans until the matching `} from "..."` line.
    const lines = final.split("\n");
    let insertAt = 0;
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (/^\s*import\b/.test(line)) {
        // Single-line import ending in `from "..."` (with optional `;`)
        if (/from\s+["'][^"']+["']\s*;?\s*$/.test(line)) {
          insertAt = i + 1;
          i++;
          continue;
        }
        // Multi-line import — advance until we find the closing `} from "..."`
        let j = i + 1;
        while (j < lines.length && !/^\s*\}\s*from\s+["'][^"']+["']\s*;?\s*$/.test(lines[j])) {
          j++;
        }
        insertAt = j + 1;
        i = j + 1;
        continue;
      }
      // Allow comments / blank lines between imports
      if (insertAt > 0 && /^\s*(\/\/|\/\*|\*|$)/.test(line)) {
        i++;
        continue;
      }
      if (insertAt > 0) break;
      i++;
    }
    lines.splice(insertAt, 0, `import { Eyebrow } from "@/components/pps/Eyebrow";`);
    final = lines.join("\n");
  }
  writeFileSync(file, final);
  totalChanges += fileChanges;
  changedFiles.push(`${rel} (+${fileChanges})`);
}

console.log(`migrated ${totalChanges} eyebrow(s) across ${changedFiles.length} file(s):`);
for (const f of changedFiles) console.log(`  ${f}`);
