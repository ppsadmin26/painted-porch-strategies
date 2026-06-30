// Per-tier routing summary surfaced read-only on /admin/offerings cards and
// on /admin/quiz-rules. Sourced from src/data/pathFinderQuiz.ts — keep in
// sync when the engine's routing logic changes.
//
// See also: .lovable/memory/features/quiz/pq2-routing-and-scout-mode.md
//           .lovable/memory/features/quiz/b2b-recommendation-rules.md
//           .lovable/memory/features/quiz/b2b-featured-pool.md

export interface RoutingSummary {
  /** Short one-liner shown as the block header on each card. */
  headline: string;
  /** How this tier gets placed into a result. */
  placement: "auto" | "rt-pool" | "always" | "none";
  /** Bullet rules shown beneath the headline. */
  rules: string[];
  /** Which personas it can reach (informational). */
  personas: string[];
}

export const ALL_PERSONAS = [
  "b2c_individual",
  "b2b_leader",
  "b2b_exec",
  "b2b_team",
  "b2b_org",
] as const;

const B2B_ONLY = ["b2b_leader", "b2b_exec", "b2b_team", "b2b_org"];
const B2C_ONLY = ["b2c_individual"];

export function routingSummaryForTier(tier: string): RoutingSummary {
  const t = (tier || "").trim();
  switch (t) {
    case "Free":
      return {
        headline: "Free Resources — RT-pool controlled",
        placement: "rt-pool",
        rules: [
          "Surfaces in any RT (B2C RT1–6 or B2B RT-A–E) where you check the box in the RT-pool editor below.",
          "Capped at 2 free resources per B2B result; supplemental 'More from the Porch' caps at 4 across all sources.",
          "Scout Mode (B2B individual scout) reroutes to B2C personas, so B2C pools can still light up for them.",
        ],
        personas: [...ALL_PERSONAS],
      };
    case "Speaking":
      return {
        headline: "Speaking Topics — RT-pool controlled (B2B only)",
        placement: "rt-pool",
        rules: [
          "Surfaces in the B2B 'Speaking Topics — Bookable Keynotes' group, capped at 3 per result.",
          "RT membership comes from the B2B RT-pool checkboxes below (overrides the SPEAKING_BY_RT default).",
          "Also gated by the 'Show on Speaker Page' toggle for /speaking/[name] pages — independent of quiz routing.",
        ],
        personas: B2B_ONLY,
      };
    case "Workshop":
      return {
        headline: "Workshops — automatic by result type",
        placement: "auto",
        rules: [
          "Placed by the engine: each B2B result (RT-A through RT-E) has a fixed primary-3 workshop set hard-coded in pathFinderQuiz.ts.",
          "B2B Featured Pool fallback: when an RT's primary picks are all ineligible, SAFE_B2B_FALLBACK fills in so the list never goes blank.",
          "'Pin to top' below promotes the workshop to position 1 only when it's already in the matched primary list.",
        ],
        personas: B2B_ONLY,
      };
    case "Blue Door":
      return {
        headline: "Blue Door — always present on every B2B result",
        placement: "always",
        rules: [
          "Appears in the 'Deeper Option — Blue Door Organizational Appraisal' group on RT-A through RT-E.",
          "Promoted to 'Strongest Next Step' for RT-D (architectural signal) and any B2B branch where Blue Door scores stronger than workshops.",
          "Not surfaced on B2C results.",
        ],
        personas: B2B_ONLY,
      };
    case "IGNITE":
      return {
        headline: "IGNITE (B2C) — automatic by result type",
        placement: "auto",
        rules: [
          "Placed by the engine on B2C results (RT1–RT6) based on the matched scoring path.",
          "RT-pool checkboxes below are ignored for this tier — placement is hard-coded in pathFinderQuiz.ts.",
          "Linked launch (course_launch_status) controls Live vs Coming Soon badging in the quiz result.",
        ],
        personas: B2C_ONLY,
      };
    case "AMPLIFY":
      return {
        headline: "AMPLIFY Labs — automatic by result type",
        placement: "auto",
        rules: [
          "Default audience is B2C individuals on the matched RT. Scout Mode (B2B individual scout) promotes a relevant lab to the primary slot via pickScoutLab().",
          "Surfaces on B2B results only when the engine routes there explicitly (e.g., Stractical Leader crossover note on Cap branch).",
          "RT-pool checkboxes below are ignored for this tier.",
        ],
        personas: [...ALL_PERSONAS],
      };
    case "Assessment":
      return {
        headline: "Assessment — automatic by result type",
        placement: "auto",
        rules: [
          "Engine-placed on the result types where the assessment is the prescribed next step.",
          "RT-pool checkboxes below are ignored for this tier.",
        ],
        personas: [...ALL_PERSONAS],
      };
    default:
      return {
        headline: "Tier not recognized — no routing rules defined",
        placement: "none",
        rules: [
          `Unknown tier "${tier || "—"}". The quiz engine has no placement logic for this tier; offering will not appear in any result.`,
          "Set a valid tier in the PPS Op Platform (Free, Speaking, Workshop, Blue Door, IGNITE, AMPLIFY, Assessment).",
        ],
        personas: [],
      };
  }
}

export const PLACEMENT_BADGE_COPY: Record<RoutingSummary["placement"], string> = {
  "rt-pool": "RT-pool",
  auto: "Auto",
  always: "Always shown",
  none: "Not routed",
};
