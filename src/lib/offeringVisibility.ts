/**
 * Offering visibility — Phase C single source of truth.
 *
 * After Phase C, an offering's "Live" state is the AND of two independent
 * concerns:
 *
 *  1. `is_published` — owned by the PPS Op Platform (mirrored into PPS via
 *     sync). "Is this offering published in the catalog?"
 *  2. The host page's `page_status` — owned by PPS (/admin/pages).
 *     "Is the page that renders this card / hosts this anchor actually live
 *     (vs. Coming Soon)?"
 *
 * During the transition we still read the legacy `is_live` column as a
 * fallback when `is_published` is missing (older rows / older selects).
 *
 * Render code should never hand-roll the visibility rule — use the helpers
 * here so the rule stays consistent across the quiz, speaker pages, the
 * workshops accordion, and any future surface.
 */

export interface OfferingVisibilityRow {
  is_published?: boolean | null;
  /** Deprecated; still mirrored by DB trigger during transition. */
  is_live?: boolean | null;
  current_url?: string | null;
  dedicated_url?: string | null;
  anchor_id?: string | null;
}

/** Path portion of the URL that hosts this offering's card / anchor. */
export function resolveHostPath(row: OfferingVisibilityRow): string | null {
  const candidate =
    (row.dedicated_url && row.dedicated_url.trim()) ||
    (row.current_url && row.current_url.trim()) ||
    null;
  if (!candidate) return null;
  if (/^https?:\/\//i.test(candidate)) return null;
  return candidate.split("#")[0].split("?")[0] || null;
}

/** True when the offering is published in the canonical catalog. */
export function isOfferingPublished(row: OfferingVisibilityRow): boolean {
  if (typeof row.is_published === "boolean") return row.is_published;
  return Boolean(row.is_live);
}

/**
 * Final public-visibility check used by every render surface.
 *
 * @param row              Offering row (needs publish + URL fields).
 * @param draftPagePaths   Set of `page_status.path` values currently in
 *                         'draft' state. Caller is responsible for fetching
 *                         this once and reusing it.
 */
export function isOfferingVisible(
  row: OfferingVisibilityRow,
  draftPagePaths: Set<string>,
): boolean {
  if (!isOfferingPublished(row)) return false;
  const host = resolveHostPath(row);
  if (host && draftPagePaths.has(host)) return false;
  return true;
}
