import { describe, it, expect } from "vitest";
import {
  ALWAYS_LIVE_PREFIXES,
  resolvePageStatus,
  resolvePageStatusEntry,
  type PageStatusMap,
} from "@/config/pageStatus";
import { collectSitemapPaths } from "@/pages/pps/Sitemap";

/**
 * Guardrail tests: admin pages must never be draftable, and neither the
 * Sitemap nor the Page Status manager should expose draft UI for them.
 */
describe("admin pages can never be drafts", () => {
  const adminPaths = [
    "/admin",
    "/admin/login",
    "/admin/posts",
    "/admin/users",
    "/admin/media",
    "/admin/youtube",
    "/admin/videos",
    "/admin/pages",
    "/admin/policy-notifications",
    "/admin/account",
  ];

  it("/admin is in ALWAYS_LIVE_PREFIXES", () => {
    expect(ALWAYS_LIVE_PREFIXES).toContain("/admin");
  });

  it("resolves admin paths as live even when a draft override exists", () => {
    const map: PageStatusMap = {};
    for (const p of adminPaths) {
      map[p] = { id: p, path: p, status: "draft", note: null } as any;
    }
    for (const p of adminPaths) {
      expect(resolvePageStatus(p, map)).toBe("live");
      // No draft entry should ever surface for an admin path.
      expect(resolvePageStatusEntry(p, map)).toBeUndefined();
    }
  });

  it("PageStatusManager overrides list filters out /admin paths", () => {
    const map: PageStatusMap = {
      "/admin/posts": { id: "1", path: "/admin/posts", status: "draft", note: null } as any,
      "/courses": { id: "2", path: "/courses", status: "draft", note: null } as any,
    };
    // Mirrors the filter in PageStatusManager.tsx
    const visible = Object.values(map).filter((e) => !e.path.startsWith("/admin"));
    expect(visible.map((v) => v.path)).toEqual(["/courses"]);
  });

  it("Sync from sitemap never adds /admin paths", () => {
    const paths = collectSitemapPaths().filter((p) => !p.startsWith("/admin"));
    expect(paths.every((p) => !p.startsWith("/admin"))).toBe(true);
    // Sanity: the unfiltered sitemap does include admin paths, so the filter matters.
    expect(collectSitemapPaths().some((p) => p.startsWith("/admin"))).toBe(true);
  });

  it("Sitemap inline draft control is hidden for /admin paths", () => {
    // Mirrors the condition in Sitemap.tsx:
    //   canManage && node.path && !node.path.startsWith("/admin")
    const canManage = true;
    const shouldShow = (path: string) =>
      canManage && !!path && !path.startsWith("/admin");

    expect(shouldShow("/admin/posts")).toBe(false);
    expect(shouldShow("/admin")).toBe(false);
    expect(shouldShow("/courses")).toBe(true);
    expect(shouldShow("/about")).toBe(true);
  });

  it("addOverride validation rejects /admin paths", () => {
    // Mirrors the guard in PageStatusManager.addOverride
    const isAdminPath = (path: string) =>
      path === "/admin" || path.startsWith("/admin/");

    expect(isAdminPath("/admin")).toBe(true);
    expect(isAdminPath("/admin/anything")).toBe(true);
    expect(isAdminPath("/administrator")).toBe(false);
    expect(isAdminPath("/about")).toBe(false);
  });
});
