import { describe, expect, it } from "vitest";
import {
  DEDICATED_LANDING_KEYS,
  validateTopicSlugPairs,
  validateWorkshopRouting,
  type WorkshopRoutingRow,
} from "@/lib/workshopRoutingValidation";

function makeRow(overrides: Partial<WorkshopRoutingRow> = {}): WorkshopRoutingRow {
  return {
    offering_key: "row",
    name: "Row",
    delivery_format: "workshop",
    current_url: "/speaking/topics",
    anchor_id: "row",
    topic_slug: "row",
    include_in_workshops: false,
    include_on_speaker_page: false,
    is_keynote: false,
    ...overrides,
  };
}

describe("validateWorkshopRouting", () => {
  it("passes non-routing rows through with no issues", () => {
    const r = makeRow({ delivery_format: "course", include_in_workshops: false });
    expect(validateWorkshopRouting(r).level).toBe("ok");
  });

  it("errors when a featured workshop is not on /partner/amplify/workshops", () => {
    const r = makeRow({
      include_in_workshops: true,
      current_url: "/speaking/topics",
      anchor_id: "foo",
    });
    const res = validateWorkshopRouting(r);
    expect(res.level).toBe("error");
    expect(res.issues.some((i) => i.code === "FEATURED_WRONG_URL")).toBe(true);
  });

  it("errors when a featured workshop is missing anchor_id", () => {
    const r = makeRow({
      include_in_workshops: true,
      current_url: "/partner/amplify/workshops",
      anchor_id: null,
    });
    expect(validateWorkshopRouting(r).issues.some((i) => i.code === "FEATURED_MISSING_ANCHOR")).toBe(true);
  });

  it("errors when a featured anchor is not rendered on the page", () => {
    const r = makeRow({
      include_in_workshops: true,
      current_url: "/partner/amplify/workshops",
      anchor_id: "ghost",
    });
    const res = validateWorkshopRouting(r, { featuredAnchorIds: new Set(["architect-change"]) });
    expect(res.issues.some((i) => i.code === "FEATURED_ANCHOR_UNRENDERED")).toBe(true);
  });

  it("errors when a speaking row is not on /speaking/topics", () => {
    const r = makeRow({
      delivery_format: "keynote",
      current_url: "/partner/amplify/workshops",
      topic_slug: "eight-by-eight",
      anchor_id: "eight-by-eight",
    });
    expect(validateWorkshopRouting(r).issues.some((i) => i.code === "TOPIC_WRONG_URL")).toBe(true);
  });

  it("errors when anchor_id does not match topic_slug", () => {
    const r = makeRow({
      topic_slug: "eight-by-eight",
      anchor_id: "8-8",
    });
    expect(validateWorkshopRouting(r).issues.some((i) => i.code === "TOPIC_SLUG_MISMATCH")).toBe(true);
  });

  it("errors when topic_slug is missing on a speaking topic", () => {
    const r = makeRow({ topic_slug: null, anchor_id: null });
    expect(validateWorkshopRouting(r).issues.some((i) => i.code === "TOPIC_SLUG_MISSING")).toBe(true);
  });

  it("passes a well-formed speaking topic", () => {
    const r = makeRow({ topic_slug: "eight-by-eight", anchor_id: "eight-by-eight" });
    expect(validateWorkshopRouting(r).level).toBe("ok");
  });

  it("skips topic_slug rules for dedicated landings", () => {
    for (const key of DEDICATED_LANDING_KEYS) {
      const r = makeRow({
        offering_key: key,
        delivery_format: "keynote",
        current_url: "/resources/kick-the-habit",
        topic_slug: null,
        anchor_id: null,
      });
      expect(validateWorkshopRouting(r).level).toBe("ok");
    }
  });

  it("requires speaker-page rows to point at a registered speaker URL", () => {
    const r = makeRow({
      delivery_format: "keynote",
      include_on_speaker_page: true,
      current_url: "/speaking/topics",
      anchor_id: "topic-x",
    });
    expect(validateWorkshopRouting(r).issues.some((i) => i.code === "SPEAKER_WRONG_URL")).toBe(true);
  });

  it("accepts speaker-page rows on /speaking/amy", () => {
    const r = makeRow({
      delivery_format: "keynote",
      include_on_speaker_page: true,
      current_url: "/speaking/amy",
      anchor_id: "topic-goldilocks-leadership",
    });
    expect(validateWorkshopRouting(r).level).toBe("ok");
  });
});

describe("validateTopicSlugPairs", () => {
  it("flags rows sharing a topic_slug but diverging URLs", () => {
    const rows: WorkshopRoutingRow[] = [
      { offering_key: "ws", name: "workshop", delivery_format: "workshop", current_url: "/speaking/topics", anchor_id: "x", topic_slug: "x", include_in_workshops: false, include_on_speaker_page: false, is_keynote: false },
      { offering_key: "kn", name: "keynote", delivery_format: "keynote", current_url: "/partner/amplify/workshops", anchor_id: "x", topic_slug: "x", include_in_workshops: false, include_on_speaker_page: false, is_keynote: true },
    ];
    const pairs = validateTopicSlugPairs(rows);
    expect(pairs.get("ws")?.some((i) => i.code === "TOPIC_PAIR_DIVERGES")).toBe(true);
    expect(pairs.get("kn")?.some((i) => i.code === "TOPIC_PAIR_DIVERGES")).toBe(true);
  });

  it("passes when paired rows agree", () => {
    const rows: WorkshopRoutingRow[] = [
      { offering_key: "ws", name: "workshop", delivery_format: "workshop", current_url: "/speaking/topics", anchor_id: "x", topic_slug: "x", include_in_workshops: false, include_on_speaker_page: false, is_keynote: false },
      { offering_key: "kn", name: "keynote", delivery_format: "keynote", current_url: "/speaking/topics", anchor_id: "x", topic_slug: "x", include_in_workshops: false, include_on_speaker_page: false, is_keynote: true },
    ];
    expect(validateTopicSlugPairs(rows).size).toBe(0);
  });
});
