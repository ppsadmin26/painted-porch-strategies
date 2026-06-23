import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf-8");

/**
 * Guards the two route-aware scroll components that keep deep-links and
 * route changes working across the SPA:
 *
 *   - ScrollToTop         — resets scroll on pathname change, skips when a
 *                           hash is present so deep-links still land on the
 *                           target section.
 *   - ScrollToHash (App)  — retries the anchor lookup with backoff, uses
 *                           fuzzy id matching, and falls back to top-of-page
 *                           when the anchor never mounts.
 */

describe("ScrollToTop (src/components/ScrollToTop.tsx)", () => {
  const src = read("src/components/ScrollToTop.tsx");

  it("uses useLayoutEffect so the reset fires before paint (no flash of prev scroll)", () => {
    expect(src).toMatch(/useLayoutEffect/);
    expect(src).not.toMatch(/useEffect\(/);
  });

  it("skips when a hash is present so ScrollToHash can deep-link", () => {
    expect(src).toMatch(/if\s*\(hash\)\s*return/);
  });

  it("re-runs on both pathname and hash changes", () => {
    expect(src).toMatch(/\[pathname,\s*hash\]/);
  });

  it("uses instant behavior (smooth would jump after content paints)", () => {
    expect(src).toMatch(/behavior:\s*["']instant["']/);
  });

  it("falls back to documentElement + body scrollTop for older Safari quirks", () => {
    expect(src).toMatch(/documentElement[\s\S]*scrollTop\s*=\s*0/);
    expect(src).toMatch(/document\.body[\s\S]*scrollTop\s*=\s*0/);
  });
});

describe("ScrollToHash (declared inside src/App.tsx)", () => {
  const src = read("src/App.tsx");

  it("only runs when a hash is present", () => {
    expect(src).toMatch(/function ScrollToHash[\s\S]{0,400}?if\s*\(!hash\)\s*return/);
  });

  it("decodes the hash so URL-encoded anchors (#workshop%20name) still match", () => {
    expect(src).toMatch(/decodeURIComponent\(hash\.slice\(1\)\)/);
  });

  it("retries with backoff so cards that mount after data load still resolve", () => {
    // The attempts array is the contract — if it shrinks below ~5 entries,
    // late-mounting anchors will silently fail.
    const match = src.match(/const attempts = \[([^\]]+)\]/);
    expect(match).toBeTruthy();
    const delays = match![1].split(",").map((s) => Number(s.trim()));
    expect(delays.length).toBeGreaterThanOrEqual(5);
    // Strictly increasing, last attempt covers slow data fetches.
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeGreaterThan(delays[i - 1]);
    }
    expect(delays[delays.length - 1]).toBeGreaterThanOrEqual(1000);
  });

  it("uses fuzzy id matching so `architect-change` and `architectChange` both resolve", () => {
    expect(src).toMatch(/findElementByFuzzyId/);
  });

  it("falls back to scrolling to top when the anchor never appears", () => {
    expect(src).toMatch(/window\.scrollTo\(\{\s*top:\s*0/);
  });

  it("cancels pending timers on unmount so navigating away doesn't jump back", () => {
    expect(src).toMatch(/cancelled\s*=\s*true/);
  });

  it("uses smooth scroll for the actual anchor jump (matches design system)", () => {
    expect(src).toMatch(/scrollIntoView\(\{\s*behavior:\s*["']smooth["']/);
  });
});

describe("App.tsx mounts both scroll guards exactly once", () => {
  const src = read("src/App.tsx");

  it("renders ScrollToTop inside the Router", () => {
    // Imported and rendered.
    expect(src).toMatch(/ScrollToTop/);
    expect(src).toMatch(/<ScrollToTop\s*\/>/);
  });

  it("renders ScrollToHash inside the Router", () => {
    expect(src).toMatch(/<ScrollToHash\s*\/>/);
  });

  it("only declares ScrollToHash once (no accidental duplicate)", () => {
    const matches = src.match(/function ScrollToHash/g) ?? [];
    expect(matches.length).toBe(1);
    const mounts = src.match(/<ScrollToHash\s*\/>/g) ?? [];
    expect(mounts.length).toBe(1);
  });
});
