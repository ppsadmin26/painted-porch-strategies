/**
 * Cap guardrail: verify the recommendation cap holds across every quiz
 * result combination and a range of realistic supplemental inputs.
 *
 * The `capRecommendations` helper mirrors the exact algorithm used inside
 * `PathFinderQuizDialog.tsx`. Testing the helper here means the invariants
 * are exhaustively validated without rendering the dialog.
 *
 * Guarantees under test:
 *   - Total surfaced items never exceed MAX_TOTAL_RECOMMENDATIONS (6).
 *   - Primary + secondary offerings never exceed MAX_PRIMARY_SECONDARY (4).
 *   - Supplemental (opPlatform + related) never exceeds MAX_SUPPLEMENTAL (3).
 *   - Related Reading is capped at MAX_RELATED (2).
 *   - No offering (by url / name / key) appears in more than one bucket.
 */
import { describe, it, expect } from "vitest";
import {
  capRecommendations,
  MAX_TOTAL_RECOMMENDATIONS,
  MAX_PRIMARY_SECONDARY,
  MAX_SUPPLEMENTAL,
  MAX_RELATED,
  type CapInput,
  type CapOffering,
} from "../capRecommendations";
import {
  buildResult,
  OFFERINGS,
  type Answers,
  type Track,
} from "@/data/pathFinderQuiz";

const OPTS = ["A", "B", "C", "D"] as const;

// Build a large, realistic supplemental fixture — 8 op-platform offerings +
// 5 related-content items — so the helper actually has to trim under budget.
const opPlatformFixture: CapInput["opPlatformGroup"] = {
  heading: "More from the Porch",
  offerings: Array.from({ length: 8 }, (_, i) => ({
    key: `op-${i}`,
    name: `Op Platform Item ${i}`,
    url: `https://paintedporch-ops.lovable.app/item-${i}`,
  })),
};

const relatedFixture: CapInput["relatedContent"] = Array.from(
  { length: 5 },
  (_, i) => ({
    kind: i % 2 === 0 ? "blog" : "media",
    url: `/insights/post-${i}`,
    title: `Related item ${i}`,
    source: i % 2 === 1 ? "Podcast" : undefined,
  }),
);

function collectAllOfferingIds(offerings: CapOffering[]): string[] {
  const ids: string[] = [];
  for (const o of offerings) {
    if (o.url) ids.push(`u:${o.url.trim().toLowerCase().replace(/\/+$/, "")}`);
    if (o.name) ids.push(`n:${o.name.trim().toLowerCase()}`);
    if (o.key) ids.push(`k:${o.key}`);
  }
  return ids;
}

function assertNoDuplicates(output: ReturnType<typeof capRecommendations>) {
  const all: CapOffering[] = [];
  if (output.primary) all.push(...output.primary.offerings);
  for (const g of output.secondaryGroups) all.push(...g.offerings);
  if (output.opPlatform) all.push(...output.opPlatform.offerings);
  const ids = collectAllOfferingIds(all);
  expect(new Set(ids).size).toBe(ids.length);
}

interface Combo {
  label: string;
  track: Track;
  answers: Answers;
}

const combos: Combo[] = [];

// B2C: exhaust Q1..Q6 (PQ2 fixed at aspiring/leading pair, use "aspiring")
for (const q1 of OPTS)
  for (const q2 of OPTS)
    for (const q3 of OPTS)
      for (const q4 of OPTS)
        for (const q5 of OPTS)
          for (const q6 of OPTS)
            combos.push({
              label: `B2C Q1=${q1} Q2=${q2} Q3=${q3} Q4=${q4} Q5=${q5} Q6=${q6}`,
              track: "b2c",
              answers: {
                PQ1: "A",
                PQ2: "aspiring",
                Q1: q1,
                Q2: q2,
                Q3: q3,
                Q4: q4,
                Q5: q5,
                Q6: q6,
              },
            });

// B2B: exhaust each branch's own question tree. Each branch has Q1..Q3 +
// Q4DM (decision-maker toggle, A = scout / B = team). 4^3 * 2 = 128 per
// branch * 4 branches = 512 combos.
const branches: Array<{ pq2: string; qids: string[] }> = [
  { pq2: "A", qids: ["Q1", "Q2", "Q3"] },
  { pq2: "B", qids: ["Q1", "Q2", "Q3"] },
  { pq2: "C", qids: ["Q1", "Q2", "Q3"] },
  { pq2: "D", qids: ["Q1", "Q2", "Q3"] },
];
for (const b of branches) {
  for (const q1 of OPTS)
    for (const q2 of OPTS)
      for (const q3 of OPTS)
        for (const dm of ["A", "B"] as const) {
          combos.push({
            label: `B2B pq2=${b.pq2} Q1=${q1} Q2=${q2} Q3=${q3} DM=${dm}`,
            track: "b2b",
            answers: {
              PQ1: "B",
              OrgPQ2: b.pq2,
              Q1: q1,
              Q2: q2,
              Q3: q3,
              Q4DM: dm,
            },
          });
        }
}

// Realistic blueDoorRequiredKeys sample — mirror common flagged workshops.
const blueDoorRequiredKeys = new Set<string>(
  Object.keys(OFFERINGS)
    .filter((k) => /workshop|amplify|leader|change/i.test(k))
    .slice(0, 5),
);

describe("capRecommendations — global cap invariants", () => {
  it(`enumerates all ${combos.length} quiz combinations`, () => {
    // 4^6 (B2C) + 4^3 * 2 * 4 (B2B) = 4096 + 512 = 4608
    expect(combos.length).toBe(4 ** 6 + 4 ** 3 * 2 * 4);
  });

  it.each(combos)(
    "$label → total items ≤ MAX and no duplicates",
    ({ track, answers }) => {
      const result = buildResult(track, answers);
      const scoutMode = answers["Q4DM"] === "A";

      const output = capRecommendations({
        strongestNextStep: result.strongestNextStep ?? null,
        primaryGroup: result.primaryGroup ?? null,
        groups: result.groups ?? [],
        opPlatformGroup: opPlatformFixture,
        relatedContent: relatedFixture,
        blueDoorRequiredKeys,
        isB2B: track === "b2b",
        scoutMode,
      });

      const t = output.totals;

      // Hard global cap.
      expect(t.total).toBeLessThanOrEqual(MAX_TOTAL_RECOMMENDATIONS);

      // Primary + secondary (offerings) cap.
      expect(t.primary + t.secondary).toBeLessThanOrEqual(
        MAX_PRIMARY_SECONDARY,
      );

      // Supplemental cap.
      expect(t.opPlatform + t.related).toBeLessThanOrEqual(MAX_SUPPLEMENTAL);

      // Related reading cap.
      expect(t.related).toBeLessThanOrEqual(MAX_RELATED);

      // SNS is always 0 or 1.
      expect(t.sns === 0 || t.sns === 1).toBe(true);

      // Global dedup across every surfaced bucket.
      assertNoDuplicates(output);
    },
  );
});

describe("capRecommendations — degenerate inputs still hold the cap", () => {
  it("empty inputs produce empty output with total 0", () => {
    const out = capRecommendations({
      strongestNextStep: null,
      primaryGroup: null,
      groups: [],
      opPlatformGroup: null,
      relatedContent: [],
      blueDoorRequiredKeys: new Set(),
      isB2B: false,
      scoutMode: false,
    });
    expect(out.totals.total).toBe(0);
    expect(out.primary).toBeNull();
    expect(out.secondaryGroups).toEqual([]);
    expect(out.opPlatform).toBeNull();
    expect(out.related).toEqual([]);
  });

  it("massively oversized inputs are still capped at MAX_TOTAL_RECOMMENDATIONS", () => {
    const bigPrimary = {
      heading: "Primary",
      offerings: Array.from({ length: 50 }, (_, i) => ({
        key: `p-${i}`,
        name: `P${i}`,
        url: `/p/${i}`,
      })),
    };
    const bigGroups = Array.from({ length: 10 }, (_, gi) => ({
      heading: `G${gi}`,
      offerings: Array.from({ length: 20 }, (_, i) => ({
        key: `g${gi}-${i}`,
        name: `G${gi}I${i}`,
        url: `/g/${gi}/${i}`,
      })),
    }));
    const bigOp = {
      heading: "Op",
      offerings: Array.from({ length: 30 }, (_, i) => ({
        key: `op-${i}`,
        name: `Op${i}`,
        url: `https://op/${i}`,
      })),
    };
    const bigRelated = Array.from({ length: 30 }, (_, i) => ({
      kind: "blog",
      url: `/r/${i}`,
      title: `R${i}`,
    }));

    const out = capRecommendations({
      strongestNextStep: {
        offering: { key: "sns", name: "SNS", url: "/sns" },
      },
      primaryGroup: bigPrimary,
      groups: bigGroups,
      opPlatformGroup: bigOp,
      relatedContent: bigRelated,
      blueDoorRequiredKeys: new Set(),
      isB2B: false,
      scoutMode: false,
    });

    expect(out.totals.total).toBeLessThanOrEqual(MAX_TOTAL_RECOMMENDATIONS);
    expect(out.totals.primary + out.totals.secondary).toBeLessThanOrEqual(
      MAX_PRIMARY_SECONDARY,
    );
    expect(out.totals.opPlatform + out.totals.related).toBeLessThanOrEqual(
      MAX_SUPPLEMENTAL,
    );
    expect(out.totals.related).toBeLessThanOrEqual(MAX_RELATED);
  });

  it("duplicate offerings across buckets are surfaced only once", () => {
    const shared = { key: "shared", name: "Shared", url: "/shared" };
    const out = capRecommendations({
      strongestNextStep: { offering: shared },
      primaryGroup: {
        heading: "Primary",
        offerings: [
          shared,
          { key: "p1", name: "P1", url: "/p1" },
          { key: "p2", name: "P2", url: "/p2" },
        ],
      },
      groups: [
        {
          heading: "Group",
          offerings: [shared, { key: "g1", name: "G1", url: "/g1" }],
        },
      ],
      opPlatformGroup: {
        heading: "Op",
        offerings: [shared, { key: "op1", name: "Op1", url: "/op1" }],
      },
      relatedContent: [
        { kind: "blog", url: "/shared", title: "Shared" },
        { kind: "blog", url: "/r1", title: "R1" },
      ],
      blueDoorRequiredKeys: new Set(),
      isB2B: false,
      scoutMode: false,
    });

    const all = [
      ...(out.primary?.offerings ?? []),
      ...out.secondaryGroups.flatMap((g) => g.offerings),
      ...(out.opPlatform?.offerings ?? []),
    ];
    // "shared" must not appear in any bucket since it's already the SNS.
    expect(all.some((o) => o.key === "shared")).toBe(false);
    // Related dedup drops the "/shared" reference too.
    expect(out.related.some((r) => r.url === "/shared")).toBe(false);
  });
});
