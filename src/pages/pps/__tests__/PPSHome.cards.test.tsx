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

    const pathLink = screen.getByRole("link", {
      name: /Discover Your P\.A\.T\.H\.way/i,
    });
    const blueDoorLinks = screen.getAllByRole("link", {
      name: /Open the Blue Door/i,
    });
    // Find the Blue Door link inside the cards section (paired with the
    // P.A.T.H.way link in the same grid). It's the one whose parent card also
    // contains the heading "Exploring for Your Team or Organization?".
    const blueDoorCardLink = blueDoorLinks.find((el) =>
      el.parentElement?.textContent?.includes(
        "Exploring for Your Team or Organization?",
      ),
    );
    expect(blueDoorCardLink, "card-level Blue Door link").toBeDefined();

    for (const link of [pathLink, blueDoorCardLink!]) {
      // The link itself must push to the bottom of the flex column.
      expect(link.className).toMatch(/\bmt-auto\b/);

      // Its parent card must be a full-height flex column.
      const card = link.parentElement as HTMLElement;
      expect(card.className).toMatch(/\bflex\b/);
      expect(card.className).toMatch(/\bflex-col\b/);
      expect(card.className).toMatch(/\bh-full\b/);

      // The link must be the LAST child of the card (nothing below it).
      expect(card.lastElementChild).toBe(link);
    }

    // The grid wrapper must stretch cards to equal height on md+ so the
    // links visually line up across cards (mobile stacks, so per-card
    // bottom alignment via mt-auto is what matters there).
    const grid = (pathLink.parentElement as HTMLElement)
      .parentElement as HTMLElement;
    expect(grid.className).toMatch(/\bgrid\b/);
    expect(grid.className).toMatch(/\bitems-stretch\b/);
    expect(grid.className).toMatch(/\bmd:grid-cols-2\b/);
  });
});
