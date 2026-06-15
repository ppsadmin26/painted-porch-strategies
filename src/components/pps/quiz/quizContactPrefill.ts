/**
 * Shared helper for carrying P.A.T.H.finder quiz context into the Contact form
 * even when the user navigates away from the quiz dialog first (e.g., clicks
 * through to a recommended workshop or the Blue Door page, then later opens
 * /contact). The quiz dialog writes this payload to sessionStorage as soon as
 * a result is shown; PPSContact reads it on mount and offers the user a
 * checkbox to include the answers + recommendations in their message.
 */

export const QUIZ_CONTACT_PREFILL_KEY = "pps:pathfinder:contactPrefill";

export type QuizContactPrefill = {
  scope?: string;
  interest?: string;
  /** Formatted recommendations / next-steps block from the quiz result */
  message: string;
  /** Formatted Q&A list of how the user answered the quiz */
  answersText?: string;
  /** Display label shown in the small contact-form banner */
  resultHeadline: string;
  /** Timestamp so we can age out stale prefills (24h) */
  savedAt: number;
};

const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function saveQuizContactPrefill(payload: Omit<QuizContactPrefill, "savedAt">): void {
  try {
    sessionStorage.setItem(
      QUIZ_CONTACT_PREFILL_KEY,
      JSON.stringify({ ...payload, savedAt: Date.now() } satisfies QuizContactPrefill),
    );
  } catch {
    /* ignore */
  }
}

export function loadQuizContactPrefill(): QuizContactPrefill | null {
  try {
    const raw = sessionStorage.getItem(QUIZ_CONTACT_PREFILL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuizContactPrefill;
    if (!parsed || typeof parsed !== "object" || !parsed.message) return null;
    if (Date.now() - (parsed.savedAt ?? 0) > MAX_AGE_MS) {
      clearQuizContactPrefill();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearQuizContactPrefill(): void {
  try { sessionStorage.removeItem(QUIZ_CONTACT_PREFILL_KEY); } catch { /* ignore */ }
}

/** Combine the answers and recommendations into a single appendable block. */
export function formatQuizBlock(p: Pick<QuizContactPrefill, "message" | "answersText" | "resultHeadline">): string {
  const parts: string[] = [];
  parts.push(`--- P.A.T.H.finder Quiz Context ---`);
  if (p.resultHeadline) parts.push(`Result: ${p.resultHeadline}`);
  if (p.answersText && p.answersText.trim()) {
    parts.push(``, `My quiz responses:`, p.answersText.trim());
  }
  if (p.message && p.message.trim()) {
    parts.push(``, `Recommended next steps from the quiz:`, p.message.trim());
  }
  return parts.join("\n");
}
