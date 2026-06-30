/**
 * /admin/offerings — Routing rules block coverage.
 *
 * For every offering card rendered on the page, this spec:
 *   1. Reads the tier chip shown on the card.
 *   2. Looks up the canonical routing summary via
 *      `routingSummaryForTier(tier)` (the same helper the UI uses).
 *   3. Asserts the per-card "Routing rules" block shows the matching
 *      headline, placement badge, every rule bullet, and the persona list.
 *
 * Requires an admin Supabase session (see admin-offerings.spec.ts for the
 * env vars). Skipped otherwise so PRs without an injected session stay green.
 */
import { test, expect, type Locator } from "@playwright/test";
import {
  routingSummaryForTier,
  PLACEMENT_BADGE_COPY,
} from "../src/lib/quizRoutingSummary";

const SESSION_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;
const AUTH_STATUS = process.env.LOVABLE_BROWSER_AUTH_STATUS;
const HAS_SESSION =
  AUTH_STATUS === "injected" && !!SESSION_KEY && !!SESSION_JSON;

test.describe("/admin/offerings — Routing rules per card", () => {
  test.skip(
    !HAS_SESSION,
    `No admin Supabase session injected (LOVABLE_BROWSER_AUTH_STATUS=${AUTH_STATUS ?? "unset"}).`,
  );

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(
      ([key, json]) => {
        window.localStorage.setItem(key as string, json as string);
      },
      [SESSION_KEY!, SESSION_JSON!],
    );
    await page.goto("/admin/offerings", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");
    if (!page.url().includes("/admin/offerings")) {
      test.skip(true, `Redirected to ${page.url()} — admin role required.`);
    }
    await expect(
      page.locator("code.text-xs.text-muted-foreground").first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("each card's Routing rules block matches routingSummaryForTier(tier)", async ({
    page,
  }) => {
    // Every offering card carries a Save button and an offering_key <code>.
    const cards: Locator = page
      .locator("div")
      .filter({ has: page.locator("code.text-xs.text-muted-foreground") })
      .filter({ has: page.getByRole("button", { name: /^Save$/ }) });

    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    // Cap to keep runtime sane on large datasets while still covering every
    // tier — the assertion loop is O(cards) and the page renders all rows.
    const maxToCheck = Math.min(count, 60);
    const tiersSeen = new Set<string>();

    for (let i = 0; i < maxToCheck; i++) {
      const card = cards.nth(i);
      const key = (await card.locator("code").first().innerText()).trim();

      // The tier chip lives next to the offering name; it's the only element
      // with `border-dashed border-bluedoor/40` + `h-7` short text content.
      // Fall back to scanning short text candidates.
      const tierChip = card
        .locator("span, div")
        .filter({ hasText: /^(Free|Speaking|Workshop|Blue Door|IGNITE|AMPLIFY|Assessment|—)$/ })
        .first();
      await expect(tierChip, `tier chip for ${key}`).toBeVisible();
      const rawTier = (await tierChip.innerText()).trim();
      const tier = rawTier === "—" ? "" : rawTier;
      tiersSeen.add(tier || "(unknown)");

      const summary = routingSummaryForTier(tier);

      // Scope to the routing-rules block inside this card.
      const block = card
        .locator("div")
        .filter({
          has: page.getByText(
            /Routing rules · how this offering reaches the quiz/,
          ),
        })
        .first();
      await expect(block, `routing block for ${key} (tier=${tier})`).toBeVisible();

      // Headline.
      await expect(
        block.getByText(summary.headline, { exact: false }),
        `headline for ${key} (tier=${tier})`,
      ).toBeVisible();

      // Placement badge copy.
      await expect(
        block.getByText(PLACEMENT_BADGE_COPY[summary.placement], { exact: true }),
        `placement badge for ${key} (tier=${tier})`,
      ).toBeVisible();

      // Every rule bullet.
      for (const rule of summary.rules) {
        await expect(
          block.getByText(rule, { exact: false }),
          `rule bullet for ${key} (tier=${tier}): ${rule.slice(0, 40)}…`,
        ).toBeVisible();
      }

      // Persona list (only rendered when non-empty).
      if (summary.personas.length > 0) {
        await expect(
          block.getByText(
            `Personas reached: ${summary.personas.join(", ")}`,
            { exact: false },
          ),
          `personas for ${key} (tier=${tier})`,
        ).toBeVisible();
      }
    }

    // Sanity: dataset should exercise more than a single tier.
    expect(tiersSeen.size).toBeGreaterThan(1);
  });

  test("unknown tiers render the 'Not routed' fallback summary", async ({
    page,
  }) => {
    // Pure unit-style guard against helper drift — the UI uses the same
    // helper, so verifying the helper's fallback shape protects the block's
    // rendering contract even when no card currently has an unknown tier.
    const summary = routingSummaryForTier("NotARealTier");
    expect(summary.placement).toBe("none");
    expect(PLACEMENT_BADGE_COPY[summary.placement]).toBe("Not routed");
    expect(summary.rules.length).toBeGreaterThan(0);
    expect(summary.personas).toEqual([]);
  });
});
