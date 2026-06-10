import { test, expect, type Page } from "../playwright-fixture";
import AxeBuilder from "@axe-core/playwright";

/**
 * Site-wide accessibility smoke tests.
 *
 * Visits every high-traffic public route and runs axe-core against the full
 * page. Fails on `critical` or `serious` WCAG 2.0/2.1 A/AA violations.
 *
 * color-contrast is excluded because headless Chromium cannot reliably
 * sample alpha-composited backgrounds (hero overlays, gradients). Contrast
 * is enforced separately by the design system tests.
 *
 * Add new routes to ROUTES as pages launch. Keep this list focused on
 * routes a real visitor can reach — admin/draft pages live behind auth and
 * don't belong here.
 */

const ROUTES: Array<{ name: string; path: string }> = [
  { name: "Home",                       path: "/" },
  { name: "About",                      path: "/about" },
  { name: "Our Approach",               path: "/about/approach" },
  { name: "Our Impact",                 path: "/about/impact" },
  { name: "Partner hub",                path: "/partner" },
  { name: "IGNITE",                     path: "/partner/ignite" },
  { name: "IGNITE courses",             path: "/partner/ignite/courses" },
  { name: "IGNITE assessments",         path: "/partner/ignite/assessments" },
  { name: "IGNITE masterclasses",       path: "/partner/ignite/masterclasses" },
  { name: "AMPLIFY",                    path: "/partner/amplify" },
  { name: "AMPLIFY workshops",          path: "/partner/amplify/workshops" },
  { name: "AMPLIFY sprints",            path: "/partner/amplify/sprints" },
  { name: "AMPLIFY labs",               path: "/partner/amplify/labs" },
  { name: "Stractical Leader workshop", path: "/partner/amplify/stractical-leader" },
  { name: "EMBODY",                     path: "/partner/embody" },
  { name: "Blue Door landing",          path: "/blue-door" },
  { name: "Phase Zero",                 path: "/phase-zero" },
  { name: "EQ assessment",              path: "/eq" },
  { name: "Resources hub",              path: "/resources" },
  { name: "Free downloads",             path: "/resources/free" },
  { name: "Insights blog",              path: "/resources/insights" },
  { name: "FAQ",                        path: "/resources/faq" },
  { name: "YouTube",                    path: "/resources/youtube" },
  { name: "As Seen On",                 path: "/speaking/media" },
  { name: "Speaking hub",               path: "/speaking" },
  { name: "Speaker — Amy",              path: "/speaking/amy" },
  { name: "Speaker — Rob",              path: "/speaking/rob" },
  { name: "Speaker — Sierra",           path: "/speaking/sierra" },
  { name: "Start Here (quiz)",          path: "/start-here" },
  { name: "Contact",                    path: "/contact" },
  { name: "Terms",                      path: "/terms" },
  { name: "Sitemap",                    path: "/sitemap" },
  { name: "Refund request",             path: "/refund-request" },
  { name: "Burnout opt-in",             path: "/burnout" },
  { name: "Kick the Habit",             path: "/kick-the-habit" },
  { name: "Pilot Training",             path: "/pilot-training" },
  { name: "Stoic Field Guide",          path: "/stoic-field-guide" },
  { name: "6 Communicator Styles",      path: "/6-communicator-styles" },
  { name: "Link-in-bio — Amy",          path: "/amy" },
  { name: "Link-in-bio — Rob",          path: "/rob" },
  { name: "Link-in-bio — Sierra",       path: "/sierra" },
];

async function runAxe(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .disableRules(["color-contrast"])
    .analyze();

  const blocking = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );

  if (blocking.length > 0) {
    const summary = blocking
      .map((v) => {
        const sampleNodes = v.nodes
          .slice(0, 3)
          .map((n) => `      ${n.target.join(" ")}`)
          .join("\n");
        return `- [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node${
          v.nodes.length === 1 ? "" : "s"
        })\n    ${v.helpUrl}\n${sampleNodes}`;
      })
      .join("\n");
    throw new Error(`Accessibility violations on ${label}:\n${summary}`);
  }
}

test.describe("Site-wide accessibility", () => {
  test.beforeEach(async ({ page }) => {
    // Auto-dismiss the quiz dialog so it doesn't dominate every result.
    // Pages that intentionally open it (e.g. /start-here) have their own
    // dedicated a11y coverage in e2e/b2c-quiz.spec.ts.
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("pps-pathfinder-quiz-dismissed", "1");
      } catch {
        /* noop */
      }
    });
  });

  for (const route of ROUTES) {
    test(`${route.name} (${route.path})`, async ({ page }) => {
      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
      expect(response?.status() ?? 0, `${route.path} should load`).toBeLessThan(400);

      // Give lazy-mounted hero videos and animations a beat to settle so
      // axe sees the real DOM, not a transient loading state.
      await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {
        /* some pages keep long-lived connections open; that's fine */
      });

      await runAxe(page, `${route.name} (${route.path})`);
    });
  }
});
