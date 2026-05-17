import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

/**
 * Verifies bottom-link alignment for the "Discover Your P.A.T.H.way" cards
 * ("Exploring for Yourself?" and "Exploring for Your Team or Organization?").
 *
 * jsdom doesn't run layout, so true pixel screenshots aren't possible here.
 * Instead we assert the structural contract that guarantees the link sits at
 * the bottom of each card at every breakpoint:
 *   - card uses `flex flex-col h-full`
 *   - the link uses `mt-auto`
 *   - the link is the LAST child of its card
 *   - the grid wrapper uses `items-stretch` so cards match heights on md+
 */

vi.mock("@/hooks/useFeaturedPosts", () => ({
  useFeaturedPosts: () => ({ posts: [], isLoading: false }),
}));
vi.mock("@/hooks/useDocumentSeo", () => ({
  useDocumentSeo: () => {},
}));
vi.mock("@/components/pps/ClientLogoMarquee", () => ({
  __esModule: true,
  default: () => null,
}));
vi.mock("@/components/pps/TierHeroSection", () => ({
  TierHeroSection: () => null,
}));
vi.mock("@/components/pps/ParallaxCTA", () => ({
  __esModule: true,
  default: () => null,
}));
vi.mock("@/assets/heroes/home-hero.jpg", () => ({ default: "hero.jpg" }));

import PPSHome from "../PPSHome";

function renderHome() {
  return render(
    <MemoryRouter>
      <PPSHome />
    </MemoryRouter>,
  );
}

describe("PPSHome — Discover cards link alignment", () => {
  it("aligns the link at the bottom of each card via flex-col + mt-auto", () => {
    renderHome();

    // Scope to each card via its heading, then assert the trailing link.
    const yourselfCard = screen
      .getByRole("heading", { name: /^Exploring for Yourself\?$/i })
      .closest("div") as HTMLElement;
    const teamCard = screen
      .getByRole("heading", {
        name: /^Exploring for Your Team or Organization\?$/i,
      })
      .closest("div") as HTMLElement;

    expect(yourselfCard).toBeTruthy();
    expect(teamCard).toBeTruthy();

    const pathLink = yourselfCard.querySelector(
      'a[href="/start-here"]',
    ) as HTMLAnchorElement;
    const blueDoorCardLink = teamCard.querySelector(
      'a[href="/blue-door"]',
    ) as HTMLAnchorElement;

    expect(pathLink).toBeTruthy();
    expect(blueDoorCardLink).toBeTruthy();

    for (const [card, link] of [
      [yourselfCard, pathLink],
      [teamCard, blueDoorCardLink],
    ] as const) {
      // The link itself must push to the bottom of the flex column.
      expect(link.className).toMatch(/\bmt-auto\b/);

      // The card must be a full-height flex column.
      expect(card.className).toMatch(/\bflex\b/);
      expect(card.className).toMatch(/\bflex-col\b/);
      expect(card.className).toMatch(/\bh-full\b/);

      // The link must be the LAST child of the card (nothing below it).
      expect(card.lastElementChild).toBe(link);
    }

    // The grid wrapper must stretch cards to equal height on md+ so the
    // links visually line up across cards. (Mobile stacks single-column,
    // so per-card bottom alignment via mt-auto is what matters there.)
    const grid = yourselfCard.parentElement as HTMLElement;
    expect(grid.className).toMatch(/\bgrid\b/);
    expect(grid.className).toMatch(/\bitems-stretch\b/);
    expect(grid.className).toMatch(/\bmd:grid-cols-2\b/);
  });
});
