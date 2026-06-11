#!/usr/bin/env node
/**
 * Regression guard: every <span ...>IF</span> used inside the brand word
 * "shIFt" must render bold. We accept either an explicit weight class
 * (font-bold / font-semibold / font-extrabold / font-black) or the
 * `.shift-if` utility defined in src/index.css.
 *
 * Run: `npm run brand:shift-if`
 * Exits non-zero if any IF span lacks bold styling.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "src");
const SPAN_IF = /<span\s+className="([^"]*)">IF<\/span>/g;
const BOLD = /\b(font-bold|font-semibold|font-extrabold|font-black|shift-if)\b/;

const offenders = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      const src = fs.readFileSync(full, "utf8");
      let m;
      while ((m = SPAN_IF.exec(src)) !== null) {
        if (!BOLD.test(m[1])) {
          const line = src.slice(0, m.index).split("\n").length;
          offenders.push(`${path.relative(process.cwd(), full)}:${line}  ${m[0]}`);
        }
      }
    }
  }
}

walk(ROOT);

if (offenders.length) {
  console.error("\nshIFt IF-bold guard failed. The following spans need `font-bold` or the `.shift-if` utility:\n");
  for (const o of offenders) console.error("  " + o);
  console.error(`\n${offenders.length} offending span(s).`);
  process.exit(1);
}

console.log(`shIFt IF-bold guard passed (scanned src/).`);
