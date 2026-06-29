import { describe, it, expect, vi } from "vitest";
import { render, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RecGroup } from "../PathFinderQuizDialog";

function renderGroup(offerings: Parameters<typeof RecGroup>[0]["offerings"]) {
  return render(
    <MemoryRouter>
      <RecGroup heading="Test Group" offerings={offerings} onClose={vi.fn()} />
    </MemoryRouter>
  );
}

describe("RecGroup — invalid URL defense-in-depth", () => {
  it("renders a non-clickable placeholder (no anchor) with data-op-platform-invalid-url for unsafe URLs", () => {
    const { container, getByText } = renderGroup([
      {
        key: "bad-1",
        name: "Bad JS URL",
        blurb: "Should not be clickable",
        url: "javascript:alert(1)",
        tier: "Free",
      },
    ]);

    const placeholder = container.querySelector('[data-op-platform-invalid-url="true"]');
    expect(placeholder).not.toBeNull();
    expect(placeholder!.tagName).toBe("DIV");
    expect(placeholder!.getAttribute("role")).toBe("link");
    expect(placeholder!.getAttribute("aria-disabled")).toBe("true");
    expect(placeholder!.getAttribute("aria-label")).toContain("link unavailable");
    expect(placeholder!.getAttribute("aria-describedby")).toContain("bad-1-unavailable");

    // No anchor or router link rendered for this offering
    expect(within(placeholder as HTMLElement).queryByRole("link")).toBeNull();
    expect(container.querySelectorAll("a").length).toBe(0);

    // Context still shown
    expect(getByText("Bad JS URL")).toBeInTheDocument();

    // Visible, accessible unavailable text is rendered
    expect(getByText("Link unavailable — check back soon")).toBeInTheDocument();
  });

  it.each([
    ["empty string", ""],
    ["whitespace", "   "],
    ["javascript: scheme", "javascript:void(0)"],
    ["data: scheme", "data:text/html,<script>1</script>"],
    ["unsupported scheme", "ftp://example.com"],
    ["relative path without leading slash", "resources/foo"],
  ])("flags %s as invalid", (_label, url) => {
    const { container, getByText } = renderGroup([
      { key: "k", name: "X", blurb: "y", url, tier: "Free" },
    ]);
    expect(container.querySelector('[data-op-platform-invalid-url="true"]')).not.toBeNull();
    expect(container.querySelectorAll("a").length).toBe(0);
    expect(getByText("Link unavailable — check back soon")).toBeInTheDocument();
  });

  it("renders safe URLs as real links (no placeholder attribute)", () => {
    const { container } = renderGroup([
      { key: "ok-1", name: "Internal", blurb: "b", url: "/resources/foo", tier: "Free" },
      { key: "ok-2", name: "External", blurb: "b", url: "https://example.com", tier: "Free" },
    ]);
    expect(container.querySelector('[data-op-platform-invalid-url="true"]')).toBeNull();
    expect(container.querySelectorAll("a").length).toBe(2);
  });

  it("mixed list renders only invalid items as placeholders", () => {
    const { container } = renderGroup([
      { key: "ok", name: "Good", blurb: "b", url: "/x", tier: "Free" },
      { key: "bad", name: "Bad", blurb: "b", url: "javascript:1", tier: "Free" },
    ]);
    expect(container.querySelectorAll('[data-op-platform-invalid-url="true"]').length).toBe(1);
    expect(container.querySelectorAll("a").length).toBe(1);
  });
});
