/**
 * Page Publish Status — runtime helpers
 * ----------------------------------------------------------------------------
 * Status overrides are stored in the database (`page_status` table) and
 * managed via the UI in /sitemap (inline switch) or /admin/pages.
 *
 * This file only contains:
 *   - The list of ALWAYS-LIVE prefixes (auth, admin, system pages)
 *   - The path-matching helper used by both the gate and the sitemap
 *   - A pure resolver that takes a DB map and returns the effective status
 *
 * Default status when no override exists: "live".
 */

import type { PageStatus, PageStatusMap, PageStatusRecord } from "@/hooks/usePageStatuses";

export type { PageStatus, PageStatusRecord, PageStatusMap };

/**
 * Routes the gate must NEVER block, regardless of overrides. Keeps auth,
 * admin, and post-purchase flows working even if someone misconfigures.
 */
export const ALWAYS_LIVE_PREFIXES = [
  "/admin",
  "/reset-password",
  "/sitemap",
  "/404",
  "/contact",
];

function isAlwaysLive(pathname: string): boolean {
  return ALWAYS_LIVE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function matchesPath(pattern: string, pathname: string): boolean {
  if (pattern === pathname) return true;
  if (pattern.includes(":")) {
    const patternParts = pattern.split("/");
    const pathParts = pathname.split("/");
    if (patternParts.length !== pathParts.length) return false;
    return patternParts.every((p, i) => p.startsWith(":") || p === pathParts[i]);
  }
  return false;
}

/**
 * Resolve the effective status for a pathname given the current DB map.
 * Used by PageGate and Sitemap.
 *
 * Default (no override): "draft" — every new URL is hidden until an admin
 * explicitly marks it Live in /admin/pages or /sitemap. Always-live prefixes
 * (admin, auth, sitemap, 404, contact) bypass this and stay Live.
 */
export function resolvePageStatus(pathname: string, map: PageStatusMap): PageStatus {
  if (isAlwaysLive(pathname)) return "live";
  // Exact match first (fast path).
  const exact = map[pathname];
  if (exact) return exact.status;
  // Pattern match (for routes registered with :param patterns in the DB).
  for (const record of Object.values(map)) {
    if (matchesPath(record.path, pathname)) return record.status;
  }
  return "draft";
}

export function resolvePageStatusEntry(
  pathname: string,
  map: PageStatusMap,
): PageStatusRecord | undefined {
  if (isAlwaysLive(pathname)) return undefined;
  if (map[pathname]) return map[pathname];
  for (const record of Object.values(map)) {
    if (matchesPath(record.path, pathname)) return record;
  }
  return undefined;
}
