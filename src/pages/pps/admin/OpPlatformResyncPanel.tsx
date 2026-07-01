import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Upload,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  fetchOpPlatformRecommendations,
  OpPlatformFetchError,
  type OpPlatformRecommendation,
} from "@/integrations/op-platform/recommendations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface LocalRow {
  id: string;
  offering_key: string;
  name: string;
  tier: string;
  blurb: string;
  description: string | null;
  image_url: string | null;
  current_url: string | null;
  dedicated_url?: string | null;
  blue_door_required?: boolean | null;
}

interface OpPlatformResyncPanelProps {
  rows: LocalRow[];
  /** Called after a successful apply so the parent can refresh its rows. */
  onApplied?: (
    updates: Array<{ id: string; patch: Record<string, unknown> }>,
  ) => void;
}


interface FieldDiff {
  field: string;
  label: string;
  local: string;
  remote: string;
  /** When true, the field is informational only (mapping mismatch). */
  advisory?: boolean;
}

interface DiffItem {
  id: string;
  localName: string;
  offering_key: string;
  remoteName: string;
  fields: FieldDiff[];
  local: LocalRow;
  remote: OpPlatformRecommendation;
}

function norm(s: string | null | undefined): string {
  return (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** Composite key used for missing-remote selection. Includes format so two
 *  rows with the same name but different delivery types are distinct. */
function remoteKey(r: OpPlatformRecommendation): string {
  return `${norm(r.name)}|${(r.format ?? "").toLowerCase()}`;
}

/** Tier (local) → expected format (Op Platform). Used for advisory diffs. */
const TIER_FORMAT_MAP: Record<string, string[]> = {
  Free: ["free_resource"],
  Speaking: ["keynote"],
  Workshop: ["workshop"],
  IGNITE: ["course", "masterclass", "assessment"],
  AMPLIFY: ["lab", "workshop"],
  "Blue Door": ["assessment"],
  Assessment: ["assessment"],
};

function diffField(
  field: string,
  label: string,
  local: string,
  remote: string,
  opts?: { ignoreWhitespace?: boolean; advisory?: boolean },
): FieldDiff | null {
  const a = opts?.ignoreWhitespace ? norm(local) : (local ?? "").trim();
  const b = opts?.ignoreWhitespace ? norm(remote) : (remote ?? "").trim();
  if (a === b) return null;
  return { field, label, local, remote, advisory: opts?.advisory };
}

/**
 * Dry-run audit comparing local path_finder_offerings rows against the
 * public PPS Op Platform recommendations feed. Read-only — surfaces what
 * would change if we synced, without writing anything.
 *
 * Match key is normalized name (the feed does not expose a stable ID).
 * Each mismatched row is expandable to reveal the full local vs Op Platform
 * value for every diverging field.
 */
export function OpPlatformResyncPanel({
  rows,
  onApplied,
}: OpPlatformResyncPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuditError | null>(null);
  const [remote, setRemote] = useState<OpPlatformRecommendation[] | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedMissing, setSelectedMissing] = useState<Set<string>>(new Set());
  const [inserting, setInserting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [retryStatus, setRetryStatus] = useState<string | null>(null);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleSelected = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    setRetryStatus(null);
    try {
      const res = await fetchOpPlatformRecommendations(
        { liveOnly: false, limit: 200 },
        {
          retry: {
            retries: 3,
            baseDelayMs: 500,
            maxDelayMs: 4000,
            onRetry: ({ attempt, delayMs, error: err }) => {
              const reason = err.status ? `HTTP ${err.status}` : "network error";
              setRetryStatus(
                `Transient failure (${reason}). Retry ${attempt} of 3 in ${
                  Math.round(delayMs / 100) / 10
                }s…`,
              );
            },
          },
        },
      );
      setRemote(res.results);
      setFetchedAt(new Date());
      setExpanded(new Set());
      setSelected(new Set());
      setRetryStatus(null);
    } catch (e: unknown) {
      setError(toAuditError(e));
      setRemote(null);
      setRetryStatus(null);
    } finally {
      setLoading(false);
    }
  };



  const buckets = (() => {
    if (!remote) return null;

    // Match key = normalized name + Op Platform format. This lets a single
    // topic name (e.g., "AI, EI, Oh!") exist as multiple local rows for
    // different delivery types (keynote vs. workshop vs. masterclass) and
    // still line up with the correct remote record.
    const remoteByKey = new Map<string, OpPlatformRecommendation>();
    const remoteKeysByName = new Map<string, string[]>();
    for (const r of remote) {
      const nameKey = norm(r.name);
      const key = `${nameKey}|${(r.format ?? "").toLowerCase()}`;
      remoteByKey.set(key, r);
      const arr = remoteKeysByName.get(nameKey) ?? [];
      arr.push(key);
      remoteKeysByName.set(nameKey, arr);
    }

    const missingOnOp: LocalRow[] = [];
    const mismatches: DiffItem[] = [];
    const claimedRemote = new Set<string>();

    for (const l of rows) {
      const nameKey = norm(l.name);
      const expectedFormats = TIER_FORMAT_MAP[l.tier] ?? [];

      // 1. Prefer an unclaimed remote whose format matches the local tier.
      let matchedKey: string | null = null;
      for (const fmt of expectedFormats) {
        const k = `${nameKey}|${fmt}`;
        if (remoteByKey.has(k) && !claimedRemote.has(k)) {
          matchedKey = k;
          break;
        }
      }
      // 2. Fallback — same name, unclaimed, only if exactly one candidate.
      if (!matchedKey) {
        const candidates = (remoteKeysByName.get(nameKey) ?? []).filter(
          (k) => !claimedRemote.has(k),
        );
        if (candidates.length === 1) matchedKey = candidates[0];
      }

      if (!matchedKey) {
        missingOnOp.push(l);
        continue;
      }
      claimedRemote.add(matchedKey);
      const r = remoteByKey.get(matchedKey)!;

      const fields: FieldDiff[] = [];

      // Name (case + punctuation — match key is normalized so casing diffs
      // are only surfaced here, not as missing rows).
      const nameDiff = diffField("name", "Name", l.name, r.name);
      if (nameDiff) fields.push(nameDiff);

      // Short blurb.
      const blurbDiff = diffField(
        "blurb",
        "Short blurb",
        l.blurb ?? "",
        r.short_blurb ?? "",
        { ignoreWhitespace: true },
      );
      if (blurbDiff) fields.push(blurbDiff);

      // Long description.
      const descDiff = diffField(
        "description",
        "Long description",
        l.description ?? "",
        r.long_description ?? "",
        { ignoreWhitespace: true },
      );
      if (descDiff) fields.push(descDiff);

      // Thumbnail.
      const imgDiff = diffField(
        "image_url",
        "Thumbnail URL",
        l.image_url ?? "",
        r.thumbnail_url ?? "",
      );
      if (imgDiff) fields.push(imgDiff);

      // Canonical URL — only flag when both sides are non-empty AND differ.
      const localUrl = (l.dedicated_url || l.current_url || "").trim();
      const remoteUrl = (r.url ?? "").trim();
      if (localUrl && remoteUrl && localUrl !== remoteUrl) {
        fields.push({
          field: "url",
          label: "URL",
          local: localUrl,
          remote: remoteUrl,
        });
      }
      // Blue Door required (canonical mirror from Op Platform).
      const remoteBdr = Boolean(
        (r as unknown as { blue_door_required?: boolean }).blue_door_required,
      );
      const localBdr = Boolean(l.blue_door_required);
      if (remoteBdr !== localBdr) {
        fields.push({
          field: "blue_door_required",
          label: "Requires Blue Door first",
          local: localBdr ? "yes" : "no",
          remote: remoteBdr ? "yes" : "no",
        });
      }

      // Tier ↔ format consistency (advisory only — does not block sync).
      if (
        expectedFormats.length > 0 &&
        r.format &&
        !expectedFormats.includes(r.format)
      ) {
        fields.push({
          field: "tier_format",
          label: "Tier ↔ Format",
          local: `tier: ${l.tier}`,
          remote: `format: ${r.format}`,
          advisory: true,
        });
      }

      if (fields.length > 0) {
        mismatches.push({
          id: l.id,
          localName: l.name,
          offering_key: l.offering_key,
          remoteName: r.name,
          fields,
          local: l,
          remote: r,
        });
      }
    }

    // Any remote record that wasn't claimed by a local row is genuinely
    // missing locally — including name-collision cases where one delivery
    // type exists but another (e.g., masterclass vs. workshop) does not.
    const missingLocally: OpPlatformRecommendation[] = remote.filter((r) => {
      const key = `${norm(r.name)}|${(r.format ?? "").toLowerCase()}`;
      return !claimedRemote.has(key);
    });

    return { missingLocally, missingOnOp, mismatches };
  })();

  /**
   * Build a Supabase patch for a mismatch row using Op Platform values.
   * Only writable canonical narrative fields are included; URL diffs and
   * advisory tier/format diffs are intentionally skipped.
   */
  const buildPatch = (m: DiffItem): Record<string, unknown> => {
    const patch: Record<string, unknown> = {};
    for (const f of m.fields) {
      if (f.advisory) continue;
      if (f.field === "name") patch.name = m.remote.name;
      else if (f.field === "blurb") patch.blurb = m.remote.short_blurb ?? "";
      else if (f.field === "description")
        patch.description = m.remote.long_description ?? "";
      else if (f.field === "image_url")
        patch.image_url = m.remote.thumbnail_url ?? null;
      else if (f.field === "blue_door_required")
        patch.blue_door_required = Boolean(
          (m.remote as unknown as { blue_door_required?: boolean }).blue_door_required,
        );
      // url is skipped — dedicated_url vs current_url is locally owned.
    }
    return patch;
  };

  const selectableMismatches = (buckets?.mismatches ?? []).filter(
    (m) => Object.keys(buildPatch(m)).length > 0,
  );
  const allSelected =
    selectableMismatches.length > 0 &&
    selectableMismatches.every((m) => selected.has(m.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(selectableMismatches.map((m) => m.id)));
    }
  };

  const applySelected = async () => {
    if (!buckets) return;
    const targets = buckets.mismatches.filter((m) => selected.has(m.id));
    const updates = targets
      .map((m) => ({ id: m.id, patch: buildPatch(m) }))
      .filter((u) => Object.keys(u.patch).length > 0);
    if (updates.length === 0) {
      toast({ title: "Nothing to apply", description: "Select at least one row with writable diffs." });
      return;
    }
    setApplying(true);
    let okCount = 0;
    const failures: string[] = [];
    for (const u of updates) {
      const { error: err } = await supabase
        .from("path_finder_offerings")
        .update(u.patch as never)
        .eq("id", u.id);
      if (err) failures.push(err.message);
      else okCount += 1;
    }
    setApplying(false);
    if (failures.length > 0) {
      toast({
        title: `Applied ${okCount} of ${updates.length}`,
        description: failures[0],
        variant: "destructive",
      });
    } else {
      toast({ title: `Applied ${okCount} row${okCount === 1 ? "" : "s"}` });
    }
    onApplied?.(updates);
    setSelected(new Set());
    // Re-run audit so the panel reflects post-write state.
    void runAudit();
  };

  /** Map Op Platform format → local tier. Best-effort default; admin can edit after insert. */
  const formatToTier = (fmt: string): string => {
    switch (fmt) {
      case "keynote":
        return "Speaking";
      case "workshop":
        return "Workshop";
      case "lab":
        return "AMPLIFY";
      case "course":
      case "masterclass":
        return "IGNITE";
      case "assessment":
        return "IGNITE";
      case "free_resource":
        return "Free";
      case "partnership":
        return "AMPLIFY";
      default:
        return "Free";
    }
  };

  const slugify = (s: string): string =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || `op-${Date.now()}`;

  const toggleMissing = (key: string) =>
    setSelectedMissing((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const insertSelectedMissing = async () => {
    if (!buckets) return;
    const targets = buckets.missingLocally.filter((r) =>
      selectedMissing.has(remoteKey(r)),
    );
    if (targets.length === 0) {
      toast({ title: "Nothing selected", description: "Select at least one Op Platform row to insert." });
      return;
    }
    setInserting(true);
    const existingKeys = new Set(rows.map((r) => r.offering_key));
    const payload = targets.map((r) => {
      let key = slugify(r.name);
      let i = 2;
      while (existingKeys.has(key)) key = `${slugify(r.name)}-${i++}`;
      existingKeys.add(key);
      return {
        offering_key: key,
        name: r.name,
        tier: formatToTier(r.format),
        blurb: r.short_blurb ?? "",
        description: r.long_description ?? null,
        current_url: r.url ?? "https://onthepaintedporch.com",
        dedicated_url: r.url ?? null,
        image_url: r.thumbnail_url ?? null,
        blue_door_required: Boolean(
          (r as unknown as { blue_door_required?: boolean }).blue_door_required,
        ),
        is_published: false,
        include_in_quiz: false,
      };
    });
    const { error: err } = await supabase
      .from("path_finder_offerings")
      .insert(payload as never);
    setInserting(false);
    if (err) {
      toast({
        title: `Insert failed`,
        description: err.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: `Inserted ${payload.length} row${payload.length === 1 ? "" : "s"}`,
      description: "New rows are unpublished and excluded from the quiz. Configure them in the registry.",
    });
    setSelectedMissing(new Set());
    onApplied?.([]);
    void runAudit();
  };



  return (
    <div className="rounded-lg border border-dashed border-bluedoor/40 bg-bluedoor/5 p-4 mb-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-bluedoor/10 text-bluedoor border-bluedoor/40"
          >
            PPS Op Platform sync
          </Badge>
          <span className="text-sm font-poppins font-semibold text-navy">
            Resync audit (dry run)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={runAudit}
            disabled={loading}
            className="border-bluedoor/40 text-bluedoor hover:bg-bluedoor/10"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-1" />
            )}
            {remote ? "Re-run audit" : "Run audit"}
          </Button>
          {remote && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Read-only diff against the public PPS Op Platform recommendations
        feed. No writes — surfaces what would change if we synced. Matched by
        normalized offering name (the feed does not expose a stable ID).
      </p>

      {loading && retryStatus && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-2">
          {retryStatus}
        </p>
      )}

      {error && <SyncErrorPanel error={error} onRetry={runAudit} />}


      {buckets && (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md border bg-white p-3">
              <div className="text-xs text-muted-foreground">
                Missing locally
              </div>
              <div className="text-2xl font-poppins font-bold text-bluedoor">
                {buckets.missingLocally.length}
              </div>
              <div className="text-[11px] text-muted-foreground">
                In Op Platform · not in DB
              </div>
            </div>
            <div className="rounded-md border bg-white p-3">
              <div className="text-xs text-muted-foreground">
                Missing on Op Platform
              </div>
              <div className="text-2xl font-poppins font-bold text-raspberry">
                {buckets.missingOnOp.length}
              </div>
              <div className="text-[11px] text-muted-foreground">
                In DB · not in feed (possibly invalid)
              </div>
            </div>
            <div className="rounded-md border bg-white p-3">
              <div className="text-xs text-muted-foreground">
                Field mismatches
              </div>
              <div className="text-2xl font-poppins font-bold text-gold">
                {buckets.mismatches.length}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Click any row to expand
              </div>
            </div>
          </div>
          {fetchedAt && (
            <p className="text-[11px] text-muted-foreground mt-2 text-right">
              Audited {fetchedAt.toLocaleTimeString()} ·{" "}
              {remote?.length ?? 0} remote rows · {rows.length} local rows
            </p>
          )}

          {open && (
            <div className="mt-3 space-y-4">
              <DiffSection
                title="Missing on Op Platform — likely invalid local rows"
                tone="raspberry"
                empty="None — every local row has a match in the feed."
              >
                {buckets.missingOnOp.length > 0 && (
                  <ul className="divide-y">
                    {buckets.missingOnOp.map((l) => (
                      <li
                        key={l.id}
                        className="py-2 text-sm flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-medium text-navy">
                            {l.name || (
                              <em className="text-muted-foreground">
                                — unnamed —
                              </em>
                            )}
                          </div>
                          <code className="text-[11px] text-muted-foreground">
                            {l.offering_key}
                          </code>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {l.tier || "—"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </DiffSection>

              <DiffSection
                title="Missing locally — present in Op Platform but no DB row"
                tone="bluedoor"
                empty="None — every Op Platform offering has a local mirror."
              >
                {buckets.missingLocally.length > 0 && (
                  <>
                    <div className="flex items-center justify-between gap-2 mb-2 px-1">
                      <label className="flex items-center gap-2 text-[11px] text-navy font-medium cursor-pointer">
                        <Checkbox
                          checked={
                            selectedMissing.size === buckets.missingLocally.length &&
                            buckets.missingLocally.length > 0
                          }
                          onCheckedChange={() => {
                            if (selectedMissing.size === buckets.missingLocally.length) {
                              setSelectedMissing(new Set());
                            } else {
                              setSelectedMissing(
                                new Set(buckets.missingLocally.map((r) => norm(r.name))),
                              );
                            }
                          }}
                          aria-label="Select all missing"
                        />
                        Select all ({buckets.missingLocally.length})
                      </label>
                      <Button
                        size="sm"
                        onClick={insertSelectedMissing}
                        disabled={inserting || selectedMissing.size === 0}
                        className="bg-bluedoor hover:bg-bluedoor/90 text-white h-7 px-3 text-xs"
                      >
                        {inserting ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 mr-1" />
                        )}
                        Insert selected ({selectedMissing.size})
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2 px-1">
                      Inserted rows start unpublished and excluded from the quiz. Configure PPS flags in the registry after insert.
                    </p>
                    <ul className="divide-y">
                      {buckets.missingLocally.map((r, i) => {
                        const key = norm(r.name);
                        return (
                          <li
                            key={`${r.name}-${i}`}
                            className="py-2 text-sm flex items-center justify-between gap-3"
                          >
                            <label className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer">
                              <Checkbox
                                checked={selectedMissing.has(key)}
                                onCheckedChange={() => toggleMissing(key)}
                                aria-label={`Select ${r.name}`}
                              />
                              <span className="font-medium text-navy truncate">{r.name}</span>
                            </label>
                            <Badge variant="outline" className="text-[10px]">
                              {r.format}
                            </Badge>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </DiffSection>

              <DiffSection
                title="Field mismatches — local copy differs from Op Platform"
                tone="gold"
                empty="None — local copy matches the feed for every shared row."
              >
                {buckets.mismatches.length > 0 && (
                  <>
                    <div className="flex items-center justify-between gap-2 mb-2 px-1">
                      <label className="flex items-center gap-2 text-[11px] text-navy font-medium cursor-pointer">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all writable mismatches"
                        />
                        Select all writable ({selectableMismatches.length})
                      </label>
                      <Button
                        size="sm"
                        onClick={applySelected}
                        disabled={applying || selected.size === 0}
                        className="bg-bluedoor hover:bg-bluedoor/90 text-white h-7 px-3 text-xs"
                      >
                        {applying ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 mr-1" />
                        )}
                        Apply selected ({selected.size})
                      </Button>
                    </div>
                    <ul className="divide-y">
                      {buckets.mismatches.map((m) => {
                        const isOpen = expanded.has(m.id);
                        const patch = buildPatch(m);
                        const writable = Object.keys(patch).length > 0;
                        const isSelected = selected.has(m.id);
                        return (
                          <li key={m.id} className="py-2 text-xs">
                            <div className="w-full flex items-center justify-between gap-3 hover:bg-white/60 rounded px-1 py-1">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleSelected(m.id)}
                                  disabled={!writable}
                                  aria-label={`Select ${m.localName}`}
                                  title={
                                    writable
                                      ? "Select to apply Op Platform values"
                                      : "No writable fields differ (advisory or URL only)"
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() => toggle(m.id)}
                                  className="flex items-center gap-2 min-w-0 text-left flex-1"
                                  aria-expanded={isOpen}
                                  aria-controls={`diff-${m.id}`}
                                >
                                  {isOpen ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  )}
                                  <div className="min-w-0">
                                    <div className="font-medium text-navy text-sm truncate">
                                      {m.localName}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <code className="text-[11px] text-muted-foreground">
                                        {m.offering_key}
                                      </code>
                                      <Badge variant="outline" className="text-[10px]">
                                        {m.local.tier}
                                      </Badge>
                                      <span className="text-[10px] text-muted-foreground">→</span>
                                      <Badge variant="outline" className="text-[10px] border-bluedoor/40 text-bluedoor">
                                        {m.remote.format}
                                      </Badge>
                                    </div>
                                  </div>
                                </button>
                              </div>
                              <div className="flex items-center gap-1 flex-wrap justify-end">
                                {m.fields.map((f) => (
                                  <Badge
                                    key={f.field}
                                    variant="outline"
                                    className={`text-[10px] ${
                                      f.advisory
                                        ? "border-muted-foreground/30 text-muted-foreground"
                                        : "border-gold/40 text-gold"
                                    }`}
                                  >
                                    {f.label}
                                    {f.advisory ? " (advisory)" : ""}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {isOpen && (
                              <div
                                id={`diff-${m.id}`}
                                className="mt-2 ml-5 space-y-3 border-l-2 border-gold/30 pl-3"
                              >
                                <DeliveryTypeBlock local={m.local.tier} remote={m.remote.format} />
                                {m.fields.map((f) => (
                                  <FieldDiffBlock key={f.field} diff={f} />
                                ))}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </DiffSection>

            </div>
          )}
        </>
      )}
    </div>
  );
}

function DeliveryTypeBlock({
  local,
  remote,
}: {
  local: string;
  remote: string;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-[11px] font-poppins font-semibold text-navy uppercase tracking-wide">
        Delivery type
      </span>
      <div className="grid grid-cols-[60px_1fr] gap-x-2 gap-y-1 items-start text-xs">
        <span className="text-[10px] uppercase tracking-wide text-raspberry font-semibold">
          local
        </span>
        <div className="text-foreground/90">{local || <em className="text-muted-foreground">—</em>}</div>
        <span className="text-[10px] uppercase tracking-wide text-bluedoor font-semibold">
          op
        </span>
        <div className="text-foreground/90">{remote || <em className="text-muted-foreground">—</em>}</div>
      </div>
    </div>
  );
}


function FieldDiffBlock({ diff }: { diff: FieldDiff }) {
  const isLong =
    (diff.local?.length ?? 0) > 80 || (diff.remote?.length ?? 0) > 80;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-poppins font-semibold text-navy uppercase tracking-wide">
          {diff.label}
        </span>
        {diff.advisory && (
          <span className="text-[10px] text-muted-foreground italic">
            advisory — does not block sync
          </span>
        )}
      </div>
      <div
        className={
          isLong
            ? "space-y-1.5"
            : "grid grid-cols-[60px_1fr] gap-x-2 gap-y-1 items-start"
        }
      >
        <div
          className={
            isLong
              ? "rounded-md border border-raspberry/30 bg-raspberry/5 p-2"
              : "contents"
          }
        >
          <span className="text-[10px] uppercase tracking-wide text-raspberry font-semibold">
            local
          </span>
          <div className="break-words whitespace-pre-wrap text-foreground/90 text-xs">
            {diff.local || <em className="text-muted-foreground">— empty —</em>}
          </div>
        </div>
        <div
          className={
            isLong
              ? "rounded-md border border-bluedoor/30 bg-bluedoor/5 p-2"
              : "contents"
          }
        >
          <span className="text-[10px] uppercase tracking-wide text-bluedoor font-semibold">
            op
          </span>
          <div className="break-words whitespace-pre-wrap text-foreground/90 text-xs">
            {diff.remote || (
              <em className="text-muted-foreground">— empty —</em>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DiffSection({
  title,
  tone,
  empty,
  children,
}: {
  title: string;
  tone: "raspberry" | "bluedoor" | "gold";
  empty: string;
  children?: React.ReactNode;
}) {
  const toneCls =
    tone === "raspberry"
      ? "border-raspberry/30 bg-raspberry/5"
      : tone === "bluedoor"
        ? "border-bluedoor/30 bg-bluedoor/5"
        : "border-gold/40 bg-gold/5";
  const empty_ = !children;
  return (
    <div className={`rounded-md border ${toneCls} p-3`}>
      <div className="text-xs font-poppins font-semibold text-navy mb-2">
        {title}
      </div>
      {empty_ ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="w-3.5 h-3.5 text-lime-foreground" />
          {empty}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error surfacing
// ---------------------------------------------------------------------------

interface AuditError {
  title: string;
  message: string;
  url?: string;
  status?: number;
  statusText?: string;
  body?: string;
  suggestions: string[];
  raw: string;
}

function toAuditError(e: unknown): AuditError {
  if (e instanceof OpPlatformFetchError) {
    return {
      title: e.status
        ? `PPS Op Platform returned ${e.status} ${e.statusText ?? ""}`.trim()
        : "Could not reach PPS Op Platform",
      message: e.message,
      url: e.url,
      status: e.status,
      statusText: e.statusText,
      body: e.body,
      suggestions: suggestionsFor(e),
      raw: JSON.stringify(
        {
          name: e.name,
          message: e.message,
          url: e.url,
          status: e.status,
          statusText: e.statusText,
          body: e.body?.slice(0, 2000),
        },
        null,
        2,
      ),
    };
  }
  const err = e as Error;
  const msg = err?.message ?? String(e);
  return {
    title: "Unexpected error running audit",
    message: msg,
    suggestions: [
      "Open the browser console and re-run the audit to capture a full stack trace.",
      "If the error persists, ping engineering with the raw payload below.",
    ],
    raw: JSON.stringify(
      { name: err?.name, message: msg, stack: err?.stack },
      null,
      2,
    ),
  };
}

function suggestionsFor(e: OpPlatformFetchError): string[] {
  if (e.status === undefined) {
    return [
      "The request never reached the endpoint — likely a network / CORS / DNS issue.",
      "Confirm you have internet access and try the endpoint URL directly in a new tab.",
      "If CORS is the culprit, verify the PPS Op Platform edge function still allow-lists this origin.",
    ];
  }
  const body = (e.body ?? "").toLowerCase();
  if (e.status === 400) {
    const tips: string[] = [
      "The endpoint rejected the query. Check the URL below for unsupported filter values (persona, format, segment, stage).",
      "If you recently added a new filter, confirm the edge function was redeployed with matching support.",
    ];
    if (body.includes("limit")) tips.unshift("`limit` may be above the endpoint cap — try lowering it.");
    return tips;
  }
  if (e.status === 401 || e.status === 403) {
    return [
      "The endpoint refused the request. It should be public — confirm the edge function's RLS policies and JWT-verification flag haven't changed.",
      "If auth was recently tightened, restore the anon-key read policy on the underlying view.",
    ];
  }
  if (e.status === 404) {
    return [
      "Endpoint path not found. The edge function may have been renamed or unpublished — verify the deployment.",
      "Double-check the URL below matches the deployed function name (`pathfinder-recommendations`).",
    ];
  }
  if (e.status === 429) {
    return [
      "Rate limited. Wait 30 seconds and try again.",
      "If this keeps happening, batch fewer resyncs per minute.",
    ];
  }
  if (e.status >= 500) {
    return [
      "The endpoint errored server-side. It is usually transient — retry in a minute.",
      "If it persists, check the PPS Op Platform edge function logs for a stack trace and share the timestamp.",
    ];
  }
  return [
    "Unexpected status code. Copy the raw payload below and share with engineering.",
  ];
}

function SyncErrorPanel({
  error,
  onRetry,
}: {
  error: AuditError;
  onRetry: () => void;
}) {
  const copyRaw = async () => {
    try {
      await navigator.clipboard.writeText(error.raw);
      toast({ title: "Error details copied" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };
  return (
    <div className="mt-3 rounded-md border border-raspberry/40 bg-raspberry/5 p-3 text-sm text-raspberry space-y-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="font-poppins font-semibold text-navy">
            {error.title}
          </div>
          <div className="text-foreground/90 break-words">{error.message}</div>
          {error.url && (
            <div className="text-[11px] text-muted-foreground break-all">
              <span className="uppercase tracking-wide font-semibold mr-1">
                endpoint:
              </span>
              <a
                href={error.url}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-dotted hover:text-bluedoor inline-flex items-center gap-1"
              >
                {error.url}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {error.suggestions.length > 0 && (
        <div className="rounded-md border border-raspberry/30 bg-white p-2.5">
          <div className="text-[11px] uppercase tracking-wide font-poppins font-semibold text-navy mb-1">
            Suggested fixes
          </div>
          <ul className="list-disc pl-5 space-y-1 text-xs text-foreground/90">
            {error.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {error.body && (
        <details className="rounded-md border border-raspberry/30 bg-white p-2.5">
          <summary className="text-[11px] uppercase tracking-wide font-poppins font-semibold text-navy cursor-pointer">
            Response body ({error.body.length.toLocaleString()} chars)
          </summary>
          <pre className="mt-2 max-h-48 overflow-auto text-[11px] text-foreground/80 whitespace-pre-wrap break-words">
            {error.body}
          </pre>
        </details>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="border-raspberry/40 text-raspberry hover:bg-raspberry/10 h-7 px-3 text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Retry audit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={copyRaw}
          className="h-7 px-3 text-xs text-navy"
        >
          <Copy className="w-3.5 h-3.5 mr-1" />
          Copy error details
        </Button>
      </div>
    </div>
  );
}

