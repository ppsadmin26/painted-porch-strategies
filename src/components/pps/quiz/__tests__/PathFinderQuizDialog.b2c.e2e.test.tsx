/**
 * End-to-end-style integration test for the B2C P.A.T.H.finder quiz.
 *
 * Renders the real <PathFinderQuizDialog/> in jsdom and clicks through every
 * question for each canonical B2C result type (RT1–RT6) plus the cohort
 * variants of RT3/RT4 that change which primary offering is recommended.
 *
 * For each flow we assert:
 *   - The result page renders with the expected headline (=> correct resultType)
 *   - The expected PRIMARY offering name is visible
 *   - A link to the primary offering URL is rendered (the user's "next step")
 *
 * This guards the full chain — UI clicks → answers state → scoring →
 * recommendation resolver → rendered result — that the unit-level
 * pathFinderQuiz.b2c.test.ts can't catch on its own.
 */
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// jsdom doesn't ship ResizeObserver, which Radix's Dialog relies on.
beforeAll(() => {
  const g = globalThis as unknown as { ResizeObserver?: unknown };
  if (typeof g.ResizeObserver === "undefined") {
    class RO { observe() {} unobserve() {} disconnect() {} }
    g.ResizeObserver = RO;
  }
});

// Mock Supabase before importing the dialog (it pulls in the client).
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        or: async () => ({ data: [], error: null }),
      }),
    }),
    functions: { invoke: async () => ({ data: null, error: null }) },
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: () => {} }),
}));

import PathFinderQuizDialog from "@/components/pps/quiz/PathFinderQuizDialog";
import { OFFERINGS } from "@/data/pathFinderQuiz";

interface Flow {
  name: string;
  // Answers in order. PQ1 = "A" (B2C), PQ2 = "current"|"aspiring", then Q1..Q6.
  answers: { pq1: "A"; pq2: "current" | "aspiring"; q1: string; q2: string; q3: string; q4: string; q5: string; q6: string };
  expectedHeadline: RegExp;
  // The primary offering the user should land on.
  primaryOfferingKey: keyof typeof OFFERINGS;
}

const FLOWS: Flow[] = [
  // RT1 — PREPARE dominant → IGNITE self-paced foundations
  {
    name: "RT1 — Start with Foundations (Radical Mindfulness)",
    answers: { pq1: "A", pq2: "current", q1: "A", q2: "A", q3: "A", q4: "A", q5: "A", q6: "B" },
    expectedHeadline: /Start with Foundations/i,
    primaryOfferingKey: "radicalMindfulness",
  },
  // RT2 — ALIGN dominant → communication
  {
    name: "RT2 — Build Communication Power (Master Your Message)",
    answers: { pq1: "A", pq2: "current", q1: "B", q2: "B", q3: "D", q4: "B", q5: "B", q6: "B" },
    expectedHeadline: /Build Communication Power/i,
    primaryOfferingKey: "masterYourMessage",
  },
  // RT3 self-paced (Q6=B) → Create Extraordinary Teams
  {
    name: "RT3 — Elevate Team Leadership, self-paced (Create Extraordinary Teams)",
    answers: { pq1: "A", pq2: "current", q1: "C", q2: "A", q3: "B", q4: "A", q5: "C", q6: "B" },
    expectedHeadline: /Elevate Team Leadership/i,
    primaryOfferingKey: "createExtraordinaryTeams",
  },
  // RT3 cohort (Q6=C) → AMPLIFY Lab
  {
    name: "RT3 — Elevate Team Leadership, cohort (From Conflict to Connection Lab)",
    answers: { pq1: "A", pq2: "current", q1: "C", q2: "A", q3: "B", q4: "A", q5: "C", q6: "C" },
    expectedHeadline: /Elevate Team Leadership/i,
    primaryOfferingKey: "conflictToConnectionLab",
  },
  // RT4 self-paced (Q6=B) → Leading Change Mini Course
  {
    name: "RT4 — Master Change Architecture, self-paced (Leading Change Mini)",
    answers: { pq1: "A", pq2: "current", q1: "D", q2: "A", q3: "A", q4: "B", q5: "B", q6: "B" },
    expectedHeadline: /Master Change Architecture/i,
    primaryOfferingKey: "leadingChangeMini",
  },
  // RT4 cohort (Q6=C) → Leading Change / P.A.T.H. Lab
  {
    name: "RT4 — Master Change Architecture, cohort (Leading Change Lab)",
    answers: { pq1: "A", pq2: "current", q1: "D", q2: "A", q3: "A", q4: "B", q5: "B", q6: "C" },
    expectedHeadline: /Master Change Architecture/i,
    primaryOfferingKey: "leadingChangeLab",
  },
  // RT5 — HABITS + Q4/Q5=D + Q6 C|D → Advanced Partnership; primary list starts with Stractical Leader Lab
  {
    name: "RT5 — Ready for Advanced Partnership (Stractical Leader Lab)",
    answers: { pq1: "A", pq2: "current", q1: "A", q2: "A", q3: "D", q4: "D", q5: "D", q6: "C" },
    expectedHeadline: /Ready for Advanced Partnership/i,
    primaryOfferingKey: "stracticalLeaderLab",
  },
];

// RT6 has no primary group; assert headline + an exploration group offering.
const RT6_ANSWERS = { pq1: "A", pq2: "current", q1: "A", q2: "A", q3: "A", q4: "A", q5: "A", q6: "A" } as const;

function renderDialog() {
  return render(
    <MemoryRouter>
      <PathFinderQuizDialog open={true} onOpenChange={() => {}} />
    </MemoryRouter>,
  );
}

/**
 * Click the option whose label contains a unique fragment, then click "Next"
 * (or "See My Results" on the final question). Uses the option-label text
 * directly from the data layer so this stays in sync with any wording tweaks.
 */
function answerCurrent(optionLabel: string, last: boolean) {
  // The dialog renders each option as a <button> containing the label text.
  // Multiple buttons may match if a fragment is reused — pick the visible one
  // inside the current question container (the only enabled option buttons).
  const optionButtons = screen
    .getAllByRole("button")
    .filter((b) => b.textContent?.includes(optionLabel));
  expect(optionButtons.length, `option not found: "${optionLabel}"`).toBeGreaterThan(0);
  fireEvent.click(optionButtons[0]);

  const advance = screen.getByRole("button", { name: last ? /See My Results/i : /^Next/i });
  expect(advance, "advance button should be enabled after selection").not.toBeDisabled();
  fireEvent.click(advance);
}

// Map answer ids ("A"/"B"/...) to their full prompt label per question, looked
// up from the data layer so tests don't drift from copy edits.
import { PQ1, PQ2_B2C, B2C_QUESTIONS } from "@/data/pathFinderQuiz";
const labelFor = (qIndex: number, optId: string): string => {
  // 0 = PQ1, 1 = PQ2_B2C, 2..7 = Q1..Q6
  const q = qIndex === 0 ? PQ1 : qIndex === 1 ? PQ2_B2C : B2C_QUESTIONS[qIndex - 2];
  const opt = q.options.find((o) => o.id === optId);
  if (!opt) throw new Error(`No option ${optId} for question index ${qIndex} (${q.id})`);
  return opt.label;
};

function walkB2C(a: Flow["answers"]) {
  const ids: string[] = [a.pq1, a.pq2, a.q1, a.q2, a.q3, a.q4, a.q5, a.q6];
  ids.forEach((id, i) => answerCurrent(labelFor(i, id), i === ids.length - 1));
}

describe("B2C P.A.T.H.finder quiz (UI integration)", () => {
  beforeEach(() => {
    cleanup();
    // Wipe persisted progress between flows.
    try { sessionStorage.clear(); } catch { /* noop */ }
  });

  it.each(FLOWS)("$name", async ({ answers, expectedHeadline, primaryOfferingKey }) => {
    renderDialog();

    // Sanity: the first question is PQ1.
    expect(screen.getByText(/I'm here because I'm thinking about/i)).toBeInTheDocument();

    walkB2C(answers);

    // Result page rendered with the expected headline.
    const heading = await screen.findByRole("heading", { name: expectedHeadline });
    expect(heading).toBeInTheDocument();

    // Primary offering surfaced by name AND linked to its URL.
    const expected = OFFERINGS[primaryOfferingKey];
    expect(screen.getByText(expected.name)).toBeInTheDocument();

    const linksToOffering = screen
      .getAllByRole("link")
      .filter((a) => a.getAttribute("href") === expected.url);
    expect(
      linksToOffering.length,
      `expected at least one link to ${expected.url} (${primaryOfferingKey})`,
    ).toBeGreaterThan(0);

    // Smoke: the "What Comes Next" panel renders.
    expect(screen.getByText(/What Comes Next/i)).toBeInTheDocument();
  });

  it("RT6 — Explore Before Committing (Q6=A bypass) renders exploration groups, no primary", async () => {
    cleanup();
    sessionStorage.clear();
    renderDialog();

    const ids = [RT6_ANSWERS.pq1, RT6_ANSWERS.pq2, RT6_ANSWERS.q1, RT6_ANSWERS.q2, RT6_ANSWERS.q3, RT6_ANSWERS.q4, RT6_ANSWERS.q5, RT6_ANSWERS.q6];
    ids.forEach((id, i) => answerCurrent(labelFor(i, id), i === ids.length - 1));

    expect(await screen.findByRole("heading", { name: /Explore Before Committing/i })).toBeInTheDocument();
    // No "Your Starting Point" primary-group heading on RT6 (RT1–RT5 always have one).
    expect(screen.queryByRole("heading", { name: /Your Starting Point/i })).not.toBeInTheDocument();
    // An exploration offering link is present.
    const fifty2 = OFFERINGS.fiftyTwoStoicism;
    const links = screen.getAllByRole("link").filter((a) => a.getAttribute("href") === fifty2.url);
    expect(links.length).toBeGreaterThan(0);
  });
});
