/**
 * Integration test: end-to-end quiz flow.
 *
 * Composes the real branches that ship to the user:
 *   1. `buildResult(track, answers)` — scoring + primary/secondary groups.
 *   2. `capRecommendations(...)`     — the dedupe/budget helper that
 *      PathFinderQuizDialog uses to render the final list.
 *
 * We seed the supplemental buckets (opPlatform + related) with deliberately
 * adversarial payloads to prove the shipped pipeline still guarantees:
 *
 *   A. **No duplicate delivery formats** in the final visible output —
 *      even when an Op Platform row echoes a primary offering by url,
 *      name, or key, and even when a related-content link points at the
 *      same URL as a recommended offering.
 *
 *   B. **No cross-track category leakage** in the final visible output —
 *      B2B results must not surface IGNITE/AMPLIFY tiers (Scout Mode
 *      strongestNextStep is the sanctioned exception), and B2C results
 *      must not surface Blue Door / Workshop / Speaking tiers.
 *
 *   C. **The global 6-item cap** is respected regardless of how much
 *      supplemental noise we throw at it.
 */
import { describe, it, expect } from "vitest";
import {
  buildResult,
  OFFERINGS,
  type Answers,
  type Offering,
  type QuizResult,
} from "@/data/pathFinderQuiz";
import {
  capRecommendations,
  MAX_TOTAL_RECOMMENDATIONS,
  type CapGroup,
  type CapRelated,
} from "../capRecommendations";

// ---------- adversarial supplemental payload builders ----------

/** Op Platform group that echoes every primary/secondary offering by url,
 *  name, AND key — the three collision axes the dedupe layer handles. */
function duplicateOpPlatformFor(result: QuizResult): CapGroup<Offering> {
  const echoes: Offering[] = [];
  const push = (o: Offering, tag: string) =>
    echoes.push({ ...o, key: `${o.key}__dup_${tag}` });
  for (const o of result.primaryGroup?.offerings ?? []) {
    // Duplicate by URL only
    push({ ...o, name: `Other Name for ${o.name}` }, "byUrl");
    // Duplicate by NAME only
    push({ ...o, url: `${o.url}?variant=copy` }, "byName");
  }
  for (const g of result.groups ?? []) {
    for (const o of g.offerings) {
      push({ ...o, name: `Alt ${o.name}` }, "byUrlGrp");
    }
  }
  // Plus a couple of "clean" supplementals so we can verify the bucket isn't
  // entirely eaten by the dedupe.
  const clean: Offering[] = [
    {
      key: "supp_clean_1",
      name: "PPS Op Platform Supplemental One",
      tier: "Free",
      url: "/insights/supp-1",
      blurb: "Clean supplemental — should survive dedupe.",
    },
    {
      key: "supp_clean_2",
      name: "PPS Op Platform Supplemental Two",
      tier: "Free",
      url: "/insights/supp-2",
      blurb: "Clean supplemental — should survive dedupe.",
    },
  ];
  return { heading: "More from the Porch", offerings: [...echoes, ...clean] };
}

/** Related content that overlaps a primary offering URL — this is the exact
 *  "insights leaking a duplicate of the primary CTA" bug we want blocked. */
function duplicateRelatedFor(result: QuizResult): CapRelated[] {
  const first = result.primaryGroup?.offerings[0];
  const items: CapRelated[] = [
    {
      kind: "blog",
      title: "Clean insight 1",
      url: "/insights/clean-1",
      source: "Insights",
    },
    {
      kind: "blog",
      title: "Clean insight 2",
      url: "/insights/clean-2",
      source: "Insights",
    },
  ];
  if (first) {
    items.push({
      kind: "blog",
      title: `Blog echo of ${first.name}`,
      url: first.url,
      source: "Insights",
    });
  }
  return items;
}

// ---------- category-leakage helpers ----------

const B2B_FORBIDDEN: Set<Offering["tier"]> = new Set(["IGNITE", "AMPLIFY"]);
const B2C_FORBIDDEN: Set<Offering["tier"]> = new Set([
  "Blue Door",
  "Workshop",
  "Speaking",
]);

function surfacedOfferings(out: ReturnType<typeof capRecommendations<Offering>>): Offering[] {
  const all: Offering[] = [];
  if (out.primary) all.push(...out.primary.offerings);
  for (const g of out.secondaryGroups) all.push(...g.offerings);
  if (out.opPlatform) all.push(...(out.opPlatform.offerings as Offering[]));
  return all;
}

function duplicateIdsIn(out: ReturnType<typeof capRecommendations<Offering>>): string[] {
  const ids: string[] = [];
  const push = (o: Offering) => {
    ids.push(`url:${o.url.trim().toLowerCase().replace(/\/+$/, "")}`);
    ids.push(`name:${o.name.trim().toLowerCase()}`);
    ids.push(`key:${o.key}`);
  };
  for (const o of surfacedOfferings(out)) push(o);
  for (const r of out.related) {
    ids.push(`url:${r.url.trim().toLowerCase().replace(/\/+$/, "")}`);
    ids.push(`name:${r.title.trim().toLowerCase()}`);
  }
  const seen = new Set<string>();
  const dups: string[] = [];
  for (const id of ids) {
    if (seen.has(id)) dups.push(id);
    else seen.add(id);
  }
  return dups;
}

// ---------- representative flow cases across both tracks ----------

interface FlowCase {
  label: string;
  track: "b2c" | "b2b";
  answers: Answers;
  scoutMode: boolean;
}

const flows: FlowCase[] = [
  // B2C — one per RT bucket
  { label: "B2C RT6 exploration",   track: "b2c", answers: { Q1: "A", Q2: "A", Q3: "A", Q4: "A", Q5: "A", Q6: "A" }, scoutMode: false },
  { label: "B2C RT1-ish",           track: "b2c", answers: { Q1: "B", Q2: "B", Q3: "B", Q4: "B", Q5: "B", Q6: "B" }, scoutMode: false },
  { label: "B2C RT-mid",            track: "b2c", answers: { Q1: "C", Q2: "C", Q3: "C", Q4: "C", Q5: "C", Q6: "C" }, scoutMode: false },
  { label: "B2C RT-tail",           track: "b2c", answers: { Q1: "D", Q2: "D", Q3: "D", Q4: "D", Q5: "D", Q6: "D" }, scoutMode: false },
  // B2B — one per OrgPQ2 branch (A/B/C/D) + RT-E (empty PQ2), plus Scout Mode
  { label: "B2B RT-A team",         track: "b2b", answers: { OrgPQ2: "A", Q1Team: "A",  Q2Team: "A",  OrgPQ3: "A", Q4DM: "B" }, scoutMode: false },
  { label: "B2B RT-B change",       track: "b2b", answers: { OrgPQ2: "B", Q1Change: "B", Q2Change: "B", OrgPQ3: "B", Q4DM: "B" }, scoutMode: false },
  { label: "B2B RT-C capacity",     track: "b2b", answers: { OrgPQ2: "C", Q1Cap: "C",   Q2Cap: "C",   OrgPQ3: "C", Q4DM: "C" }, scoutMode: false },
  { label: "B2B RT-D strategic",    track: "b2b", answers: { OrgPQ2: "D", Q1Strategic: "D", OrgPQ3: "A", Q4DM: "D" }, scoutMode: false },
  { label: "B2B RT-E fallback",     track: "b2b", answers: { OrgPQ2: "", OrgPQ3: "C", Q4DM: "B" }, scoutMode: false },
  { label: "B2B Scout Mode reroute",track: "b2b", answers: { OrgPQ2: "A", Q1Team: "A", Q2Team: "A", OrgPQ3: "A", Q4DM: "A" }, scoutMode: true },
];

function bdrKeysFor(result: QuizResult): Set<string> {
  // Simulate the runtime `blueDoorRequiredKeys` set the dialog builds from
  // `path_finder_offerings.blue_door_required`. We pick the first workshop in
  // the primary group (if any) to force the BDR partition to fire on B2B runs.
  const set = new Set<string>();
  const wsFirst = result.primaryGroup?.offerings.find((o) => o.tier === "Workshop");
  if (wsFirst) set.add(wsFirst.key);
  return set;
}

// ---------- tests ----------

describe("Integration: quiz flow → capRecommendations final output", () => {
  it.each(flows)(
    "$label — no duplicate formats survive after adversarial supplementals",
    ({ track, answers, scoutMode }) => {
      const result = buildResult(track, answers);
      const out = capRecommendations<Offering>({
        strongestNextStep: result.strongestNextStep ?? null,
        primaryGroup: result.primaryGroup ?? null,
        groups: result.groups ?? [],
        opPlatformGroup: duplicateOpPlatformFor(result),
        relatedContent: duplicateRelatedFor(result),
        blueDoorRequiredKeys: bdrKeysFor(result),
        isB2B: track === "b2b",
        scoutMode,
      });

      const dups = duplicateIdsIn(out);
      expect(
        dups,
        `Final quiz output surfaced duplicate delivery formats: ${dups.join(", ")}`,
      ).toEqual([]);
    },
  );

  it.each(flows)(
    "$label — no cross-track category leakage in final output",
    ({ track, answers, scoutMode }) => {
      const result = buildResult(track, answers);
      const out = capRecommendations<Offering>({
        strongestNextStep: result.strongestNextStep ?? null,
        primaryGroup: result.primaryGroup ?? null,
        groups: result.groups ?? [],
        opPlatformGroup: null,
        relatedContent: [],
        blueDoorRequiredKeys: bdrKeysFor(result),
        isB2B: track === "b2b",
        scoutMode,
      });

      const forbidden = track === "b2b" ? B2B_FORBIDDEN : B2C_FORBIDDEN;
      const leaks = surfacedOfferings(out)
        .filter((o) => forbidden.has(o.tier))
        .map((o) => `${o.key}(${o.tier})`);

      // Scout Mode is the sanctioned exception: it deliberately reroutes to a
      // B2C Lab as the strongest-next-step. That offering lives in the
      // strongestNextStep pointer, NOT in the primary/secondary/opPlatform
      // surfaces we're inspecting here, so this assertion still holds.
      expect(
        leaks,
        `Final ${track.toUpperCase()} output leaked forbidden tiers: ${leaks.join(", ")}`,
      ).toEqual([]);
    },
  );

  it.each(flows)(
    "$label — total surfaced items never exceeds the global cap",
    ({ track, answers, scoutMode }) => {
      const result = buildResult(track, answers);
      const out = capRecommendations<Offering>({
        strongestNextStep: result.strongestNextStep ?? null,
        primaryGroup: result.primaryGroup ?? null,
        groups: result.groups ?? [],
        opPlatformGroup: duplicateOpPlatformFor(result),
        relatedContent: duplicateRelatedFor(result),
        blueDoorRequiredKeys: bdrKeysFor(result),
        isB2B: track === "b2b",
        scoutMode,
      });
      expect(out.totals.total).toBeLessThanOrEqual(MAX_TOTAL_RECOMMENDATIONS);
    },
  );

  it("catalog sanity — every OFFERINGS entry has a resolvable tier", () => {
    for (const o of Object.values(OFFERINGS) as Offering[]) {
      expect(o.tier, `offering ${o.key} missing tier`).toBeTruthy();
    }
  });
});
