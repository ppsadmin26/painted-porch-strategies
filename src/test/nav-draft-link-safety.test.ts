import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf-8");

/**
 * Source-level guarantees that draft pages can never silently appear in
 * navigation surfaces or be reached via the four standalone "link-in-bio"
 * routes that live outside <PPSLayout>.
 *
 * Why source-level: PPSNavigation / PPSFooter / SmartLink / ParallaxCTA all
 * depend on Supabase live data via useArePagesLive / useIsPageLive. Wiring up
 * a real render with mocked sessions is high-cost; pinning the exact filtering
 * idioms here catches regressions immediately and runs in milliseconds.
 */
describe("Navigation and CTA surfaces filter draft links", () => {
  describe("PPSNavigation", () => {
    const nav = read("src/components/pps/PPSNavigation.tsx");

    it("imports useArePagesLive (batch live-status lookup)", () => {
      expect(nav).toMatch(/useArePagesLive/);
    });

    it("collects every nav href into a single lookup batch", () => {
      // We expect a memoized list of paths plus a single useArePagesLive call.
      expect(nav).toMatch(/useArePagesLive\(allPaths\)/);
    });

    it("filters parent links and dropdown children against liveMap", () => {
      expect(nav).toMatch(/liveMap\[c\.href\]\s*!==\s*false/);
      expect(nav).toMatch(/liveMap\[l\.href\]\s*!==\s*false/);
    });

    it("hides the Discover Your P.A.T.H.way CTA when /start-here is draft", () => {
      expect(nav).toMatch(/startHereLive/);
      expect(nav).toMatch(/liveMap\["\/start-here"\]\s*!==\s*false/);
    });
  });

  describe("PPSFooter", () => {
    const footer = read("src/components/pps/PPSFooter.tsx");

    it("imports useArePagesLive for footer link filtering", () => {
      expect(footer).toMatch(/useArePagesLive/);
    });

    it("passes both quickLinks and pathways through the live-status batch", () => {
      // Combined batch keeps the footer to a single page_status read.
      expect(footer).toMatch(
        /useArePagesLive\(\[\.\.\.quickLinks,\s*\.\.\.pathways\]\.map/,
      );
    });
  });

  describe("SmartLink", () => {
    const sl = read("src/components/pps/SmartLink.tsx");

    it("imports useIsPageLive (per-link status check)", () => {
      expect(sl).toMatch(/useIsPageLive/);
    });

    it("renders a non-interactive aria-disabled element when target is draft", () => {
      // All three variants (link/button/card) must mark themselves disabled
      // so screen readers and keyboard users never traverse a dead link.
      const matches = sl.match(/aria-disabled="true"/g) ?? [];
      expect(matches.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("ParallaxCTA", () => {
    const cta = read("src/components/pps/ParallaxCTA.tsx");

    it("imports useIsPageLive to suppress draft CTAs", () => {
      expect(cta).toMatch(/useIsPageLive/);
    });
  });
});

/**
 * The four "link-in-bio" routes (/amy, /rob, /sierra, /overview) live OUTSIDE
 * <PPSLayout>, so they don't inherit its <PageGate>. Each one must therefore
 * wrap its own element in <PageGate> explicitly — otherwise an admin marking
 * the path Draft in /admin/pages has no effect and the page stays public.
 *
 * As of this writing /overview is currently marked Draft in page_status, so a
 * regression here is a real public-visibility leak, not a hypothetical.
 */
describe("Standalone link-in-bio routes are gated", () => {
  const app = read("src/App.tsx");

  it("imports PageGate at the top of App.tsx", () => {
    expect(app).toMatch(/import\s+PageGate\s+from\s+["']\.\/components\/pps\/PageGate["']/);
  });

  for (const route of ["/amy", "/rob", "/sierra", "/overview"]) {
    it(`wraps ${route} in <PageGate>`, () => {
      // Match the route registration and assert PageGate appears on the line.
      const re = new RegExp(
        `<Route\\s+path="${route}"\\s+element=\\{<PageGate>`,
      );
      expect(app).toMatch(re);
    });
  }
});
