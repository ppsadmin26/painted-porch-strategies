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
} from "lucide-react";
import {
  fetchOpPlatformRecommendations,
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
  const [error, setError] = useState<string | null>(null);
  const [remote, setRemote] = useState<OpPlatformRecommendation[] | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);

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
    try {
      const res = await fetchOpPlatformRecommendations({
        liveOnly: false,
        limit: 500,
      });
      setRemote(res.results);
      setFetchedAt(new Date());
      setExpanded(new Set());
      setSelected(new Set());
    } catch (e: any) {
      setError(e?.message ?? "Failed to fetch from PPS Op Platform");
      setRemote(null);
    } finally {
      setLoading(false);
    }
  };


  const buckets = (() => {
    if (!remote) return null;
    const remoteByName = new Map<string, OpPlatformRecommendation>();
    for (const r of remote) remoteByName.set(norm(r.name), r);
    const localByName = new Map<string, LocalRow>();
    for (const r of rows) localByName.set(norm(r.name), r);

    const missingLocally: OpPlatformRecommendation[] = [];
    const missingOnOp: LocalRow[] = [];
    const mismatches: DiffItem[] = [];

    for (const r of remote) {
      if (!localByName.has(norm(r.name))) missingLocally.push(r);
    }
    for (const l of rows) {
      const key = norm(l.name);
      const r = remoteByName.get(key);
      if (!r) {
        missingOnOp.push(l);
        continue;
      }
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

      // Tier ↔ format consistency (advisory only — does not block sync).
      const expectedFormats = TIER_FORMAT_MAP[l.tier];
      if (
        expectedFormats &&
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
    return { missingLocally, missingOnOp, mismatches };
  })();

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

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-raspberry/40 bg-raspberry/5 p-3 text-sm text-raspberry">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
                  <ul className="divide-y">
                    {buckets.missingLocally.map((r, i) => (
                      <li
                        key={`${r.name}-${i}`}
                        className="py-2 text-sm flex items-center justify-between gap-3"
                      >
                        <div className="font-medium text-navy">{r.name}</div>
                        <Badge variant="outline" className="text-[10px]">
                          {r.format}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </DiffSection>

              <DiffSection
                title="Field mismatches — local copy differs from Op Platform"
                tone="gold"
                empty="None — local copy matches the feed for every shared row."
              >
                {buckets.mismatches.length > 0 && (
                  <ul className="divide-y">
                    {buckets.mismatches.map((m) => {
                      const isOpen = expanded.has(m.id);
                      return (
                        <li key={m.id} className="py-2 text-xs">
                          <button
                            type="button"
                            onClick={() => toggle(m.id)}
                            className="w-full flex items-center justify-between gap-3 text-left hover:bg-white/60 rounded px-1 py-1"
                            aria-expanded={isOpen}
                            aria-controls={`diff-${m.id}`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {isOpen ? (
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              )}
                              <div className="min-w-0">
                                <div className="font-medium text-navy text-sm truncate">
                                  {m.localName}
                                </div>
                                <code className="text-[11px] text-muted-foreground">
                                  {m.offering_key}
                                </code>
                              </div>
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
                          </button>

                          {isOpen && (
                            <div
                              id={`diff-${m.id}`}
                              className="mt-2 ml-5 space-y-3 border-l-2 border-gold/30 pl-3"
                            >
                              {m.fields.map((f) => (
                                <FieldDiffBlock key={f.field} diff={f} />
                              ))}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </DiffSection>
            </div>
          )}
        </>
      )}
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
