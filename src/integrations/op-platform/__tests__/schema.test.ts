import { describe, expect, it } from "vitest";
import {
  OpPlatformRecommendationSchema,
  validateOpPlatformRecommendations,
} from "@/integrations/op-platform/schema";

const validRow = {
  name: "Stractical Leader Lab",
  short_blurb: "Six-week leadership intensive.",
  long_description: "Long description here.",
  url: "/partner/amplify/stractical-leader",
  thumbnail_url: "https://cdn.example.com/img.jpg",
  format: "lab",
  catalog_segment: "B2C",
  audience_personas: ["b2c_individual"],
  path_stage: "PREPARE",
  pricing: { amount: 997 },
  marketing_angle: null,
  content_themes: ["leadership"],
  pillar_alignment: ["foundational"],
  is_live: true,
  status: "live",
  sort_order: 1,
};

describe("OpPlatformRecommendationSchema", () => {
  it("accepts a well-formed row", () => {
    const r = OpPlatformRecommendationSchema.safeParse(validRow);
    expect(r.success).toBe(true);
  });

  it("trims name and rejects empty", () => {
    const r = OpPlatformRecommendationSchema.safeParse({
      ...validRow,
      name: "   ",
    });
    expect(r.success).toBe(false);
  });

  it.each([
    ["javascript:alert(1)"],
    ["mailto:a@b.com"],
    ["//evil.com/path"],
    ["not a url"],
    [""],
    [null],
    [42],
  ])("rejects unsafe url %p", (url) => {
    const r = OpPlatformRecommendationSchema.safeParse({ ...validRow, url });
    expect(r.success).toBe(false);
  });

  it.each([
    ["/workshops/x"],
    ["/start-here"],
    ["https://example.com/x"],
    ["http://example.com"],
  ])("accepts safe url %p", (url) => {
    const r = OpPlatformRecommendationSchema.safeParse({ ...validRow, url });
    expect(r.success).toBe(true);
  });

  it("rejects unknown format", () => {
    const r = OpPlatformRecommendationSchema.safeParse({
      ...validRow,
      format: "ebook",
    });
    expect(r.success).toBe(false);
  });

  it("rejects unknown catalog_segment", () => {
    const r = OpPlatformRecommendationSchema.safeParse({
      ...validRow,
      catalog_segment: "B2G",
    });
    expect(r.success).toBe(false);
  });

  it("allows null short_blurb but rejects whitespace-only blurb", () => {
    expect(
      OpPlatformRecommendationSchema.safeParse({ ...validRow, short_blurb: null })
        .success,
    ).toBe(true);
    expect(
      OpPlatformRecommendationSchema.safeParse({ ...validRow, short_blurb: "   " })
        .success,
    ).toBe(false);
  });

  it("caps short_blurb length", () => {
    const huge = "x".repeat(2000);
    const r = OpPlatformRecommendationSchema.safeParse({
      ...validRow,
      short_blurb: huge,
    });
    expect(r.success).toBe(false);
  });

  it("passes through unknown fields", () => {
    const r = OpPlatformRecommendationSchema.safeParse({
      ...validRow,
      newly_added_field: "ok",
    });
    expect(r.success).toBe(true);
  });
});

describe("validateOpPlatformRecommendations", () => {
  it("partitions valid and dropped rows", () => {
    const out = validateOpPlatformRecommendations([
      validRow,
      { ...validRow, name: "" },
      { ...validRow, url: "javascript:alert(1)" },
    ]);
    expect(out.valid).toHaveLength(1);
    expect(out.dropped).toHaveLength(2);
    expect(out.dropped[0].reason).toMatch(/name/);
    expect(out.dropped[1].reason).toMatch(/url/);
  });

  it("returns empty result for non-array input", () => {
    expect(validateOpPlatformRecommendations(null).valid).toEqual([]);
    expect(validateOpPlatformRecommendations(undefined).valid).toEqual([]);
    expect(validateOpPlatformRecommendations("oops").valid).toEqual([]);
  });
});
