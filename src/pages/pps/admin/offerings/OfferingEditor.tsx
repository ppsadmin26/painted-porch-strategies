import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ExternalLink } from "lucide-react";
import { routingSummaryForTier, PLACEMENT_BADGE_COPY } from "@/lib/quizRoutingSummary";

// Full-name display map for facilitators
const FACILITATOR_FULL_NAME: Record<string, string> = {
  Amy: "Amy Yackowski",
  Rob: "Rob Hunter",
  Sierra: "Sierra Ramm Cantrell",
};
export const facilitatorDisplay = (f: string | null | undefined) => {
  if (!f) return "";
  return f
    .split(/\s*(?:,|&|\band\b)\s*/i)
    .filter(Boolean)
    .map((n) => FACILITATOR_FULL_NAME[n] ?? n)
    .join(", ");
};

const OP_PLATFORM_ADMIN_BASE = "https://paintedporch-ops.lovable.app/admin/topics";
function buildBlueDoorEditUrl(row: { topic_slug?: string | null; name?: string | null }): string {
  const params = new URLSearchParams();
  if (row.topic_slug) params.set("slug", row.topic_slug);
  else if (row.name) params.set("q", row.name);
  const qs = params.toString();
  return qs ? `${OP_PLATFORM_ADMIN_BASE}?${qs}` : OP_PLATFORM_ADMIN_BASE;
}

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

export interface OfferingRow {
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
  is_published: boolean;
  sort_order: number;
  topic: string | null;
  topic_slug: string | null;
  include_in_workshops: boolean;
  is_featured_in_quiz: boolean;
  is_keynote: boolean;
  include_on_speaker_page: boolean;
  image_url: string | null;
  launch_slug: string | null;
  b2c_rt_pools: Record<string, string[]> | null;
  b2b_rt_pools: Record<string, string[]> | null;
  blue_door_required: boolean;
}

export interface LaunchOption {
  slug: string;
  course_name: string;
  status: "coming_soon" | "live";
  program_type: string;
}

function isQuizEligible(row: Pick<OfferingRow, "is_published" | "current_url" | "dedicated_url" | "anchor_id">): boolean {
  if (!row.is_published) return false;
  return Boolean(
    (row.current_url && row.current_url.trim()) ||
    (row.dedicated_url && row.dedicated_url.trim()) ||
    (row.anchor_id && row.anchor_id.trim()),
  );
}

interface Props {
  row: OfferingRow;
  launches: LaunchOption[];
  onSaved?: (updated: OfferingRow) => void;
}

export default function OfferingEditor({ row: initialRow, launches, onSaved }: Props) {
  const { toast } = useToast();
  const [row, setRow] = useState<OfferingRow>(initialRow);
  const [dirty, setDirty] = useState<Partial<OfferingRow>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { setRow(initialRow); setDirty({}); }, [initialRow.id]);

  const patch = (partial: Partial<OfferingRow>) => setDirty((d) => ({ ...d, ...partial }));
  const valueOf = <K extends keyof OfferingRow>(key: K): OfferingRow[K] =>
    (key in dirty ? (dirty as any)[key] : row[key]) as OfferingRow[K];
  const isDirty = Object.keys(dirty).length > 0;

  const save = async () => {
    if (!isDirty) return;
    setSaving(true);
    const { error } = await supabase
      .from("path_finder_offerings")
      .update(dirty)
      .eq("id", row.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    const updated = { ...row, ...dirty } as OfferingRow;
    setRow(updated);
    setDirty({});
    toast({ title: "Saved" });
    onSaved?.(updated);
  };

  const resolveUrl = () => {
    const published = valueOf("is_published");
    const dedicated = valueOf("dedicated_url");
    const current = valueOf("current_url");
    const anchor = valueOf("anchor_id");
    let url = (published && dedicated) ? dedicated : current;
    if (anchor && url && !url.includes("#")) url = `${url}#${anchor}`;
    return url;
  };

  const url = resolveUrl();
  const tier = (valueOf("tier") ?? "") as string;
  const summary = useMemo(() => routingSummaryForTier(tier), [tier]);
  const launch = launches.find((l) => l.slug === valueOf("launch_slug"));

  return (
    <div className="border rounded-lg p-4 bg-white space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center h-7 rounded-md border border-dashed border-bluedoor/40 px-2 text-xs font-medium ${TIER_COLORS[tier] ?? "bg-background"}`}
            title="Tier is canonical — edit in PPS Op Platform"
          >
            {tier || "—"}
            <span className="ml-1 text-[10px] text-bluedoor">· canonical</span>
          </span>
          <code className="text-xs text-muted-foreground">{row.offering_key}</code>
          {isQuizEligible({
            is_published: valueOf("is_published"),
            current_url: valueOf("current_url"),
            dedicated_url: valueOf("dedicated_url"),
            anchor_id: valueOf("anchor_id"),
          }) ? (
            <Badge variant="outline" className="bg-lime/15 text-lime-foreground border-lime/40">
              Quiz eligible
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/30">
              Not eligible
            </Badge>
          )}
          {launch && (
            <Link to={`/admin/course-launches?slug=${encodeURIComponent(launch.slug)}`}>
              <Badge
                variant="outline"
                className={`${launch.status === "live" ? "bg-lime/15 text-lime-foreground border-lime/40" : "bg-gold/15 text-gold-foreground border-gold/40"} hover:underline cursor-pointer`}
              >
                {launch.status === "live" ? "Launch: Live" : "Launch: Coming Soon"}
              </Badge>
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={!!valueOf("is_published")}
              onCheckedChange={(v) => patch({ is_published: v })}
              id={`published-${row.id}`}
            />
            <Label htmlFor={`published-${row.id}`} className="text-sm font-medium">
              {valueOf("is_published") ? "Published" : "Unpublished"}
            </Label>
          </div>
          <Button
            size="sm"
            onClick={save}
            disabled={!isDirty || saving}
            className="bg-primary text-white hover:bg-primary/90"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Save
          </Button>
        </div>
      </div>

      {/* Registry */}
      <section className="rounded-md border border-dashed border-bluedoor/40 bg-bluedoor/5 px-3 py-3">
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
          <Label className="text-xs font-poppins font-semibold text-bluedoor uppercase tracking-wide">
            Registry · PPS Op Platform (read-only)
          </Label>
          <a
            href={buildBlueDoorEditUrl(row)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-bluedoor hover:underline"
          >
            Edit in PPS Op Platform <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="grid md:grid-cols-[10rem_1fr] gap-4">
          <div>
            {row.image_url ? (
              <div className="w-full aspect-[16/10] rounded border border-border overflow-hidden bg-muted">
                <img src={row.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full aspect-[16/10] rounded border border-dashed border-muted-foreground/30 bg-muted flex items-center justify-center text-[11px] text-muted-foreground italic">
                no image
              </div>
            )}
          </div>
          <div className="space-y-2 min-w-0">
            <div className="font-poppins font-semibold text-navy text-base leading-tight">
              {row.name || <span className="italic text-muted-foreground">— missing name —</span>}
            </div>
            <div className="text-sm text-foreground/80 whitespace-pre-wrap">
              {row.blurb || <span className="italic text-muted-foreground">— empty blurb —</span>}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-navy">Speaker(s): </span>
              {row.facilitator ? facilitatorDisplay(row.facilitator) : <span className="italic">none</span>}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {valueOf("topic") && (
                <Badge variant="outline" className="bg-navy/5 text-navy border-navy/30 text-[11px]">
                  Topic: {valueOf("topic")}
                </Badge>
              )}
              {valueOf("include_in_workshops") && (
                <Badge variant="outline" className="bg-strategic/15 text-strategic border-strategic/40 text-[11px]">
                  Workshop
                </Badge>
              )}
              {valueOf("is_keynote") && (
                <Badge variant="outline" className="bg-gold/20 text-gold-foreground border-gold/40 text-[11px]">
                  Keynote
                </Badge>
              )}
              {valueOf("blue_door_required") && (
                <Badge variant="outline" className="bg-bluedoor/15 text-bluedoor border-bluedoor/40 text-[11px]">
                  Blue Door required
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PPS Controls */}
      <section className="rounded-md border border-primary/30 bg-primary/[0.03] px-3 py-3 space-y-4">
        <Label className="text-xs font-poppins font-semibold text-navy uppercase tracking-wide">PPS Controls</Label>

        <div className="space-y-3">
          <div className="text-xs font-poppins font-semibold text-primary uppercase tracking-wide">Quiz</div>

          <div className="rounded-md border border-dashed border-primary/30 bg-white px-3 py-2">
            <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-navy">Routing rules · how this offering reaches the quiz</span>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-[10px]">{PLACEMENT_BADGE_COPY[summary.placement]}</Badge>
                <Link to="/admin/quiz-rules" className="text-[11px] text-bluedoor hover:underline ml-1">
                  Full rules →
                </Link>
              </div>
            </div>
            <p className="text-xs font-medium text-navy/80 mb-1">{summary.headline}</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-foreground/80">
              {summary.rules.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
            {summary.personas.length > 0 && (
              <p className="text-[11px] text-muted-foreground mt-1">
                Personas reached: {summary.personas.join(", ")}
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 rounded-md border border-input bg-white px-3 py-2 cursor-pointer">
            <Switch
              checked={!!valueOf("is_featured_in_quiz")}
              onCheckedChange={(v) => patch({ is_featured_in_quiz: v })}
            />
            <span className="text-sm">
              <strong>Pin to top of primary list</strong>
              <span className="block text-[11px] text-muted-foreground">
                When this offering already appears in a result's primary list, pin it to position 1.
              </span>
            </span>
          </label>

          <RtPoolEditor
            tier={tier}
            b2cValue={(valueOf("b2c_rt_pools") ?? {}) as Record<string, string[]>}
            b2bValue={(valueOf("b2b_rt_pools") ?? {}) as Record<string, string[]>}
            onB2cChange={(v) => patch({ b2c_rt_pools: v as any })}
            onB2bChange={(v) => patch({ b2b_rt_pools: v as any })}
          />

          <div className="rounded-md border border-dashed border-gold/40 bg-gold/5 px-3 py-2">
            <Label className="text-xs">
              <strong>Linked launch</strong>
              <span className="block text-xs text-muted-foreground font-normal">
                When linked, the quiz reads availability from <code>course_launch_status</code>.
              </span>
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <select
                value={valueOf("launch_slug") ?? ""}
                onChange={(e) => patch({ launch_slug: (e.target.value || null) as any })}
                className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">— No linked launch —</option>
                {launches.map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.course_name} ({l.status === "live" ? "Live" : "Coming Soon"}) · {l.slug}
                  </option>
                ))}
              </select>
              {valueOf("launch_slug") ? (
                <Link
                  to={`/admin/course-launches?slug=${encodeURIComponent(valueOf("launch_slug") as string)}`}
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  Manage <ExternalLink className="w-3 h-3" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-primary/10">
          <div className="text-xs font-poppins font-semibold text-primary uppercase tracking-wide">Website</div>

          <label className="flex items-center gap-2 rounded-md border border-input bg-white px-3 py-2 cursor-pointer">
            <Switch
              checked={!!valueOf("include_on_speaker_page")}
              onCheckedChange={(v) => patch({ include_on_speaker_page: v })}
            />
            <span className="text-sm">
              <strong>Show on Speaker page</strong>
              <span className="block text-[11px] text-muted-foreground">Include on the facilitator's /speaking/[name] page.</span>
            </span>
          </label>

          <div className="grid md:grid-cols-3 gap-3 text-sm">
            <div>
              <Label className="text-xs">Hub / fallback URL</Label>
              <Input
                value={valueOf("current_url") ?? ""}
                onChange={(e) => patch({ current_url: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Dedicated page URL</Label>
              <Input
                placeholder="e.g. /partner/amplify/labs/goldilocks"
                value={valueOf("dedicated_url") ?? ""}
                onChange={(e) => patch({ dedicated_url: (e.target.value || null) as any })}
              />
            </div>
            <div>
              <Label className="text-xs">Anchor on hub page</Label>
              <Input
                placeholder="e.g. lab-goldilocks"
                value={valueOf("anchor_id") ?? ""}
                onChange={(e) => patch({ anchor_id: (e.target.value || null) as any })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Quiz will link to:</span>
            {url ? (
              <Link to={url} target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">
                {url} <ExternalLink className="w-3 h-3" />
              </Link>
            ) : <span className="italic">(no url)</span>}
          </div>
        </div>
      </section>
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

function rtPoolMode(tier: string): "free" | "speaking" | "none" {
  const t = (tier || "").trim().toLowerCase();
  if (t === "free") return "free";
  if (t === "speaking") return "speaking";
  return "none";
}

function RtPoolEditor({ tier, b2cValue, b2bValue, onB2cChange, onB2bChange }: RtPoolEditorProps) {
  const mode = rtPoolMode(tier);
  if (mode === "none") return null;

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
            ? "Tick each result type where this free resource should appear."
            : "Tick each B2B result type where this speaking topic should appear."}
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
