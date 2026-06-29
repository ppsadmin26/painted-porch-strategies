import { describe, expect, it, vi, afterEach } from "vitest";
import {
  OP_PLATFORM_RECS_ENDPOINT,
  buildOpPlatformRecsUrl,
  fetchOpPlatformRecommendations,
} from "@/integrations/op-platform/recommendations";
import {
  isB2BResult,
  resolveOpPlatformPersona,
  segmentForResult,
} from "@/integrations/op-platform/personaMap";

describe("buildOpPlatformRecsUrl", () => {
  it("returns the bare endpoint with no filters", () => {
    expect(buildOpPlatformRecsUrl({})).toBe(OP_PLATFORM_RECS_ENDPOINT);
  });

  it("serializes scalar params", () => {
    const url = buildOpPlatformRecsUrl({
      persona: "b2b_leader",
      surface: "quiz",
      limit: 6,
      liveOnly: true,
    });
    expect(url).toContain("persona=b2b_leader");
    expect(url).toContain("surface=quiz");
    expect(url).toContain("limit=6");
    expect(url).toContain("liveOnly=true");
  });

  it("CSV-joins array params", () => {
    const url = buildOpPlatformRecsUrl({
      persona: ["b2b_leader", "b2b_exec"],
      format: ["workshop", "lab"],
    });
    expect(url).toContain("persona=b2b_leader%2Cb2b_exec");
    expect(url).toContain("format=workshop%2Clab");
  });

  it("omits empty arrays", () => {
    const url = buildOpPlatformRecsUrl({ persona: [], format: [] });
    expect(url).toBe(OP_PLATFORM_RECS_ENDPOINT);
  });
});

describe("fetchOpPlatformRecommendations", () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns parsed body on 200", async () => {
    const row = {
      name: "X",
      short_blurb: "blurb",
      url: "/workshops/x",
      format: "workshop",
      catalog_segment: "B2B",
      audience_personas: ["b2b_leader"],
      content_themes: [],
      pillar_alignment: [],
      is_live: true,
      status: "live",
    };
    globalThis.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({ count: 1, results: [row] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    ) as typeof fetch;
    const out = await fetchOpPlatformRecommendations({ persona: "b2b_leader" });
    expect(out.count).toBe(1);
    expect(out.results[0].name).toBe("X");
  });

  it("drops rows that fail schema validation", async () => {
    const good = {
      name: "Good",
      short_blurb: "ok",
      url: "/ok",
      format: "workshop",
      catalog_segment: "B2B",
    };
    const badUrl = { ...good, name: "BadUrl", url: "javascript:alert(1)" };
    const noName = { ...good, name: "" };
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    globalThis.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({ count: 3, results: [good, badUrl, noName] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    ) as typeof fetch;
    const out = await fetchOpPlatformRecommendations({ persona: "b2b_leader" });
    expect(out.count).toBe(1);
    expect(out.results.map((r) => r.name)).toEqual(["Good"]);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("throws on non-2xx", async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response("bad", { status: 400 }),
    ) as typeof fetch;
    await expect(
      fetchOpPlatformRecommendations({ persona: "b2b_leader" }),
    ).rejects.toThrow(/400/);
  });
});

describe("persona mapping", () => {
  it("treats every B2C result as b2c_individual", () => {
    (["RT1", "RT2", "RT3", "RT4", "RT5", "RT6"] as const).forEach((rt) => {
      expect(isB2BResult(rt)).toBe(false);
      expect(segmentForResult(rt)).toBe("B2C");
      expect(resolveOpPlatformPersona({ resultType: rt })).toBe("b2c_individual");
    });
  });

  it("defaults B2B to b2b_leader", () => {
    (["RT-A", "RT-B", "RT-C", "RT-D", "RT-E"] as const).forEach((rt) => {
      expect(isB2BResult(rt)).toBe(true);
      expect(segmentForResult(rt)).toBe("B2B");
      expect(resolveOpPlatformPersona({ resultType: rt })).toBe("b2b_leader");
    });
  });

  it("honors explicit scope signals", () => {
    expect(resolveOpPlatformPersona({ resultType: "RT-A", scope: "exec" })).toBe(
      "b2b_exec",
    );
    expect(resolveOpPlatformPersona({ resultType: "RT-B", scope: "team" })).toBe(
      "b2b_team",
    );
    expect(resolveOpPlatformPersona({ resultType: "RT-C", scope: "org" })).toBe(
      "b2b_org",
    );
  });

  it("Scout Mode reroutes B2B → b2c_individual", () => {
    expect(
      resolveOpPlatformPersona({ resultType: "RT-A", scoutMode: true }),
    ).toBe("b2c_individual");
  });
});
