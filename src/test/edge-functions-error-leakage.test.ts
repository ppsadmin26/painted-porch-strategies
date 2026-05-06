import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Asserts that every opt-in / lead-capture edge function returns ONLY
 * `{"error":"Internal server error"}` from its 500 catch block, and never
 * leaks `err.message` / `error.message` / raw error objects to the client.
 *
 * This is a static-analysis test: it parses the function source and
 * inspects the catch block(s) that return a 500 response.
 */

const FUNCTIONS = [
  "submit-burnout-optin",
  "submit-communicator-styles-optin",
  "submit-ghl-lead",
  "submit-kick-habit-optin",
  "submit-newsletter-optin",
  "submit-pilot-training-optin",
  "submit-stoic-field-guide-optin",
];

const CANONICAL_BODY = `{ error: "Internal server error" }`;

function loadSource(name: string): string {
  const path = resolve(
    __dirname,
    "..",
    "..",
    "supabase",
    "functions",
    name,
    "index.ts",
  );
  return readFileSync(path, "utf8");
}

/** Extract the body of every top-level `catch (...) { ... }` block. */
function extractCatchBlocks(source: string): string[] {
  const blocks: string[] = [];
  const re = /catch\s*\([^)]*\)\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    let depth = 1;
    let i = m.index + m[0].length;
    const start = i;
    while (i < source.length && depth > 0) {
      const c = source[i];
      if (c === "{") depth++;
      else if (c === "}") depth--;
      i++;
    }
    blocks.push(source.slice(start, i - 1));
  }
  return blocks;
}

describe("opt-in / lead edge functions: 500 response hygiene", () => {
  for (const fn of FUNCTIONS) {
    describe(fn, () => {
      const source = loadSource(fn);
      const catches = extractCatchBlocks(source);
      const fiveHundredCatches = catches.filter((b) => /status:\s*500/.test(b));

      it("has at least one 500 catch handler", () => {
        expect(fiveHundredCatches.length).toBeGreaterThan(0);
      });

      it("returns ONLY the canonical {error: 'Internal server error'} body", () => {
        for (const block of fiveHundredCatches) {
          expect(block).toContain(CANONICAL_BODY);
        }
      });

      it("never leaks err.message / error.message / raw error in 500 response", () => {
        for (const block of fiveHundredCatches) {
          // Isolate just the Response/JSON.stringify portion (not console.error).
          const responseMatch = block.match(
            /return\s+new\s+Response\s*\(([\s\S]*?)\)\s*;?/,
          );
          expect(responseMatch).toBeTruthy();
          const responseArgs = responseMatch![1];

          expect(responseArgs).not.toMatch(/\berr\.message\b/);
          expect(responseArgs).not.toMatch(/\berror\.message\b/);
          expect(responseArgs).not.toMatch(/\be\.message\b/);
          expect(responseArgs).not.toMatch(/\.stack\b/);
          // No string interpolation of error variables in the body.
          expect(responseArgs).not.toMatch(/\$\{\s*(?:err|error|e)\b/);
          // No spreading the error into the JSON payload.
          expect(responseArgs).not.toMatch(/\.\.\.\s*(?:err|error|e)\b/);
        }
      });

      it("only the 'error' key appears in the 500 JSON body", () => {
        for (const block of fiveHundredCatches) {
          const jsonMatch = block.match(
            /JSON\.stringify\s*\(\s*\{([^}]*)\}\s*\)/,
          );
          expect(jsonMatch).toBeTruthy();
          const keys = jsonMatch![1]
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .map((kv) => kv.split(":")[0].trim().replace(/['"]/g, ""));
          expect(keys).toEqual(["error"]);
        }
      });
    });
  }
});
