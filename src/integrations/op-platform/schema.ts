/**
 * Schema validation for PPS Op Platform recommendation rows.
 *
 * Runs at ingestion time inside `fetchOpPlatformRecommendations` so the rest
 * of the app only ever sees rows whose shape we trust:
 *   - `name`     — non-empty trimmed string (rendered as the card title)
 *   - `short_blurb` — non-empty string when present (allowed null), bounded
 *     length so a corrupt long_description can't sneak in
 *   - `url`      — either a safe http(s) absolute URL or a same-origin
 *     absolute path (`/foo`, not `//evil.com`), per `isSafeOpPlatformUrl`
 *
 * Rows that fail the schema are dropped from the response. We intentionally
 * do NOT throw — the catalog is an external surface and one bad row should
 * never blank the entire quiz result panel. Drops are logged once per fetch
 * so we can monitor in the browser console + ops dashboard.
 */

import { z } from "zod";
import { isSafeOpPlatformUrl } from "./urlValidation";
import type {
  OpPlatformFormat,
  OpPlatformPersona,
  OpPlatformRecommendation,
  OpPlatformSegment,
  OpPlatformStage,
} from "./recommendations";

const FORMAT_VALUES: OpPlatformFormat[] = [
  "assessment",
  "course",
  "free_resource",
  "keynote",
  "lab",
  "masterclass",
  "partnership",
  "workshop",
];

const PERSONA_VALUES: OpPlatformPersona[] = [
  "b2c_individual",
  "b2b_leader",
  "b2b_exec",
  "b2b_team",
  "b2b_org",
];

const STAGE_VALUES: OpPlatformStage[] = [
  "PREPARE",
  "ALIGN",
  "TAKE_OFF",
  "HABITS",
];

const SEGMENT_VALUES: OpPlatformSegment[] = ["B2B", "B2C"];

// Hard upper bounds prevent a corrupt catalog row from blowing up the UI.
const NAME_MAX = 200;
const BLURB_MAX = 1000;

const trimmedNonEmpty = (max: number) =>
  z
    .string()
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, "must be non-empty")
    .refine((s) => s.length <= max, `must be ≤ ${max} chars`);

const safeUrl = z
  .string()
  .refine(isSafeOpPlatformUrl, "must be a safe http(s) URL or absolute path");

const nullableBlurb = z
  .union([trimmedNonEmpty(BLURB_MAX), z.null()])
  .optional()
  .transform((v) => (v === undefined ? null : v));

const nullableLong = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (typeof v === "string" ? v : null));

const nullableThumb = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (typeof v === "string" && v.trim() ? v : null));

/**
 * Accepts an array of strings OR a delimited string (comma / semicolon /
 * pipe / newline) and normalizes to `string[]`. The Op Platform feed
 * occasionally serializes multi-value fields as joined strings; we coerce
 * here so one representation change doesn't drop every row.
 */
const coerceStringArray = z
  .union([z.array(z.string()), z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (Array.isArray(v)) return v.map((s) => s.trim()).filter(Boolean);
    if (typeof v === "string") {
      return v
        .split(/[,;|\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  });

/**
 * Zod schema for a single recommendation row. Unknown extra keys are passed
 * through (we use `.passthrough()`) so the catalog can add new fields without
 * breaking the client.
 */
export const OpPlatformRecommendationSchema = z
  .object({
    name: trimmedNonEmpty(NAME_MAX),
    short_blurb: nullableBlurb,
    long_description: nullableLong,
    url: safeUrl,
    thumbnail_url: nullableThumb,
    format: z.enum(FORMAT_VALUES as [OpPlatformFormat, ...OpPlatformFormat[]]),
    catalog_segment: z.enum(
      SEGMENT_VALUES as [OpPlatformSegment, ...OpPlatformSegment[]],
    ),
    audience_personas: z
      .array(z.enum(PERSONA_VALUES as [OpPlatformPersona, ...OpPlatformPersona[]]))
      .default([]),
    path_stage: z
      .union([
        z.enum(STAGE_VALUES as [OpPlatformStage, ...OpPlatformStage[]]),
        z.null(),
      ])
      .optional()
      .transform((v) => v ?? null),
    pricing: z
      .union([z.record(z.unknown()), z.null()])
      .optional()
      .transform((v) => v ?? null),
    marketing_angle: z
      .union([z.string(), z.null()])
      .optional()
      .transform((v) => (typeof v === "string" ? v : null)),
    content_themes: coerceStringArray,
    pillar_alignment: coerceStringArray,
    is_live: z.boolean().default(true),
    status: z.string().default("live"),
    sort_order: z
      .union([z.number(), z.null()])
      .optional()
      .transform((v) => (typeof v === "number" ? v : null)),
  })
  .passthrough();

export interface ValidationOutcome {
  valid: OpPlatformRecommendation[];
  dropped: Array<{ index: number; name: unknown; reason: string }>;
}

/**
 * Validate an array of raw recommendation rows. Bad rows are dropped rather
 * than throwing — see file header for the rationale.
 */
export function validateOpPlatformRecommendations(
  rows: unknown,
): ValidationOutcome {
  const out: ValidationOutcome = { valid: [], dropped: [] };
  if (!Array.isArray(rows)) return out;

  rows.forEach((row, index) => {
    const parsed = OpPlatformRecommendationSchema.safeParse(row);
    if (parsed.success) {
      out.valid.push(parsed.data as OpPlatformRecommendation);
      return;
    }
    const flat = parsed.error.flatten();
    const firstField = Object.keys(flat.fieldErrors)[0];
    const firstMsg =
      (firstField && flat.fieldErrors[firstField]?.[0]) ||
      flat.formErrors[0] ||
      "invalid row";
    out.dropped.push({
      index,
      name:
        row && typeof row === "object" && "name" in (row as Record<string, unknown>)
          ? (row as Record<string, unknown>).name
          : undefined,
      reason: firstField ? `${firstField}: ${firstMsg}` : firstMsg,
    });
  });

  return out;
}
