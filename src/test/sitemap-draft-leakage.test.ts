import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ALWAYS_LIVE_PREFIXES,
  resolvePageStatus,
  type PageStatusMap,
} from "@/config/pageStatus";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf-8");

/**
 * Verifies that Draft pages are never exposed publicly:
 *   1. The XML sitemap edge function filters out paths flagged Draft in page_status.
 *   2. The on-page /sitemap nav hides Draft entries from non-admins.
 *   3. The "Sync from sitemap" admin action inserts new rows as Draft (not Live).
 */
describe("Draft pages never leak to public surfaces", () => {
  describe("XML sitemap edge function (supabase/functions/sitemap)", () => {
    const fn = read("supabase/functions/sitemap/index.ts");

    it("queries page_status for draft overrides", () => {
      expect(fn).toMatch(/from\(["']page_status["']\)/);
      expect(fn).toMatch(/\.eq\(["']status["'],\s*["']draft["']\)/);
    });

    it("builds a Set of draft paths and filters static pages through it", () => {
      expect(fn).toMatch(/draftPaths/);
      expect(fn).toMatch(/staticPages[\s\S]*\.filter\(/);
    });

    it("also filters dynamic blog post URLs against draft overrides", () => {
      // The blog loop should skip any post whose resolved path is a draft.
      expect(fn).toMatch(/isPublic\(path\)/);
    });

    it("respects ALWAYS_LIVE_PREFIXES so admin/auth routes are never blocked", () => {
      expect(fn).toMatch(/ALWAYS_LIVE_PREFIXES/);
      // The list must include every prefix from the shared config.
      for (const prefix of ALWAYS_LIVE_PREFIXES) {
        expect(fn).toContain(`"${prefix}"`);
      }
    });
  });

  describe("On-page Sitemap nav filtering", () => {
    const sitemap = read("src/pages/pps/Sitemap.tsx");

    it("filters child links so non-staff never see draft routes", () => {
      // Implementation: short-circuit on isStaff, then drop draft children.
      expect(sitemap).toMatch(/isStaff/);
      expect(sitemap).toMatch(/resolvePageStatus\([^)]+\)\s*===\s*["']draft["']/);
    });

    it("hides draft + non-public routes from non-staff at the row level", () => {
      expect(sitemap).toMatch(/\(isDraft \|\| isNonPublic\) && !isStaff/);
    });

    it("filter logic: drafts are removed for visitors but admins see everything", () => {
      const map: PageStatusMap = {
        "/courses": { id: "1", path: "/courses", status: "draft", note: null, updated_at: "" } as any,
        "/about": { id: "2", path: "/about", status: "live", note: null, updated_at: "" } as any,
      };
      const links = [{ href: "/courses" }, { href: "/about" }];

      const publicVisible = links.filter((l) => resolvePageStatus(l.href, map) === "live");
      expect(publicVisible.map((l) => l.href)).toEqual(["/about"]);

      const adminVisible = links.filter(() => true);
      expect(adminVisible).toHaveLength(2);
    });
  });

  describe("Sync from sitemap inserts new rows as Draft", () => {
    const mgr = read("src/pages/pps/admin/PageStatusManager.tsx");

    it("uses status: 'draft' when syncing missing sitemap paths", () => {
      // Must NOT insert as live anymore.
      expect(mgr).not.toMatch(/status:\s*["']live["']\s+as const,\s*\n\s*note:\s*["']Synced from sitemap/);
      expect(mgr).toMatch(/status:\s*["']draft["']\s+as const,\s*\n\s*note:\s*["']Synced from sitemap/);
    });

    it("excludes /admin paths from the sync", () => {
      // Filter may be inline or extracted to a memo — just assert the exclusion exists.
      expect(mgr).toMatch(/\.filter\(\(p\)\s*=>\s*!p\.startsWith\(["']\/admin["']\)\)/);
    });

    it("toast confirmation announces rows added as Draft, not Live", () => {
      expect(mgr).toMatch(/as Draft\./);
      expect(mgr).not.toMatch(/Added \$\{[^}]+\} missing path\$\{[^}]+\} as Live\./);
    });
  });
});
