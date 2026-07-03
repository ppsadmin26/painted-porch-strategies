/**
 * Workshop / Keynote / Speaking routing validation.
 *
 * Shared rules used by:
 *  - the offerings editor admin UI (blocks publish on errors)
 *  - `scripts/validate-workshop-routing.mjs` (build-time CI guard)
 *
 * Kept as a pure function with no React or Supabase imports so it can be
 * consumed from Node scripts and unit tests without extra deps.
 */

export interface WorkshopRoutingRow {
  offering_key: string;
  name?: string | null;
  delivery_format: string;
  current_url: string | null;
  anchor_id: string | null;
  topic_slug: string | null;
  include_in_workshops: boolean;
  include_on_speaker_page: boolean;
  is_keynote: boolean;
}

export type RoutingIssueLevel = "error" | "warning";

export interface RoutingIssue {
  level: RoutingIssueLevel;
  code: string;
  message: string;
}

/** Offerings whose canonical landing is NOT /speaking/topics — allowed to keep their own URL. */
export const DEDICATED_LANDING_KEYS = new Set<string>([
  "stracticalLeader",
  "kickTheHabit",
]);

/** Known speaker pages a row may point at when `include_on_speaker_page = true`. */
export const SPEAKER_PAGE_URLS = new Set<string>([
  "/speaking/amy",
  "/speaking/rob",
]);

const WORKSHOPS_URL = "/partner/amplify/workshops";
const SPEAKING_TOPICS_URL = "/speaking/topics";

const ROUTING_FORMATS = new Set(["workshop", "keynote", "speaking"]);

/** Is this row subject to workshop/keynote/speaking routing rules at all? */
export function isRoutingRelevant(row: WorkshopRoutingRow): boolean {
  return (
    ROUTING_FORMATS.has((row.delivery_format || "").toLowerCase()) ||
    !!row.include_in_workshops ||
    !!row.is_keynote ||
    !!row.include_on_speaker_page
  );
}

export interface ValidateOptions {
  /**
   * Set of anchor ids known to be rendered on /partner/amplify/workshops.
   * Passed by the build-time script (parsed from AmplifyWorkshops.tsx + the
   * live DB query). Optional in the admin UI — when omitted, rule 1's anchor
   * membership check is skipped (we still enforce presence).
   */
  featuredAnchorIds?: Set<string>;
}

export interface ValidationResult {
  level: "ok" | "warning" | "error";
  issues: RoutingIssue[];
}

export function validateWorkshopRouting(
  row: WorkshopRoutingRow,
  opts: ValidateOptions = {},
): ValidationResult {
  const issues: RoutingIssue[] = [];

  if (!isRoutingRelevant(row)) {
    return { level: "ok", issues };
  }

  const key = row.offering_key;
  const current = (row.current_url || "").trim();
  const anchor = (row.anchor_id || "").trim();
  const topicSlug = (row.topic_slug || "").trim();
  const isDedicated = DEDICATED_LANDING_KEYS.has(key);

  // Rule 1: featured workshops
  if (row.include_in_workshops) {
    if (current !== WORKSHOPS_URL) {
      issues.push({
        level: "error",
        code: "FEATURED_WRONG_URL",
        message: `Featured on Workshops page must have current_url="${WORKSHOPS_URL}" (got "${current || "∅"}").`,
      });
    }
    if (!anchor) {
      issues.push({
        level: "error",
        code: "FEATURED_MISSING_ANCHOR",
        message: "Featured workshop is missing anchor_id — card cannot be linked to.",
      });
    } else if (opts.featuredAnchorIds && !opts.featuredAnchorIds.has(anchor)) {
      issues.push({
        level: "error",
        code: "FEATURED_ANCHOR_UNRENDERED",
        message: `anchor_id "${anchor}" is not rendered on /partner/amplify/workshops.`,
      });
    }
    return finalize(issues);
  }

  // Rule 2: speaker-page rows
  if (row.include_on_speaker_page) {
    if (!SPEAKER_PAGE_URLS.has(current)) {
      issues.push({
        level: "error",
        code: "SPEAKER_WRONG_URL",
        message: `"Show on Speaker page" is on but current_url "${current || "∅"}" is not a registered speaker page.`,
      });
    }
    if (!anchor) {
      issues.push({
        level: "warning",
        code: "SPEAKER_MISSING_ANCHOR",
        message: "Speaker-page rows should set anchor_id so quiz recommendations scroll to the topic card.",
      });
    }
    return finalize(issues);
  }

  // Rule 3: everything else → /speaking/topics
  if (isDedicated) {
    // Dedicated-landing exception: don't enforce topic-slug rules.
    return finalize(issues);
  }

  if (current !== SPEAKING_TOPICS_URL) {
    issues.push({
      level: "error",
      code: "TOPIC_WRONG_URL",
      message: `Workshop/keynote/speaking rows must route to "${SPEAKING_TOPICS_URL}" (got "${current || "∅"}").`,
    });
  }
  if (!topicSlug) {
    issues.push({
      level: "error",
      code: "TOPIC_SLUG_MISSING",
      message: "topic_slug is required so /speaking/topics can render the card.",
    });
  }
  if (topicSlug && anchor && anchor !== topicSlug) {
    issues.push({
      level: "error",
      code: "TOPIC_SLUG_MISMATCH",
      message: `anchor_id "${anchor}" must match topic_slug "${topicSlug}".`,
    });
  }
  if (topicSlug && !anchor) {
    issues.push({
      level: "error",
      code: "TOPIC_ANCHOR_MISSING",
      message: `anchor_id must be set to "${topicSlug}" to scroll to the card.`,
    });
  }

  return finalize(issues);
}

/**
 * Rule 4 — paired workshop/keynote rows sharing a topic_slug must share
 * current_url and anchor_id. Returns per-row issues keyed by offering_key.
 */
export function validateTopicSlugPairs(
  rows: WorkshopRoutingRow[],
): Map<string, RoutingIssue[]> {
  const out = new Map<string, RoutingIssue[]>();
  const bySlug = new Map<string, WorkshopRoutingRow[]>();
  for (const r of rows) {
    if (!r.topic_slug) continue;
    if (DEDICATED_LANDING_KEYS.has(r.offering_key)) continue;
    if (r.include_in_workshops || r.include_on_speaker_page) continue;
    const list = bySlug.get(r.topic_slug) ?? [];
    list.push(r);
    bySlug.set(r.topic_slug, list);
  }

  for (const [slug, group] of bySlug) {
    if (group.length < 2) continue;
    const urls = new Set(group.map((r) => (r.current_url || "").trim()));
    const anchors = new Set(group.map((r) => (r.anchor_id || "").trim()));
    if (urls.size > 1 || anchors.size > 1) {
      for (const r of group) {
        const list = out.get(r.offering_key) ?? [];
        list.push({
          level: "error",
          code: "TOPIC_PAIR_DIVERGES",
          message: `Rows sharing topic_slug "${slug}" must share current_url and anchor_id.`,
        });
        out.set(r.offering_key, list);
      }
    }
  }
  return out;
}

function finalize(issues: RoutingIssue[]): ValidationResult {
  const hasError = issues.some((i) => i.level === "error");
  return {
    level: hasError ? "error" : issues.length ? "warning" : "ok",
    issues,
  };
}
