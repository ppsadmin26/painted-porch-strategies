import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Search, AlertTriangle, CheckCircle2, FileText, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import auditReport from "../../../../docs/offerings-duplication-audit.json";
import anchorAudit from "../../../../docs/anchor-coverage-audit.json";

type AuditReport = {
  generated_at: string;
  blue_door_connected: boolean;
  counts: {
    pps_rows: number;
    bd_rows: number;
    matched: number;
    pps_only: number;
    bd_only: number;
    topic_candidates: number;
  };
};

type AnchorAudit = {
  generated_at: string;
  total_anchored: number;
  present: number;
  missing: number;
  missing_by_destination: Record<string, Array<{ offering_key: string; anchor: string; name: string; tier: string }>>;
  launches?: {
    total_linked: number;
    known_slugs: number;
    broken: number;
    broken_detail: Array<{ offering_key: string; name: string; tier: string; launch_slug: string; is_live: boolean }>;
  };
};

const ANCHOR_AUDIT = anchorAudit as AnchorAudit;

function Stat({ label, value, tone }: { label: string; value: number; tone?: "raspberry" }) {
  return (
    <div className="rounded border bg-background px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`font-poppins font-semibold ${tone === "raspberry" ? "text-raspberry" : "text-navy"}`}>
        {value}
      </div>
    </div>
  );
}

interface Row {
  id: string;
  offering_key: string;
  name: string;
  facilitator: string | null;
  tier: string;
  blurb: string | null;
  current_url: string | null;
  dedicated_url: string | null;
  anchor_id: string | null;
  is_live: boolean;
  sort_order: number;
  topic: string | null;
  include_in_workshops: boolean;
  is_featured_in_quiz: boolean;
  launch_slug: string | null;
}

const TIER_COLORS: Record<string, string> = {
  IGNITE: "bg-gold/15 text-gold-foreground border-gold/40",
  AMPLIFY: "bg-purple/15 text-purple border-purple/40",
  Workshop: "bg-strategic/15 text-strategic border-strategic/40",
  "Blue Door": "bg-bluedoor/15 text-bluedoor border-bluedoor/40",
  Free: "bg-lime/15 text-lime-foreground border-lime/40",
  Assessment: "bg-raspberry/10 text-raspberry border-raspberry/40",
  Speaking: "bg-navy/10 text-navy border-navy/40",
};

function resolveUrl(r: Row): string | null {
  let url = r.is_live && r.dedicated_url ? r.dedicated_url : r.current_url;
  if (!url) return null;
  if (r.anchor_id && !url.includes("#")) url = `${url}#${r.anchor_id}`;
  return url;
}

function isQuizEligible(r: Row): boolean {
  if (!r.is_live) return false;
  return Boolean(r.current_url?.trim() || r.dedicated_url?.trim() || r.anchor_id?.trim());
}

export default function OfferingsCoverage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [launchSlugs, setLaunchSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [audit, setAudit] = useState<AuditReport>(auditReport as AuditReport);
  const [refreshing, setRefreshing] = useState(false);

  const refreshAudit = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke("audit-offerings-overlap");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAudit(data as AuditReport);
      toast.success(
        `Audit refreshed · ${data.counts.matched} matched · ${data.counts.topic_candidates} topic candidates${
          data.blue_door_connected ? "" : " (PPS-only)"
        }`,
      );
    } catch (e: any) {
      toast.error(`Audit refresh failed: ${e.message ?? e}`);
    } finally {
      setRefreshing(false);
    }
  };


  useEffect(() => {
    (async () => {
      const [offRes, launchRes] = await Promise.all([
        supabase
          .from("path_finder_offerings")
          .select("*")
          .order("topic", { nullsFirst: false })
          .order("sort_order"),
        supabase.from("course_launch_status").select("slug"),
      ]);
      setRows((offRes.data ?? []) as Row[]);
      setLaunchSlugs(new Set((launchRes.data ?? []).map((l: { slug: string }) => l.slug)));
      setLoading(false);
    })();
  }, []);

  const brokenLaunches = useMemo(() => {
    if (launchSlugs.size === 0) return [] as Array<{ row: Row; slug: string }>;
    return rows
      .filter((r) => r.launch_slug && !launchSlugs.has(r.launch_slug))
      .map((r) => ({ row: r, slug: r.launch_slug as string }));
  }, [rows, launchSlugs]);

  const filtered = useMemo(() => {
    if (!filter) return rows;
    const q = filter.toLowerCase();
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.offering_key.toLowerCase().includes(q) ||
        (r.facilitator ?? "").toLowerCase().includes(q) ||
        r.tier.toLowerCase().includes(q) ||
        (r.topic ?? "").toLowerCase().includes(q) ||
        (resolveUrl(r) ?? "").toLowerCase().includes(q),
    );
  }, [rows, filter]);

  const summary = useMemo(() => {
    const total = rows.length;
    const live = rows.filter((r) => r.is_live).length;
    const eligible = rows.filter(isQuizEligible).length;
    const featured = rows.filter((r) => r.is_featured_in_quiz).length;
    const workshops = rows.filter((r) => r.include_in_workshops).length;
    const untagged = rows.filter((r) => !r.topic).length;
    const missingUrl = rows.filter((r) => !resolveUrl(r)).length;
    return { total, live, eligible, featured, workshops, untagged, missingUrl };
  }, [rows]);

  // Group by topic
  const byTopic = useMemo(() => {
    const m = new Map<string, Row[]>();
    for (const r of filtered) {
      const k = r.topic ?? "— Untagged —";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(r);
    }
    return Array.from(m.entries()).sort(([a], [b]) => {
      if (a.startsWith("—")) return 1;
      if (b.startsWith("—")) return -1;
      return a.localeCompare(b);
    });
  }, [filtered]);

  // Group by destination (resolved URL path, ignoring hash) — shows which page each delivery routes to
  const byDestination = useMemo(() => {
    const m = new Map<string, Row[]>();
    for (const r of filtered) {
      const url = resolveUrl(r);
      const key = url ? url.split("#")[0] : "(no destination)";
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(r);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-navy">Offerings Coverage</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Read-only summary of every offering in <code>path_finder_offerings</code> grouped by topic and by destination page. Use this to spot duplicates, missing URLs, and topics that span multiple deliveries (e.g., AI EI Oh as both Speaking and Workshop).
          </p>
          <p className="text-sm mt-2">
            Edit rows in <Link to="/admin/path-finder" className="text-primary underline">P.A.T.H. Finder Offerings</Link>.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Filter by name, topic, URL…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8 w-64"
          />
        </div>
      </div>

      {/* Phase 1 audit banner */}
      <div className="mb-6 rounded-lg border border-bluedoor/30 bg-bluedoor/5 p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-bluedoor mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-poppins font-semibold text-navy">Phase 1 overlap audit</h2>
              <Badge variant="outline" className="text-xs">
                {audit.blue_door_connected ? "Blue Door connected" : "PPS-only"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                generated {new Date(audit.generated_at).toLocaleString()}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={refreshAudit}
                disabled={refreshing}
                className="ml-auto h-7 text-xs"
              >
                {refreshing ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3 mr-1" />
                )}
                Refresh audit
              </Button>
            </div>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
              <Stat label="PPS rows" value={audit.counts.pps_rows} />
              <Stat label="BD rows" value={audit.counts.bd_rows} />
              <Stat label="Matched" value={audit.counts.matched} />
              <Stat label="PPS only" value={audit.counts.pps_only} />
              <Stat label="BD only" value={audit.counts.bd_only} />
              <Stat label="Topic candidates" value={audit.counts.topic_candidates} tone="raspberry" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Click <strong>Refresh audit</strong> to re-run live against PPS
              {audit.blue_door_connected ? " + Blue Door" : " (Blue Door creds not set)"}.
              The static snapshot below comes from{" "}
              <code className="bg-muted px-1 rounded">scripts/audit-offerings-overlap.mjs</code>.
              Full markdown report:{" "}
              <a
                href="/docs/offerings-duplication-audit.md"
                target="_blank"
                rel="noreferrer"
                className="text-bluedoor underline"
              >
                docs/offerings-duplication-audit.md
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Anchor coverage audit — verifies every offering with a #fragment or anchor_id
          actually points at an id rendered somewhere in the source tree (covers
          masterclasses, courses, assessments, workshops, labs, speaking, resources). */}
      <div className="mb-6 rounded-lg border border-purple/30 bg-purple/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${ANCHOR_AUDIT.missing > 0 ? "text-raspberry" : "text-lime-foreground"}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-poppins font-semibold text-navy">Anchor coverage</h2>
              <Badge
                variant="outline"
                className={
                  ANCHOR_AUDIT.missing > 0
                    ? "bg-raspberry/10 text-raspberry border-raspberry/40"
                    : "bg-lime/10 text-lime-foreground border-lime/40"
                }
              >
                {ANCHOR_AUDIT.present}/{ANCHOR_AUDIT.total_anchored} resolved
              </Badge>
              <span className="text-xs text-muted-foreground">
                generated {new Date(ANCHOR_AUDIT.generated_at).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Each row in <code>path_finder_offerings</code> with an <code>anchor_id</code> or <code>#fragment</code> in its URL
              is checked against every <code>id="…"</code> rendered in <code>src/pages</code> and <code>src/components</code>
              (masterclasses, courses, assessments, workshops, labs, speaking topics, resources). Missing anchors mean a quiz
              recommendation will route to the right page but fail to scroll to the intended card. Run{" "}
              <code className="bg-muted px-1 rounded">npm run audit:anchors</code> to refresh.
            </p>
            {ANCHOR_AUDIT.missing > 0 && (
              <div className="mt-3 space-y-2">
                {Object.entries(ANCHOR_AUDIT.missing_by_destination).map(([dest, items]) => (
                  <div key={dest} className="rounded border bg-background px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <Link to={dest} target="_blank" className="font-mono text-xs text-navy hover:underline inline-flex items-center gap-1">
                        {dest} <ExternalLink className="w-3 h-3" />
                      </Link>
                      <Badge variant="outline" className="text-[10px]">{items.length} missing</Badge>
                    </div>
                    <ul className="mt-1.5 text-xs space-y-0.5">
                      {items.map((it) => (
                        <li key={`${it.offering_key}-${it.anchor}`} className="flex items-center justify-between gap-2">
                          <span className="text-navy">
                            <span className="font-medium">{it.name}</span>{" "}
                            <code className="text-muted-foreground">({it.offering_key})</code>
                          </span>
                          <code className="text-raspberry">#{it.anchor}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Launch link integrity — live cross-check between path_finder_offerings.launch_slug
          and course_launch_status.slug. Catches drift if a launch row is renamed or deleted. */}
      <div className={`mb-6 rounded-lg border p-4 ${brokenLaunches.length > 0 ? "border-raspberry/40 bg-raspberry/5" : "border-lime/30 bg-lime/5"}`}>
        <div className="flex items-start gap-3">
          {brokenLaunches.length > 0 ? (
            <AlertTriangle className="w-5 h-5 text-raspberry mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-lime-foreground mt-0.5 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-poppins font-semibold text-navy">Launch link integrity</h2>
              <Badge
                variant="outline"
                className={
                  brokenLaunches.length > 0
                    ? "bg-raspberry/10 text-raspberry border-raspberry/40"
                    : "bg-lime/10 text-lime-foreground border-lime/40"
                }
              >
                {brokenLaunches.length === 0
                  ? `all ${rows.filter((r) => !!r.launch_slug).length} resolved`
                  : `${brokenLaunches.length} broken`}
              </Badge>
              <span className="text-xs text-muted-foreground">live check</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Each offering with a <code>launch_slug</code> is checked against{" "}
              <code>course_launch_status</code>. Broken links cause the quiz to silently
              fall back to the <strong>Live</strong> toggle. Fix on{" "}
              <Link to="/admin/path-finder" className="text-primary underline">
                P.A.T.H. Finder Offerings
              </Link>{" "}
              (filter to "Broken launch link") or repoint via the launch_slug dropdown.
            </p>
            {brokenLaunches.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs">
                {brokenLaunches.map(({ row, slug }) => (
                  <li key={row.id} className="rounded border bg-background px-3 py-2 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-navy">
                      <span className="font-medium">{row.name}</span>{" "}
                      <code className="text-muted-foreground">({row.offering_key})</code>
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="text-muted-foreground">missing slug</span>
                      <code className="text-raspberry">{slug}</code>
                      <Link
                        to={`/admin/course-launches?slug=${encodeURIComponent(slug)}`}
                        className="text-primary hover:underline"
                      >
                        Open in launches
                      </Link>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>



      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-8">

        {[
          { label: "Total", value: summary.total, tone: "text-navy" },
          { label: "Live", value: summary.live, tone: "text-lime-foreground" },
          { label: "Quiz eligible", value: summary.eligible, tone: "text-primary" },
          { label: "Featured", value: summary.featured, tone: "text-purple" },
          { label: "In workshops", value: summary.workshops, tone: "text-teal" },
          { label: "Untagged topic", value: summary.untagged, tone: summary.untagged ? "text-raspberry" : "text-muted-foreground" },
          { label: "No URL", value: summary.missingUrl, tone: summary.missingUrl ? "text-raspberry" : "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-white p-3">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className={`text-2xl font-poppins font-bold ${s.tone}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* By topic */}
          <section>
            <h2 className="text-xl font-poppins font-semibold text-navy mb-3">By topic</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Multiple rows in the same topic = one idea delivered multiple ways (Phase 2 will split these into topic + deliveries).
            </p>
            <div className="space-y-4">
              {byTopic.map(([topic, items]) => (
                <div key={topic} className="border rounded-lg bg-white">
                  <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
                    <div className="font-poppins font-semibold text-navy">{topic}</div>
                    <Badge variant="outline">{items.length} {items.length === 1 ? "delivery" : "deliveries"}</Badge>
                  </div>
                  <ul className="divide-y">
                    {items.map((r) => {
                      const url = resolveUrl(r);
                      return (
                        <li key={r.id} className="px-4 py-3">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-navy">{r.name}</span>
                                <Badge variant="outline" className={TIER_COLORS[r.tier] ?? ""}>{r.tier}</Badge>
                                {r.facilitator && <Badge variant="outline" className="text-xs">{r.facilitator}</Badge>}
                                {r.is_featured_in_quiz && (
                                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/40 text-xs">Featured</Badge>
                                )}
                                {r.include_in_workshops && (
                                  <Badge variant="outline" className="bg-teal/10 text-teal border-teal/40 text-xs">Workshop</Badge>
                                )}
                              </div>
                              <code className="text-xs text-muted-foreground block mt-1">{r.offering_key}</code>
                              <div className="text-xs mt-1 truncate">
                                {url ? (
                                  <Link to={url} target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">
                                    {url} <ExternalLink className="w-3 h-3" />
                                  </Link>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-raspberry">
                                    <AlertTriangle className="w-3 h-3" /> No URL or anchor
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 text-xs">
                              {isQuizEligible(r) ? (
                                <span className="inline-flex items-center gap-1 text-lime-foreground">
                                  <CheckCircle2 className="w-3 h-3" /> Eligible
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Not eligible</span>
                              )}
                              <span className={r.is_live ? "text-lime-foreground" : "text-muted-foreground"}>
                                {r.is_live ? "Live" : "Hub only"}
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* By destination */}
          <section>
            <h2 className="text-xl font-poppins font-semibold text-navy mb-3">By destination page</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Each row groups every offering that resolves to the same page path. Useful for spotting hub pages doing double duty.
            </p>
            <div className="space-y-4">
              {byDestination.map(([dest, items]) => (
                <div key={dest} className="border rounded-lg bg-white">
                  <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 gap-2">
                    <div className="font-mono text-xs text-navy truncate">
                      {dest === "(no destination)" ? (
                        <span className="text-raspberry inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {dest}
                        </span>
                      ) : (
                        <Link to={dest} target="_blank" className="hover:underline inline-flex items-center gap-1">
                          {dest} <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                    <Badge variant="outline">{items.length}</Badge>
                  </div>
                  <ul className="divide-y">
                    {items.map((r) => {
                      const url = resolveUrl(r);
                      const anchor = url && url.includes("#") ? url.split("#")[1] : null;
                      return (
                        <li key={r.id} className="px-4 py-2 text-sm flex items-center justify-between gap-2 flex-wrap">
                          <div className="min-w-0">
                            <span className="text-navy font-medium">{r.name}</span>{" "}
                            <Badge variant="outline" className={`${TIER_COLORS[r.tier] ?? ""} text-xs`}>{r.tier}</Badge>
                            {anchor && (
                              <code className="ml-2 text-xs text-muted-foreground">#{anchor}</code>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{r.topic ?? "untagged"}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
