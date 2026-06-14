import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ExternalLink, Search } from "lucide-react";
import { Link } from "react-router-dom";

interface Row {
  id: string;
  offering_key: string;
  name: string;
  facilitator: string | null;
  tier: string;
  blurb: string;
  current_url: string;
  dedicated_url: string | null;
  anchor_id: string | null;
  is_live: boolean;
  sort_order: number;
  notes: string | null;
}

const TIER_COLORS: Record<string, string> = {
  IGNITE: "bg-gold/15 text-gold-foreground border-gold/40",
  AMPLIFY: "bg-purple/15 text-purple border-purple/40",
  "Pathway B": "bg-strategic/15 text-strategic border-strategic/40",
  "Blue Door": "bg-bluedoor/15 text-bluedoor border-bluedoor/40",
  Free: "bg-lime/15 text-lime-foreground border-lime/40",
  Assessment: "bg-raspberry/10 text-raspberry border-raspberry/40",
};

export default function PathFinderOfferings() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [dirty, setDirty] = useState<Record<string, Partial<Row>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [showOnly, setShowOnly] = useState<"all" | "needs-page" | "live">("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("path_finder_offerings")
      .select("*")
      .order("sort_order");
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
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
          !r.tier.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [rows, filter, showOnly]);

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
