/**
 * Page Categories
 * ----------------------------------------------------------------------------
 * Every site URL is tagged with one of three categories. This is the single
 * source of truth that audits, the admin UI, the public sitemap, robots.txt,
 * and sitemap.xml all read from.
 *
 *   public    — Live, publicly navigable. Included in sitemap.xml,
 *               not Disallowed in robots, scanned by brand audits.
 *   internal  — Staff / admin only. Disallowed in robots, excluded from
 *               sitemap.xml, skipped by brand audits.
 *   archived  — Legacy / superseded routes kept for reference. Disallowed
 *               in robots, excluded from sitemap.xml, skipped by audits.
 *
 * Category is INDEPENDENT of Live/Draft status. A page can be Live +
 * archived (visible to the public but not promoted) or Draft + public
 * (will be promoted once it goes live).
 *
 * Categories live in the `page_status.category` column. This file exposes
 * the type and a default URL-prefix heuristic used to:
 *   - seed new rows that don't yet have a category
 *   - resolve a category at runtime when no DB row exists
 */

export type PageCategory = "public" | "internal" | "archived";

export const PAGE_CATEGORIES: readonly PageCategory[] = ["public", "internal", "archived"] as const;

/** Display labels + colours used by /admin/pages and the public /sitemap. */
export const CATEGORY_META: Record<
  PageCategory,
  { label: string; description: string; pillClass: string }
> = {
  public: {
    label: "Public",
    description: "Live, indexable, included in sitemap.xml and brand audits.",
    pillClass: "bg-pps-lime/20 text-pps-navy border border-pps-lime/40",
  },
  internal: {
    label: "Internal",
    description: "Staff / admin only. Hidden from search engines and audits.",
    pillClass: "bg-pps-teal/15 text-pps-navy border border-pps-teal/40",
  },
  archived: {
    label: "Archived",
    description: "Legacy / superseded. Kept for reference but excluded everywhere.",
    pillClass: "bg-pps-charcoal/15 text-pps-charcoal border border-pps-charcoal/30",
  },
};

/**
 * URL-prefix heuristics. Order matters — first match wins.
 * Used as a fallback when a route has no `page_status.category` row.
 */
const URL_RULES: Array<{ test: (p: string) => boolean; category: PageCategory }> = [
  { test: (p) => p === "/admin" || p.startsWith("/admin/"), category: "internal" },
  { test: (p) => p === "/reset-password", category: "internal" },
  { test: (p) => /archive|verbatim/i.test(p), category: "archived" },
];

export function getDefaultCategoryForPath(path: string): PageCategory {
  for (const rule of URL_RULES) if (rule.test(path)) return rule.category;
  return "public";
}
