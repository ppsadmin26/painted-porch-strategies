import { test, expect, type Page } from "../playwright-fixture";
import {
  PQ1,
  ORG_PQ2,
  CHANGE_BRANCH,
  type Question,
} from "../src/data/pathFinderQuiz";
import { assertRecommendationLinksValid } from "./helpers/recommendationLinks";

/**
 * Real-browser smoke for PPS Op Platform supplemental recommendations on
 * the B2B side of the P.A.T.H.finder quiz.
 *
 * Mirrors pq-op-platform-recs.spec.ts (B2C) but walks an organizational
 * "Change" branch — a path that consistently surfaces a primary workshop,
 * the Blue Door prerequisite, and the supplemental "More from the Porch"
 * + Related Reading groups via fetchOpPlatformRecommendations.
 *
 *   1. Enumerate EVERY rendered recommendation link inside the result
 *      dialog.
 *   2. For each href, navigate to it and assert the destination renders
 *      with a 2xx/3xx status — no 404 from the catalog or local fallback.
 *   3. Assert any non-clickable safe placeholders did not silently render
 *      an <a> (defense-in-depth fallback for unsafe URLs).
 */

// Ordered question list for the B2B → Change branch. Q4DM=C avoids the
// Scout-mode reroute (which sends Q4DM=A respondents into B2C labs) so we
// stay on the true B2B result surface.
const B2B_CHANGE_QUESTIONS: Question[] = [PQ1, ORG_PQ2, ...CHANGE_BRANCH];

// PQ1=B (org), OrgPQ2=B (change), Q1Change=A, Q2Change=A,
// Q3Change=["neither"] (multi), Q4DM=C, OrgPQ3=A.
type Answer = string | string[];
const ANSWERS: Answer[] = ["B", "B", "A", "A", ["neither"], "C", "A"];

function labelFor(q: Question, optId: string): string {
  const opt = q.options.find((o) => o.id === optId);
  if (!opt) throw new Error(`No option ${optId} on question ${q.id}`);
  return opt.label;
}

async function pickSingle(page: Page, q: Question, optId: string) {
  const label = labelFor(q, optId);
  const option = page
    .getByRole("radio", { name: label, exact: false })
    .or(page.getByRole("button", { name: label, exact: false }));
  await expect(option).toBeVisible();
  await option.click();
}

async function pickMulti(page: Page, q: Question, optIds: string[]) {
  for (const id of optIds) {
    const label = labelFor(q, id);
    const option = page
      .getByRole("checkbox", { name: label, exact: false })
      .or(page.getByRole("button", { name: label, exact: false }));
    await expect(option).toBeVisible();
    await option.click();
  }
}

async function walkB2B(page: Page) {
  for (let i = 0; i < ANSWERS.length; i++) {
    const q = B2B_CHANGE_QUESTIONS[i];
    const ans = ANSWERS[i];
    const last = i === ANSWERS.length - 1;
    if (Array.isArray(ans)) {
      await pickMulti(page, q, ans);
    } else {
      await pickSingle(page, q, ans);
    }
    const advance = page.getByRole("button", {
      name: last ? /See My Results/i : /^Next$/i,
    });
    await expect(advance).toBeEnabled();
    await advance.click();
  }
}

test.describe("PPS Op Platform recommendation links — B2B (real browser)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try { sessionStorage.clear(); } catch { /* noop */ }
    });
  });

  test("every B2B recommendation link navigates to a working page", async ({
    page,
  }) => {
    await page.goto("/start-here");
    await expect(
      page.getByText(/I'm here because I'm thinking about/i),
    ).toBeVisible({ timeout: 5000 });

    await walkB2B(page);

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await page.waitForLoadState("networkidle").catch(() => { /* best-effort */ });

    await assertRecommendationLinksValid(page, dialog, "B2B quiz result dialog");
  });
});
