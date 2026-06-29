import { test, expect, type Page } from "../playwright-fixture";
import {
  PQ1,
  ORG_PQ2,
  CHANGE_BRANCH,
  type Question,
} from "../src/data/pathFinderQuiz";

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

    // 1. Every clickable recommendation href in the dialog.
    const hrefs = await dialog.locator("a[href]").evaluateAll((nodes) =>
      Array.from(
        new Set(
          (nodes as HTMLAnchorElement[])
            .map((a) => a.getAttribute("href") ?? "")
            .filter((h) => h.length > 0)
            .filter((h) => !h.startsWith("#") && !h.startsWith("mailto:") && !h.startsWith("tel:")),
        ),
      ),
    );

    expect(
      hrefs.length,
      "B2B dialog should render at least one recommendation link",
    ).toBeGreaterThan(0);

    // 2. Safe-URL placeholders must not have rendered an <a>.
    const invalidPlaceholders = dialog.locator('[data-op-platform-invalid-url="true"]');
    const placeholderCount = await invalidPlaceholders.count();
    if (placeholderCount > 0) {
      const placeholderLinks = await invalidPlaceholders.locator("a[href]").count();
      expect(placeholderLinks, "non-clickable fallback must not render an <a>").toBe(0);
    }

    // 3. Each href resolves with 2xx/3xx.
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
        if (status >= 400) {
          failures.push(`${status} ${absolute}`);
        }
      } catch (err) {
        failures.push(`THREW ${absolute}: ${(err as Error).message}`);
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `Broken B2B recommendation link(s) rendered in quiz result dialog:\n  - ${failures.join("\n  - ")}`,
      );
    }
  });
});
