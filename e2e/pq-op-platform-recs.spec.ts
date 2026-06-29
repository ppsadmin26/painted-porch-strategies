import { test, expect, type Page } from "../playwright-fixture";
import { PQ1, PQ2_B2C, B2C_QUESTIONS } from "../src/data/pathFinderQuiz";
import { assertRecommendationLinksValid } from "./helpers/recommendationLinks";

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

    await assertRecommendationLinksValid(page, dialog, "B2C quiz result dialog");
  });
});
