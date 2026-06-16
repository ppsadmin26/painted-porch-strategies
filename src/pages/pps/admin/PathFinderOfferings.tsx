import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ExternalLink, Search, AlertTriangle, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  topic: string | null;
  include_in_workshops: boolean;
  is_featured_in_quiz: boolean;
  launch_slug: string | null;
  b2c_rt_pools: Record<string, string[]> | null;
  b2b_rt_pools: Record<string, string[]> | null;
}

interface LaunchOption {
  slug: string;
  course_name: string;
  status: "coming_soon" | "live";
  program_type: string;
}

const TIER_OPTIONS = ["Free", "IGNITE", "AMPLIFY", "Workshop", "Blue Door", "Speaking", "Assessment"] as const;
const B2C_RTS = ["RT1", "RT2", "RT3", "RT4", "RT5", "RT6"] as const;
const B2B_RTS = ["RT-A", "RT-B", "RT-C", "RT-D", "RT-E"] as const;


const TIER_COLORS: Record<string, string> = {
  IGNITE: "bg-gold/15 text-gold-foreground border-gold/40",
  AMPLIFY: "bg-purple/15 text-purple border-purple/40",
  Workshop: "bg-strategic/15 text-strategic border-strategic/40",
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
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState<Row[]>([]);
  const [launches, setLaunches] = useState<LaunchOption[]>([]);
  const [dirty, setDirty] = useState<Record<string, Partial<Row>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get("filter") ?? "");
  const [showOnly, setShowOnly] = useState<"all" | "needs-page" | "live" | "broken-launch">("all");
  const [newOpen, setNewOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newRow, setNewRow] = useState({
    offering_key: "",
    name: "",
    tier: "Free" as (typeof TIER_OPTIONS)[number],
    current_url: "",
    dedicated_url: "",
    anchor_id: "",
    topic: "",
    blurb: "",
    is_live: true,
  });
  const [keyManuallyEdited, setKeyManuallyEdited] = useState(false);

  const slugifyKey = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);

  const resetNew = () => {
    setNewRow({
      offering_key: "",
      name: "",
      tier: "Free",
      current_url: "",
      dedicated_url: "",
      anchor_id: "",
      topic: "",
      blurb: "",
      is_live: true,
    });
    setKeyManuallyEdited(false);
  };

  const createOffering = async () => {
    const key = newRow.offering_key.trim();
    const name = newRow.name.trim();
    if (!name) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
      toast({ title: "Invalid key", description: "Use letters, numbers, dashes, underscores only.", variant: "destructive" });
      return;
    }
    if (rows.some((r) => r.offering_key === key)) {
      toast({ title: "Key already exists", description: "Pick a unique offering key.", variant: "destructive" });
      return;
    }
    const maxSort = rows.reduce((m, r) => Math.max(m, r.sort_order ?? 0), 0);
    setCreating(true);
    const { data, error } = await supabase
      .from("path_finder_offerings")
      .insert({
        offering_key: key,
        name,
        tier: newRow.tier,
        blurb: newRow.blurb || "",
        current_url: newRow.current_url || "",
        dedicated_url: newRow.dedicated_url || null,
        anchor_id: newRow.anchor_id || null,
        topic: newRow.topic || null,
        is_live: newRow.is_live,
        sort_order: maxSort + 10,
        b2c_rt_pools: {},
        b2b_rt_pools: {},
      } as any)
      .select()
      .single();
    setCreating(false);
    if (error) {
      toast({ title: "Create failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Offering created", description: "Map it to RT pools below." });
    setNewOpen(false);
    resetNew();
    await load();
    // Scroll the new card into view
    setTimeout(() => {
      const el = document.getElementById(`offering-${(data as any).id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
  };

  const load = async () => {
    setLoading(true);
    const [offRes, launchRes] = await Promise.all([
      supabase.from("path_finder_offerings").select("id, offering_key, name, facilitator, tier, blurb, description, current_url, dedicated_url, anchor_id, is_live, sort_order, topic, include_in_workshops, is_featured_in_quiz, launch_slug, b2c_rt_pools, b2b_rt_pools").order("sort_order"),
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
            <option value="broken-launch">Broken launch link ({brokenRows.length})</option>
          </select>
          <Button
            size="sm"
            onClick={() => setNewOpen(true)}
            className="bg-primary text-white hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-1" /> New offering
          </Button>
        </div>
      </div>

      <Dialog open={newOpen} onOpenChange={(o) => { setNewOpen(o); if (!o) resetNew(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New offering</DialogTitle>
            <DialogDescription>
              Create a new offering. After saving, map it to B2C / B2B RT pools on its card to surface it in quiz results.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Display name *</Label>
              <Input
                value={newRow.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setNewRow((r) => ({
                    ...r,
                    name,
                    offering_key: keyManuallyEdited ? r.offering_key : slugifyKey(name),
                  }));
                }}
                placeholder="The Stoic Leader Field Guide"
              />
            </div>
            <div>
              <Label className="text-xs">Offering key * (unique, letters/numbers/-/_)</Label>
              <Input
                value={newRow.offering_key}
                onChange={(e) => {
                  setKeyManuallyEdited(true);
                  setNewRow((r) => ({ ...r, offering_key: e.target.value }));
                }}
                placeholder="stoic-leader-field-guide"
                className="font-mono text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Tier *</Label>
              <select
                value={newRow.tier}
                onChange={(e) => setNewRow((r) => ({ ...r, tier: e.target.value as any }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {TIER_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Blurb</Label>
              <Textarea
                rows={2}
                value={newRow.blurb}
                onChange={(e) => setNewRow((r) => ({ ...r, blurb: e.target.value }))}
                placeholder="One short line shown under the name."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Hub URL</Label>
                <Input
                  value={newRow.current_url}
                  onChange={(e) => setNewRow((r) => ({ ...r, current_url: e.target.value }))}
                  placeholder="/partner/ignite"
                />
              </div>
              <div>
                <Label className="text-xs">Dedicated URL</Label>
                <Input
                  value={newRow.dedicated_url}
                  onChange={(e) => setNewRow((r) => ({ ...r, dedicated_url: e.target.value }))}
                  placeholder="/stoic-field-guide"
                />
              </div>
              <div>
                <Label className="text-xs">Anchor ID</Label>
                <Input
                  value={newRow.anchor_id}
                  onChange={(e) => setNewRow((r) => ({ ...r, anchor_id: e.target.value }))}
                  placeholder="optional"
                />
              </div>
              <div>
                <Label className="text-xs">Topic tag</Label>
                <Input
                  value={newRow.topic}
                  onChange={(e) => setNewRow((r) => ({ ...r, topic: e.target.value }))}
                  placeholder="Leadership"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newRow.is_live}
                onCheckedChange={(v) => setNewRow((r) => ({ ...r, is_live: v }))}
                id="new-live"
              />
              <Label htmlFor="new-live" className="text-sm">Live (quiz-eligible)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)} disabled={creating}>Cancel</Button>
            <Button onClick={createOffering} disabled={creating} className="bg-primary text-white hover:bg-primary/90">
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {!loading && brokenRows.length > 0 && (
        <div className="mb-6 rounded-lg border border-raspberry/40 bg-raspberry/5 px-4 py-3 text-sm text-navy">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 text-raspberry shrink-0" />
            <div className="flex-1">
              <p className="font-poppins font-semibold text-raspberry mb-1">
                {brokenRows.length} offering{brokenRows.length === 1 ? "" : "s"} link to a missing program launch
              </p>
              <p className="mb-2 text-xs">
                The linked <code>launch_slug</code> no longer exists in <code>course_launch_status</code>. The quiz falls back to the <strong>Live</strong> toggle for these rows, but the link should be cleared or repointed.
              </p>
              <ul className="space-y-1 text-xs">
                {brokenRows.slice(0, 8).map(({ row, slug }) => (
                  <li key={row.id} className="flex items-center gap-2 flex-wrap">
                    <strong className="text-navy">{row.name}</strong>
                    <code className="text-muted-foreground">{row.offering_key}</code>
                    <span className="text-muted-foreground">→ missing slug</span>
                    <code className="text-raspberry">{slug}</code>
                    <button
                      type="button"
                      onClick={() => patch(row.id, { launch_slug: null as any })}
                      className="text-primary hover:underline"
                    >
                      Clear link
                    </button>
                  </li>
                ))}
                {brokenRows.length > 8 && (
                  <li className="text-muted-foreground">…and {brokenRows.length - 8} more.</li>
                )}
              </ul>
              <button
                type="button"
                onClick={() => setShowOnly("broken-launch")}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Filter to broken-launch rows →
              </button>
            </div>
          </div>
        </div>
      )}




      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((row) => {
            const live = valueOf(row, "is_live");
            const url = resolveUrl(row);
            return (
              <div key={row.id} id={`offering-${row.id}`} className="border rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={valueOf(row, "tier")}
                      onChange={(e) => patch(row.id, { tier: e.target.value })}
                      className={`h-7 rounded-md border px-2 text-xs font-medium ${TIER_COLORS[valueOf(row, "tier")] ?? "bg-background"}`}
                      title="Pricing tier / category"
                    >
                      {TIER_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
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
                      <option value="Change & Innovation">Change & Innovation</option>
                      <option value="Comms">Comms</option>
                      <option value="Leadership & EQ">Leadership & EQ</option>
                      <option value="Philosophy">Philosophy</option>
                      <option value="Teams">Teams</option>
                      <option value="Wellbeing & Resilience">Wellbeing & Resilience</option>
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

                <RtPoolEditor
                  tier={(valueOf(row, "tier") ?? "") as string}
                  b2cValue={(valueOf(row, "b2c_rt_pools") ?? {}) as Record<string, string[]>}
                  b2bValue={(valueOf(row, "b2b_rt_pools") ?? {}) as Record<string, string[]>}
                  onB2cChange={(v) => patch(row.id, { b2c_rt_pools: v as any })}
                  onB2bChange={(v) => patch(row.id, { b2b_rt_pools: v as any })}
                />



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




interface RtPoolEditorProps {
  tier: string;
  b2cValue: Record<string, string[]>;
  b2bValue: Record<string, string[]>;
  onB2cChange: (v: Record<string, string[]>) => void;
  onB2bChange: (v: Record<string, string[]>) => void;
}

// Which tiers the RT-pool editor actually controls.
// Other tiers (Pathway B workshops, IGNITE courses, AMPLIFY labs, EMBODY, Blue Door,
// Assessment, Free guides not in a curated pool) are placed by the quiz engine via
// hardcoded result-type maps + the global Live + URL allowlist.
function rtPoolMode(tier: string): "free" | "speaking" | "none" {
  const t = (tier || "").trim().toLowerCase();
  if (t === "free") return "free";
  if (t === "speaking") return "speaking";
  return "none";
}

function RtPoolEditor({ tier, b2cValue, b2bValue, onB2cChange, onB2bChange }: RtPoolEditorProps) {
  const mode = rtPoolMode(tier);

  if (mode === "none") {
    return (
      <div className="mt-3 rounded-md border border-dashed border-muted-foreground/30 bg-muted/30 px-3 py-2 space-y-1">
        <div className="text-xs font-poppins font-semibold text-navy">Quiz result-type (RT) mapping</div>
        <p className="text-xs text-muted-foreground">
          This offering's tier (<strong>{tier || "—"}</strong>) is placed automatically by the quiz engine based
          on each result type's recommended path. There's nothing to map here. To control whether it can appear at
          all, use the <strong>Live</strong> toggle and make sure a URL or anchor is set above.
        </p>
        <p className="text-xs text-muted-foreground">
          RT mapping is only used for <strong>Free</strong> tier (Free Resources group) and <strong>Speaking</strong> tier
          (Speaking Topics group, B2B only).
        </p>
      </div>
    );
  }

  const toggle = (current: Record<string, string[]>, rt: string, on: boolean, poolName: "free" | "speaking") => {
    const copy = { ...current };
    if (on) copy[rt] = [poolName];
    else delete copy[rt];
    return copy;
  };

  return (
    <div className="mt-3 rounded-md border border-dashed border-primary/40 bg-primary/5 px-3 py-2 space-y-2">
      <Label className="text-xs">
        <strong>Quiz result-type (RT) mapping</strong>
        <span className="block text-xs text-muted-foreground font-normal">
          {mode === "free"
            ? "Tick each result type where this free resource should appear in the Free Resources / Free Starting Points group."
            : "Tick each B2B result type where this speaking topic should appear in the Speaking Topics group."}
        </span>
      </Label>

      {mode === "free" && (
        <div className="space-y-1">
          <div className="text-xs font-poppins font-semibold text-navy">B2C results (individual leader)</div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {B2C_RTS.map((rt) => {
              const on = (b2cValue[rt] ?? []).includes("free");
              return (
                <label key={rt} className="flex items-center gap-2 rounded border border-input bg-background px-2 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={(e) => onB2cChange(toggle(b2cValue, rt, e.target.checked, "free"))}
                  />
                  <span className="text-[11px] text-muted-foreground">{rt}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-1">
        <div className="text-xs font-poppins font-semibold text-navy">B2B results (organization)</div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {B2B_RTS.map((rt) => {
            const poolName: "free" | "speaking" = mode;
            const on = (b2bValue[rt] ?? []).includes(poolName);
            return (
              <label key={rt} className="flex items-center gap-2 rounded border border-input bg-background px-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={(e) => onB2bChange(toggle(b2bValue, rt, e.target.checked, poolName))}
                />
                <span className="text-[11px] text-muted-foreground">{rt}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

