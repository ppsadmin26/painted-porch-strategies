/**
 * Guardrail: B2B quiz recommendations must never include Lab offerings.
 *
 * Rule (from mem://features/quiz/b2b-recommendation-rules):
 *   B2B primary recommendations = Workshops + Blue Door + Speaking only.
 *   Labs are B2C-only. The ONLY allowed surface for a Lab in a B2B result
 *   is the textual `crossoverNote` on RT-C when Q1Cap=B + Q2Cap=C
 *   (individual-leader development crossover), which redirects the
 *   individual to retake the quiz on the B2C track.
 *
 * This test exhaustively walks every B2B answer combination and asserts:
 *   - No Lab offering appears in primaryGroup.offerings
 *   - No Lab offering appears in any groups[].offerings
 *   - No Lab offering appears in strongestNextStep.offering
 */
import { describe, it, expect } from "vitest";
import { buildResult, OFFERINGS, type Answers, type OfferingKey } from "../pathFinderQuiz";

const LAB_KEYS: OfferingKey[] = (Object.keys(OFFERINGS) as OfferingKey[]).filter(
  (k) => k.endsWith("Lab"),
);

function isLabOffering(key: string): boolean {
  return (LAB_KEYS as string[]).includes(key);
}

// Enumerate combinations per branch. We cover every Q1/Q2 combo and
// representative PQ3 / Q4DM values, since those drive routing + strongest.
const PQ3_VALUES = ["A", "B", "C"] as const;
const Q4DM_VALUES = ["A", "B", "C", "D"] as const;

interface Combo {
  label: string;
  answers: Answers;
}

const combos: Combo[] = [];

// Team branch (PQ2=A): Q1Team A-D, Q2Team A-C
for (const q1 of ["A", "B", "C", "D"]) {
  for (const q2 of ["A", "B", "C"]) {
    for (const pq3 of PQ3_VALUES) {
      combos.push({
        label: `RT-A Q1Team=${q1} Q2Team=${q2} PQ3=${pq3}`,
        answers: { OrgPQ2: "A", Q1Team: q1, Q2Team: q2, Q4DM: "C", OrgPQ3: pq3 },
      });
    }
  }
}

// Change branch (PQ2=B): Q1Change A-D, Q2Change A-D
for (const q1 of ["A", "B", "C", "D"]) {
  for (const q2 of ["A", "B", "C", "D"]) {
    for (const pq3 of PQ3_VALUES) {
      combos.push({
        label: `RT-B Q1Change=${q1} Q2Change=${q2} PQ3=${pq3}`,
        answers: { OrgPQ2: "B", Q1Change: q1, Q2Change: q2, Q4DM: "C", OrgPQ3: pq3 },
      });
    }
  }
}

// Capability branch (PQ2=C): Q1Cap A-D, Q2Cap A-C — includes crossover (B+C)
for (const q1 of ["A", "B", "C", "D"]) {
  for (const q2 of ["A", "B", "C"]) {
    for (const pq3 of PQ3_VALUES) {
      combos.push({
        label: `RT-C Q1Cap=${q1} Q2Cap=${q2} PQ3=${pq3}`,
        answers: { OrgPQ2: "C", Q1Cap: q1, Q2Cap: q2, Q4DM: "C", OrgPQ3: pq3 },
      });
    }
  }
}

// Strategic branch (PQ2=D): Q1Strategic A-D
for (const q1 of ["A", "B", "C", "D"]) {
  for (const pq3 of PQ3_VALUES) {
    combos.push({
      label: `RT-D Q1Strategic=${q1} PQ3=${pq3}`,
      answers: { OrgPQ2: "D", Q1Strategic: q1, Q4DM: "C", OrgPQ3: pq3 },
    });
  }
}

// RT-E ambiguous fallback. Q4DM="A" (scout) is intentionally rerouted to
// surface a Lab — see applyScoutReroute. The Labs-guardrail covers non-scout
// Q4DM values only; the scout path has its own assertions below.
for (const q4 of Q4DM_VALUES.filter((v) => v !== "A")) {
  combos.push({
    label: `RT-E PQ2=empty PQ3=C Q4DM=${q4}`,
    answers: { OrgPQ2: "", Q4DM: q4, OrgPQ3: "C" },
  });
}

describe("B2B quiz recommendations (Labs guardrail)", () => {
  it("has at least one Lab offering defined to test against", () => {
    expect(LAB_KEYS.length).toBeGreaterThan(0);
  });

  it.each(combos)("$label → no Lab in any recommendation surface", ({ answers }) => {
    const result = buildResult("b2b", answers);

    const primaryKeys = result.primaryGroup?.offerings.map((o) => o.key) ?? [];
    const groupKeys = (result.groups ?? []).flatMap((g) => g.offerings.map((o) => o.key));
    const strongestKey = result.strongestNextStep?.offering.key;

    const offending = [
      ...primaryKeys.filter(isLabOffering).map((k) => `primaryGroup:${k}`),
      ...groupKeys.filter(isLabOffering).map((k) => `groups:${k}`),
      ...(strongestKey && isLabOffering(strongestKey) ? [`strongestNextStep:${strongestKey}`] : []),
    ];

    expect(offending, `B2B result must not surface Labs. Found: ${offending.join(", ")}`).toEqual([]);
  });

  it("RT-C crossover (Q1Cap=B + Q2Cap=C) surfaces Lab ONLY in crossoverNote text", () => {
    const result = buildResult("b2b", {
      OrgPQ2: "C",
      Q1Cap: "B",
      Q2Cap: "C",
      Q4DM: "C",
      OrgPQ3: "A",
    });
    expect(result.resultType).toBe("RT-C");
    expect(result.crossoverNote).toBeDefined();
    expect(result.crossoverNote).toMatch(/Lab/);
    // And still no Lab in the actual recommendation surfaces:
    const allKeys = [
      ...(result.primaryGroup?.offerings.map((o) => o.key) ?? []),
      ...(result.groups ?? []).flatMap((g) => g.offerings.map((o) => o.key)),
    ];
    expect(allKeys.filter(isLabOffering)).toEqual([]);
  });
});

describe("B2B scout reroute (Q4DM=A) — individual focus signaled", () => {
  // Per mem://features/quiz/b2b-recommendation-rules: Labs are B2C unless
  // individual focus is signaled. Q4DM="A" ("Just me — exploring before
  // bringing a recommendation to others") is that signal.
  const scoutCases: { label: string; answers: Answers; expectedLab: string }[] = [
    { label: "RT-A scout, Q1Team=A → conflictToConnectionLab",
      answers: { OrgPQ2: "A", Q1Team: "A", Q2Team: "A", Q4DM: "A", OrgPQ3: "C" },
      expectedLab: "conflictToConnectionLab" },
    { label: "RT-A scout, Q1Team=C → goldilocksLab",
      answers: { OrgPQ2: "A", Q1Team: "C", Q2Team: "A", Q4DM: "A", OrgPQ3: "C" },
      expectedLab: "goldilocksLab" },
    { label: "RT-B scout, Q1Change=D → aiEiOhLab",
      answers: { OrgPQ2: "B", Q1Change: "D", Q2Change: "A", Q4DM: "A", OrgPQ3: "C" },
      expectedLab: "aiEiOhLab" },
    { label: "RT-C scout, Q1Cap=B → stracticalLeaderLab",
      answers: { OrgPQ2: "C", Q1Cap: "B", Q2Cap: "A", Q4DM: "A", OrgPQ3: "C" },
      expectedLab: "stracticalLeaderLab" },
    { label: "RT-D scout, Q1Strategic=A → stoicismLab",
      answers: { OrgPQ2: "D", Q1Strategic: "A", Q4DM: "A", OrgPQ3: "C" },
      expectedLab: "stoicismLab" },
  ];

  it.each(scoutCases)("$label", ({ answers, expectedLab }) => {
    const result = buildResult("b2b", answers);
    expect(result.track).toBe("b2b");
    expect(result.subhead).toMatch(/Scout Mode/i);
    expect(result.primaryGroup?.offerings[0]?.key).toBe(expectedLab);
    expect(result.strongestNextStep?.offering.key).toBe(expectedLab);
    const hasWorkshopGroup = result.groups.some((g) =>
      /When You're Ready to Bring Your Team/i.test(g.heading),
    );
    expect(hasWorkshopGroup).toBe(true);
    const hasBlueDoorGroup = result.groups.some((g) =>
      /Blue Door/i.test(g.heading),
    );
    expect(hasBlueDoorGroup).toBe(true);
  });
});
