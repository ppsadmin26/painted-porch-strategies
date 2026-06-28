/**
 * E2E-style integration test verifying that the "Related Reading" feature
 * works end-to-end:
 *
 *   1. The hook (useQuizRelatedContent) queries Supabase using the category
 *      slugs mapped to the result's ResultType.
 *   2. The PathFinderQuizDialog renders a "From the Porch — Related Reading"
 *      section listing the returned blog + media items as proper links.
 *   3. When the user submits the email form, the submit-path-finder-quiz
 *      edge function is invoked with `relatedContent` included in the
 *      payload (so it flows through to the results email).
 */
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

beforeAll(() => {
  const g = globalThis as unknown as { ResizeObserver?: unknown };
  if (typeof g.ResizeObserver === "undefined") {
    class RO { observe() {} unobserve() {} disconnect() {} }
    g.ResizeObserver = RO;
  }
});

// ----- Fixture data returned by the mocked Supabase client -----
const CATEGORY_ROWS = [
  { id: "cat-resilience", slug: "resilience-wellbeing" },
  { id: "cat-stoicism", slug: "stoicism-philosophy" },
];

const BLOG_ROW = {
  post: {
    id: "blog-1",
    slug: "calm-in-the-storm",
    title: "Finding Calm in the Storm",
    excerpt: "How small daily practices fortify resilience.",
    cover_image_url: "https://img/blog-1.jpg",
    publish_date: "2025-05-01T00:00:00Z",
    status: "published",
  },
};

const MEDIA_ROW = {
  appearance: {
    id: "media-1",
    title: "Stoicism at Work",
    show_name: "The Leadership Podcast",
    description: "Amy on applying Stoic practices in modern teams.",
    thumbnail_url: "https://img/media-1.jpg",
    external_url: "https://podcast.example/episode/123",
    appearance_date: "2025-04-15T00:00:00Z",
  },
};

const invokeSpy = vi.fn(
  async (_name: string, _opts: { body: unknown }) => ({ data: null, error: null }),
);

vi.mock("@/integrations/supabase/client", () => {
  // Per-table fake query builder. Returns a thenable that resolves with the
  // fixture rows for whichever table was selected.
  const buildFor = (table: string) => {
    let data: unknown[] = [];
    if (table === "blog_categories") data = CATEGORY_ROWS;
    else if (table === "blog_post_categories") data = [BLOG_ROW];
    else if (table === "media_appearance_categories") data = [MEDIA_ROW];
    else data = [];

    const result = Promise.resolve({ data, error: null });
    const builder: Record<string, unknown> = {};
    const chain = () => builder;
    builder.select = chain;
    builder.or = () => result;
    builder.eq = chain;
    builder.in = chain;
    builder.limit = chain;
    builder.order = chain;
    builder.then = (onFulfilled?: unknown, onRejected?: unknown) =>
      (result.then as (a?: unknown, b?: unknown) => unknown)(onFulfilled, onRejected);
    return builder;
  };

  return {
    supabase: {
      from: (table: string) => buildFor(table),
      functions: { invoke: (name: string, opts: { body: unknown }) => invokeSpy(name, opts) },
    },
  };
});

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: () => {} }),
}));

import PathFinderQuizDialog from "@/components/pps/quiz/PathFinderQuizDialog";
import { PQ1, PQ2_B2C, B2C_QUESTIONS, RT_TO_CONTENT_CATEGORIES } from "@/data/pathFinderQuiz";

// RT1 (Start with Foundations) is mapped to ["resilience-wellbeing","stoicism-philosophy"]
// — the exact slugs our mocked blog_categories table returns ids for.
const RT1_ANSWERS = ["A", "current", "A", "A", "A", "A", "A", "B"] as const;

const labelFor = (qIndex: number, optId: string): string => {
  const q = qIndex === 0 ? PQ1 : qIndex === 1 ? PQ2_B2C : B2C_QUESTIONS[qIndex - 2];
  const opt = q.options.find((o) => o.id === optId);
  if (!opt) throw new Error(`No option ${optId} at index ${qIndex}`);
  return opt.label;
};

function answerCurrent(optionLabel: string, last: boolean) {
  const btn = [
    ...screen.queryAllByRole("button"),
    ...screen.queryAllByRole("radio"),
  ].find((b) => b.textContent?.includes(optionLabel));
  expect(btn, `option not found: "${optionLabel}"`).toBeTruthy();
  fireEvent.click(btn!);
  const advance = screen.getByRole("button", { name: last ? /See My Results/i : /^Next/i });
  fireEvent.click(advance);
}

function renderDialog() {
  return render(
    <MemoryRouter>
      <PathFinderQuizDialog open={true} onOpenChange={() => {}} />
    </MemoryRouter>,
  );
}

describe("PathFinderQuizDialog — Related Reading (E2E)", () => {
  beforeEach(() => {
    cleanup();
    invokeSpy.mockClear();
    try { sessionStorage.clear(); } catch { /* noop */ }
  });

  it("RT_TO_CONTENT_CATEGORIES has slugs for every ResultType", () => {
    // Sanity guard — keeps the mapping in sync with the union type.
    const rts = ["RT1","RT2","RT3","RT4","RT5","RT6","RT-A","RT-B","RT-C","RT-D","RT-E"] as const;
    for (const rt of rts) {
      const slugs = RT_TO_CONTENT_CATEGORIES[rt];
      expect(slugs, `missing mapping for ${rt}`).toBeTruthy();
      expect(slugs.length).toBeGreaterThan(0);
    }
  });

  it("renders the From the Porch section with blog + media items, then includes relatedContent in the submit payload", async () => {
    renderDialog();
    RT1_ANSWERS.forEach((id, i) => answerCurrent(labelFor(i, id), i === RT1_ANSWERS.length - 1));

    // Result renders.
    await screen.findByRole("heading", { name: /Start with Foundations/i });

    // Related Reading section renders once the hook resolves.
    await screen.findByText(/^Related Reading$/i);
    await screen.findByText(BLOG_ROW.post.title);
    await screen.findByText(MEDIA_ROW.appearance.title);

    // Blog item links internally to /resources/blog/<slug>.
    const blogLink = screen
      .getAllByRole("link")
      .find((a) => a.getAttribute("href") === `/resources/blog/${BLOG_ROW.post.slug}`);
    expect(blogLink, "internal blog link missing").toBeTruthy();

    // Media item links externally and opens in a new tab.
    const mediaLink = screen
      .getAllByRole("link")
      .find((a) => a.getAttribute("href") === MEDIA_ROW.appearance.external_url);
    expect(mediaLink, "external media link missing").toBeTruthy();
    expect(mediaLink!.getAttribute("target")).toBe("_blank");
    expect(mediaLink!.getAttribute("rel") ?? "").toMatch(/noopener/);

    // Source label for media.
    expect(screen.getByText(/Media · The Leadership Podcast/i)).toBeInTheDocument();

    // Now fill in the email form and submit — payload must include relatedContent.
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "Marcus" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "marcus@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /Send my results/i }));

    await waitFor(() => expect(invokeSpy).toHaveBeenCalled());
    const call = invokeSpy.mock.calls[0] as unknown as [string, { body: Record<string, unknown> }];
    const [fnName, opts] = call;
    expect(fnName).toBe("submit-path-finder-quiz");
    const related = opts.body.relatedContent as Array<{ kind: string; title: string; url: string }>;
    expect(Array.isArray(related)).toBe(true);
    expect(related.length).toBeGreaterThanOrEqual(2);
    const kinds = related.map((r) => r.kind).sort();
    expect(kinds).toContain("blog");
    expect(kinds).toContain("media");
    expect(related.find((r) => r.kind === "blog")?.title).toBe(BLOG_ROW.post.title);
    expect(related.find((r) => r.kind === "media")?.url).toBe(MEDIA_ROW.appearance.external_url);
  });
});
