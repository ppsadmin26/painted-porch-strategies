import { expect, type Page, type Locator } from "../../playwright-fixture";

/**
 * Shared helpers for asserting that every rendered recommendation link
 * inside the P.A.T.H.finder result dialog is safe and reachable.
 *
 * Used by both pq-op-platform-recs.spec.ts (B2C) and
 * pq-op-platform-recs-b2b.spec.ts (B2B).
 */

/** Collect every navigable href rendered inside the result dialog. */
export async function collectRecommendationHrefs(dialog: Locator): Promise<string[]> {
  return dialog.locator("a[href]").evaluateAll((nodes) =>
    Array.from(
      new Set(
        (nodes as HTMLAnchorElement[])
          .map((a) => a.getAttribute("href") ?? "")
          .filter((h) => h.length > 0)
          // Skip in-page anchors and mailto/tel which aren't navigations.
          .filter(
            (h) =>
              !h.startsWith("#") &&
              !h.startsWith("mailto:") &&
              !h.startsWith("tel:"),
          ),
      ),
    ),
  );
}

/**
 * Defense-in-depth: any card that fell back to the non-clickable safe
 * placeholder (data-op-platform-invalid-url="true") must NOT contain a
 * navigable <a>.
 */
export async function assertSafePlaceholdersHaveNoLinks(dialog: Locator): Promise<void> {
  const invalidPlaceholders = dialog.locator('[data-op-platform-invalid-url="true"]');
  const placeholderCount = await invalidPlaceholders.count();
  if (placeholderCount === 0) return;
  const placeholderLinks = await invalidPlaceholders.locator("a[href]").count();
  expect(
    placeholderLinks,
    "non-clickable fallback must not render an <a>",
  ).toBe(0);
}

/**
 * Hit every href with HEAD (fallback to GET on 405/501) using the page's
 * network stack. Throws a single aggregated error listing every broken
 * link so failures are easy to triage.
 */
export async function assertAllHrefsReachable(
  page: Page,
  hrefs: string[],
  context: string,
): Promise<void> {
  const baseURL = new URL(page.url()).origin;
  const failures: string[] = [];
  for (const href of hrefs) {
    const absolute = href.startsWith("http")
      ? href
      : new URL(href, baseURL).toString();
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
      // 2xx/3xx counts as working. SPA routes always 200 from the dev
      // server because index.html is served for unknown paths, which
      // matches production behavior.
      if (status >= 400) {
        failures.push(`${status} ${absolute}`);
      }
    } catch (err) {
      failures.push(`THREW ${absolute}: ${(err as Error).message}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `Broken recommendation link(s) rendered in ${context}:\n  - ${failures.join("\n  - ")}`,
    );
  }
}

/**
 * Convenience: run the full validation suite against an already-visible
 * result dialog.
 */
export async function assertRecommendationLinksValid(
  page: Page,
  dialog: Locator,
  context: string,
): Promise<string[]> {
  const hrefs = await collectRecommendationHrefs(dialog);
  expect(
    hrefs.length,
    `${context} should render at least one recommendation link`,
  ).toBeGreaterThan(0);
  await assertSafePlaceholdersHaveNoLinks(dialog);
  await assertAllHrefsReachable(page, hrefs, context);
  return hrefs;
}
