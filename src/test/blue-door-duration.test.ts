import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Guardrail: The Blue Door descriptor must consistently say
 * "less than 30 minutes" / "under 30 minutes". Any other minute-based
 * duration phrasing (e.g. "15-20 minutes", "45 minute", "90 minutes")
 * in active Blue Door surface area should fail CI.
 *
 * Scope: src/components/pps/blue-door/** and src/pages/pps/BlueDoor*.tsx
 * Excludes any path containing "_archive" (historical snapshots).
 */

const ROOTS = [
  "src/components/pps/blue-door",
  "src/pages/pps",
];

const PAGE_PREFIX = "BlueDoor"; // only BlueDoor*.tsx in src/pages/pps

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const full = join(dir, name);
    if (full.includes("_archive")) continue;
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, out);
    } else if (/\.(tsx?|mdx?)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

function collectFiles(): string[] {
  const files: string[] = [];
  // blue-door components: everything (non-archive)
  walk(ROOTS[0], files);
  // pages: only BlueDoor*.tsx
  try {
    for (const name of readdirSync(ROOTS[1])) {
      if (name.startsWith(PAGE_PREFIX) && /\.tsx?$/.test(name)) {
        files.push(join(ROOTS[1], name));
      }
    }
  } catch {
    /* ignore */
  }
  return files;
}

// Matches any "<number> minute(s)" or "<n>-<n> minute(s)" phrasing.
// Capture the leading number(s) to allow only when normalized to 30.
const DURATION_RE = /(\d+\s*(?:[-–]\s*\d+)?)\s*[-–]?\s*minutes?\b/gi;

// Allowed substrings (case-insensitive). If a match's surrounding ~40 chars
// includes one of these, treat it as compliant.
const ALLOWED_CONTEXTS = [
  "less than 30 minutes",
  "under 30 minutes",
  "30 minutes or less",
  "within 30 minutes",
];

function isAllowed(snippet: string): boolean {
  const lower = snippet.toLowerCase();
  return ALLOWED_CONTEXTS.some((p) => lower.includes(p));
}

describe("Blue Door duration descriptor", () => {
  const files = collectFiles();

  it("scans at least the known Blue Door surface area", () => {
    expect(files.length).toBeGreaterThan(5);
  });

  it("only uses 'less than/under 30 minutes' phrasing for the appraisal duration", () => {
    const violations: string[] = [];

    for (const file of files) {
      const src = readFileSync(file, "utf8");
      for (const match of src.matchAll(DURATION_RE)) {
        const start = Math.max(0, (match.index ?? 0) - 25);
        const end = Math.min(src.length, (match.index ?? 0) + match[0].length + 25);
        const window = src.slice(start, end);

        // Benign: "a few minutes" / "couple of minutes" etc. (no leading digit
        // captured) — the regex requires a digit, so this branch only triggers
        // for numeric durations. Allow "72 business hours" siblings etc. by
        // checking the surrounding window.
        if (isAllowed(window)) continue;

        // Allow "72 minutes"? No — Blue Door brief is "72 business hours".
        // Any remaining numeric "<n> minutes" is a violation.
        violations.push(
          `${relative(process.cwd(), file)}: "${match[0].trim()}" — context: "...${window.replace(/\s+/g, " ").trim()}..."`,
        );
      }
    }

    expect(
      violations,
      `Blue Door descriptor must say "less than 30 minutes" (or "under 30 minutes"). ` +
        `Found non-compliant duration phrasing:\n  - ${violations.join("\n  - ")}`,
    ).toEqual([]);
  });
});
