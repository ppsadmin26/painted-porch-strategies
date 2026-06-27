// Quiz outcome → Blue Door persona mapping.
//
// The Blue Door catalog uses a closed set of 5 personas. Every Pathfinder
// quiz result type (RT1–RT6 for B2C, RT-A through RT-E for B2B) must map
// into exactly one of them when calling the Blue Door recommendations
// endpoint. See docs/handoff/BlueDoor-to-PPS-Offerings-Handoff-v1.md §4.
//
// Scout Mode (B2B individual exploring labs) routes to b2c_individual,
// per .lovable/memory/features/quiz/b2b-recommendation-rules.md.

import type { ResultType } from "@/data/pathFinderQuiz";
import type {
  BlueDoorPersona,
  BlueDoorSegment,
} from "@/integrations/bluedoor/recommendations";

export interface PersonaMapInput {
  resultType: ResultType;
  /** B2B: did the user signal individual exploration (Scout Mode)? */
  scoutMode?: boolean;
  /** B2B: org-size / scope signal if the quiz captures one. */
  scope?: "individual" | "team" | "leader" | "exec" | "org";
}

const B2B_RESULTS: ReadonlySet<ResultType> = new Set<ResultType>([
  "RT-A",
  "RT-B",
  "RT-C",
  "RT-D",
  "RT-E",
]);

export function isB2BResult(rt: ResultType): boolean {
  return B2B_RESULTS.has(rt);
}

export function resolveBlueDoorPersona(input: PersonaMapInput): BlueDoorPersona {
  const { resultType, scoutMode, scope } = input;

  if (!isB2BResult(resultType)) return "b2c_individual";

  // Scout Mode: B2B individual exploring labs → treat as B2C buyer for the
  // recommendation slate (matches existing Scout reroute behavior).
  if (scoutMode) return "b2c_individual";

  switch (scope) {
    case "individual":
      return "b2c_individual";
    case "team":
      return "b2b_team";
    case "exec":
      return "b2b_exec";
    case "org":
      return "b2b_org";
    case "leader":
    default:
      // Default B2B persona is the people-leader, per handoff guidance.
      return "b2b_leader";
  }
}

export function segmentForResult(rt: ResultType): BlueDoorSegment {
  return isB2BResult(rt) ? "B2B" : "B2C";
}
