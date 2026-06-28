// Blue Door — public Pathfinder Recommendations client.
//
// Phase A foundation for wiring the PPS Pathfinder quiz to the Blue Door
// canonical catalog (topics + deliveries) via the public edge function.
// See docs/handoff/BlueDoor-to-PPS-Offerings-Handoff-v1.md
//
// Endpoint is public (anon-keyed, RLS-gated, read-only). No auth required.

export const BLUEDOOR_RECS_ENDPOINT =
  "https://ycwitjvuhtkvtnbfvuhl.supabase.co/functions/v1/pathfinder-recommendations";

export type BlueDoorPersona =
  | "b2c_individual"
  | "b2b_leader"
  | "b2b_exec"
  | "b2b_team"
  | "b2b_org";

export type BlueDoorStage = "PREPARE" | "ALIGN" | "TAKE_OFF" | "HABITS";

export type BlueDoorFormat =
  | "assessment"
  | "course"
  | "free_resource"
  | "keynote"
  | "lab"
  | "masterclass"
  | "partnership"
  | "workshop";

export type BlueDoorSegment = "B2B" | "B2C";
export type BlueDoorSurface = "quiz" | "pathways" | "any";

export interface BlueDoorRecommendationFilters {
  persona?: BlueDoorPersona | BlueDoorPersona[];
  stage?: BlueDoorStage | BlueDoorStage[];
  format?: BlueDoorFormat | BlueDoorFormat[];
  segment?: BlueDoorSegment | BlueDoorSegment[];
  pillar?: string | string[];
  surface?: BlueDoorSurface;
  liveOnly?: boolean;
  limit?: number;
}

export interface BlueDoorRecommendation {
  name: string;
  short_blurb: string | null;
  long_description: string | null;
  url: string | null;
  thumbnail_url: string | null;
  format: BlueDoorFormat;
  catalog_segment: BlueDoorSegment;
  audience_personas: BlueDoorPersona[];
  path_stage: BlueDoorStage | null;
  pricing: Record<string, unknown> | null;
  marketing_angle: string | null;
  content_themes: string[];
  pillar_alignment: string[];
  is_live: boolean;
  status: string;
  sort_order: number | null;
}

export interface BlueDoorRecommendationResponse {
  count: number;
  results: BlueDoorRecommendation[];
}

function appendMulti(
  params: URLSearchParams,
  key: string,
  value: unknown,
): void {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    if (value.length === 0) return;
    params.set(key, value.join(","));
  } else {
    params.set(key, String(value));
  }
}

export function buildBlueDoorRecsUrl(
  filters: BlueDoorRecommendationFilters,
): string {
  const params = new URLSearchParams();
  appendMulti(params, "persona", filters.persona);
  appendMulti(params, "stage", filters.stage);
  appendMulti(params, "format", filters.format);
  appendMulti(params, "segment", filters.segment);
  appendMulti(params, "pillar", filters.pillar);
  if (filters.surface) params.set("surface", filters.surface);
  if (filters.liveOnly !== undefined)
    params.set("liveOnly", String(filters.liveOnly));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return qs ? `${BLUEDOOR_RECS_ENDPOINT}?${qs}` : BLUEDOOR_RECS_ENDPOINT;
}

export async function fetchOpPlatformRecommendations(
  filters: BlueDoorRecommendationFilters,
  init?: { signal?: AbortSignal },
): Promise<BlueDoorRecommendationResponse> {
  const url = buildBlueDoorRecsUrl(filters);
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: init?.signal,
  });
  if (!res.ok) {
    let errBody = "";
    try {
      errBody = await res.text();
    } catch {
      // ignore
    }
    throw new Error(
      `Blue Door recommendations request failed (${res.status}): ${errBody}`,
    );
  }
  const data = (await res.json()) as BlueDoorRecommendationResponse;
  return {
    count: data.count ?? 0,
    results: Array.isArray(data.results) ? data.results : [],
  };
}
