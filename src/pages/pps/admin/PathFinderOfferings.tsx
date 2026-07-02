import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink, Search, AlertTriangle, Plus, RefreshCw, Pencil } from "lucide-react";
import { OpPlatformResyncPanel } from "./OpPlatformResyncPanel";
import type { OfferingRow, LaunchOption } from "./offerings/OfferingEditor";
import { facilitatorDisplay } from "./offerings/OfferingEditor";

const OP_PLATFORM_ADMIN_BASE = "https://paintedporch-ops.lovable.app/admin/topics";

const TIER_COLORS: Record<string, string> = {
  IGNITE: "bg-gold/15 text-gold-foreground border-gold/40",
  AMPLIFY: "bg-purple/15 text-purple border-purple/40",
  Workshop: "bg-strategic/15 text-strategic border-strategic/40",
  "Blue Door": "bg-bluedoor/15 text-bluedoor border-bluedoor/40",
  Free: "bg-lime/15 text-lime-foreground border-lime/40",
  Assessment: "bg-raspberry/10 text-raspberry border-raspberry/40",
  Speaking: "bg-navy/10 text-navy border-navy/40",
};

interface Row extends OfferingRow {
  updated_at?: string | null;
}

function tierSegment(tier: string): "B2B" | "B2C" | null {
  const t = (tier || "").toLowerCase();
  if (["amplify", "embody", "blue door", "workshop", "speaking"].includes(t)) return "B2B";
  if (["free", "ignite", "assessment"].includes(t)) return "B2C";
  return null;
}

function deliveryTypes(row: Row): string[] {
  const t = (row.tier || "").toLowerCase();
  const out: string[] = [];
  if (row.is_keynote) out.push("keynote");
  if (row.include_in_workshops) out.push("workshop");
  if (t === "free") out.push("free_resource");
  if (t === "amplify") out.push("lab");
  if (t === "ignite") out.push("course");
  if (t === "assessment") out.push("assessment");
  if (t === "blue door") out.push("assessment");
  if (out.length === 0 && row.tier) out.push(row.tier.toLowerCase());
  return Array.from(new Set(out));
}

export default function PathFinderOfferings() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState<Row[]>([]);
  const [launches, setLaunches] = useState<LaunchOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get("filter") ?? "");
  const [typeFilter, setTypeFilter] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("");
  const [facilitatorFilter, setFacilitatorFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const load = async () => {
    setLoading(true);
    const [offRes, launchRes] = await Promise.all([
      supabase
        .from("path_finder_offerings")
        .select("id, offering_key, name, facilitator, tier, engagement_tier, delivery_format, blurb, description, current_url, dedicated_url, anchor_id, is_live, is_published, sort_order, topic, topic_slug, include_in_workshops, is_featured_in_quiz, is_keynote, include_on_speaker_page, image_url, launch_slug, b2c_rt_pools, b2b_rt_pools, blue_door_required, updated_at")
        .order("name"),
      supabase.from("course_launch_status").select("slug, course_name, status, program_type").order("course_name"),
    ]);
    if (offRes.error) toast({ title: "Failed to load", description: offRes.error.message, variant: "destructive" });
    setRows((offRes.data ?? []) as Row[]);
    setLaunches((launchRes.data ?? []) as LaunchOption[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const launchSlugs = useMemo(() => new Set(launches.map((l) => l.slug)), [launches]);
  const brokenIds = useMemo(() => {
    if (launches.length === 0) return new Set<string>();
    return new Set(rows.filter((r) => r.launch_slug && !launchSlugs.has(r.launch_slug)).map((r) => r.id));
  }, [rows, launches, launchSlugs]);

  const topicDeliveryCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const k = r.topic_slug || r.offering_key;
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  }, [rows]);

  const uniqueFacilitators = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) {
      if (!r.facilitator) continue;
      for (const p of r.facilitator.split(/\s*(?:,|&|\band\b)\s*/i)) {
        const v = p.trim();
        if (v) s.add(v);
      }
    }
    return Array.from(s).sort();
  }, [rows]);

  const uniqueCategories = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) if (r.topic) s.add(r.topic);
    return Array.from(s).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (typeFilter && !deliveryTypes(r).includes(typeFilter)) return false;
      if (segmentFilter && tierSegment(r.tier) !== segmentFilter) return false;
      if (facilitatorFilter && !(r.facilitator ?? "").toLowerCase().includes(facilitatorFilter.toLowerCase())) return false;
      if (categoryFilter && r.topic !== categoryFilter) return false;
      if (filter) {
        const q = filter.toLowerCase();
        if (
          !r.name.toLowerCase().includes(q) &&
          !r.offering_key.toLowerCase().includes(q) &&
          !(r.facilitator ?? "").toLowerCase().includes(q) &&
          !r.tier.toLowerCase().includes(q) &&
          !(r.topic ?? "").toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [rows, filter, typeFilter, segmentFilter, facilitatorFilter, categoryFilter]);

  const stats = useMemo(() => {
    const topicSlugs = new Set(filtered.map((r) => r.topic_slug || r.offering_key));
    const live = filtered.filter((r) => r.is_published).length;
    return { shown: filtered.length, topics: topicSlugs.size, deliveries: filtered.length, live };
  }, [filtered]);

  const deliveryTypeOptions = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) for (const t of deliveryTypes(r)) s.add(t);
    return Array.from(s).sort();
  }, [rows]);

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-navy">Offerings & Delivery</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Canonical catalog. Each topic owns shared narrative (name, blurb, image, tier, facilitator) from the <strong>PPS Op Platform</strong>. Click a row to open its detail page and edit PPS-owned quiz & website controls.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <a
            href={OP_PLATFORM_ADMIN_BASE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 h-9 px-3 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90"
            title="New offerings must be authored in the PPS Op Platform Offerings Register"
          >
            <Plus className="w-4 h-4" /> New topic <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, slug, ID, or type…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All types</option>
          {deliveryTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={segmentFilter} onChange={(e) => setSegmentFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All segments</option>
          <option value="B2B">B2B</option>
          <option value="B2C">B2C</option>
        </select>
        <select value={facilitatorFilter} onChange={(e) => setFacilitatorFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All facilitators</option>
          {uniqueFacilitators.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All categories</option>
          {uniqueCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="text-xs text-muted-foreground text-right mb-4">
        {stats.shown} shown · {stats.topics} topics · {stats.deliveries} deliveries · <span className="text-lime-foreground">{stats.live} live</span>
      </div>

      {!loading && brokenIds.size > 0 && (
        <div className="mb-4 rounded-lg border border-raspberry/40 bg-raspberry/5 px-4 py-2 text-xs text-navy flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-raspberry" />
          {brokenIds.size} offering{brokenIds.size === 1 ? "" : "s"} link to a missing program launch — open the row to repair.
        </div>
      )}

      {!loading && (
        <OpPlatformResyncPanel
          rows={rows}
          onApplied={(updates) => {
            setRows((rs) =>
              rs.map((r) => {
                const u = updates.find((x) => x.id === r.id);
                return u ? ({ ...r, ...(u.patch as Partial<Row>) }) : r;
              }),
            );
          }}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="border rounded-lg bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-navy">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Topic</th>
                <th className="px-2 py-3 font-semibold">ID</th>
                <th className="px-2 py-3 font-semibold">Types</th>
                <th className="px-2 py-3 font-semibold">Segment</th>
                <th className="px-2 py-3 font-semibold">Facilitator</th>
                <th className="px-2 py-3 font-semibold">Category</th>
                <th className="px-2 py-3 font-semibold text-center">Deliveries</th>
                <th className="px-2 py-3 font-semibold text-center">Live</th>
                <th className="px-2 py-3 font-semibold">Updated</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const seg = tierSegment(r.tier);
                const types = deliveryTypes(r);
                const facilitators = r.facilitator ? facilitatorDisplay(r.facilitator).split(", ") : [];
                const deliveryCount = topicDeliveryCount.get(r.topic_slug || r.offering_key) ?? 1;
                return (
                  <tr key={r.id} className="border-t hover:bg-muted/20 align-top">
                    <td className="px-4 py-3 max-w-xs">
                      <Link to={`/admin/offerings/${encodeURIComponent(r.offering_key)}`} className="block group">
                        <div className="font-poppins font-semibold text-navy leading-tight group-hover:underline">
                          {r.name || <span className="italic text-muted-foreground">— missing name —</span>}
                        </div>
                        <code className="text-[10px] text-muted-foreground">{r.offering_key}</code>
                        {r.blurb && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{r.blurb}</div>
                        )}
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-xs text-muted-foreground whitespace-nowrap">#{r.sort_order ?? "—"}</td>
                    <td className="px-2 py-3">
                      <div className="flex flex-col gap-1">
                        {types.map((t) => (
                          <Badge key={t} variant="outline" className={`${TIER_COLORS[r.tier] ?? ""} text-[10px] w-fit`}>{t}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      {seg && (
                        <Badge variant="outline" className={seg === "B2B" ? "bg-navy/10 text-navy border-navy/30" : "bg-lime/15 text-lime-foreground border-lime/40"}>
                          {seg}
                        </Badge>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex flex-col gap-1">
                        {facilitators.map((f) => (
                          <Badge key={f} variant="outline" className="text-[10px] w-fit whitespace-nowrap">{f}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      {r.topic && (
                        <Badge variant="outline" className="bg-navy/5 text-navy border-navy/30 text-[10px]">{r.topic}</Badge>
                      )}
                    </td>
                    <td className="px-2 py-3 text-center text-navy font-semibold">{deliveryCount}</td>
                    <td className="px-2 py-3 text-center">
                      {r.is_published ? <span className="text-lime-foreground font-semibold">✓</span> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-2 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {r.updated_at ? new Date(r.updated_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-2 py-3">
                      <Link to={`/admin/offerings/${encodeURIComponent(r.offering_key)}`} className="text-muted-foreground hover:text-primary" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="text-center py-10 text-sm text-muted-foreground">No offerings match filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
