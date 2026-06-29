/**
 * URL validation for PPS Op Platform recommendations.
 *
 * Recommendations come from the canonical catalog edge function and are
 * rendered inside the quiz result dialog as clickable cards. A bad URL
 * (empty, malformed, javascript:, mailto:, etc.) must NOT render as a
 * link — instead the dialog should hide it or render a non-clickable
 * placeholder. This util is the single source of truth used by:
 *   - the recommendations hook (filter at fetch-time)
 *   - the RecGroup renderer (defense-in-depth at render-time)
 *   - the urlValidation unit test suite
 */

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export function isSafeOpPlatformUrl(raw: unknown): raw is string {
  if (typeof raw !== "string") return false;
  const url = raw.trim();
  if (!url) return false;

  // Internal route. Must be absolute path, no protocol-relative `//evil.com`,
  // no whitespace.
  if (url.startsWith("/")) {
    if (url.startsWith("//")) return false;
    if (/\s/.test(url)) return false;
    return true;
  }

  // External URL. Must parse and use http(s).
  try {
    const parsed = new URL(url);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return false;
    if (!parsed.hostname) return false;
    return true;
  } catch {
    return false;
  }
}
