import { useEffect, useState } from "react";
import {
  fetchBlueDoorRecommendations,
  type BlueDoorFormat,
  type BlueDoorRecommendation,
} from "@/integrations/bluedoor/recommendations";
import {
  resolveBlueDoorPersona,
  segmentForResult,
} from "@/integrations/bluedoor/personaMap";
import type { Answers, Offering, QuizResult, ResultType } from "@/data/pathFinderQuiz";

/**
 * Phase A: Pull supplemental "from the canonical catalog" recommendations
 * from the Blue Door public edge function and merge them into the existing
 * quiz result as a SECONDARY group. The hand-tuned RT routing in
 * `pathFinderQuiz.ts` (primary group, Strongest Next Step, Scout reroute,
 * crossover note) is the source of truth; Blue Door results only ever
 * append at the bottom.
 *
 * Dedupe rules:
 *  - Skip anything whose URL or normalized name already appears in the
 *    primary or other groups (or strongest next step).
 *  - Cap to MAX_ITEMS to keep the results page scannable.
 *  - Skip rows missing a usable URL.
 *
 * Failures are non-fatal — the catalog group simply does not render.
 */

// Supplemental cap. The dialog's "From the Porch" block totals ≤4 items
// (≤2 free resources here + ≤2 insights from useQuizRelatedContent), so we
// only ever surface up to 2 free-resource picks from the canonical catalog.
const MAX_ITEMS = 2;
const FORMAT_TO_TIER: Record<BlueDoorFormat, Offering["tier"]> = {
  assessment: "Assessment",
  course: "IGNITE",
  free_resource: "Free",
  keynote: "Speaking",
  lab: "AMPLIFY",
  masterclass: "IGNITE",
  partnership: "AMPLIFY",
  workshop: "Workshop",
};

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeUrl(url: string): string {
  return url.trim().toLowerCase().replace(/[#?].*$/, "").replace(/\/+$/, "");
}

function bdToOffering(rec: BlueDoorRecommendation, index: number): Offering | null {
  if (!rec.url || !rec.url.trim()) return null;
  return {
    key: `bd:${normalizeUrl(rec.url)}:${index}`,
    name: rec.name,
    tier: FORMAT_TO_TIER[rec.format] ?? "Free",
    blurb: (rec.short_blurb ?? rec.long_description ?? "").trim(),
    url: rec.url,
  };
}

function collectExisting(result: QuizResult | null): { urls: Set<string>; names: Set<string> } {
  const urls = new Set<string>();
  const names = new Set<string>();
  if (!result) return { urls, names };
  const push = (o: { url?: string; name?: string }) => {
    if (o.url) urls.add(normalizeUrl(o.url));
    if (o.name) names.add(normalizeName(o.name));
  };
  if (result.strongestNextStep?.offering) push(result.strongestNextStep.offering);
  if (result.primaryGroup) result.primaryGroup.offerings.forEach(push);
  result.groups.forEach((g) => g.offerings.forEach(push));
  return { urls, names };
}

export interface BlueDoorQuizGroup {
  heading: string;
  offerings: Offering[];
}

/**
 * Fetch + merge. Returns a single supplemental group (or null) ready to
 * render below the existing recommendation groups. The dialog is
 * responsible for placement & styling.
 */
export function useBlueDoorRecommendations(
  result: QuizResult | null,
  answers: Answers,
): { group: BlueDoorQuizGroup | null; loading: boolean } {
  const [group, setGroup] = useState<BlueDoorQuizGroup | null>(null);
  const [loading, setLoading] = useState(false);

  // Inputs we actually depend on — kept stable to avoid extra fetches.
  const resultType: ResultType | null = result?.resultType ?? null;
  const scoutMode = answers["Q4DM"] === "A";

  useEffect(() => {
    if (!resultType) {
      setGroup(null);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const persona = resolveBlueDoorPersona({ resultType, scoutMode });
        const segment = segmentForResult(resultType);
        const data = await fetchBlueDoorRecommendations(
          {
            persona,
            segment,
            surface: "quiz",
            liveOnly: true,
            limit: 12,
          },
          { signal: controller.signal },
        );
        if (cancelled) return;

        const { urls, names } = collectExisting(result);
        // Prefer free resources first so the supplemental block always
        // surfaces a low-friction starting point when one exists.
        const sorted = [...data.results].sort((a, b) => {
          const aFree = a.format === "free_resource" ? 0 : 1;
          const bFree = b.format === "free_resource" ? 0 : 1;
          return aFree - bFree;
        });
        const merged: Offering[] = [];
        for (let i = 0; i < sorted.length && merged.length < MAX_ITEMS; i += 1) {
          const off = bdToOffering(sorted[i], i);
          if (!off) continue;
          if (!off.url || !/^https?:\/\/|^\//.test(off.url)) continue;
          if (!off.name?.trim() || !off.blurb?.trim()) continue;
          if (urls.has(normalizeUrl(off.url))) continue;
          if (names.has(normalizeName(off.name))) continue;
          merged.push(off);
        }
        if (merged.length === 0) {
          setGroup(null);
          return;
        }
        setGroup({ heading: "More from the Porch", offerings: merged });
      } catch (err) {
        if (!cancelled && (err as { name?: string }).name !== "AbortError") {
          console.warn("Blue Door recommendations fetch failed (non-fatal):", err);
          setGroup(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
    // We intentionally exclude `result` from the dep list — re-fetching on
    // every result mutation (annotate, prioritize) would thrash the network.
    // The resultType + scoutMode signals capture the routing inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultType, scoutMode]);

  return { group, loading };
}
