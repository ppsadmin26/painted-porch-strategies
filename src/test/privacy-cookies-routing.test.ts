import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sitemapData, collectSitemapPaths } from "@/pages/pps/Sitemap";
import { resolvePageStatus } from "@/config/pageStatus";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("/privacy and /cookies — redirects + sitemap inclusion", () => {
  describe("SPA redirects (App.tsx)", () => {
    const app = read("src/App.tsx");

    it("redirects /privacy to /terms?tab=privacy", () => {
      expect(app).toMatch(
        /<Route\s+path="privacy"\s+element=\{<Navigate\s+to="\/terms\?tab=privacy"\s+replace\s*\/>\}\s*\/>/,
      );
    });

    it("redirects /cookies to /terms?tab=cookies", () => {
      expect(app).toMatch(
        /<Route\s+path="cookies"\s+element=\{<Navigate\s+to="\/terms\?tab=cookies"\s+replace\s*\/>\}\s*\/>/,
      );
    });
  });

  describe("On-page Sitemap (/sitemap)", () => {
    const paths = collectSitemapPaths(sitemapData);

    it("lists /privacy and /cookies", () => {
      expect(paths).toContain("/privacy");
      expect(paths).toContain("/cookies");
      expect(paths).toContain("/terms");
    });

    it("treats /privacy and /cookies as Live when an explicit live override exists", () => {
      // Defaults are now Draft; legal pages should be backfilled to Live in page_status.
      const map = {
        "/privacy": { id: "1", path: "/privacy", status: "live" as const, note: null, updated_at: "" },
        "/cookies": { id: "2", path: "/cookies", status: "live" as const, note: null, updated_at: "" },
      };
      expect(resolvePageStatus("/privacy", map)).toBe("live");
      expect(resolvePageStatus("/cookies", map)).toBe("live");
    });
  });

  describe("XML sitemap (supabase/functions/sitemap)", () => {
    const fn = read("supabase/functions/sitemap/index.ts");

    it("includes /privacy as a static page entry", () => {
      expect(fn).toMatch(/loc:\s*"\/privacy"/);
    });

    it("includes /cookies as a static page entry", () => {
      expect(fn).toMatch(/loc:\s*"\/cookies"/);
    });

    it("includes /terms as a static page entry", () => {
      expect(fn).toMatch(/loc:\s*"\/terms"/);
    });
  });
});
