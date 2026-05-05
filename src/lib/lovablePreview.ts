/**
 * Detects whether the app is running inside the Lovable editor preview
 * (the iframe shown in the Lovable build interface).
 *
 * Editor preview hostnames:
 *   - id-preview--<project>.lovable.app   (live preview iframe)
 *   - *.lovable.dev                       (internal Lovable dev tooling)
 *
 * NOT considered preview (these are public traffic):
 *   - <project>.lovable.app                (published site, e.g. pps-website.lovable.app)
 *   - any custom domain
 *   - localhost (treat as production-like for safety)
 */
export function isLovableEditorPreview(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host.startsWith("id-preview--") || host.endsWith(".lovable.dev");
}
