import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ExternalLink, Search, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface Row {
  id: string;
  offering_key: string;
  name: string;
  facilitator: string | null;
  tier: string;
  blurb: string;
  description: string | null;
  current_url: string;
  dedicated_url: string | null;
  anchor_id: string | null;
  is_live: boolean;
  sort_order: number;
  notes: string | null;
  topic: string | null;
  include_in_workshops: boolean;
  is_featured_in_quiz: boolean;
  launch_slug: string | null;
}

interface LaunchOption {
  slug: string;
  course_name: string;
  status: "coming_soon" | "live";
  program_type: string;
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

/** An offering is recommendable by the quiz if it is Live AND has at least
 *  one of current_url / dedicated_url / anchor_id set. */
function isQuizEligible(row: Pick<Row, "is_live" | "current_url" | "dedicated_url" | "anchor_id">): boolean {
  if (!row.is_live) return false;
  return Boolean(
    (row.current_url && row.current_url.trim()) ||
    (row.dedicated_url && row.dedicated_url.trim()) ||
    (row.anchor_id && row.anchor_id.trim()),
  );
}

export default function PathFinderOfferings() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [launches, setLaunches] = useState<LaunchOption[]>([]);
  const [dirty, setDirty] = useState<Record<string, Partial<Row>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [showOnly, setShowOnly] = useState<"all" | "needs-page" | "live" | "broken-launch">("all");

  const load = async () => {
    setLoading(true);
    const [offRes, launchRes] = await Promise.all([
      supabase.from("path_finder_offerings").select("*").order("sort_order"),
      supabase
        .from("course_launch_status")
        .select("slug, course_name, status, program_type")
        .order("course_name"),
    ]);
    if (offRes.error) toast({ title: "Failed to load", description: offRes.error.message, variant: "destructive" });
    setRows((offRes.data ?? []) as Row[]);
    setLaunches((launchRes.data ?? []) as LaunchOption[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const launchSlugs = useMemo(() => new Set(launches.map((l) => l.slug)), [launches]);

  // Effective launch_slug per row (accounts for unsaved edits) and broken-link detection
  const brokenRows = useMemo(() => {
    if (launches.length === 0) return [] as Array<{ row: Row; slug: string }>;
    return rows
      .map((r) => {
        const d = dirty[r.id];
        const slug = (d && "launch_slug" in d ? (d as any).launch_slug : r.launch_slug) as string | null;
        return slug && !launchSlugs.has(slug) ? { row: r, slug } : null;
      })
      .filter(Boolean) as Array<{ row: Row; slug: string }>;
  }, [rows, dirty, launches, launchSlugs]);

  const brokenIds = useMemo(() => new Set(brokenRows.map((b) => b.row.id)), [brokenRows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (showOnly === "broken-launch" && !brokenIds.has(r.id)) return false;
      if (showOnly === "needs-page" && (r.is_live || (r.dedicated_url && r.dedicated_url !== r.current_url))) {
        // "needs-page" = not live AND no dedicated_url set yet
        if (r.is_live || r.dedicated_url) return false;
      }
      if (showOnly === "live" && !r.is_live) return false;
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
  }, [rows, filter, showOnly, brokenIds]);

  const patch = (id: string, partial: Partial<Row>) => {
    setDirty((d) => ({ ...d, [id]: { ...d[id], ...partial } }));
  };

  const valueOf = <K extends keyof Row>(row: Row, key: K): Row[K] => {
    const d = dirty[row.id];
    return (d && key in d ? (d as any)[key] : row[key]) as Row[K];
  };

  const isDirty = (id: string) => !!dirty[id] && Object.keys(dirty[id]).length > 0;

  const save = async (row: Row) => {
    if (!isDirty(row.id)) return;
    setSavingId(row.id);
    const patchObj = dirty[row.id];
    const { error } = await supabase
      .from("path_finder_offerings")
      .update(patchObj)
      .eq("id", row.id);
    setSavingId(null);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    setRows((r) => r.map((x) => (x.id === row.id ? { ...x, ...patchObj } as Row : x)));
    setDirty((d) => { const n = { ...d }; delete n[row.id]; return n; });
    toast({ title: "Saved" });
  };

  const resolveUrl = (row: Row) => {
    const live = valueOf(row, "is_live");
    const dedicated = valueOf(row, "dedicated_url");
    const current = valueOf(row, "current_url");
    const anchor = valueOf(row, "anchor_id");
    let url = (live && dedicated) ? dedicated : current;
    if (anchor && url && !url.includes("#")) url = `${url}#${anchor}`;
    return url;
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-navy">P.A.T.H. Finder Offerings</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Every recommendation the quiz can surface. Flip <strong>Live</strong> on once a dedicated page exists — the quiz will start linking there instantly. Use <strong>Anchor</strong> to deep-link into a card on the hub page in the meantime.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Filter…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-8 w-56"
            />
          </div>
          <select
            value={showOnly}
            onChange={(e) => setShowOnly(e.target.value as any)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All ({rows.length})</option>
            <option value="needs-page">Needs page ({rows.filter(r => !r.is_live && !r.dedicated_url).length})</option>
            <option value="live">Live ({rows.filter(r => r.is_live).length})</option>
          </select>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-bluedoor/30 bg-bluedoor/5 px-4 py-3 text-sm text-navy">
        <p className="font-poppins font-semibold text-bluedoor mb-1">Heads up: this table is moving</p>
        <p>
          The Blue Door <strong>Offerings Master Register</strong> is becoming the single source of truth for every offering (B2C and B2B). In Phase 2, this table will be a one-way synced mirror of that register, with canonical fields (name, blurb, pricing, descriptions) edited only in Blue Door admin. Routing fields below (URL, anchor, Live, Prioritize in quiz) will stay editable here.
        </p>
        <p className="mt-2">
          See <code>docs/offerings-master-schema.md</code> and{" "}
          <code>.lovable/plan-offerings-sync.md</code> for the plan.{" "}
          <a
            href="https://bluedoordiagnostic.lovable.app/admin/offerings"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bluedoor underline hover:no-underline"
          >
            Open Blue Door · Offerings Register
          </a>
        </p>
      </div>


      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((row) => {
            const live = valueOf(row, "is_live");
            const url = resolveUrl(row);
            return (
              <div key={row.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={TIER_COLORS[row.tier] ?? ""}>{row.tier}</Badge>
                    {row.facilitator && <Badge variant="outline">{row.facilitator}</Badge>}
                    <code className="text-xs text-muted-foreground">{row.offering_key}</code>
                    {isQuizEligible({
                      is_live: valueOf(row, "is_live"),
                      current_url: valueOf(row, "current_url"),
                      dedicated_url: valueOf(row, "dedicated_url"),
                      anchor_id: valueOf(row, "anchor_id"),
                    }) ? (
                      <Badge
                        variant="outline"
                        className="bg-lime/15 text-lime-foreground border-lime/40"
                        title="Live AND has a URL or anchor. Eligible to appear in quiz results."
                      >
                        Quiz eligible
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-muted text-muted-foreground border-muted-foreground/30"
                        title="Not eligible: needs Live + at least one of Hub URL, Dedicated URL, or Anchor."
                      >
                        Not eligible
                      </Badge>
                    )}
                    {(() => {
                      const slug = valueOf(row, "launch_slug");
                      if (!slug) return null;
                      const launch = launches.find((l) => l.slug === slug);
                      if (!launch) {
                        return (
                          <Badge
                            variant="outline"
                            className="bg-raspberry/10 text-raspberry border-raspberry/40"
                            title={`Linked launch "${slug}" no longer exists`}
                          >
                            Launch: missing
                          </Badge>
                        );
                      }
                      const cls =
                        launch.status === "live"
                          ? "bg-lime/15 text-lime-foreground border-lime/40"
                          : "bg-gold/15 text-gold-foreground border-gold/40";
                      return (
                        <Link
                          to={`/admin/course-launches?slug=${encodeURIComponent(slug)}`}
                          className="inline-flex items-center"
                          title="Open in Program Launches"
                        >
                          <Badge variant="outline" className={`${cls} hover:underline cursor-pointer`}>
                            {launch.status === "live" ? "Launch: Live" : "Launch: Coming Soon"}
                          </Badge>
                        </Link>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={live}
                        onCheckedChange={(v) => patch(row.id, { is_live: v })}
                        id={`live-${row.id}`}
                      />
                      <Label htmlFor={`live-${row.id}`} className="text-sm font-medium">
                        {live ? "Live" : "Hub only"}
                      </Label>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => save(row)}
                      disabled={!isDirty(row.id) || savingId === row.id}
                      className="bg-primary text-white hover:bg-primary/90"
                    >
                      {savingId === row.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                      Save
                    </Button>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <Label className="text-xs">Display name (shown in quiz results)</Label>
                    <Input
                      value={valueOf(row, "name") ?? ""}
                      onChange={(e) => patch(row.id, { name: e.target.value })}
                      className="font-poppins font-semibold text-navy"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Blurb (shown under the name)</Label>
                    <Textarea
                      rows={2}
                      value={valueOf(row, "blurb") ?? ""}
                      onChange={(e) => patch(row.id, { blurb: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Topic tag (shown on workshop hub)</Label>
                    <select
                      value={valueOf(row, "topic") ?? ""}
                      onChange={(e) => patch(row.id, { topic: e.target.value || null })}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">— Untagged —</option>
                      <option value="Change">Change</option>
                      <option value="Comms">Comms</option>
                      <option value="EQ">EQ</option>
                      <option value="Innovation">Innovation</option>
                      <option value="Leadership">Leadership</option>
                      <option value="Mindfulness">Mindfulness</option>
                      <option value="Philosophy">Philosophy</option>
                      <option value="Resilience">Resilience</option>
                      <option value="Teams">Teams</option>
                      <option value="Wellbeing">Wellbeing</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <Label className="text-xs">Workshop description (shown in accordion body)</Label>
                  <Textarea
                    rows={3}
                    value={valueOf(row, "description") ?? ""}
                    onChange={(e) => patch(row.id, { description: e.target.value || null as any })}
                    placeholder="Full description shown when the accordion is expanded..."
                  />
                </div>

                <div className="mb-3 flex items-center gap-2 rounded-md border border-dashed border-teal/40 bg-teal/5 px-3 py-2">
                  <Switch
                    id={`workshop-${row.id}`}
                    checked={!!valueOf(row, "include_in_workshops")}
                    onCheckedChange={(v) => patch(row.id, { include_in_workshops: v })}
                  />
                  <Label htmlFor={`workshop-${row.id}`} className="text-sm">
                    Show in the <strong>Browse All Workshop Topics</strong> accordion
                    <span className="block text-xs text-muted-foreground">
                      Use this to flag a speaking topic (or any offering) as also bookable as a workshop.
                    </span>
                  </Label>
                </div>

                <div className="mb-3 flex items-center gap-2 rounded-md border border-dashed border-primary/40 bg-primary/5 px-3 py-2">
                  <Switch
                    id={`featured-${row.id}`}
                    checked={!!valueOf(row, "is_featured_in_quiz")}
                    onCheckedChange={(v) => patch(row.id, { is_featured_in_quiz: v })}
                  />
                  <Label htmlFor={`featured-${row.id}`} className="text-sm">
                    <strong>Prioritize in P.A.T.H.finder quiz</strong>
                    <span className="block text-xs text-muted-foreground">
                      Eligibility is automatic: any offering that is Live AND has a URL or anchor set below will appear in quiz results. Turn this on to promote it ahead of other eligible options when the result matches.
                    </span>
                  </Label>
                </div>




                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <Label className="text-xs">Hub / fallback URL</Label>
                    <Input
                      value={valueOf(row, "current_url") ?? ""}
                      onChange={(e) => patch(row.id, { current_url: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Dedicated page URL (when it exists)</Label>
                    <Input
                      placeholder="e.g. /partner/amplify/labs/goldilocks"
                      value={valueOf(row, "dedicated_url") ?? ""}
                      onChange={(e) => patch(row.id, { dedicated_url: e.target.value || null as any })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Anchor on hub page (optional)</Label>
                    <Input
                      placeholder="e.g. lab-goldilocks"
                      value={valueOf(row, "anchor_id") ?? ""}
                      onChange={(e) => patch(row.id, { anchor_id: e.target.value || null as any })}
                    />
                  </div>
                </div>

                <div className="mt-3 rounded-md border border-dashed border-gold/40 bg-gold/5 px-3 py-2">
                  <Label className="text-xs">
                    <strong>Linked launch</strong> (single source of truth for Live vs Coming Soon)
                    <span className="block text-xs text-muted-foreground font-normal">
                      When linked, the quiz reads availability from <code>course_launch_status</code>. Coming Soon programs still appear in results, deprioritized, with a "join the launch list" badge.
                    </span>
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      value={valueOf(row, "launch_slug") ?? ""}
                      onChange={(e) => patch(row.id, { launch_slug: e.target.value || (null as any) })}
                      className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">— No linked launch (use Live toggle above) —</option>
                      {launches.map((l) => (
                        <option key={l.slug} value={l.slug}>
                          {l.course_name} ({l.status === "live" ? "Live" : "Coming Soon"}) · {l.slug}
                        </option>
                      ))}
                    </select>
                    {valueOf(row, "launch_slug") ? (
                      <Link
                        to={`/admin/course-launches?slug=${encodeURIComponent(valueOf(row, "launch_slug") as string)}`}
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Manage <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Quiz will link to:</span>
                  {url ? (
                    <Link to={url} target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">
                      {url} <ExternalLink className="w-3 h-3" />
                    </Link>
                  ) : <span className="italic">(no url)</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
