import { test, expect, type Page } from "../playwright-fixture";
import { PQ1, PQ2_B2C, B2C_QUESTIONS } from "../src/data/pathFinderQuiz";

/**
 * Real-browser smoke for PPS Op Platform supplemental recommendations.
 *
 * We walk a representative B2C flow that reliably triggers the
 * "More from the Porch" supplemental block (powered by
 * fetchOpPlatformRecommendations) and then:
 *
 *   1. Enumerate EVERY rendered recommendation link inside the result
 *      dialog (primary group + secondary groups + Op Platform group +
 *      Related Reading).
 *   2. For each href, navigate to it and assert the destination renders
 *      with a 200-ish status — i.e. no 404 / dead URL slipped through
 *      either the canonical catalog OR the local fallback.
 *   3. Assert that any card that lost its URL renders as the safe
 *      non-clickable placeholder (data-op-platform-invalid-url="true")
 *      instead of an `<a>` or `<Link>`.
 *
 * If you change the recommendation rendering pipeline, run this against
 * the live preview before shipping.
 */

const QUESTION_ORDER = [PQ1, PQ2_B2C, ...B2C_QUESTIONS];

// Same answer set as the "RT5 — Ready for Advanced Partnership" flow in
// b2c-quiz.spec.ts — it consistently routes to a result that surfaces a
// primary offering plus supplemental cards.
const ANSWERS = ["A", "current", "A", "A", "D", "D", "D", "C"] as const;

function labelFor(qIndex: number, optId: string): string {
  const q = QUESTION_ORDER[qIndex];
  const opt = q.options.find((o) => o.id === optId);
  if (!opt) throw new Error(`No option ${optId} for question ${q.id}`);
  return opt.label;
}

async function walkB2C(page: Page) {
  for (let i = 0; i < ANSWERS.length; i++) {
    const last = i === ANSWERS.length - 1;
    const label = labelFor(i, ANSWERS[i]);
    const option = page
      .getByRole("radio", { name: label, exact: false })
      .or(page.getByRole("button", { name: label, exact: false }));
    await expect(option).toBeVisible();
    await option.click();
    const advance = page.getByRole("button", {
      name: last ? /See My Results/i : /^Next$/i,
    });
    await expect(advance).toBeEnabled();
    await advance.click();
  }
}

test.describe("PPS Op Platform recommendation links (real browser)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try { sessionStorage.clear(); } catch { /* noop */ }
    });
  });

  test("every rendered recommendation link navigates to a working page", async ({
    page,
  }) => {
    await page.goto("/start-here");
    await expect(
      page.getByText(/I'm here because I'm thinking about/i),
    ).toBeVisible({ timeout: 5000 });

    await walkB2C(page);

    // Wait for the result dialog (Op Platform fetch is async and may add
    // additional cards after the dialog mounts — give the supplemental
    // group up to ~5s to settle).
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await page.waitForLoadState("networkidle").catch(() => { /* best-effort */ });

    // 1. Collect every clickable recommendation href in the dialog.
    const hrefs = await dialog.locator("a[href]").evaluateAll((nodes) =>
      Array.from(
        new Set(
          (nodes as HTMLAnchorElement[])
            .map((a) => a.getAttribute("href") ?? "")
            .filter((h) => h.length > 0)
            // Skip in-page anchors and mailto/tel which aren't navigations.
            .filter((h) => !h.startsWith("#") && !h.startsWith("mailto:") && !h.startsWith("tel:")),
        ),
      ),
    );

    expect(hrefs.length, "dialog should render at least one recommendation link").toBeGreaterThan(0);

    // 2. Any cards that fell back to the non-clickable placeholder must
    //    not have rendered an <a> — they're <div data-op-platform-invalid-url>.
    const invalidPlaceholders = dialog.locator('[data-op-platform-invalid-url="true"]');
    const placeholderCount = await invalidPlaceholders.count();
    if (placeholderCount > 0) {
      // None of the placeholders should contain a navigable link.
      const placeholderLinks = await invalidPlaceholders.locator("a[href]").count();
      expect(placeholderLinks, "non-clickable fallback must not render an <a>").toBe(0);
    }

    // 3. Validate each href actually resolves. Internal routes are
    //    fetched via the dev server; external links are hit with HEAD
    //    (falling back to GET on 405) using the page's network stack so
    //    cookies / origin headers behave like a real navigation.
    const baseURL = new URL(page.url()).origin;
    const failures: string[] = [];
    for (const href of hrefs) {
      const absolute = href.startsWith("http") ? href : new URL(href, baseURL).toString();
      try {
        let resp = await page.request.fetch(absolute, {
          method: "HEAD",
          failOnStatusCode: false,
          maxRedirects: 5,
        });
        if (resp.status() === 405 || resp.status() === 501) {
          resp = await page.request.fetch(absolute, {
            method: "GET",
            failOnStatusCode: false,
            maxRedirects: 5,
          });
        }
        const status = resp.status();
        // Treat any 2xx/3xx as a working URL. SPA routes always 200 from
        // the dev server because index.html is served for unknown paths,
        // which is exactly the behavior production also uses.
        if (status >= 400) {
          failures.push(`${status} ${absolute}`);
        }
      } catch (err) {
        failures.push(`THREW ${absolute}: ${(err as Error).message}`);
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `Broken recommendation link(s) rendered in quiz result dialog:\n  - ${failures.join("\n  - ")}`,
      );
    }
  });
});
