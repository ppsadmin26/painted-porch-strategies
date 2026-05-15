/**
 * Visual-regression guard for the P.A.T.H. road on PPSHomeVerbatim.
 *
 * We don't snapshot the rendered DOM (the page pulls auth, routing, Supabase,
 * etc.), so this is a *source-level* contract test: it locks in the invariants
 * that make the road look like one continuous, color-coded curve flowing
 * through the four boxes with seamless extensions on each side.
 *
 * Anything below was hand-tuned across multiple iterations — if you need to
 * change the shape, update the expectations here intentionally.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SRC = readFileSync(
  resolve(__dirname, "../PPSHomeVerbatim.tsx"),
  "utf-8"
);

describe("PPSHomeVerbatim — P.A.T.H. road continuity", () => {
  // ---------- Main road (4 colored segments, dashed centerline) ----------

  it("desktop road path spans the full grid as one smooth curve", () => {
    expect(SRC).toContain(
      'd="M 0 100 C 100 100, 200 50, 300 100 S 500 150, 600 100 S 800 50, 900 100 S 1100 150, 1200 100"'
    );
  });

  it("mobile road path uses the same shape with a flatter amplitude", () => {
    expect(SRC).toContain(
      'd="M 0 100 C 100 100, 200 70, 300 100 S 500 130, 600 100 S 800 70, 900 100 S 1100 130, 1200 100"'
    );
  });

  it("clip rects divide the road into 4 equal 300-unit segments per breakpoint", () => {
    for (const variant of ["Mobile", "Desktop"]) {
      expect(SRC).toContain(`<rect x="0" y="0" width="300" height="200" />`);
      expect(SRC).toContain(`<rect x="300" y="0" width="300" height="200" />`);
      expect(SRC).toContain(`<rect x="600" y="0" width="300" height="200" />`);
      expect(SRC).toContain(`<rect x="900" y="0" width="300" height="200" />`);
      // sanity: clip ids exist for both breakpoints
      expect(SRC).toMatch(new RegExp(`ppsRoad${variant}Clip[1-4]`));
    }
  });

  it("colored segments map P→teal, A→raspberry, T→gold, H→lime in order", () => {
    const order = ["--primary", "--raspberry", "--gold", "--lime"];
    for (const variant of ["Mobile", "Desktop"]) {
      const idx = order
        .map((tok) =>
          SRC.indexOf(
            `clipPath="url(#ppsRoad${variant}Clip${order.indexOf(tok) + 1})"`
          )
        )
        .filter((i) => i >= 0);
      expect(idx).toHaveLength(4);
      // Must appear in ascending source order (i.e., clip1 before clip2 before…)
      expect([...idx].sort((a, b) => a - b)).toEqual(idx);
      // And each segment must be stroked with its assigned color token
      for (const tok of order) {
        expect(SRC).toContain(`stroke="hsl(var(${tok}))"`);
      }
    }
  });

  // ---------- Curved extensions (left teal, right lime) ----------

  it("extensions match the road's bulge amplitude at each breakpoint", () => {
    // Desktop bulge = 50 (road peaks at y=50). Extensions mirror that height.
    expect(SRC).toContain('d="M 0 50 C 30 50, 60 100, 100 100"'); // left teal, desktop
    expect(SRC).toContain('d="M 0 100 C 40 80, 60 50, 100 50"'); // right lime, desktop
    // Mobile bulge = 70 (flatter). Extensions match.
    expect(SRC).toContain('d="M 0 70 C 30 70, 60 100, 100 100"'); // left teal, mobile
    expect(SRC).toContain('d="M 0 100 C 40 88, 60 70, 100 70"'); // right lime, mobile
  });

  it("right-side extension enters at the same up-right tangent the road exits with", () => {
    // Road's last segment exits with B'(1) = (300, -150) desktop  →  slope -0.5
    //                                       (300,  -90) mobile   →  slope -0.3
    // Extension's first control point encodes that slope:
    //   desktop: P1 = (40, 80)  →  3·(40,-20) = (120,-60)  →  slope -0.5  ✓
    //   mobile : P1 = (40, 88)  →  3·(40,-12) = (120,-36)  →  slope -0.3  ✓
    expect(SRC).toMatch(/M 0 100 C 40 80,\s*60 50,\s*100 50/);
    expect(SRC).toMatch(/M 0 100 C 40 88,\s*60 70,\s*100 70/);
  });

  it("left-side extension exits with a horizontal tangent matching the road's flat entry", () => {
    // Road's first segment enters with B'(0) = (300, 0)  →  horizontal.
    // Extensions end with P2.y == P3.y == 100 so 3·(P3-P2) is horizontal.
    expect(SRC).toMatch(/C 30 50,\s*60 100,\s*100 100/); // desktop
    expect(SRC).toMatch(/C 30 70,\s*60 100,\s*100 100/); // mobile
  });

  it("extension stroke widths and opacities equal the main road's per breakpoint", () => {
    // Desktop main road: strokeWidth=28, opacity=0.6, dash 8/8
    expect(SRC).toMatch(/strokeWidth="28"[^/]*opacity="0\.6"/s);
    // Mobile main road: strokeWidth=20, opacity=0.4, dash 6/6
    expect(SRC).toMatch(/strokeWidth="20"[^/]*opacity="0\.4"/s);
    // Dashed centerlines exist at both breakpoints
    expect(SRC).toContain('strokeDasharray="8 8"');
    expect(SRC).toContain('strokeDasharray="6 6"');
  });

  it("colored extension paths use round caps so the junction has no visible seam", () => {
    // Round caps fill any sub-pixel wedge created by non-uniform x/y scaling
    // where the extension SVG meets the main road SVG.
    const roundCapColored = SRC.match(
      /<path\b[^/]*?stroke="hsl\(var\(--(?:primary|lime)\)\)"[^/]*?strokeLinecap="round"[^/]*?\/>/gs
    );
    // 2 sides × 2 breakpoints = 4 colored extension paths
    expect(roundCapColored?.length).toBe(4);
  });

  it("extension SVGs are positioned to reach the white card's padding on each side", () => {
    // Negative-margin classes so the extension sits in the card's padding
    // (24px mobile, 32px sm, 48px md). Width matches the same padding.
    expect(SRC).toMatch(
      /-left-6 sm:-left-8 md:-left-12 w-6 sm:w-8 md:w-12/
    );
    expect(SRC).toMatch(
      /-right-6 sm:-right-8 md:-right-12 w-6 sm:w-8 md:w-12/
    );
    // Extensions and main road share the same vertical center + height ramp
    // so they line up perfectly across breakpoints.
    expect(SRC).toMatch(/top-\[42%\] -translate-y-1\/2[^"]*h-\[120%\] sm:h-\[140%\]/);
  });
});
