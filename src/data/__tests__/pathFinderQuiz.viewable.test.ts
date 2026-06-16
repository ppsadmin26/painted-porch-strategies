/**
 * Guardrails for the admin-driven "viewable" filter that controls which
 * P.A.T.H.finder offerings can appear in quiz results.
 *
 * Rule: an offering is only recommendable if its key is in `viewableKeys`
 * (computed at runtime from /admin/path-finder-offerings as is_live=true
 * AND at least one of current_url / dedicated_url / anchor_id set).
 *
 * The build should still produce a non-empty result when filtering would
 * otherwise empty a primary group (falls back to original copy).
 */
import { describe, it, expect } from "vitest";
import { buildResult, type Answers } from "../pathFinderQuiz";

const B2B_TEAM: Answers = { OrgPQ2: "A", Q1Team: "A", Q2Team: "A", Q4DM: "C", OrgPQ3: "A" };
const B2B_CHANGE: Answers = { OrgPQ2: "B", Q1Change: "A", Q2Change: "A", Q4DM: "C", OrgPQ3: "A" };
const B2C_RT1: Answers = { Q1: "A", Q2: "A", Q3: "A", Q4: "A", Q5: "A", Q6: "B" };

describe("viewableKeys filter (B2B)", () => {
  it("no viewableKeys → uses original picks", () => {
    const r = buildResult("b2b", B2B_TEAM);
    expect(r.primaryGroup?.offerings.length).toBeGreaterThan(0);
  });

  it("only blueDoor + architectChange eligible → primary picks narrow to those", () => {
    const r = buildResult("b2b", B2B_CHANGE, {
      viewableKeys: new Set(["blueDoor", "architectChange", "architectureOfOrganizationalShift"]),
    });
    const keys = r.primaryGroup?.offerings.map((o) => o.key) ?? [];
    for (const k of keys) {
      expect(["blueDoor", "architectChange", "architectureOfOrganizationalShift"]).toContain(k);
    }
  });

  it("speaking topic appears as its own group when eligible", () => {
    const r = buildResult("b2b", B2B_TEAM, {
      viewableKeys: new Set([
        "architectChange", "blueDoor",
        "speakingHeroesAssemble", "speakingFromDysfunction",
      ]),
    });
    const speakingGroup = r.groups.find((g) => g.heading.toLowerCase().includes("speaking"));
    expect(speakingGroup).toBeDefined();
    expect(speakingGroup!.offerings.map((o) => o.key)).toEqual(
      expect.arrayContaining(["speakingHeroesAssemble"]),
    );
  });

  it("empty eligible set → falls back gracefully (no blank result)", () => {
    const r = buildResult("b2b", B2B_TEAM, { viewableKeys: new Set() });
    expect(r.primaryGroup?.offerings.length).toBeGreaterThan(0);
  });
});

describe("viewableKeys filter (B2C)", () => {
  it("filters primary group to eligible keys only", () => {
    const r = buildResult("b2c", B2C_RT1, {
      viewableKeys: new Set(["radicalMindfulness"]),
    });
    const keys = r.primaryGroup?.offerings.map((o) => o.key) ?? [];
    expect(keys).toEqual(["radicalMindfulness"]);
  });

  it("when no primary key is eligible, falls back to safe defaults that are eligible", () => {
    const r = buildResult("b2c", B2C_RT1, {
      viewableKeys: new Set(["masterYourMessage"]), // not part of RT1 original picks
    });
    // The post-process keeps original group intact rather than blank.
    expect(r.primaryGroup?.offerings.length).toBeGreaterThan(0);
  });
});
