/**
 * Edge-case guardrails for quiz recommendation output.
 *
 * Covers two failure modes that have historically been easy to reintroduce:
 *
 *   1. **Duplicate delivery formats** — the same offering (by key) or the same
 *      (name, tier) pair appearing in more than one surface within a single
 *      result (e.g., listed in primaryGroup AND a secondary group, or the
 *      strongestNextStep repeated inside primaryGroup). Users see this as
 *      "why is Blue Door showing up three times?" and it inflates the visible
 *      recommendation count past our cap.
 *
 *   2. **Category leakage across tracks** — B2C-only tiers (IGNITE courses,
 *      AMPLIFY Labs) appearing in a B2B result, or B2B-only tiers (Blue Door,
 *      Workshop, Speaking) appearing in a B2C result. The Labs guardrail lives
 *      in `pathFinderQuiz.b2b.test.ts`; this file extends the rule to every
 *      forbidden tier on both tracks so a future OFFERINGS entry with the
 *      wrong tier can't slip through.
 *
 * Both invariants are asserted across every reachable B2B branch and a
 * representative slice of B2C combinations (full 4^6 sweep already lives in
 * `pathFinderQuiz.b2c.test.ts`; here we only need enough to exercise each
 * RT1..RT6 bucket).
 */
import { describe, it, expect } from "vitest";
import {
  buildResult,
  OFFERINGS,
  RT_TO_CONTENT_CATEGORIES,
  type Answers,
  type Offering,
  type QuizResult,
} from "../pathFinderQuiz";

// ---------- helpers ----------

function allSurfaces(r: QuizResult): { where: string; offering: Offering }[] {
  const out: { where: string; offering: Offering }[] = [];
  for (const o of r.primaryGroup?.offerings ?? []) out.push({ where: "primaryGroup", offering: o });
  for (const g of r.groups ?? []) {
    for (const o of g.offerings) out.push({ where: `group:${g.heading}`, offering: o });
  }
  if (r.strongestNextStep?.offering) {
    out.push({ where: "strongestNextStep", offering: r.strongestNextStep.offering });
  }
  return out;
}

function findDuplicateKeys(r: QuizResult): { key: string; locations: string[] }[] {
  const byKey = new Map<string, string[]>();
  for (const { where, offering } of allSurfaces(r)) {
    const arr = byKey.get(offering.key) ?? [];
    arr.push(where);
    byKey.set(offering.key, arr);
  }
  return Array.from(byKey.entries())
    .filter(([, locs]) => locs.length > 1)
    .map(([key, locations]) => ({ key, locations }));
}

function findDuplicateFormats(r: QuizResult): { format: string; locations: string[] }[] {
  // (name, tier) collision across DIFFERENT keys catches accidental catalog
  // duplication — e.g., two workshop entries with the same visible name.
  const byFormat = new Map<string, { key: string; where: string }[]>();
  for (const { where, offering } of allSurfaces(r)) {
    const format = `${offering.name}|${offering.tier}`;
    const arr = byFormat.get(format) ?? [];
    arr.push({ key: offering.key, where });
    byFormat.set(format, arr);
  }
  return Array.from(byFormat.entries())
    .filter(([, entries]) => {
      const uniqueKeys = new Set(entries.map((e) => e.key));
      // >1 distinct key with the same (name, tier) = a real dup format.
      return uniqueKeys.size > 1;
    })
    .map(([format, entries]) => ({
      format,
      locations: entries.map((e) => `${e.where}:${e.key}`),
    }));
}

const B2B_FORBIDDEN_TIERS = new Set<Offering["tier"]>(["IGNITE", "AMPLIFY"]);
const B2C_FORBIDDEN_TIERS = new Set<Offering["tier"]>(["Blue Door", "Workshop", "Speaking"]);

function tierLeaks(r: QuizResult, forbidden: Set<Offering["tier"]>) {
  return allSurfaces(r)
    .filter(({ offering }) => forbidden.has(offering.tier))
    .map(({ where, offering }) => `${where}:${offering.key}(${offering.tier})`);
}

// ---------- B2B combinations (all branches × representative PQ3 / Q4DM) ----------

interface B2BCase { label: string; answers: Answers }

const b2bCases: B2BCase[] = [];
const PQ3 = ["A", "B", "C"] as const;
const Q4DM = ["A", "B", "C", "D"] as const;

for (const q1 of ["A", "B", "C", "D"]) {
  for (const q2 of ["A", "B", "C"]) {
    for (const pq3 of PQ3) {
      for (const q4 of Q4DM) {
        b2bCases.push({
          label: `RT-A Q1Team=${q1} Q2Team=${q2} PQ3=${pq3} Q4DM=${q4}`,
          answers: { OrgPQ2: "A", Q1Team: q1, Q2Team: q2, OrgPQ3: pq3, Q4DM: q4 },
        });
      }
    }
  }
}
for (const q1 of ["A", "B", "C", "D"]) {
  for (const q2 of ["A", "B", "C", "D"]) {
    for (const pq3 of PQ3) {
      for (const q4 of Q4DM) {
        b2bCases.push({
          label: `RT-B Q1Change=${q1} Q2Change=${q2} PQ3=${pq3} Q4DM=${q4}`,
          answers: { OrgPQ2: "B", Q1Change: q1, Q2Change: q2, OrgPQ3: pq3, Q4DM: q4 },
        });
      }
    }
  }
}
for (const q1 of ["A", "B", "C", "D"]) {
  for (const q2 of ["A", "B", "C"]) {
    for (const pq3 of PQ3) {
      for (const q4 of Q4DM) {
        b2bCases.push({
          label: `RT-C Q1Cap=${q1} Q2Cap=${q2} PQ3=${pq3} Q4DM=${q4}`,
          answers: { OrgPQ2: "C", Q1Cap: q1, Q2Cap: q2, OrgPQ3: pq3, Q4DM: q4 },
        });
      }
    }
  }
}
for (const q1 of ["A", "B", "C", "D"]) {
  for (const pq3 of PQ3) {
    for (const q4 of Q4DM) {
      b2bCases.push({
        label: `RT-D Q1Strategic=${q1} PQ3=${pq3} Q4DM=${q4}`,
        answers: { OrgPQ2: "D", Q1Strategic: q1, OrgPQ3: pq3, Q4DM: q4 },
      });
    }
  }
}
for (const q4 of Q4DM) {
  b2bCases.push({
    label: `RT-E PQ2=empty PQ3=C Q4DM=${q4}`,
    answers: { OrgPQ2: "", OrgPQ3: "C", Q4DM: q4 },
  });
}

// ---------- B2C combinations (one representative per RT bucket + a broad slice) ----------

const b2cCases: { label: string; answers: Answers }[] = [];
// One combo per RT bucket to cover shape variance, then a stride sample.
const OPTS = ["A", "B", "C", "D"] as const;
for (const q1 of OPTS) {
  for (const q6 of OPTS) {
    b2cCases.push({
      label: `B2C Q1=${q1} Q2=A Q3=A Q4=A Q5=A Q6=${q6}`,
      answers: { Q1: q1, Q2: "A", Q3: "A", Q4: "A", Q5: "A", Q6: q6 },
    });
  }
}
// Explicit RT6 exploration path.
b2cCases.push({ label: "B2C RT6 (Q6=A)", answers: { Q1: "A", Q2: "A", Q3: "A", Q4: "A", Q5: "A", Q6: "A" } });

// ---------- tests ----------

describe("Quiz edge cases — no duplicate delivery formats", () => {
  it.each(b2bCases)("$label → no key or (name,tier) duplication", ({ answers }) => {
    const r = buildResult("b2b", answers);
    const dupKeys = findDuplicateKeys(r);
    const dupFormats = findDuplicateFormats(r);
    expect(
      dupKeys,
      `B2B result surfaced the same offering key more than once: ${JSON.stringify(dupKeys)}`,
    ).toEqual([]);
    expect(
      dupFormats,
      `B2B result surfaced two different offerings with an identical (name, tier): ${JSON.stringify(dupFormats)}`,
    ).toEqual([]);
  });

  it.each(b2cCases)("$label → no key or (name,tier) duplication", ({ answers }) => {
    const r = buildResult("b2c", answers);
    const dupKeys = findDuplicateKeys(r);
    const dupFormats = findDuplicateFormats(r);
    expect(dupKeys, `B2C dup keys: ${JSON.stringify(dupKeys)}`).toEqual([]);
    expect(dupFormats, `B2C dup formats: ${JSON.stringify(dupFormats)}`).toEqual([]);
  });
});

describe("Quiz edge cases — no cross-track category leakage", () => {
  it.each(b2bCases)("$label → no B2C-only tiers (IGNITE / AMPLIFY) in B2B result", ({ answers }) => {
    const r = buildResult("b2b", answers);
    // Scout Mode reroute (Q4DM=A) intentionally surfaces an AMPLIFY Lab as the
    // strongest next step. That's the sanctioned exception and lives in
    // strongestNextStep only — the primary/groups still must not carry
    // AMPLIFY/IGNITE tiers.
    const surfaces = allSurfaces(r).filter(({ where }) => where !== "strongestNextStep");
    const leaks = surfaces
      .filter(({ offering }) => B2B_FORBIDDEN_TIERS.has(offering.tier))
      .map(({ where, offering }) => `${where}:${offering.key}(${offering.tier})`);
    expect(
      leaks,
      `B2B result must not carry IGNITE/AMPLIFY tiers outside strongestNextStep: ${leaks.join(", ")}`,
    ).toEqual([]);
  });

  it.each(b2cCases)("$label → no B2B-only tiers (Blue Door / Workshop / Speaking) in B2C result", ({ answers }) => {
    const r = buildResult("b2c", answers);
    const leaks = tierLeaks(r, B2C_FORBIDDEN_TIERS);
    expect(
      leaks,
      `B2C result must not carry Blue Door / Workshop / Speaking tiers: ${leaks.join(", ")}`,
    ).toEqual([]);
  });
});

describe("Quiz edge cases — RT_TO_CONTENT_CATEGORIES hygiene", () => {
  const entries = Object.entries(RT_TO_CONTENT_CATEGORIES) as [string, string[]][];

  it("every result type maps to an array (possibly empty) of unique, trimmed slugs", () => {
    for (const [rt, slugs] of entries) {
      expect(Array.isArray(slugs), `${rt} must map to an array`).toBe(true);
      const seen = new Set<string>();
      for (const slug of slugs) {
        expect(typeof slug, `${rt} slug must be string`).toBe("string");
        expect(slug.trim(), `${rt} contains empty/whitespace slug`).not.toBe("");
        expect(slug, `${rt} slug "${slug}" has surrounding whitespace`).toBe(slug.trim());
        expect(seen.has(slug), `${rt} lists slug "${slug}" more than once`).toBe(false);
        seen.add(slug);
      }
    }
  });
});

describe("Quiz edge cases — OFFERINGS catalog integrity", () => {
  it("no two catalog entries share the same (name, tier) — the source of most dup-format bugs", () => {
    const byFormat = new Map<string, string[]>();
    for (const o of Object.values(OFFERINGS) as Offering[]) {
      const format = `${o.name}|${o.tier}`;
      const arr = byFormat.get(format) ?? [];
      arr.push(o.key);
      byFormat.set(format, arr);
    }
    const collisions = Array.from(byFormat.entries())
      .filter(([, keys]) => keys.length > 1)
      .map(([format, keys]) => `${format} → [${keys.join(", ")}]`);
    expect(collisions, `OFFERINGS catalog has duplicate (name, tier): ${collisions.join(" | ")}`).toEqual([]);
  });

  it("every offering key equals its map key (guards against copy-paste key drift)", () => {
    for (const [mapKey, offering] of Object.entries(OFFERINGS)) {
      expect(offering.key, `OFFERINGS.${mapKey}.key must match its map key`).toBe(mapKey);
    }
  });
});
