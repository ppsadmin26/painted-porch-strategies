import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import {
  fetchOpPlatformRecommendations,
  type OpPlatformRecommendation,
} from "@/integrations/op-platform/recommendations";

interface LocalRow {
  id: string;
  offering_key: string;
  name: string;
  tier: string;
  blurb: string;
  image_url: string | null;
}

interface OpPlatformResyncPanelProps {
  rows: LocalRow[];
}

interface DiffItem {
  localName: string;
  offering_key: string;
  remoteName: string;
  fields: Array<{ field: string; local: string; remote: string }>;
}

function norm(s: string | null | undefined): string {
  return (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Dry-run audit comparing local path_finder_offerings rows against the
 * public PPS Op Platform recommendations feed. Read-only — surfaces what
 * would change if we synced, without writing anything.
 *
 * Match key is normalized name (the feed does not expose a stable ID).
 */
export function OpPlatformResyncPanel({ rows }: OpPlatformResyncPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remote, setRemote] = useState<OpPlatformRecommendation[] | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOpPlatformRecommendations({ liveOnly: false, limit: 500 });
      setRemote(res.results);
      setFetchedAt(new Date());
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
      const fields: DiffItem["fields"] = [];
      if (norm(l.blurb) !== norm(r.short_blurb)) {
        fields.push({ field: "blurb", local: l.blurb ?? "", remote: r.short_blurb ?? "" });
      }
      if ((l.image_url ?? "").trim() !== (r.thumbnail_url ?? "").trim()) {
        fields.push({ field: "image_url", local: l.image_url ?? "", remote: r.thumbnail_url ?? "" });
      }
      if (fields.length > 0) {
        mismatches.push({
          localName: l.name,
          offering_key: l.offering_key,
          remoteName: r.name,
          fields,
        });
      }
    }
    return { missingLocally, missingOnOp, mismatches };
  })();

  return (
    <div className="rounded-lg border border-dashed border-bluedoor/40 bg-bluedoor/5 p-4 mb-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-bluedoor/10 text-bluedoor border-bluedoor/40">
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
            {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
            {remote ? "Re-run audit" : "Run audit"}
          </Button>
          {remote && (
            <Button size="sm" variant="ghost" onClick={() => setOpen((o) => !o)}>
              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Read-only diff against the public PPS Op Platform recommendations feed. No writes — surfaces what would change if we synced.
        Matched by normalized offering name (the feed does not expose a stable ID).
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
              <div className="text-xs text-muted-foreground">Missing locally</div>
              <div className="text-2xl font-poppins font-bold text-bluedoor">
                {buckets.missingLocally.length}
              </div>
              <div className="text-[11px] text-muted-foreground">In Op Platform · not in DB</div>
            </div>
            <div className="rounded-md border bg-white p-3">
              <div className="text-xs text-muted-foreground">Missing on Op Platform</div>
              <div className="text-2xl font-poppins font-bold text-raspberry">
                {buckets.missingOnOp.length}
              </div>
              <div className="text-[11px] text-muted-foreground">In DB · not in feed (possibly invalid)</div>
            </div>
            <div className="rounded-md border bg-white p-3">
              <div className="text-xs text-muted-foreground">Field mismatches</div>
              <div className="text-2xl font-poppins font-bold text-gold">
                {buckets.mismatches.length}
              </div>
              <div className="text-[11px] text-muted-foreground">blurb / image differs</div>
            </div>
          </div>
          {fetchedAt && (
            <p className="text-[11px] text-muted-foreground mt-2 text-right">
              Audited {fetchedAt.toLocaleTimeString()} · {remote?.length ?? 0} remote rows · {rows.length} local rows
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
                      <li key={l.id} className="py-2 text-sm flex items-center justify-between gap-3">
                        <div>
                          <div className="font-medium text-navy">{l.name || <em className="text-muted-foreground">— unnamed —</em>}</div>
                          <code className="text-[11px] text-muted-foreground">{l.offering_key}</code>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{l.tier || "—"}</Badge>
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
                      <li key={`${r.name}-${i}`} className="py-2 text-sm flex items-center justify-between gap-3">
                        <div className="font-medium text-navy">{r.name}</div>
                        <Badge variant="outline" className="text-[10px]">{r.format}</Badge>
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
                    {buckets.mismatches.map((m) => (
                      <li key={m.offering_key} className="py-2 text-xs space-y-1">
                        <div className="font-medium text-navy text-sm">{m.localName}</div>
                        <code className="text-[11px] text-muted-foreground">{m.offering_key}</code>
                        {m.fields.map((f) => (
                          <div key={f.field} className="grid grid-cols-[60px_1fr] gap-2">
                            <span className="text-muted-foreground">{f.field}:</span>
                            <div className="space-y-0.5">
                              <div><span className="text-[10px] text-muted-foreground">local </span><span className="break-all">{f.local || <em>— empty —</em>}</span></div>
                              <div><span className="text-[10px] text-bluedoor">op   </span><span className="break-all">{f.remote || <em>— empty —</em>}</span></div>
                            </div>
                          </div>
                        ))}
                      </li>
                    ))}
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
      <div className="text-xs font-poppins font-semibold text-navy mb-2">{title}</div>
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
