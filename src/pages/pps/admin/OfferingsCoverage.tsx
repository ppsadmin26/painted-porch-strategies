import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, ExternalLink, Search, AlertTriangle, CheckCircle2 } from "lucide-react";

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
}

const TIER_COLORS: Record<string, string> = {
  IGNITE: "bg-gold/15 text-gold-foreground border-gold/40",
  AMPLIFY: "bg-purple/15 text-purple border-purple/40",
  "Pathway B": "bg-strategic/15 text-strategic border-strategic/40",
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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("path_finder_offerings")
        .select("*")
        .order("topic", { nullsFirst: false })
        .order("sort_order");
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, []);

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
