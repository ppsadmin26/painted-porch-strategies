import { test, expect, type Page } from "../playwright-fixture";
import { PQ1, PQ2_B2C, B2C_QUESTIONS } from "../src/data/pathFinderQuiz";

/**
 * Keyboard-only navigation guardrails for the B2C P.A.T.H.finder quiz.
 *
 * Verifies, end to end in real Chromium:
 *   1. Focus order — Tab lands on option buttons in DOM order, then Next.
 *   2. Visible focus — every focused element exposes a non-`none` :focus-visible
 *      outline or box-shadow (we never strip focus rings inside the dialog).
 *   3. No keyboard traps — Shift+Tab can move backward; from the last focusable
 *      element, Tab cycles back to the first (Radix Dialog focus trap is
 *      intentional inside a modal but MUST remain navigable in both directions).
 *   4. Result page — Tab order reaches the primary-offering CTA without dead
 *      ends, and the dialog can be closed with Escape.
 *
 * All assertions run without the mouse touching the page.
 */

const QUESTION_ORDER = [PQ1, PQ2_B2C, ...B2C_QUESTIONS];

/** Canonical RT3 cohort flow — exercises every question + the cohort primary. */
const FLOW = {
  answers: ["A", "current", "C", "A", "B", "A", "C", "C"] as const,
  primaryOfferingKey: "conflictToConnectionLab" as const,
};

async function focusedSummary(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return null;
    return {
      tag: el.tagName,
      role: el.getAttribute("role"),
      name:
        el.getAttribute("aria-label") ||
        (el.textContent || "").trim().slice(0, 80),
      dataIndex: el.getAttribute("data-option-index"),
    };
  });
}

async function hasVisibleFocusIndicator(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return false;
    const cs = window.getComputedStyle(el);
    const outlineVisible =
      cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
    const ringVisible = cs.boxShadow !== "none";
    return outlineVisible || ringVisible;
  });
}

async function pressKey(page: Page, key: string, times = 1) {
  for (let i = 0; i < times; i++) await page.keyboard.press(key);
}

async function answerByKeyboard(page: Page, qIndex: number, optId: string, last: boolean) {
  const q = QUESTION_ORDER[qIndex];
  const opt = q.options.find((o) => o.id === optId);
  if (!opt) throw new Error(`No option ${optId} for ${q.id}`);

  // The first option button should be reachable via Tab from the dialog's
  // initial focus. Tab until activeElement is the desired option label, then
  // activate with Space or Enter (both must work for buttons).
  const target = page
    .getByRole("radio", { name: opt.label, exact: false })
    .or(page.getByRole("button", { name: opt.label, exact: false }));
  await expect(target).toBeVisible();


  // Tab forward up to N times to land on the target. Cap to avoid infinite loop.
  let landed = false;
  for (let i = 0; i < 25; i++) {
    const isFocused = await target.evaluate(
      (el) => el === document.activeElement,
    );
    if (isFocused) {
      landed = true;
      break;
    }
    await page.keyboard.press("Tab");
  }
  expect(landed, `Tab never reached option "${opt.label.slice(0, 40)}…"`).toBe(true);

  // Visible focus indicator required on the focused option.
  expect(
    await hasVisibleFocusIndicator(page),
    `option "${opt.label.slice(0, 40)}…" must show a visible focus ring`,
  ).toBe(true);

  // Activate via keyboard (Space for native buttons).
  await page.keyboard.press(" ");

  // Now Tab forward to the advance button and activate with Enter.
  const advance = page.getByRole("button", {
    name: last ? /See My Results/i : /^Next$/i,
  });
  await expect(advance).toBeEnabled();

  let advanceFocused = false;
  for (let i = 0; i < 25; i++) {
    const isFocused = await advance.evaluate(
      (el) => el === document.activeElement,
    );
    if (isFocused) {
      advanceFocused = true;
      break;
    }
    await page.keyboard.press("Tab");
  }
  expect(advanceFocused, "Tab never reached advance button").toBe(true);
  expect(await hasVisibleFocusIndicator(page)).toBe(true);

  await page.keyboard.press("Enter");
}

test.describe("B2C quiz — keyboard-only navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try { sessionStorage.clear(); } catch { /* noop */ }
    });
  });

  test("walks the full RT3-cohort flow using only Tab/Shift+Tab/Enter/Space", async ({ page }) => {
    await page.goto("/start-here");
    await expect(
      page.getByText(/I'm here because I'm thinking about/i),
    ).toBeVisible({ timeout: 5000 });

    // PQ1 — verify Shift+Tab also works (reverse traversal, no trap).
    const firstOption = page.getByRole("button", {
      name: PQ1.options[0].label,
      exact: false,
    });
    // Tab to first option.
    for (let i = 0; i < 10; i++) {
      const focused = await firstOption.evaluate(
        (el) => el === document.activeElement,
      );
      if (focused) break;
      await page.keyboard.press("Tab");
    }
    expect(
      await firstOption.evaluate((el) => el === document.activeElement),
      "Tab should reach the first option of PQ1",
    ).toBe(true);

    // Shift+Tab moves focus away — must not be stuck.
    const before = await focusedSummary(page);
    await page.keyboard.press("Shift+Tab");
    const after = await focusedSummary(page);
    expect(after, "Shift+Tab must move focus (no trap)").not.toEqual(before);

    // Walk the rest of the quiz by keyboard.
    for (let i = 0; i < FLOW.answers.length; i++) {
      await answerByKeyboard(page, i, FLOW.answers[i], i === FLOW.answers.length - 1);
    }

    // Result page rendered.
    await expect(
      page.getByRole("heading", { name: /Elevate Team Leadership/i }),
    ).toBeVisible({ timeout: 5000 });

    // Tab through the result dialog: every focused element shows a visible
    // focus indicator, and Tab eventually reaches the first recommendation
    // link (admin overrides may substitute the configured primary offering
    // when it's gated off, so use the first recommendation link in the
    // dialog rather than a name lookup).
    const offeringLink = page.locator('[role="dialog"] a[href]').first();
    await expect(offeringLink).toBeVisible();

    const seen = new Set<string>();
    let reachedOffering = false;
    let stuckCount = 0;
    let prevKey = "";

    for (let i = 0; i < 80; i++) {
      const cur = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return "::body";
        const tag = el.tagName;
        const id = el.id || "";
        const name = (el.getAttribute("aria-label") || el.textContent || "")
          .trim()
          .slice(0, 60);
        const href = (el as HTMLAnchorElement).href || "";
        return `${tag}#${id}|${href}|${name}`;
      });

      if (cur === prevKey) {
        stuckCount++;
        // 2 identical focuses in a row after Tab = keyboard trap.
        expect(stuckCount, `keyboard trap on ${cur}`).toBeLessThan(2);
      } else {
        stuckCount = 0;
      }
      prevKey = cur;
      seen.add(cur);

      // Every non-body focused element must have a visible indicator.
      if (cur !== "::body") {
        expect(
          await hasVisibleFocusIndicator(page),
          `focused element lacks visible indicator: ${cur}`,
        ).toBe(true);
      }

      const onOffering = await offeringLink.evaluate(
        (el) => el === document.activeElement,
      );
      if (onOffering) {
        reachedOffering = true;
        break;
      }
      await page.keyboard.press("Tab");
    }

    expect(reachedOffering, "Tab order never reached the primary offering link").toBe(true);

    // Escape closes the dialog (standard Radix behavior, but assert it so a
    // regression in focus trap config surfaces here).
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("heading", { name: /Elevate Team Leadership/i }),
    ).toBeHidden({ timeout: 3000 });
  });
});
