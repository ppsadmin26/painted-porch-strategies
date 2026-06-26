/**
 * Shared speaking-topic normalization.
 *
 * Source of truth: `path_finder_offerings.topic_slug` (DB column, backfilled
 * + kept in sync across paired rows by the `sync_topic_slug_siblings` trigger).
 *
 * Multiple delivery rows (keynote / workshop / lab) for the same idea share a
 * `topic_slug`. The DB trigger guarantees `blurb`, `description`, and
 * `image_url` stay identical across those siblings. The only thing that
 * legitimately differs row-to-row is `name` (which carries a format suffix
 * like "(Keynote)") and `current_url` / `anchor_id`.
 *
 * B2B vs B2C variants intentionally keep separate `topic_slug` values
 * (e.g. `master-your-message-b2c` vs `master-your-message-b2b`).
 *
 * Consumers should:
 *   1. Group rows by `topic_slug` (preferred) — falling back to
 *      `canonicalTopicKey(name)` for legacy or untagged rows.
 *   2. Display `cleanTopicName(name)` so the "(Keynote)" suffix is hidden.
 *   3. Trust `blurb`/`description`/`image_url` to be canonical.
 */

const FORMAT_SUFFIX_RE =
  /\s*\((Keynote|Workshop|B2B|Lab|Masterclass|Mini Course)\)\s*$/i;

/** Strip "(Keynote)"/"(Workshop)" etc. suffixes and any subtitle separator
 *  (`:` or `!`). Used as a fallback grouping key when `topic_slug` is missing. */
export function canonicalTopicKey(name: string): string {
  return name
    .replace(FORMAT_SUFFIX_RE, "")
    .replace(/[:!]\s+.*/s, "")
    .replace(/[:!]+$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Display name with the format suffix removed. Subtitle (after `:`/`!`)
 *  is kept so we get the full marketing title. */
export function cleanTopicName(name: string): string {
  return name.replace(FORMAT_SUFFIX_RE, "").trim();
}

/** URL-safe slug derived from the cleaned name. */
export function slugifyTopicName(name: string): string {
  return cleanTopicName(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Given a list of rows that share a `topic_slug`, pick the canonical display
 * title (longest cleaned name wins so subtitles beat bare "(Keynote)" rows).
 */
export function pickCanonicalTitle(names: string[]): string {
  return names
    .map(cleanTopicName)
    .reduce((best, candidate) =>
      candidate.length > best.length ? candidate : best,
    );
}
