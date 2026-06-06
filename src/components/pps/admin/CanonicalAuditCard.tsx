import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { invalidateSeoOverrideCache } from "@/hooks/useDocumentSeo";
import { AlertTriangle, CheckCircle2, Loader2, ShieldCheck, Wand2 } from "lucide-react";

const SITE_ORIGIN = "https://pps-website.lovable.app";

type SeoRow = {
  path: string;
  canonical: string | null;
};

type Issue =
  | { kind: "missing"; path: string; suggested: string }
  | { kind: "duplicate"; path: string; current: string; suggested: string; conflictsWith: string[] }
  | { kind: "malformed"; path: string; current: string; suggested: string };

type Props = {
  sitemapPaths: string[];
  onChanged: () => void;
};

export default function CanonicalAuditCard({ sitemapPaths, onChanged }: Props) {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [rows, setRows] = useState<SeoRow[] | null>(null);
  const [applying, setApplying] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const expected = (path: string) => `${SITE_ORIGIN}${path}`;

  const runScan = async () => {
    setScanning(true);
    try {
      const { data, error } = await supabase.from("page_seo").select("path, canonical");
      if (error) throw error;
      setRows(data ?? []);
      setSelected(new Set());
    } catch (err) {
      toast({ title: "Scan failed", description: String(err), variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  const issues = useMemo<Issue[]>(() => {
    if (!rows) return [];
    const byPath = new Map(rows.map((r) => [r.path, r] as const));

    // Duplicate index by canonical
    const dupes = new Map<string, string[]>();
    for (const r of rows) {
      if (!r.canonical) continue;
      const key = r.canonical.trim().toLowerCase();
      if (!key) continue;
      if (!dupes.has(key)) dupes.set(key, []);
      dupes.get(key)!.push(r.path);
    }

    const out: Issue[] = [];
    for (const path of sitemapPaths) {
      const row = byPath.get(path);
      const current = row?.canonical?.trim() || "";

      if (!current) {
        out.push({ kind: "missing", path, suggested: expected(path) });
        continue;
      }

      // Malformed: not absolute https URL and not /-relative
      if (!/^(https?:\/\/|\/)/.test(current)) {
        out.push({ kind: "malformed", path, current, suggested: expected(path) });
        continue;
      }

      // Duplicate: same canonical used by another path
      const sharedWith = (dupes.get(current.toLowerCase()) ?? []).filter((p) => p !== path);
      if (sharedWith.length > 0) {
        out.push({
          kind: "duplicate",
          path,
          current,
          suggested: expected(path),
          conflictsWith: sharedWith,
        });
      }
    }
    return out;
  }, [rows, sitemapPaths]);

  const allKeys = useMemo(() => issues.map((i) => i.path), [issues]);
  const toggle = (path: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  const toggleAll = () =>
    setSelected((s) => (s.size === allKeys.length ? new Set() : new Set(allKeys)));

  const applyFixes = async () => {
    if (!rows || selected.size === 0) return;
    setApplying(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const updatedBy = userRes.user?.id ?? null;
      const byPath = new Map(rows.map((r) => [r.path, r] as const));
      const toApply = issues.filter((i) => selected.has(i.path));

      // Upsert in batch; rows that don't exist get created with just path + canonical.
      const payload = toApply.map((i) => ({
        path: i.path,
        canonical: i.suggested,
        updated_by: updatedBy,
      }));

      const { error } = await supabase.from("page_seo").upsert(payload, { onConflict: "path" });
      if (error) throw error;

      toApply.forEach((i) => invalidateSeoOverrideCache(i.path));
      toast({
        title: `Applied ${toApply.length} canonical fix${toApply.length === 1 ? "" : "es"}`,
        description: "Re-running scan…",
      });
      onChanged();
      await runScan();
    } catch (err) {
      toast({ title: "Apply failed", description: String(err), variant: "destructive" });
    } finally {
      setApplying(false);
    }
  };

  return (
    <Card className="p-5 mb-6 border-pps-teal/30">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-poppins text-lg font-semibold text-pps-navy flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-pps-teal" />
            Canonical audit
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Scans every sitemap route for missing, duplicate, or malformed canonicals and suggests
            <code className="px-1">{SITE_ORIGIN}/&lt;path&gt;</code> as the fix.
          </p>
        </div>
        <Button onClick={runScan} disabled={scanning} size="sm">
          {scanning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
          {rows ? "Rescan" : "Run scan"}
        </Button>
      </div>

      {rows && issues.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-pps-lime bg-pps-lime/10 rounded-md px-3 py-2">
          <CheckCircle2 className="w-4 h-4" />
          All {sitemapPaths.length} sitemap routes have valid, unique canonicals.
        </div>
      )}

      {rows && issues.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs text-pps-teal hover:underline"
            >
              {selected.size === allKeys.length ? "Clear selection" : `Select all ${allKeys.length}`}
            </button>
            <Button
              size="sm"
              onClick={applyFixes}
              disabled={applying || selected.size === 0}
            >
              {applying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Apply {selected.size} fix{selected.size === 1 ? "" : "es"}
            </Button>
          </div>

          <div className="border rounded-md divide-y max-h-[420px] overflow-y-auto">
            {issues.map((iss) => {
              const checked = selected.has(iss.path);
              return (
                <label
                  key={iss.path}
                  className="flex items-start gap-3 p-3 hover:bg-muted/40 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(iss.path)}
                    className="mt-1 accent-pps-teal"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-poppins text-sm text-pps-navy">{iss.path}</span>
                      <IssueBadge kind={iss.kind} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      {iss.kind === "missing" ? (
                        <div>No canonical set.</div>
                      ) : (
                        <div>
                          Current: <code className="text-pps-raspberry">{iss.current}</code>
                        </div>
                      )}
                      {iss.kind === "duplicate" && (
                        <div>
                          Also used by:{" "}
                          {iss.conflictsWith.map((p, i) => (
                            <span key={p}>
                              <code>{p}</code>
                              {i < iss.conflictsWith.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </div>
                      )}
                      <div>
                        Suggested: <code className="text-pps-teal">{iss.suggested}</code>
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}

function IssueBadge({ kind }: { kind: Issue["kind"] }) {
  const label = kind === "missing" ? "missing" : kind === "duplicate" ? "duplicate" : "malformed";
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-poppins font-bold uppercase tracking-wide bg-pps-gold/20 text-pps-navy border border-pps-gold/40">
      <AlertTriangle className="w-3 h-3" />
      {label}
    </span>
  );
}
