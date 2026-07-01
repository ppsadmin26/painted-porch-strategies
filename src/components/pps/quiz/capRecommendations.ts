/**
 * Pure recommendation cap / dedupe helper for PathFinderQuizDialog.
 *
 * Invariants enforced (see tests in `capRecommendations.test.ts`):
 *   - Total surfaced items (Strongest Next Step + primary + secondary +
 *     opPlatform + related) never exceeds MAX_TOTAL_RECOMMENDATIONS.
 *   - Primary + secondary offerings together never exceed
 *     MAX_PRIMARY_SECONDARY, and reserve at least MIN_SUPPLEMENTAL slots
 *     for supplemental content when the budget allows.
 *   - Supplemental (opPlatform + related) never exceeds MAX_SUPPLEMENTAL,
 *     and Related Reading is capped at 2 items.
 *   - No offering appears in more than one bucket (dedup by url / name / key).
 *
 * Kept as a stand-alone module so it can be exhaustively unit tested
 * without rendering the dialog.
 */

export const MAX_TOTAL_RECOMMENDATIONS = 6;
export const MAX_PRIMARY_SECONDARY = 4;
export const MIN_SUPPLEMENTAL = 2;
export const MAX_SUPPLEMENTAL = 3;
export const MAX_RELATED = 2;

export interface CapOffering {
  key: string;
  name?: string;
  url?: string;
}

export interface CapGroup<T extends CapOffering = CapOffering> {
  heading: string;
  offerings: T[];
}

export interface CapRelated {
  kind: string;
  url: string;
  title: string;
  source?: string;
  excerpt?: string;
}

export interface CapInput<T extends CapOffering = CapOffering> {
  strongestNextStep?: { offering: T } | null;
  primaryGroup?: CapGroup<T> | null;
  groups: CapGroup<T>[];
  opPlatformGroup?: CapGroup<T> | null;
  relatedContent: CapRelated[];
  blueDoorRequiredKeys: Set<string>;
  isB2B: boolean;
  scoutMode: boolean;
}

export interface CapOutput<T extends CapOffering = CapOffering> {
  primary: CapGroup<T> | null;
  secondaryGroups: CapGroup<T>[];
  bdrGroup: CapGroup<T> | null; // included inside secondaryGroups too
  opPlatform: { heading: string; offerings: T[] } | null;
  related: CapRelated[];
  totals: {
    sns: number;
    primary: number;
    secondary: number;
    opPlatform: number;
    related: number;
    total: number;
  };
}

function idsFor(o: CapOffering): string[] {
  const ids: string[] = [];
  if (o.url) ids.push(`u:${o.url.trim().toLowerCase().replace(/\/+$/, "")}`);
  if (o.name) ids.push(`n:${o.name.trim().toLowerCase()}`);
  if (o.key) ids.push(`k:${o.key}`);
  return ids;
}

export function capRecommendations<T extends CapOffering>(
  input: CapInput<T>,
): CapOutput<T> {
  const {
    strongestNextStep,
    primaryGroup,
    groups,
    opPlatformGroup,
    relatedContent,
    blueDoorRequiredKeys,
    isB2B,
    scoutMode,
  } = input;

  const seen = new Set<string>();
  const isSeen = (o: CapOffering) => idsFor(o).some((id) => seen.has(id));
  const markSeen = (o: CapOffering) => idsFor(o).forEach((id) => seen.add(id));
  const dedupe = <U extends CapOffering>(arr: U[]): U[] => {
    const out: U[] = [];
    for (const item of arr) {
      if (isSeen(item)) continue;
      markSeen(item);
      out.push(item);
    }
    return out;
  };

  if (strongestNextStep?.offering) markSeen(strongestNextStep.offering);
  const snsUsed = strongestNextStep ? 1 : 0;

  let remaining = MAX_TOTAL_RECOMMENDATIONS - snsUsed;
  const psBudget = Math.min(
    Math.max(0, remaining - MIN_SUPPLEMENTAL),
    MAX_PRIMARY_SECONDARY,
  );

  // B2B partition: workshops flagged blue_door_required must sequence after
  // the Blue Door Appraisal, so lift them out of the parallel-safe primary.
  let effectivePrimary: CapGroup<T> | null = primaryGroup ?? null;
  let bdrGroup: CapGroup<T> | null = null;
  if (isB2B && !scoutMode && primaryGroup) {
    const parallelSafe = primaryGroup.offerings.filter(
      (o) => !blueDoorRequiredKeys.has(o.key),
    );
    const bdr = primaryGroup.offerings.filter((o) =>
      blueDoorRequiredKeys.has(o.key),
    );
    effectivePrimary = { ...primaryGroup, offerings: parallelSafe };
    if (bdr.length > 0) {
      bdrGroup = {
        heading: "Once the Blue Door Work is Complete",
        offerings: bdr,
      };
    }
  }

  const secondaryInput: CapGroup<T>[] = bdrGroup
    ? [bdrGroup, ...groups]
    : groups;

  const takePrimary = effectivePrimary
    ? dedupe(effectivePrimary.offerings).slice(0, Math.max(0, psBudget))
    : [];
  takePrimary.forEach(markSeen);
  let psUsed = takePrimary.length;

  const trimmedGroups = secondaryInput
    .map((g) => {
      const deduped = dedupe(g.offerings);
      const slice = deduped.slice(0, Math.max(0, psBudget - psUsed));
      slice.forEach(markSeen);
      psUsed += slice.length;
      return { ...g, offerings: slice };
    })
    .filter((g) => g.offerings.length > 0);

  remaining = MAX_TOTAL_RECOMMENDATIONS - snsUsed - psUsed;

  const supplementalBudget = Math.min(remaining, MAX_SUPPLEMENTAL);
  const bdDeduped = opPlatformGroup ? dedupe(opPlatformGroup.offerings) : [];
  const relatedDeduped: CapRelated[] = [];
  for (const c of relatedContent) {
    const key = `u:${c.url.trim().toLowerCase().replace(/\/+$/, "")}`;
    const nkey = `n:${c.title.trim().toLowerCase()}`;
    if (seen.has(key) || seen.has(nkey)) continue;
    seen.add(key);
    seen.add(nkey);
    relatedDeduped.push(c);
  }

  const insightCount = Math.min(
    relatedDeduped.length,
    MAX_RELATED,
    supplementalBudget,
  );
  const bdBudget = Math.max(
    0,
    Math.min(supplementalBudget - insightCount, MAX_SUPPLEMENTAL - insightCount),
  );
  const bdTrimmed = bdDeduped.slice(0, bdBudget);
  const relatedToShow = relatedDeduped.slice(0, insightCount);

  const primaryOut =
    effectivePrimary && takePrimary.length > 0
      ? { ...effectivePrimary, offerings: takePrimary }
      : null;
  const secondaryCount = trimmedGroups.reduce(
    (n, g) => n + g.offerings.length,
    0,
  );

  return {
    primary: primaryOut,
    secondaryGroups: trimmedGroups,
    bdrGroup: bdrGroup && bdrGroup.offerings.length > 0 ? bdrGroup : null,
    opPlatform:
      opPlatformGroup && bdTrimmed.length > 0
        ? { heading: opPlatformGroup.heading, offerings: bdTrimmed }
        : null,
    related: relatedToShow,
    totals: {
      sns: snsUsed,
      primary: takePrimary.length,
      secondary: secondaryCount - (bdrGroup ? bdrGroup.offerings.length : 0),
      opPlatform: bdTrimmed.length,
      related: relatedToShow.length,
      total:
        snsUsed +
        takePrimary.length +
        secondaryCount +
        bdTrimmed.length +
        relatedToShow.length,
    },
  };
}
