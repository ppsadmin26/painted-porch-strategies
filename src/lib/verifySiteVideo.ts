/**
 * Verify that a resolved site_videos URL is actually reachable.
 * Sends a lightweight HEAD request and logs a clear, actionable error
 * to the browser console if it fails. Safe to call from page-load effects.
 *
 * Each (slotKey + url) pair is only checked once per page load to avoid noise.
 */
const checked = new Set<string>();

export async function verifySiteVideoUrl(slotKey: string, url: string | null | undefined): Promise<void> {
  if (!url) {
    console.error(
      `[site_videos] ❌ Slot "${slotKey}" has no resolved URL. ` +
      `Open /admin/videos and assign a video for this slot.`,
    );
    return;
  }

  const cacheKey = `${slotKey}::${url}`;
  if (checked.has(cacheKey)) return;
  checked.add(cacheKey);

  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    if (!res.ok) {
      console.error(
        `[site_videos] ❌ Slot "${slotKey}" URL is unreachable ` +
        `(HTTP ${res.status} ${res.statusText}). URL: ${url}\n` +
        `→ Re-upload at /admin/videos or confirm the site-videos bucket is public.`,
      );
    } else {
      // Quiet success log — useful when debugging without being noisy.
      // eslint-disable-next-line no-console
      console.debug(`[site_videos] ✓ Slot "${slotKey}" reachable (${res.status}).`);
    }
  } catch (err) {
    console.error(
      `[site_videos] ❌ Slot "${slotKey}" network error verifying URL: ${url}`,
      err,
    );
  }
}
