/**
 * Shared helper for carrying P.A.T.H.finder quiz context into the Contact form
 * even when the user navigates away from the quiz dialog first (e.g., clicks
 * through to a recommended workshop or the Blue Door page, then later opens
 * /contact). The quiz dialog writes this payload to sessionStorage as soon as
 * a result is shown; PPSContact reads it on mount when no URL prefill params
 * are present.
 */

export const QUIZ_CONTACT_PREFILL_KEY = "pps:pathfinder:contactPrefill";

export type QuizContactPrefill = {
  scope?: string;
  interest?: string;
  message: string;
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
