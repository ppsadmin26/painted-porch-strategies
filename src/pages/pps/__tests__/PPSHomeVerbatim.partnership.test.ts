/**
 * Source-level regression test for the "Painted Porch Partnership" copy section
 * on /home-verbatim (src/pages/pps/PPSHomeVerbatim.tsx).
 *
 * Locks in:
 *  - Heading + badge
 *  - Italicized opening + closing phrases
 *  - The "Especially during periods of:" lead-in
 *  - All 6 bullet items in order
 *  - Bullet list styling (indentation + marker color matches body copy)
 *  - The two follow-on paragraphs (clarity / operational drift)
 *
 * If any of these change unintentionally, this test fails so we notice
 * before shipping.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const SRC = readFileSync(
  resolve(__dirname, "../PPSHomeVerbatim.tsx"),
  "utf-8"
);

describe("PPSHomeVerbatim › Painted Porch Partnership section", () => {
  it("keeps the badge and headline", () => {
    expect(SRC).toContain('badge-gold mb-4 inline-block">Painted Porch Partnership');
    expect(SRC).toContain("For the moments that carry broader consequences.");
  });

  it("keeps the italicized opening clause about people/systems/etc.", () => {
    expect(SRC).toMatch(
      /italic[^>]*>\s*for people, systems, leadership, culture, capacity,\s*operations, and the future direction of the organization\s*itself\./
    );
  });

  it("keeps the 'Especially during periods of:' lead-in", () => {
    expect(SRC).toContain("Especially during periods of:");
  });

  it("renders the 6 bullet items in the documented order", () => {
    const bullets = [
      "growth that feels increasingly complex",
      "moments of strategic inflection",
      "organizational stretching",
      "leadership alignment challenges",
      "AI-era transformation pressure",
      "questioning about what sustainable evolution actually looks like",
    ];

    let cursor = 0;
    for (const text of bullets) {
      const idx = SRC.indexOf(`<li>${text}</li>`, cursor);
      expect(idx, `bullet "${text}" missing or out of order`).toBeGreaterThan(-1);
      cursor = idx;
    }
  });

  it("uses indented bullets with marker color matching body copy", () => {
    // Indentation: pl-10 (mobile) / md:pl-12 (desktop)
    // Marker color: matches surrounding text via marker:text-foreground
    expect(SRC).toMatch(
      /<ul className="list-disc pl-10 md:pl-12 space-y-2 marker:text-foreground[^"]*">/
    );
  });

  it("keeps the two follow-on paragraphs (clarity + operational drift)", () => {
    expect(SRC).toContain(
      "clarity becomes more than a leadership"
    );
    expect(SRC).toContain(
      "creates operational drift you later"
    );
  });

  it("keeps the italicized closing clause about clarity/alignment/structure", () => {
    expect(SRC).toMatch(
      /italic[^>]*>\s*inside the clarity, alignment, structure, and deeper design\s*conversations that shape what shIFt happens next\./
    );
  });
});
