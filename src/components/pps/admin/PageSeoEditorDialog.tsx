import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { invalidateSeoOverrideCache } from "@/hooks/useDocumentSeo";

type FormState = {
  title: string;
  description: string;
  og_title: string;
  og_description: string;
  og_image: string;
  canonical: string;
  keywords: string;
  robots: string;
  jsonld: string;
};

const EMPTY: FormState = {
  title: "",
  description: "",
  og_title: "",
  og_description: "",
  og_image: "",
  canonical: "",
  keywords: "",
  robots: "",
  jsonld: "",
};

type Props = {
  path: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Validation thresholds
const TITLE_WARN = 60;
const TITLE_ERR = 70;
const DESC_WARN = 160;
const DESC_ERR = 200;

type Issue = { level: "warn" | "error"; message: string; field?: string };

function validateJsonLd(raw: string): { parsed: unknown; issue?: Issue } {
  const trimmed = raw.trim();
  if (!trimmed) return { parsed: null };
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (e) {
    return { parsed: null, issue: { level: "error", message: `JSON-LD is not valid JSON: ${(e as Error).message}`, field: "jsonld" } };
  }
  const checkOne = (obj: unknown): string | null => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return "Each JSON-LD entry must be an object.";
    const o = obj as Record<string, unknown>;
    if (!o["@context"]) return 'JSON-LD is missing "@context" (usually "https://schema.org").';
    if (!o["@type"]) return 'JSON-LD is missing "@type".';
    return null;
  };
  const items = Array.isArray(parsed) ? parsed : [parsed];
  for (const item of items) {
    const err = checkOne(item);
    if (err) return { parsed, issue: { level: "error", message: err, field: "jsonld" } };
  }
  return { parsed };
}

export default function PageSeoEditorDialog({ path, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exists, setExists] = useState(false);
  const [canonicalConflict, setCanonicalConflict] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !path) return;
    setLoading(true);
    setCanonicalConflict(null);
    supabase
      .from("page_seo")
      .select("*")
      .eq("path", path)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          toast({ title: "Failed to load SEO", description: error.message, variant: "destructive" });
        }
        if (data) {
          setExists(true);
          setForm({
            title: data.title ?? "",
            description: data.description ?? "",
            og_title: data.og_title ?? "",
            og_description: data.og_description ?? "",
            og_image: data.og_image ?? "",
            canonical: data.canonical ?? "",
            keywords: (data.keywords ?? []).join(", "),
            robots: data.robots ?? "",
            jsonld: data.jsonld ? JSON.stringify(data.jsonld, null, 2) : "",
          });
        } else {
          setExists(false);
          setForm(EMPTY);
        }
        setLoading(false);
      });
  }, [open, path, toast]);

  // Async duplicate canonical check (debounced)
  useEffect(() => {
    if (!open || !path) return;
    const c = form.canonical.trim();
    if (!c) {
      setCanonicalConflict(null);
      return;
    }
    const handle = setTimeout(async () => {
      const { data, error } = await supabase
        .from("page_seo")
        .select("path")
        .eq("canonical", c)
        .neq("path", path)
        .limit(1);
      if (!error && data && data.length > 0) {
        setCanonicalConflict(data[0].path);
      } else {
        setCanonicalConflict(null);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [form.canonical, open, path]);

  const jsonldCheck = useMemo(() => validateJsonLd(form.jsonld), [form.jsonld]);

  const issues = useMemo<Issue[]>(() => {
    const out: Issue[] = [];
    const t = form.title.trim();
    const d = form.description.trim();
    const c = form.canonical.trim();

    if (!t) out.push({ level: "warn", message: "Title is empty — page will fall back to hardcoded value.", field: "title" });
    else if (t.length > TITLE_ERR) out.push({ level: "error", message: `Title is ${t.length} chars (max ${TITLE_ERR}). Search engines will truncate it.`, field: "title" });
    else if (t.length > TITLE_WARN) out.push({ level: "warn", message: `Title is ${t.length} chars — recommended under ${TITLE_WARN}.`, field: "title" });

    if (!d) out.push({ level: "warn", message: "Meta description is empty — page will fall back to hardcoded value.", field: "description" });
    else if (d.length > DESC_ERR) out.push({ level: "error", message: `Description is ${d.length} chars (max ${DESC_ERR}). It will be truncated.`, field: "description" });
    else if (d.length > DESC_WARN) out.push({ level: "warn", message: `Description is ${d.length} chars — recommended under ${DESC_WARN}.`, field: "description" });

    if (!c) {
      out.push({ level: "warn", message: "Canonical URL is empty — make sure a default canonical is set elsewhere.", field: "canonical" });
    } else {
      if (!/^(https?:\/\/|\/)/.test(c)) out.push({ level: "warn", message: 'Canonical should start with "https://" or "/".', field: "canonical" });
      if (canonicalConflict) out.push({ level: "error", message: `Duplicate canonical — already used by ${canonicalConflict}.`, field: "canonical" });
    }

    if (jsonldCheck.issue) out.push(jsonldCheck.issue);

    return out;
  }, [form, canonicalConflict, jsonldCheck]);

  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warn");

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const fieldIssue = (field: string) => issues.find((i) => i.field === field);

  const handleSave = async () => {
    if (!path) return;
    if (errors.length > 0) {
      toast({ title: "Fix errors before saving", description: errors[0].message, variant: "destructive" });
      return;
    }
    if (warnings.length > 0) {
      const ok = confirm(`There ${warnings.length === 1 ? "is 1 warning" : `are ${warnings.length} warnings`}. Save anyway?\n\n• ${warnings.map((w) => w.message).join("\n• ")}`);
      if (!ok) return;
    }
    setSaving(true);
    try {
      const keywordsArr = form.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      const { data: userRes } = await supabase.auth.getUser();
      const payload = {
        path,
        title: form.title.trim() || null,
        description: form.description.trim() || null,
        og_title: form.og_title.trim() || null,
        og_description: form.og_description.trim() || null,
        og_image: form.og_image.trim() || null,
        canonical: form.canonical.trim() || null,
        keywords: keywordsArr.length ? keywordsArr : null,
        robots: form.robots.trim() || null,
        jsonld: jsonldCheck.parsed as never,
        updated_by: userRes.user?.id ?? null,
      };
      const { error } = await supabase.from("page_seo").upsert(payload, { onConflict: "path" });
      if (error) throw error;
      invalidateSeoOverrideCache(path);
      toast({ title: "SEO saved", description: path });
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Save failed", description: String(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!path) return;
    if (!confirm(`Remove SEO override for ${path}? The page will fall back to the hardcoded values.`)) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("page_seo").delete().eq("path", path);
      if (error) throw error;
      invalidateSeoOverrideCache(path);
      toast({ title: "SEO override removed", description: path });
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Delete failed", description: String(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const titleLen = form.title.length;
  const descLen = form.description.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-poppins">
            SEO for <span className="text-pps-teal">{path}</span>
          </DialogTitle>
          <DialogDescription>
            Anything you set here overrides the page's hardcoded SEO. Leave a field blank to fall back to code defaults.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading
          </div>
        ) : (
          <>
            {(errors.length > 0 || warnings.length > 0) && (
              <div className="space-y-1.5 mt-2">
                {errors.map((iss, i) => (
                  <div key={`e${i}`} className="flex items-start gap-2 text-xs bg-pps-raspberry/10 text-pps-raspberry rounded-md px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{iss.message}</span>
                  </div>
                ))}
                {warnings.map((iss, i) => (
                  <div key={`w${i}`} className="flex items-start gap-2 text-xs bg-pps-gold/15 text-pps-navy rounded-md px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{iss.message}</span>
                  </div>
                ))}
              </div>
            )}

            <Tabs defaultValue="basic" className="mt-2">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="social">Social / OG</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                <TabsTrigger value="jsonld">JSON-LD</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <Field
                  label="Title"
                  hint={`${titleLen}/${TITLE_WARN} recommended (hard cap ${TITLE_ERR})`}
                  hintTone={titleLen > TITLE_ERR ? "error" : titleLen > TITLE_WARN ? "warn" : undefined}
                  fieldIssue={fieldIssue("title")}
                >
                  <Input value={form.title} onChange={update("title")} placeholder="Page title" maxLength={120} />
                </Field>
                <Field
                  label="Meta description"
                  hint={`${descLen}/${DESC_WARN} recommended (hard cap ${DESC_ERR})`}
                  hintTone={descLen > DESC_ERR ? "error" : descLen > DESC_WARN ? "warn" : undefined}
                  fieldIssue={fieldIssue("description")}
                >
                  <Textarea
                    value={form.description}
                    onChange={update("description")}
                    rows={3}
                    placeholder="Short description shown in search results"
                    maxLength={300}
                  />
                </Field>
                <Field label="Keywords" hint="Comma-separated">
                  <Input value={form.keywords} onChange={update("keywords")} placeholder="leadership, change, phase zero" />
                </Field>
              </TabsContent>

              <TabsContent value="social" className="space-y-4 pt-4">
                <Field label="OG title" hint="Defaults to the Title above">
                  <Input value={form.og_title} onChange={update("og_title")} />
                </Field>
                <Field label="OG description" hint="Defaults to the meta description above">
                  <Textarea value={form.og_description} onChange={update("og_description")} rows={2} />
                </Field>
                <Field label="OG image URL" hint="Use a full URL or a /-relative path">
                  <Input value={form.og_image} onChange={update("og_image")} placeholder="https://… or /images/og.jpg" />
                </Field>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 pt-4">
                <Field
                  label="Canonical URL"
                  hint="Override the canonical link (full URL or /-relative path)"
                  fieldIssue={fieldIssue("canonical")}
                >
                  <Input value={form.canonical} onChange={update("canonical")} placeholder="https://pps-website.lovable.app/this-page" />
                </Field>
                <Field
                  label="Robots"
                  hint='e.g. "index, follow" or "noindex, nofollow"'
                >
                  <Input value={form.robots} onChange={update("robots")} placeholder="index, follow" />
                </Field>
              </TabsContent>

              <TabsContent value="jsonld" className="space-y-4 pt-4">
                <Field
                  label="JSON-LD"
                  hint="Paste a single object or an array of objects. Must be valid JSON with @context and @type."
                  fieldIssue={fieldIssue("jsonld")}
                >
                  <Textarea
                    value={form.jsonld}
                    onChange={update("jsonld")}
                    rows={10}
                    className="font-mono text-xs"
                    placeholder='{"@context":"https://schema.org","@type":"WebPage","name":"…"}'
                  />
                </Field>
              </TabsContent>
            </Tabs>
          </>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {exists && (
            <Button
              variant="ghost"
              className="text-pps-raspberry hover:text-pps-raspberry hover:bg-pps-raspberry/10 mr-auto"
              onClick={handleDelete}
              disabled={saving}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Remove override
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading || errors.length > 0}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {exists ? "Save changes" : "Create override"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  hint,
  hintTone,
  fieldIssue,
  children,
}: {
  label: string;
  hint?: string;
  hintTone?: "warn" | "error";
  fieldIssue?: Issue;
  children: React.ReactNode;
}) {
  const toneClass =
    fieldIssue?.level === "error" || hintTone === "error"
      ? "text-pps-raspberry"
      : fieldIssue?.level === "warn" || hintTone === "warn"
      ? "text-pps-gold"
      : "text-muted-foreground";
  return (
    <div className="space-y-1.5">
      <Label className="font-poppins text-sm text-pps-navy">{label}</Label>
      {children}
      {hint && <p className={`text-[11px] ${toneClass}`}>{hint}</p>}
    </div>
  );
}
