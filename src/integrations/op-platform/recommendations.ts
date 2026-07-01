// Blue Door — public Pathfinder Recommendations client.
//
// Phase A foundation for wiring the PPS Pathfinder quiz to the Blue Door
// canonical catalog (topics + deliveries) via the public edge function.
// See docs/handoff/BlueDoor-to-PPS-Offerings-Handoff-v1.md
//
// Endpoint is public (anon-keyed, RLS-gated, read-only). No auth required.

export const OP_PLATFORM_RECS_ENDPOINT =
  "https://ycwitjvuhtkvtnbfvuhl.supabase.co/functions/v1/pathfinder-recommendations";

export type OpPlatformPersona =
  | "b2c_individual"
  | "b2b_leader"
  | "b2b_exec"
  | "b2b_team"
  | "b2b_org";

export type OpPlatformStage = "PREPARE" | "ALIGN" | "TAKE_OFF" | "HABITS";

export type OpPlatformFormat =
  | "assessment"
  | "course"
  | "free_resource"
  | "keynote"
  | "lab"
  | "masterclass"
  | "partnership"
  | "workshop";

export type OpPlatformSegment = "B2B" | "B2C";
export type OpPlatformSurface = "quiz" | "pathways" | "any";

export interface OpPlatformRecommendationFilters {
  persona?: OpPlatformPersona | OpPlatformPersona[];
  stage?: OpPlatformStage | OpPlatformStage[];
  format?: OpPlatformFormat | OpPlatformFormat[];
  segment?: OpPlatformSegment | OpPlatformSegment[];
  pillar?: string | string[];
  surface?: OpPlatformSurface;
  liveOnly?: boolean;
  limit?: number;
}

export interface OpPlatformRecommendation {
  name: string;
  short_blurb: string | null;
  long_description: string | null;
  url: string | null;
  thumbnail_url: string | null;
  format: OpPlatformFormat;
  catalog_segment: OpPlatformSegment;
  audience_personas: OpPlatformPersona[];
  path_stage: OpPlatformStage | null;
  pricing: Record<string, unknown> | null;
  marketing_angle: string | null;
  content_themes: string[];
  pillar_alignment: string[];
  is_live: boolean;
  status: string;
  sort_order: number | null;
}

export interface OpPlatformRecommendationResponse {
  count: number;
  results: OpPlatformRecommendation[];
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

export function buildOpPlatformRecsUrl(
  filters: OpPlatformRecommendationFilters,
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
  return qs ? `${OP_PLATFORM_RECS_ENDPOINT}?${qs}` : OP_PLATFORM_RECS_ENDPOINT;
}

export class OpPlatformFetchError extends Error {
  status?: number;
  statusText?: string;
  url: string;
  body?: string;
  cause?: unknown;
  constructor(
    message: string,
    opts: {
      url: string;
      status?: number;
      statusText?: string;
      body?: string;
      cause?: unknown;
    },
  ) {
    super(message);
    this.name = "OpPlatformFetchError";
    this.url = opts.url;
    this.status = opts.status;
    this.statusText = opts.statusText;
    this.body = opts.body;
    this.cause = opts.cause;
  }
}

export async function fetchOpPlatformRecommendations(
  filters: OpPlatformRecommendationFilters,
  init?: { signal?: AbortSignal },
): Promise<OpPlatformRecommendationResponse> {
  const url = buildOpPlatformRecsUrl(filters);
  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: init?.signal,
    });
  } catch (cause) {
    throw new OpPlatformFetchError(
      `Network error contacting PPS Op Platform: ${(cause as Error)?.message ?? cause}`,
      { url, cause },
    );
  }
  if (!res.ok) {
    let errBody = "";
    try {
      errBody = await res.text();
    } catch {
      // ignore
    }
    throw new OpPlatformFetchError(
      `PPS Op Platform request failed (${res.status} ${res.statusText}).`,
      { url, status: res.status, statusText: res.statusText, body: errBody },
    );
  }
  const data = (await res.json()) as Partial<OpPlatformRecommendationResponse>;
  const { validateOpPlatformRecommendations } = await import("./schema");
  const { valid, dropped } = validateOpPlatformRecommendations(data.results);
  if (dropped.length > 0 && typeof console !== "undefined") {
    // Single grouped warning per fetch so a noisy catalog doesn't spam the
    // browser console. Includes index + field for fast triage.
    console.warn(
      `[op-platform] dropped ${dropped.length} invalid recommendation row(s):`,
      dropped,
    );
  }
  return {
    count: valid.length,
    results: valid,
  };
}
