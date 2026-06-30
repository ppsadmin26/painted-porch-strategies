/**
 * /admin/offerings end-to-end coverage.
 *
 * Verifies the consolidated offerings admin (Phase C) correctly toggles
 * website-owned controls and recomputes badges. Runs only when an admin
 * Supabase session has been injected into the sandbox via the standard
 * LOVABLE_BROWSER_SUPABASE_* env vars (see browser-use docs) AND the
 * signed-in user has admin role. Otherwise the suite is skipped so it
 * stays green on PRs without an authenticated session.
 *
 * Controls under test:
 *   - is_featured_in_quiz   (Pin-to-top switch)
 *   - include_on_speaker_page (Speaker Page switch)
 *   - launch_slug           (Linked launch <select>)
 *   - b2c_rt_pools          (RT pool checkboxes)
 *   - Published / Quiz-eligible badge recompute
 *
 * Note: `include_in_quiz` is not yet surfaced as its own switch in the
 * admin UI (Phase C still derives quiz visibility from `is_published` +
 * URL/anchor presence). When that switch ships, add coverage in the
 * dedicated `it("toggles include_in_quiz …")` block below.
 */
import { test, expect, type Page } from "@playwright/test";

const SESSION_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;
const AUTH_STATUS = process.env.LOVABLE_BROWSER_AUTH_STATUS;

const HAS_SESSION =
  AUTH_STATUS === "injected" && !!SESSION_KEY && !!SESSION_JSON;

test.describe("/admin/offerings — admin UI controls", () => {
  test.skip(
    !HAS_SESSION,
    `No admin Supabase session injected (LOVABLE_BROWSER_AUTH_STATUS=${AUTH_STATUS ?? "unset"}). ` +
      `Sign in to the preview as an admin so the harness mints a session, ` +
      `or provide LOVABLE_BROWSER_SUPABASE_* env vars in CI.`,
  );

  test.beforeEach(async ({ page }) => {
    // Establish the localhost origin before writing into localStorage so the
    // Supabase client picks the session up on the next navigation.
    await page.goto("/");
    await page.evaluate(
      ([key, json]) => {
        window.localStorage.setItem(key as string, json as string);
      },
      [SESSION_KEY!, SESSION_JSON!],
    );
    await page.goto("/admin/offerings", { waitUntil: "domcontentloaded" });

    // The admin layout redirects non-admin users straight to /admin. If that
    // happens, skip the suite — these tests require admin role, not just
    // any authenticated user.
    await page.waitForLoadState("networkidle");
    if (!page.url().includes("/admin/offerings")) {
      test.skip(
        true,
        `Signed-in user redirected to ${page.url()} — admin role required for /admin/offerings tests.`,
      );
    }
    // Wait until at least one offering card has rendered.
    await expect(
      page.locator('code:has-text("-")').first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  /**
   * Returns the first offering card (a row container that holds an
   * `offering_key` <code> tag and a Save button). All subsequent assertions
   * are scoped under this locator so the spec is order-independent.
   */
  const firstCard = (page: Page) =>
    page
      .locator("div")
      .filter({
        has: page.locator("code.text-xs.text-muted-foreground"),
      })
      .filter({ has: page.getByRole("button", { name: /^Save$/ }) })
      .first();

  test("toggles is_featured_in_quiz (Pin to top) and persists after reload", async ({
    page,
  }) => {
    const card = firstCard(page);
    const key = (await card.locator("code").first().innerText()).trim();
    const pinLabel = card.getByText(/Pin to top of primary list/i);
    const pinSwitch = card.locator('button[role="switch"]').filter({
      has: page.locator("xpath=following-sibling::*[1]//strong"),
    });
    // Simpler: find the switch by its associated label id pattern.
    const featuredSwitch = card.locator('button[role="switch"][id^="featured-"]');
    await expect(featuredSwitch).toBeVisible();
    await expect(pinLabel).toBeVisible();

    const initial = await featuredSwitch.getAttribute("data-state");
    await featuredSwitch.click();
    await expect(featuredSwitch).not.toHaveAttribute("data-state", initial!);

    const saveBtn = card.getByRole("button", { name: /^Save$/ });
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();
    await expect(page.getByText(/^Saved$/)).toBeVisible({ timeout: 10_000 });

    // Reload and confirm the row with the same key reflects the new state.
    await page.reload({ waitUntil: "domcontentloaded" });
    const sameCard = page
      .locator("div")
      .filter({ has: page.locator(`code:has-text("${key}")`) })
      .filter({ has: page.getByRole("button", { name: /^Save$/ }) })
      .first();
    const persisted = sameCard.locator(
      'button[role="switch"][id^="featured-"]',
    );
    await expect(persisted).toBeVisible();
    const newState = initial === "checked" ? "unchecked" : "checked";
    await expect(persisted).toHaveAttribute("data-state", newState);

    // Revert so the test is non-destructive.
    await persisted.click();
    await sameCard.getByRole("button", { name: /^Save$/ }).click();
    await expect(page.getByText(/^Saved$/)).toBeVisible({ timeout: 10_000 });
  });

  test("toggles include_on_speaker_page and persists", async ({ page }) => {
    const card = firstCard(page);
    const key = (await card.locator("code").first().innerText()).trim();
    const speakerSwitch = card
      .locator("label")
      .filter({ hasText: /Speaker Page/ })
      .locator('button[role="switch"]');
    await expect(speakerSwitch).toBeVisible();

    const before = await speakerSwitch.getAttribute("data-state");
    await speakerSwitch.click();
    await expect(speakerSwitch).not.toHaveAttribute("data-state", before!);

    await card.getByRole("button", { name: /^Save$/ }).click();
    await expect(page.getByText(/^Saved$/)).toBeVisible({ timeout: 10_000 });

    await page.reload({ waitUntil: "domcontentloaded" });
    const sameCard = page
      .locator("div")
      .filter({ has: page.locator(`code:has-text("${key}")`) })
      .filter({ has: page.getByRole("button", { name: /^Save$/ }) })
      .first();
    const persisted = sameCard
      .locator("label")
      .filter({ hasText: /Speaker Page/ })
      .locator('button[role="switch"]');
    const expected = before === "checked" ? "unchecked" : "checked";
    await expect(persisted).toHaveAttribute("data-state", expected);

    // Revert.
    await persisted.click();
    await sameCard.getByRole("button", { name: /^Save$/ }).click();
    await expect(page.getByText(/^Saved$/)).toBeVisible({ timeout: 10_000 });
  });

  test("edits launch_slug via the Linked launch <select> and persists", async ({
    page,
  }) => {
    const card = firstCard(page);
    const key = (await card.locator("code").first().innerText()).trim();
    const launchSelect = card
      .locator("label")
      .filter({ hasText: /Linked launch/i })
      .locator("xpath=following::select[1]");
    await expect(launchSelect).toBeVisible();

    const options = await launchSelect.locator("option").allTextContents();
    if (options.length < 2) {
      test.skip(true, "No launch slugs available to pick from in this env.");
    }

    const original = await launchSelect.inputValue();
    // Pick the first non-current, non-empty option.
    const candidate = (
      await launchSelect.locator("option").elementHandles()
    )
      .map((h) => h)
      .find(async (h) => {
        const v = await h.getAttribute("value");
        return v && v !== original;
      });
    if (!candidate) test.skip(true, "Only one launch option available.");
    const newValue = (await candidate!.getAttribute("value")) || "";

    await launchSelect.selectOption(newValue);
    await card.getByRole("button", { name: /^Save$/ }).click();
    await expect(page.getByText(/^Saved$/)).toBeVisible({ timeout: 10_000 });

    await page.reload({ waitUntil: "domcontentloaded" });
    const sameCard = page
      .locator("div")
      .filter({ has: page.locator(`code:has-text("${key}")`) })
      .filter({ has: page.getByRole("button", { name: /^Save$/ }) })
      .first();
    const persistedSelect = sameCard
      .locator("label")
      .filter({ hasText: /Linked launch/i })
      .locator("xpath=following::select[1]");
    await expect(persistedSelect).toHaveValue(newValue);

    // Revert.
    await persistedSelect.selectOption(original);
    await sameCard.getByRole("button", { name: /^Save$/ }).click();
    await expect(page.getByText(/^Saved$/)).toBeVisible({ timeout: 10_000 });
  });

  test("toggles a B2C RT pool checkbox and persists", async ({ page }) => {
    const card = firstCard(page);
    const key = (await card.locator("code").first().innerText()).trim();

    // RT pool editor renders checkboxes; first one in the card is fine.
    const firstPoolCheckbox = card
      .getByRole("checkbox")
      .first();
    if ((await firstPoolCheckbox.count()) === 0) {
      test.skip(true, "Selected card has no RT pool checkboxes.");
    }
    const before = await firstPoolCheckbox.getAttribute("data-state");
    await firstPoolCheckbox.click();
    await expect(firstPoolCheckbox).not.toHaveAttribute(
      "data-state",
      before!,
    );
    await card.getByRole("button", { name: /^Save$/ }).click();
    await expect(page.getByText(/^Saved$/)).toBeVisible({ timeout: 10_000 });

    await page.reload({ waitUntil: "domcontentloaded" });
    const sameCard = page
      .locator("div")
      .filter({ has: page.locator(`code:has-text("${key}")`) })
      .filter({ has: page.getByRole("button", { name: /^Save$/ }) })
      .first();
    const persisted = sameCard.getByRole("checkbox").first();
    const expected = before === "checked" ? "unchecked" : "checked";
    await expect(persisted).toHaveAttribute("data-state", expected);

    // Revert.
    await persisted.click();
    await sameCard.getByRole("button", { name: /^Save$/ }).click();
    await expect(page.getByText(/^Saved$/)).toBeVisible({ timeout: 10_000 });
  });

  test("Published switch flips the eligibility badge between Quiz eligible / Not eligible", async ({
    page,
  }) => {
    // Find a card that already has a URL or anchor so eligibility is purely
    // a function of the Published toggle.
    const card = firstCard(page);
    const key = (await card.locator("code").first().innerText()).trim();
    const publishedSwitch = card.locator(
      'button[role="switch"][id^="published-"]',
    );
    await expect(publishedSwitch).toBeVisible();
    const initial = await publishedSwitch.getAttribute("data-state");

    await publishedSwitch.click();
    const after = await publishedSwitch.getAttribute("data-state");
    expect(after).not.toBe(initial);

    // Badge recomputes immediately (no save required for the badge — it
    // reads from the in-memory dirty state).
    if (after === "checked") {
      await expect(card.getByText(/Quiz eligible/)).toBeVisible();
    } else {
      await expect(card.getByText(/Not eligible/)).toBeVisible();
    }

    // Revert without persisting so we don't accidentally unpublish a row.
    await publishedSwitch.click();
    await expect(publishedSwitch).toHaveAttribute("data-state", initial!);
    // Sanity: same row still resolvable by key after revert.
    await expect(page.locator(`code:has-text("${key}")`).first()).toBeVisible();
  });

  // Placeholder: enable when an `include_in_quiz` switch ships in
  // PathFinderOfferings.tsx. The Phase C migration added the column but
  // the admin UI still derives quiz visibility from is_published + URL.
  test.skip("toggles include_in_quiz (not yet surfaced in admin UI)", async () => {});
});
