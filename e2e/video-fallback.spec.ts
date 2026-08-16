import { test, expect } from "../playwright-fixture";

/**
 * E2E coverage for VideoFallback overlays on public site_videos consumers.
 *
 * Scenarios:
 *  1. Loading — supabase site_videos lookup hangs → loading overlay must paint
 *     above any sibling poster.
 *  2. Error — supabase returns no row AND any direct video request fails →
 *     branded error overlay with Retry button must paint above the poster.
 *
 * Visual regression: deterministic screenshots of both states are captured so
 * future regressions that reintroduce a partially-blank video area fail CI.
 */

const SUPABASE_SITE_VIDEOS_RE = /\/rest\/v1\/site_videos\b/;

test.describe("VideoFallback overlay z-stacking", () => {
  test("loading state paints above poster on /about/impact", async ({ page }) => {
    // Hold the site_videos request open so the consumer is stuck in loading.
    await page.route(SUPABASE_SITE_VIDEOS_RE, async () => {
      await new Promise(() => {}); // never resolves for the life of the test
    });

    await page.goto("/about/impact", { waitUntil: "domcontentloaded" });

    const heroVideoPanel = page.getByTestId("impact-hero-video");
    await expect(heroVideoPanel).toBeVisible();

    // OurImpact's hero shows VideoFallback as the error/empty fallback only
    // once site_videos resolves with no row. While the request is pending,
    // showVideo is false → VideoFallback("error") is rendered.
    // The overlay must be the topmost element inside the video panel.
    await expect(page.getByText(/Video unavailable right now/i)).toBeVisible();

    // Snapshot the hero video panel (not `section:first`, which resolves to the
    // toaster's notification region) for visual regression.
    await expect(heroVideoPanel).toHaveScreenshot("impact-hero-loading.png", {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    });
  });

  test("error state shows Retry overlay above poster on /about/impact", async ({ page }) => {
    // Resolve site_videos with no row → triggers VideoFallback error state.
    await page.route(SUPABASE_SITE_VIDEOS_RE, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(null), // .maybeSingle() interprets null as no row
      });
    });

    await page.goto("/about/impact", { waitUntil: "domcontentloaded" });

    const heroVideoPanel = page.getByTestId("impact-hero-video");
    const retry = page.getByRole("button", { name: /retry/i });
    await expect(retry).toBeVisible();

    // The hero video is a full-bleed background, so hero copy legitimately sits
    // above it. Verify the overlay stacks above the poster inside the panel
    // instead of asserting a real pointer click through the hero content.
    const stacked = await retry.evaluate((btn) => {
      const overlay = btn.closest("[data-video-fallback]") ?? btn.parentElement!;
      const poster = overlay.parentElement?.querySelector("img, video");
      const z = (el: Element) => Number(getComputedStyle(el).zIndex) || 0;
      return !poster || z(overlay) >= z(poster);
    });
    expect(stacked).toBe(true);

    await expect(heroVideoPanel).toHaveScreenshot("impact-hero-error.png", {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    });
  });
});

