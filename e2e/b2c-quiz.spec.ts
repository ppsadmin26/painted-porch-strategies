import { test, expect, type Page } from "../playwright-fixture";
import AxeBuilder from "@axe-core/playwright";
import {
  PQ1,
  PQ2_B2C,
  B2C_QUESTIONS,
  OFFERINGS,
} from "../src/data/pathFinderQuiz";

/**
 * Run axe-core against the open quiz result dialog and fail on any
 * critical (or serious) violation. Color-contrast is excluded because
 * the dialog renders over a backdrop that axe can't always sample
 * correctly in headless Chromium — contrast is covered by the design
 * system tests, not by these flow tests.
 */
async function assertNoCriticalA11yViolations(page: Page, context: string) {
  const results = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .disableRules(["color-contrast"])
    .analyze();

  const blocking = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );

  if (blocking.length > 0) {
    const summary = blocking
      .map(
        (v) =>
          `- [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node${
            v.nodes.length === 1 ? "" : "s"
          })\n    ${v.helpUrl}`,
      )
      .join("\n");
    throw new Error(
      `Accessibility violations on ${context}:\n${summary}`,
    );
  }
}

/**
 * Real-browser smoke for the B2C P.A.T.H.finder quiz.
 *
 * Mirrors the jsdom integration suite
 * (src/components/pps/quiz/__tests__/PathFinderQuizDialog.b2c.e2e.test.tsx)
 * but runs in Chromium against the live preview so we catch issues the
 * fast suite can't: real CSS, real Radix dialog focus/portal behavior,
 * real React Router navigation when the user clicks through to the
 * recommended offering.
 *
 * One canonical flow per B2C result type + the cohort variants of
 * RT3/RT4 that swap the primary offering.
 */

type AnswerIds = ["A", "current" | "aspiring", string, string, string, string, string, string];

interface Flow {
  name: string;
  answers: AnswerIds; // PQ1, PQ2, Q1, Q2, Q3, Q4, Q5, Q6
  expectedHeadline: RegExp;
  primaryOfferingKey: keyof typeof OFFERINGS;
}

const FLOWS: Flow[] = [
  {
    name: "RT1 — Start with Foundations (Radical Mindfulness)",
    answers: ["A", "current", "A", "A", "A", "A", "A", "B"],
    expectedHeadline: /Start with Foundations/i,
    primaryOfferingKey: "radicalMindfulness",
  },
  {
    name: "RT2 — Build Communication Power (Master Your Message)",
    answers: ["A", "current", "B", "B", "D", "B", "B", "B"],
    expectedHeadline: /Build Communication Power/i,
    primaryOfferingKey: "masterYourMessage",
  },
  {
    name: "RT3 — Elevate Team Leadership, self-paced (Create Extraordinary Teams)",
    answers: ["A", "current", "C", "A", "B", "A", "C", "B"],
    expectedHeadline: /Elevate Team Leadership/i,
    primaryOfferingKey: "createExtraordinaryTeams",
  },
  {
    name: "RT3 — Elevate Team Leadership, cohort (From Conflict to Connection Lab)",
    answers: ["A", "current", "C", "A", "B", "A", "C", "C"],
    expectedHeadline: /Elevate Team Leadership/i,
    primaryOfferingKey: "conflictToConnectionLab",
  },
  {
    name: "RT4 — Master Change Architecture, self-paced (Leading Change Mini)",
    answers: ["A", "current", "D", "A", "A", "B", "B", "B"],
    expectedHeadline: /Master Change Architecture/i,
    primaryOfferingKey: "leadingChangeMini",
  },
  {
    name: "RT4 — Master Change Architecture, cohort (Leading Change Lab)",
    answers: ["A", "current", "D", "A", "A", "B", "B", "C"],
    expectedHeadline: /Master Change Architecture/i,
    primaryOfferingKey: "leadingChangeLab",
  },
  {
    name: "RT5 — Ready for Advanced Partnership (Stractical Leader Lab)",
    answers: ["A", "current", "A", "A", "D", "D", "D", "C"],
    expectedHeadline: /Ready for Advanced Partnership/i,
    primaryOfferingKey: "stracticalLeaderLab",
  },
];

const QUESTION_ORDER = [PQ1, PQ2_B2C, ...B2C_QUESTIONS];

function labelFor(qIndex: number, optId: string): string {
  const q = QUESTION_ORDER[qIndex];
  const opt = q.options.find((o) => o.id === optId);
  if (!opt) throw new Error(`No option ${optId} for question ${q.id}`);
  return opt.label;
}

async function walkB2C(page: Page, answers: AnswerIds) {
  for (let i = 0; i < answers.length; i++) {
    const last = i === answers.length - 1;
    const label = labelFor(i, answers[i]);

    // Each option renders as a <button> whose accessible name contains the
    // full prompt-label text. The dialog scopes us to the current question.
    const option = page.getByRole("button", { name: label, exact: false });
    await expect(option, `option visible: "${label.slice(0, 40)}…"`).toBeVisible();
    await option.click();

    const advance = page.getByRole("button", {
      name: last ? /See My Results/i : /^Next$/i,
    });
    await expect(advance).toBeEnabled();
    await advance.click();
  }
}

test.describe("B2C P.A.T.H.finder quiz (real browser)", () => {
  test.beforeEach(async ({ page }) => {
    // Wipe any sessionStorage progress between flows.
    await page.addInitScript(() => {
      try { sessionStorage.clear(); } catch { /* noop */ }
    });
  });

  for (const flow of FLOWS) {
    test(flow.name, async ({ page }) => {
      await page.goto("/start-here");

      // Quiz auto-opens 350ms after landing. Wait for the first prompt.
      await expect(
        page.getByText(/I'm here because I'm thinking about/i),
      ).toBeVisible({ timeout: 5000 });

      await walkB2C(page, flow.answers);

      // Result page rendered with the expected headline.
      await expect(
        page.getByRole("heading", { name: flow.expectedHeadline }),
      ).toBeVisible({ timeout: 5000 });

      // Primary offering surfaced as a link. Admin overrides + the viewable
      // allowlist (/admin/path-finder-offerings) may rewrite the href OR
      // substitute the static primary pick with a fallback when the
      // configured offering is gated off. So we only assert that the result
      // dialog renders at least one recommendation link — not the exact key.
      const dialogLinks = page.locator('[role="dialog"] a[href]');
      await expect(dialogLinks.first()).toBeVisible();
      expect(await dialogLinks.count()).toBeGreaterThan(0);

      // "What Comes Next" panel renders on every non-RT6 result.
      await expect(page.getByText(/What Comes Next/i)).toBeVisible();

      // Accessibility: result dialog must have no critical/serious violations.
      await assertNoCriticalA11yViolations(page, `result page for "${flow.name}"`);
    });
  }

  test("RT6 — Explore Before Committing (Q6=A bypass) shows exploration groups, no primary", async ({ page }) => {
    await page.goto("/start-here");
    await expect(
      page.getByText(/I'm here because I'm thinking about/i),
    ).toBeVisible({ timeout: 5000 });

    await walkB2C(page, ["A", "current", "A", "A", "A", "A", "A", "A"]);

    await expect(
      page.getByRole("heading", { name: /Explore Before Committing/i }),
    ).toBeVisible({ timeout: 5000 });

    // No primary "Your Starting Point — …" heading on RT6.
    await expect(
      page.getByRole("heading", { name: /Your Starting Point/i }),
    ).toHaveCount(0);

    // RT6 renders exploration groups with at least one offering link
    // (specific keys depend on admin's viewable allowlist).
    const dialogLinks = page.locator('[role="dialog"] a[href]');
    await expect(dialogLinks.first()).toBeVisible();
    expect(await dialogLinks.count()).toBeGreaterThan(0);

    // Accessibility: RT6 result dialog must also be clean.
    await assertNoCriticalA11yViolations(page, "RT6 result page");
  });
});
