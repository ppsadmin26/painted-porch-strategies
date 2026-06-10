/**
 * Guardrail: B2C quiz recommendations must be well-formed across every
 * possible answer combination.
 *
 * Invariants (per mem://features/quiz/b2b-recommendation-rules and the
 * B2C scoring spec in pathFinderQuiz.ts):
 *   - Result track is always "b2c"
 *   - resultType is one of RT1..RT6
 *   - Every offering key referenced resolves to a real entry in OFFERINGS
 *     (catches typos / dead refs)
 *   - RT1..RT5 always expose a non-empty primaryGroup
 *   - RT6 (exploration) uses groups[] only (no primaryGroup) and is never empty
 *   - B2C results never expose a Blue Door "strongestNextStep" (Blue Door
 *     is B2B-only; the B2C resolver intentionally leaves strongestNextStep
 *     undefined)
 */
import { describe, it, expect } from "vitest";
import { buildResult, OFFERINGS, type Answers } from "../pathFinderQuiz";

const OPTS = ["A", "B", "C", "D"] as const;
const VALID_RT = new Set(["RT1", "RT2", "RT3", "RT4", "RT5", "RT6"]);
const KNOWN_KEYS = new Set(Object.keys(OFFERINGS));

interface Combo {
  label: string;
  answers: Answers;
}

// Exhaustive: 4^6 = 4096 combinations across Q1..Q6
const combos: Combo[] = [];
for (const q1 of OPTS)
  for (const q2 of OPTS)
    for (const q3 of OPTS)
      for (const q4 of OPTS)
        for (const q5 of OPTS)
          for (const q6 of OPTS) {
            combos.push({
              label: `Q1=${q1} Q2=${q2} Q3=${q3} Q4=${q4} Q5=${q5} Q6=${q6}`,
              answers: { Q1: q1, Q2: q2, Q3: q3, Q4: q4, Q5: q5, Q6: q6 },
            });
          }

describe("B2C quiz recommendations (well-formedness guardrail)", () => {
  it(`enumerates all ${combos.length} Q1..Q6 combinations`, () => {
    expect(combos.length).toBe(4 ** 6);
  });

  it.each(combos)("$label → result is well-formed", ({ answers }) => {
    const result = buildResult("b2c", answers);

    // Track + resultType
    expect(result.track).toBe("b2c");
    expect(VALID_RT.has(result.resultType)).toBe(true);

    // Primary vs. groups shape
    if (result.resultType === "RT6") {
      expect(result.primaryGroup).toBeUndefined();
      expect(result.groups.length).toBeGreaterThan(0);
    } else {
      expect(result.primaryGroup).toBeDefined();
      expect(result.primaryGroup!.offerings.length).toBeGreaterThan(0);
    }

    // All referenced offering keys must exist in the catalog
    const allKeys = [
      ...(result.primaryGroup?.offerings.map((o) => o.key) ?? []),
      ...result.groups.flatMap((g) => g.offerings.map((o) => o.key)),
    ];
    for (const k of allKeys) {
      expect(KNOWN_KEYS.has(k), `Unknown offering key in B2C result: ${k}`).toBe(true);
    }

    // B2C never surfaces a Blue Door strongest-next-step
    if (result.strongestNextStep) {
      expect(result.strongestNextStep.kind).not.toBe("blueDoor");
    }
  });

  it("RT6 triggers whenever Q6=A regardless of Q1..Q5", () => {
    for (const q1 of OPTS)
      for (const q5 of OPTS) {
        const r = buildResult("b2c", { Q1: q1, Q2: "A", Q3: "A", Q4: "A", Q5: q5, Q6: "A" });
        expect(r.resultType).toBe("RT6");
      }
  });
});
