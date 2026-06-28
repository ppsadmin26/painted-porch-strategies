/**
 * Guard test: every PPS Op Platform recommendation that the quiz surfaces
 * must have a non-empty, well-formed URL (absolute http(s) or site-relative).
 *
 * The hook (`useOpPlatformRecommendations`) is the single funnel for all
 * "More from the Porch" cards rendered by `PathFinderQuizDialog`. This test
 * feeds it a fixture containing every shape of bad URL we've seen — empty,
 * whitespace, null, `javascript:` scheme, `mailto:`, bare relative — plus
 * known-good rows, and asserts the hook only emits the good ones.
 *
 * Also asserts each surviving recommendation has a non-empty trimmed name
 * and blurb, since the UI cards require all three to render meaningfully.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { QuizResult } from "@/data/pathFinderQuiz";
import type { OpPlatformRecommendation } from "@/integrations/op-platform/recommendations";

const fetchSpy = vi.fn();
vi.mock("@/integrations/op-platform/recommendations", async () => {
  const actual = await vi.importActual<
    typeof import("@/integrations/op-platform/recommendations")
  >("@/integrations/op-platform/recommendations");
  return {
    ...actual,
    fetchOpPlatformRecommendations: (...args: unknown[]) => fetchSpy(...args),
  };
});

import { useOpPlatformRecommendations } from "@/components/pps/quiz/useOpPlatformRecommendations";

function rec(partial: Partial<OpPlatformRecommendation>): OpPlatformRecommendation {
  return {
    name: "Default",
    short_blurb: "A blurb",
    long_description: null,
    url: "https://paintedporchstrategies.com/x",
    thumbnail_url: null,
    format: "free_resource",
    catalog_segment: "B2C",
    audience_personas: ["b2c_individual"],
    path_stage: null,
    pricing: null,
    marketing_angle: null,
    content_themes: [],
    pillar_alignment: [],
    is_live: true,
    status: "live",
    sort_order: null,
    ...partial,
  };
}

const RESULT: QuizResult = {
  resultType: "RT1",
  headline: "Start with Foundations",
  narrative: "",
  strongestNextStep: null,
  primaryGroup: { heading: "Primary", offerings: [] },
  groups: [],
} as unknown as QuizResult;

const VALID_URL_RE = /^(https?:\/\/|\/)/;

afterEach(() => {
  fetchSpy.mockReset();
});

describe("useOpPlatformRecommendations — URL validation", () => {
  it("drops recommendations with empty, malformed, or unsafe URLs and keeps only good ones", async () => {
    fetchSpy.mockResolvedValueOnce({
      count: 8,
      results: [
        // ❌ invalid URLs
        rec({ name: "Empty URL", url: "" }),
        rec({ name: "Whitespace URL", url: "   " }),
        rec({ name: "Null URL", url: null }),
        rec({ name: "JS scheme", url: "javascript:alert(1)" }),
        rec({ name: "Mailto", url: "mailto:hi@example.com" }),
        rec({ name: "Bare relative", url: "resources/blog/x" }),
        // ❌ missing copy
        rec({ name: "  ", url: "https://ok.example/a" }),
        rec({ name: "No blurb", short_blurb: "", long_description: null, url: "https://ok.example/b" }),
        // ✅ keepers (cap is 2)
        rec({ name: "Good Absolute", url: "https://paintedporchstrategies.com/resources/blog/one" }),
        rec({ name: "Good Relative", url: "/resources/blog/two" }),
      ],
    });

    const { result } = renderHook(() =>
      useOpPlatformRecommendations(RESULT, { Q4DM: "B" }),
    );

    await waitFor(() => expect(result.current.group).not.toBeNull());

    const offerings = result.current.group!.offerings;
    expect(offerings.length).toBeGreaterThan(0);

    for (const o of offerings) {
      expect(o.url, `offering "${o.name}" missing URL`).toBeTruthy();
      expect(o.url!.trim()).not.toBe("");
      expect(o.url!, `bad URL shape: ${o.url}`).toMatch(VALID_URL_RE);
      expect(o.name?.trim()).toBeTruthy();
      expect(o.blurb?.trim()).toBeTruthy();
    }

    // None of the bad fixtures should have leaked through.
    const names = offerings.map((o) => o.name);
    expect(names).not.toContain("Empty URL");
    expect(names).not.toContain("Whitespace URL");
    expect(names).not.toContain("Null URL");
    expect(names).not.toContain("JS scheme");
    expect(names).not.toContain("Mailto");
    expect(names).not.toContain("Bare relative");
    expect(names).not.toContain("No blurb");

    // And at least one of the good ones should survive.
    expect(names.some((n) => n.startsWith("Good"))).toBe(true);
  });

  it("returns no group when every recommendation has an invalid URL", async () => {
    fetchSpy.mockResolvedValueOnce({
      count: 3,
      results: [
        rec({ name: "A", url: "" }),
        rec({ name: "B", url: null }),
        rec({ name: "C", url: "javascript:void(0)" }),
      ],
    });

    const { result } = renderHook(() =>
      useOpPlatformRecommendations(RESULT, { Q4DM: "B" }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.group).toBeNull();
  });
});
