import { describe, it, expect } from "vitest";
import {
  isOfferingPublished,
  isOfferingVisible,
  resolveHostPath,
} from "../offeringVisibility";

describe("offeringVisibility", () => {
  const drafts = new Set<string>(["/draft-page"]);

  it("resolves host path stripping anchor + query", () => {
    expect(
      resolveHostPath({ current_url: "/speaking/topics#kick-the-habit" }),
    ).toBe("/speaking/topics");
    expect(
      resolveHostPath({ dedicated_url: "/x?utm=1" }),
    ).toBe("/x");
    expect(resolveHostPath({ current_url: "https://other.com/x" })).toBeNull();
  });

  it("prefers is_published when present, falls back to is_live", () => {
    expect(isOfferingPublished({ is_published: true, is_live: false })).toBe(true);
    expect(isOfferingPublished({ is_published: false, is_live: true })).toBe(false);
    expect(isOfferingPublished({ is_live: true })).toBe(true);
    expect(isOfferingPublished({})).toBe(false);
  });

  it("published + live host page → visible", () => {
    expect(
      isOfferingVisible(
        { is_published: true, current_url: "/speaking/topics", anchor_id: "x" },
        drafts,
      ),
    ).toBe(true);
  });

  it("published + draft host page → hidden", () => {
    expect(
      isOfferingVisible(
        { is_published: true, current_url: "/draft-page" },
        drafts,
      ),
    ).toBe(false);
  });

  it("unpublished + live host page → hidden", () => {
    expect(
      isOfferingVisible(
        { is_published: false, current_url: "/speaking/topics" },
        drafts,
      ),
    ).toBe(false);
  });

  it("unpublished + draft host page → hidden", () => {
    expect(
      isOfferingVisible(
        { is_published: false, current_url: "/draft-page" },
        drafts,
      ),
    ).toBe(false);
  });
});
