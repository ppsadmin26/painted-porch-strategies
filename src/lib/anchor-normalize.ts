/**
 * Normalize an anchor id to a canonical form for fuzzy matching.
 *
 * Reduces common authoring variants to a single key so links don't break
 * when an anchor was authored as `architect-change` but rendered as
 * `architectChange` (or vice versa), or when casing/separators drift.
 *
 * Rules:
 *  - lowercase
 *  - strip all non-alphanumeric characters (hyphens, underscores, dots,
 *    colons, slashes, spaces, etc.)
 *
 * Examples:
 *   "architect-change"  → "architectchange"
 *   "architectChange"   → "architectchange"
 *   "Architect_Change"  → "architectchange"
 *   "mc-leading-change-mini" → "mcleadingchangemini"
 */
export function normalizeAnchor(input: string | null | undefined): string {
  if (!input) return "";
  return String(input).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * Find an element by id with fuzzy fallback. First tries exact match,
 * then scans all `[id]` elements and matches by normalized key.
 */
export function findElementByFuzzyId(id: string): HTMLElement | null {
  if (!id) return null;
  const exact = document.getElementById(id);
  if (exact) return exact;
  const target = normalizeAnchor(id);
  if (!target) return null;
  const nodes = document.querySelectorAll<HTMLElement>("[id]");
  for (const el of Array.from(nodes)) {
    if (normalizeAnchor(el.id) === target) return el;
  }
  return null;
}
