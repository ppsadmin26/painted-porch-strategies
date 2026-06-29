import { test, expect, type Page } from "../playwright-fixture";
import {
  PQ1,
  ORG_PQ2,
  TEAM_BRANCH,
  type Question,
} from "../src/data/pathFinderQuiz";
import { assertRecommendationLinksValid } from "./helpers/recommendationLinks";

/**
 * Second real-browser smoke for PPS Op Platform supplemental recommendations
 * on the B2B side of the P.A.T.H.finder quiz.
 *
 * Sibling to pq-op-platform-recs-b2b.spec.ts but deliberately walks a
 * DIFFERENT answer path:
 *   - Branch: B2B → Team (not Change)
 *   - Q4DM=A → triggers the Scout-Mode reroute
 *     (see applyScoutReroute in src/data/pathFinderQuiz.ts), which promotes
 *     an individual AMPLIFY Lab + the Stractical Mini + Stoic Field Guide
 *     as the primary, demotes workshops + Blue Door to "next move" copy,
 *     and reshapes the supplemental rec pool.
 *
 * Same safe-URL contract as the original specs:
 *   1. Enumerate every rendered recommendation link inside the result
 *      dialog.
 *   2. For each href, navigate to it and assert a 2xx/3xx response.
 *   3. Confirm any non-clickable placeholders did not silently render an
 *      <a> (defense-in-depth fallback for unsafe URLs).
 */

// PQ1 → ORG_PQ2 → TEAM_BRANCH (Q1Team, Q2Team, Q3Team, Q4DM, OrgPQ3)
const B2B_TEAM_QUESTIONS: Question[] = [PQ1, ORG_PQ2, ...TEAM_BRANCH];

// PQ1=B (org), OrgPQ2=A (team), Q1Team=A (conflict), Q2Team=A (one team),
// Q3Team=["resilience"] (multi), Q4DM=A (scout), OrgPQ3=C (not sure yet).
type Answer = string | string[];
const ANSWERS: Answer[] = ["B", "A", "A", "A", ["resilience"], "A", "C"];

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

async function walkB2BScout(page: Page) {
  for (let i = 0; i < ANSWERS.length; i++) {
    const q = B2B_TEAM_QUESTIONS[i];
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

test.describe("PPS Op Platform recommendation links — B2B Scout Mode (real browser)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try { sessionStorage.clear(); } catch { /* noop */ }
    });
  });

  test("every Scout-Mode B2B recommendation link navigates to a working page", async ({
    page,
  }) => {
    await page.goto("/start-here");
    await expect(
      page.getByText(/I'm here because I'm thinking about/i),
    ).toBeVisible({ timeout: 5000 });

    await walkB2BScout(page);

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await page.waitForLoadState("networkidle").catch(() => { /* best-effort */ });

    await assertRecommendationLinksValid(
      page,
      dialog,
      "B2B Scout-Mode quiz result dialog",
    );
  });
});
