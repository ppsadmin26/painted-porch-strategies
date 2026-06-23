import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf-8");

/**
 * Coverage contract for the browser-based axe accessibility sweep.
 *
 * The actual scan runs in CI via Playwright + @axe-core/playwright
 * (e2e/site-a11y.spec.ts) — that's where headless Chromium can compute
 * real ARIA, focus, and DOM state. This unit test does NOT re-run axe;
 * it asserts the sweep keeps covering the routes that matter most so a
 * new high-traffic page can't ship without being added to the list.
 *
 * If you launch a new key public page, add it to BOTH:
 *   1. e2e/site-a11y.spec.ts → ROUTES array
 *   2. KEY_ROUTES below
 */
const SPEC = "e2e/site-a11y.spec.ts";

const KEY_ROUTES = [
  // Top of funnel
  "/",
  "/about",
  "/about/approach",
  "/partner",
  "/partner/ignite",
  "/partner/amplify",
  "/partner/embody",
  // Conversion paths
  "/blue-door",
  "/contact",
  "/phase-zero",
  // Resources & evergreen
  "/resources",
  "/resources/insights",
  "/resources/free",
  "/resources/faq",
  // Opt-in / lead-capture (forms must stay screen-reader friendly)
  "/burnout",
  "/kick-the-habit",
  "/pilot-training",
  "/stoic-field-guide",
  // Standalone link-in-bio hubs (live outside PPSLayout)
  "/amy",
  "/rob",
  "/sierra",
];

describe("Axe a11y sweep coverage (e2e/site-a11y.spec.ts)", () => {
  it("the Playwright a11y spec exists and is wired up", () => {
    expect(existsSync(join(process.cwd(), SPEC))).toBe(true);
  });

  const src = existsSync(join(process.cwd(), SPEC)) ? read(SPEC) : "";

  it("uses @axe-core/playwright (real browser axe, not a stub)", () => {
    expect(src).toMatch(/@axe-core\/playwright/);
    expect(src).toMatch(/AxeBuilder/);
  });

  it("fails the build on critical + serious WCAG 2 A/AA violations", () => {
    // Pattern: .withTags([... "wcag2a", "wcag2aa" ...]) and impact filter.
    expect(src).toMatch(/wcag2a/);
    expect(src).toMatch(/wcag2aa/);
    expect(src).toMatch(/critical|serious/);
  });

  it.each(KEY_ROUTES)("covers %s", (route) => {
    // Route must appear verbatim inside the ROUTES array.
    expect(src).toContain(`"${route}"`);
  });

  it("runs in CI via the dedicated workflow (.github/workflows/site-a11y.yml)", () => {
    const wf = ".github/workflows/site-a11y.yml";
    expect(existsSync(join(process.cwd(), wf))).toBe(true);
    const yml = read(wf);
    expect(yml).toMatch(/site-a11y\.spec\.ts|playwright/i);
  });
});

describe("PageGate placeholder (ComingSoon) keeps draft routes a11y-safe", () => {
  // Draft routes redirect to ComingSoon, which must itself pass axe so the
  // sweep above doesn't generate false negatives just by hitting a drafted
  // URL. We assert the structural primitives axe checks for.
  const candidates = [
    "src/components/pps/ComingSoon.tsx",
    "src/pages/pps/ComingSoon.tsx",
    "src/components/ComingSoon.tsx",
  ];
  const path = candidates.find((p) => existsSync(join(process.cwd(), p)));

  it("ComingSoon component exists in the project", () => {
    expect(path).toBeTruthy();
  });

  if (path) {
    const src = read(path);

    it("renders a single landmark heading (h1) so screen readers announce the page", () => {
      expect(src).toMatch(/<h1[\s>]/);
    });

    it("provides a navigable way back (Link or Button) — no dead-end pages", () => {
      expect(src).toMatch(/<(Link|a|Button)\b/);
    });
  }
});
