import { describe, it, expect } from "vitest";
import { resolvePageStatus } from "@/config/pageStatus";
import type { PageStatusMap } from "@/hooks/usePageStatuses";

const draftMap: PageStatusMap = {
  "/courses": {
    id: "1",
    path: "/courses",
    status: "draft",
    note: null,
    updated_at: new Date().toISOString(),
  },
  "/partner/ignite/courses": {
    id: "2",
    path: "/partner/ignite/courses",
    status: "draft",
    note: null,
    updated_at: new Date().toISOString(),
  },
};

describe("Draft page visibility — nav/footer/CTA filtering", () => {
  it("resolves an explicit override to draft", () => {
    expect(resolvePageStatus("/courses", draftMap)).toBe("draft");
    expect(resolvePageStatus("/partner/ignite/courses", draftMap)).toBe("draft");
  });

  it("defaults unknown paths to draft", () => {
    expect(resolvePageStatus("/about", draftMap)).toBe("draft");
  });

  it("never gates ALWAYS_LIVE_PREFIXES even with override", () => {
    const map: PageStatusMap = {
      "/contact": {
        id: "x",
        path: "/contact",
        status: "draft",
        note: null,
        updated_at: new Date().toISOString(),
      },
    };
    expect(resolvePageStatus("/contact", map)).toBe("live");
    expect(resolvePageStatus("/admin/pages", map)).toBe("live");
  });

  it("simulates non-admin filter — draft items removed from a link list", () => {
    // /about and /resources have explicit Live overrides; /courses is Draft.
    const map: PageStatusMap = {
      ...draftMap,
      "/about": { id: "a", path: "/about", status: "live", note: null, updated_at: "" },
      "/resources": { id: "r", path: "/resources", status: "live", note: null, updated_at: "" },
    };
    const links = [
      { href: "/about" },
      { href: "/courses" },
      { href: "/partner/ignite/courses" },
      { href: "/resources" },
    ];
    const canPreview = false;
    const visible = links.filter(
      (l) => canPreview || resolvePageStatus(l.href, map) === "live",
    );
    expect(visible.map((l) => l.href)).toEqual(["/about", "/resources"]);
  });

  it("simulates admin filter — all items kept", () => {
    const links = [
      { href: "/about" },
      { href: "/courses" },
      { href: "/partner/ignite/courses" },
    ];
    const canPreview = true;
    const visible = links.filter(
      (l) => canPreview || resolvePageStatus(l.href, draftMap) === "live",
    );
    expect(visible).toHaveLength(3);
  });
});
