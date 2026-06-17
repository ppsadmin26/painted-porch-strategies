import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { invalidateSeoOverrideCache } from "@/hooks/useDocumentSeo";

type Props = {
  sitemapPaths: string[];
  seoPaths: Set<string>;
  onChanged: () => void;
};

type LogEntry = { path: string; status: "ok" | "skip" | "error"; message?: string };

/**
 * Bulk generate SEO + AEO (key message + FAQs) for every sitemap route
 * using the `generate-page-seo` edge function. Upserts results into
 * `page_seo`, preserving any fields the AI doesn't return (og_image,
 * canonical, robots, jsonld).
 */
export default function BulkSeoGenerator({ sitemapPaths, seoPaths, onChanged }: Props) {
  const { toast } = useToast();
  const [overwrite, setOverwrite] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [currentPath, setCurrentPath] = useState<string | null>(null);

  const targets = overwrite
    ? sitemapPaths
    : sitemapPaths.filter((p) => !seoPaths.has(p));

  const run = async () => {
    if (targets.length === 0) {
      toast({ title: "Nothing to do", description: "All sitemap routes already have SEO." });
      return;
    }
    if (!confirm(`Generate SEO + AEO for ${targets.length} page${targets.length === 1 ? "" : "s"}? This calls the AI gateway once per page and can take a few minutes.`)) {
      return;
    }

    setRunning(true);
    setProgress(0);
    setTotal(targets.length);
    setLog([]);

    const { data: userRes } = await supabase.auth.getUser();
    const updatedBy = userRes.user?.id ?? null;

    let ok = 0;
    let errs = 0;

    for (let i = 0; i < targets.length; i++) {
      const path = targets[i];
      setCurrentPath(path);
      try {
        const { data, error } = await supabase.functions.invoke("generate-page-seo", {
          body: { path, context: "" },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        const cleanFaqs = Array.isArray(data?.aeo_faqs)
          ? data.aeo_faqs
              .map((f: { question?: string; answer?: string }) => ({
                question: String(f.question ?? "").trim(),
                answer: String(f.answer ?? "").trim(),
              }))
              .filter((f: { question: string; answer: string }) => f.question && f.answer)
          : [];

        // Read any existing row so we preserve manually-set fields
        // (og_image, canonical, robots, jsonld) that the AI doesn't return.
        const { data: existing } = await supabase
          .from("page_seo")
          .select("og_image, canonical, robots, jsonld")
          .eq("path", path)
          .maybeSingle();

        const payload = {
          path,
          title: data?.title || null,
          description: data?.description || null,
          og_title: data?.og_title || null,
          og_description: data?.og_description || null,
          keywords: Array.isArray(data?.keywords) && data.keywords.length ? data.keywords : null,
          aeo_summary: data?.aeo_summary || null,
          aeo_faqs: cleanFaqs.length ? (cleanFaqs as unknown as never) : null,
          og_image: existing?.og_image ?? null,
          canonical: existing?.canonical ?? null,
          robots: existing?.robots ?? null,
          jsonld: (existing?.jsonld ?? null) as never,
          updated_by: updatedBy,
        };

        const { error: upErr } = await supabase
          .from("page_seo")
          .upsert(payload, { onConflict: "path" });
        if (upErr) throw upErr;

        invalidateSeoOverrideCache(path);
        ok++;
        setLog((l) => [...l, { path, status: "ok" }]);
      } catch (err) {
        errs++;
        setLog((l) => [...l, { path, status: "error", message: String((err as Error).message || err) }]);
      }
      setProgress(i + 1);
      // Gentle pacing to avoid rate limits
      await new Promise((r) => setTimeout(r, 350));
    }

    setCurrentPath(null);
    setRunning(false);
    onChanged();
    toast({
      title: "Bulk SEO complete",
      description: `${ok} updated, ${errs} failed.`,
      variant: errs > 0 ? "destructive" : "default",
    });
  };

  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <Card className="p-5 mb-6 border-pps-teal/30">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-poppins font-semibold text-pps-navy flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pps-teal" />
            Bulk generate SEO + AEO
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Generate optimized title, meta description, key message (AEO summary), keywords, and FAQ schema for every sitemap route using AI. Preserves any manually-set OG image, canonical, robots, and JSON-LD.
          </p>
        </div>
        <Button
          onClick={run}
          disabled={running || targets.length === 0}
          className="shrink-0 bg-pps-teal hover:bg-pps-teal/90"
        >
          {running ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Generate for {targets.length} page{targets.length === 1 ? "" : "s"}</>
          )}
        </Button>
      </div>

      <label className="flex items-center gap-2 text-sm text-pps-charcoal mb-3">
        <Switch checked={overwrite} onCheckedChange={setOverwrite} disabled={running} />
        <span>Overwrite pages that already have SEO ({seoPaths.size} customized)</span>
      </label>

      {running && (
        <div className="space-y-2">
          <Progress value={pct} />
          <p className="text-xs text-muted-foreground">
            {progress} / {total} {currentPath && <>— <span className="font-mono">{currentPath}</span></>}
          </p>
        </div>
      )}

      {log.length > 0 && (
        <div className="mt-4 max-h-64 overflow-y-auto border rounded-md divide-y">
          {log.map((entry, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-1.5 text-xs">
              {entry.status === "ok" ? (
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-pps-lime shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 text-pps-raspberry shrink-0" />
              )}
              <span className="font-mono text-pps-navy truncate">{entry.path}</span>
              {entry.message && <span className="text-pps-raspberry ml-auto truncate">{entry.message}</span>}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
