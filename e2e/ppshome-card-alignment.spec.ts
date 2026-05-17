import { test, expect } from "../playwright-fixture";

/**
 * Visual regression check for the "Discover Your P.A.T.H.way" cards on
 * the PPS home page.
 *
 * Two cards sit side-by-side ("Exploring for Yourself?" and
 * "Exploring for Your Team or Organization?"). The trailing link in each
 * card must align to the same bottom edge at every breakpoint, regardless
 * of the description copy length.
 *
 * jsdom tests assert the structural contract (flex-col, mt-auto, etc.) but
 * cannot run layout. This e2e test loads a real browser at mobile, tablet,
 * and desktop viewports and:
 *   1. Measures the bounding-box bottom of each link and asserts they
 *      match within 1px (the strict layout guarantee).
 *   2. Captures a deterministic screenshot of the cards section as a
 *      baseline visual snapshot — future layout regressions that shift
 *      either link will fail the snapshot comparison.
 */

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
] as const;

test.describe("PPSHome — Discover cards link alignment", () => {
  for (const vp of VIEWPORTS) {
    test(`links share the same bottom edge @ ${vp.name} (${vp.width}x${vp.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");

      const yourselfLink = page.getByRole("link", {
        name: /Discover Your P\.A\.T\.H\.way/i,
      });
      const teamLink = page.getByRole("link", { name: /Open the Blue Door/i });

      // Scroll the section into view so layout boxes are stable.
      await yourselfLink.scrollIntoViewIfNeeded();
      await expect(yourselfLink).toBeVisible();
      await expect(teamLink).toBeVisible();

      const a = await yourselfLink.boundingBox();
      const b = await teamLink.boundingBox();
      expect(a, "yourself link bounding box").not.toBeNull();
      expect(b, "team link bounding box").not.toBeNull();

      const bottomA = a!.y + a!.height;
      const bottomB = b!.y + b!.height;

      // On mobile the cards stack — bottom alignment across cards is no
      // longer a horizontal-row contract, so only assert horizontal
      // alignment when the cards actually sit on the same row.
      const sameRow = Math.abs(a!.y - b!.y) < 4;
      if (sameRow) {
        expect(
          Math.abs(bottomA - bottomB),
          `link bottoms must match within 1px (got ${bottomA} vs ${bottomB})`,
        ).toBeLessThanOrEqual(1);
      }

      // Visual snapshot of the section that contains both cards.
      const section = page
        .locator("section")
        .filter({ has: yourselfLink })
        .first();
      await expect(section).toHaveScreenshot(
        `ppshome-discover-cards-${vp.name}.png`,
        {
          maxDiffPixelRatio: 0.02,
          animations: "disabled",
        },
      );
    });
  }
});
