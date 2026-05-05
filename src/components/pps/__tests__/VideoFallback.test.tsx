import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VideoFallback from "../VideoFallback";

describe("VideoFallback", () => {
  it("renders loading state with polite aria-live and default copy", () => {
    const { container } = render(<VideoFallback state="loading" />);
    expect(screen.getByText("Loading video…")).toBeInTheDocument();
    const root = container.firstChild as HTMLElement;
    expect(root.getAttribute("aria-live")).toBe("polite");
    expect(root.getAttribute("role")).toBeNull();
  });

  it("renders error state with role='alert' and default copy", () => {
    render(<VideoFallback state="error" />);
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(screen.getByText("Video unavailable right now")).toBeInTheDocument();
  });

  it("renders empty state with default copy and no alert role", () => {
    const { container } = render(<VideoFallback state="empty" />);
    expect(screen.getByText("Preview unavailable right now")).toBeInTheDocument();
    const root = container.firstChild as HTMLElement;
    expect(root.getAttribute("role")).toBeNull();
    expect(root.getAttribute("aria-live")).toBeNull();
  });

  it("hides text and marks aria-hidden when message is null", () => {
    const { container } = render(<VideoFallback state="empty" message={null} />);
    expect(screen.queryByText("Preview unavailable right now")).not.toBeInTheDocument();
    const root = container.firstChild as HTMLElement;
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders Retry button only on error state when onRetry is provided", async () => {
    const onRetry = vi.fn();
    render(<VideoFallback state="error" onRetry={onRetry} />);
    const btn = screen.getByRole("button", { name: /retry/i });
    await userEvent.click(btn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render Retry on non-error states even with onRetry", () => {
    render(<VideoFallback state="loading" onRetry={() => {}} />);
    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
  });
});
