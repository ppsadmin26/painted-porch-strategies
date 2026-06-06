import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Code,
  Eye,
  Image as ImageIcon,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import { invalidateSeoOverrideCache, readSeoDefaultsSnapshot, type SeoDefaultsSnapshot } from "@/hooks/useDocumentSeo";

type FaqPair = { question: string; answer: string };

type FormState = {
  title: string;
  description: string;
  og_title: string;
  og_description: string;
  og_image: string;
  canonical: string;
  keywords: string[];
  robots: string;
  jsonld: string;
  aeo_summary: string;
  aeo_faqs: FaqPair[];
};

const EMPTY: FormState = {
  title: "",
  description: "",
  og_title: "",
  og_description: "",
  og_image: "",
  canonical: "",
  keywords: [],
  robots: "",
  jsonld: "",
  aeo_summary: "",
  aeo_faqs: [],
};

type Props = {
  path: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const TITLE_WARN = 60;
const TITLE_ERR = 70;
const DESC_WARN = 160;
const DESC_ERR = 200;
const AEO_WARN = 320;
const AEO_ERR = 500;
const SEO_IMAGE_PREFIX = "seo/";
const SEO_BUCKET = "blog-images";

const ROBOTS_OPTIONS: { value: string; label: string; description: string }[] = [
  { value: "__default__", label: "Use site default", description: "Falls back to the page's hardcoded value, or 'index, follow'." },
  { value: "index, follow", label: "index, follow", description: "Standard — indexed and links followed." },
  { value: "noindex, follow", label: "noindex, follow", description: "Hidden from search but links still followed." },
  { value: "index, nofollow", label: "index, nofollow", description: "Indexed but links not followed." },
  { value: "noindex, nofollow", label: "noindex, nofollow", description: "Completely hidden from search engines." },
  { value: "noindex, nofollow, noarchive", label: "noindex, nofollow, noarchive", description: "Hidden + no cached copy stored." },
  { value: "__custom__", label: "Custom…", description: "Enter your own directive string." },
];

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

function buildAeoJsonLd(faqs: FaqPair[]): Record<string, unknown> | null {
  const clean = faqs
    .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
    .filter((f) => f.question && f.answer);
  if (clean.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: clean.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

function validateAeoJsonLd(faqs: FaqPair[]): { preview: string | null; issue?: Issue } {
  const clean = faqs
    .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
    .filter((f) => f.question || f.answer);

  if (clean.length === 0) {
    if (faqs.length > 0) {
      return { preview: null, issue: { level: "warn", message: "All FAQ pairs are empty — no FAQPage JSON-LD will be emitted.", field: "aeo_faqs" } };
    }
    return { preview: null };
  }

  for (let i = 0; i < clean.length; i++) {
    const f = clean[i];
    if (!f.question) {
      return { preview: null, issue: { level: "error", message: `FAQ #${i + 1} has an answer but no question. FAQPage JSON-LD will be malformed.`, field: "aeo_faqs" } };
    }
    if (!f.answer) {
      return { preview: null, issue: { level: "error", message: `FAQ #${i + 1} has a question but no answer. FAQPage JSON-LD will be malformed.`, field: "aeo_faqs" } };
    }
    if (f.question.length < 10) {
      return { preview: null, issue: { level: "warn", message: `FAQ #${i + 1} question is very short (${f.question.length} chars). AI engines prefer natural-language questions.`, field: "aeo_faqs" } };
    }
    if (f.answer.length < 20) {
      return { preview: null, issue: { level: "warn", message: `FAQ #${i + 1} answer is very short (${f.answer.length} chars). Provide a complete, quotable answer.`, field: "aeo_faqs" } };
    }
  }

  const jsonLd = buildAeoJsonLd(faqs);
  const preview = jsonLd ? JSON.stringify(jsonLd, null, 2) : null;
  return { preview };
}

export default function PageSeoEditorDialog({ path, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exists, setExists] = useState(false);
  const [canonicalConflict, setCanonicalConflict] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [defaults, setDefaults] = useState<SeoDefaultsSnapshot | null>(null);
  const [robotsMode, setRobotsMode] = useState<string>("__default__");
  const [aeoPreviewOpen, setAeoPreviewOpen] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !path) return;
    setLoading(true);
    setCanonicalConflict(null);
    setDefaults(readSeoDefaultsSnapshot(path));
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
          const robots = data.robots ?? "";
          const knownRobots = ROBOTS_OPTIONS.find((o) => o.value === robots);
          setRobotsMode(robots ? (knownRobots ? robots : "__custom__") : "__default__");
          const rawFaqs = (data as { aeo_faqs?: unknown }).aeo_faqs;
          const faqs: FaqPair[] = Array.isArray(rawFaqs)
            ? (rawFaqs as Array<Record<string, unknown>>)
                .map((f) => ({
                  question: String(f.question ?? ""),
                  answer: String(f.answer ?? ""),
                }))
                .filter((f) => f.question || f.answer)
            : [];
          setForm({
            title: data.title ?? "",
            description: data.description ?? "",
            og_title: data.og_title ?? "",
            og_description: data.og_description ?? "",
            og_image: data.og_image ?? "",
            canonical: data.canonical ?? "",
            keywords: data.keywords ?? [],
            robots,
            jsonld: data.jsonld ? JSON.stringify(data.jsonld, null, 2) : "",
            aeo_summary: (data as { aeo_summary?: string | null }).aeo_summary ?? "",
            aeo_faqs: faqs,
          });
        } else {
          setExists(false);
          setRobotsMode("__default__");
          setForm(EMPTY);
        }
        setLoading(false);
      });
  }, [open, path, toast]);

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
  const aeoCheck = useMemo(() => validateAeoJsonLd(form.aeo_faqs), [form.aeo_faqs]);
  const aeoPreview = aeoCheck.preview;

  const issues = useMemo<Issue[]>(() => {
    const out: Issue[] = [];
    const t = form.title.trim();
    const d = form.description.trim();
    const c = form.canonical.trim();
    const a = form.aeo_summary.trim();

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

    if (a.length > AEO_ERR) out.push({ level: "error", message: `AEO summary is ${a.length} chars (max ${AEO_ERR}).`, field: "aeo_summary" });
    else if (a.length > AEO_WARN) out.push({ level: "warn", message: `AEO summary is ${a.length} chars — recommended under ${AEO_WARN}.`, field: "aeo_summary" });

    form.aeo_faqs.forEach((f, i) => {
      if ((f.question && !f.answer) || (!f.question && f.answer)) {
        out.push({ level: "warn", message: `FAQ #${i + 1} is missing a ${f.question ? "answer" : "question"}.`, field: "aeo_faqs" });
      }
    });

    if (jsonldCheck.issue) out.push(jsonldCheck.issue);
    if (aeoCheck.issue) out.push(aeoCheck.issue);

    return out;
  }, [form, canonicalConflict, jsonldCheck, aeoCheck]);

  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warn");

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const fieldIssue = (field: string) => issues.find((i) => i.field === field);

  const addKeyword = (input: string) => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !form.keywords.includes(trimmed)) {
      setForm((f) => ({ ...f, keywords: [...f.keywords, trimmed] }));
    }
    setKeywordInput("");
  };

  const removeKeyword = (tag: string) => {
    setForm((f) => ({ ...f, keywords: f.keywords.filter((k) => k !== tag) }));
  };

  const handleGenerate = async () => {
    if (!path) return;
    setGenerating(true);
    try {
      const context = [form.title, form.description, form.og_description, form.aeo_summary].filter(Boolean).join("\n");
      const { data, error } = await supabase.functions.invoke("generate-page-seo", {
        body: { path, context },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setForm((f) => ({
        ...f,
        title: data.title || f.title,
        description: data.description || f.description,
        og_title: data.og_title || f.og_title,
        og_description: data.og_description || f.og_description,
        keywords: Array.isArray(data.keywords) && data.keywords.length ? data.keywords : f.keywords,
        aeo_summary: data.aeo_summary || f.aeo_summary,
        aeo_faqs:
          Array.isArray(data.aeo_faqs) && data.aeo_faqs.length
            ? data.aeo_faqs.map((p: { question?: string; answer?: string }) => ({
                question: String(p.question ?? ""),
                answer: String(p.answer ?? ""),
              }))
            : f.aeo_faqs,
      }));
      toast({ title: "SEO + AEO generated", description: "Review and tweak before saving." });
    } catch (err) {
      toast({ title: "Generate failed", description: String((err as Error).message || err), variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const safe = file.name.replace(/[^a-z0-9.\-_]/gi, "_").slice(0, 60);
      const key = `${SEO_IMAGE_PREFIX}${Date.now()}-${safe}`;
      const { error: upErr } = await supabase.storage.from(SEO_BUCKET).upload(key, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type || `image/${ext}`,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(SEO_BUCKET).getPublicUrl(key);
      setForm((f) => ({ ...f, og_image: data.publicUrl }));
      toast({ title: "Image uploaded", description: "Set as OG image." });
    } catch (err) {
      toast({ title: "Upload failed", description: String((err as Error).message || err), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

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
      const cleanFaqs = form.aeo_faqs
        .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
        .filter((f) => f.question && f.answer);
      const { data: userRes } = await supabase.auth.getUser();
      const payload = {
        path,
        title: form.title.trim() || null,
        description: form.description.trim() || null,
        og_title: form.og_title.trim() || null,
        og_description: form.og_description.trim() || null,
        og_image: form.og_image.trim() || null,
        canonical: form.canonical.trim() || null,
        keywords: form.keywords.length ? form.keywords : null,
        robots: form.robots.trim() || null,
        jsonld: jsonldCheck.parsed as never,
        aeo_summary: form.aeo_summary.trim() || null,
        aeo_faqs: cleanFaqs.length ? (cleanFaqs as unknown as never) : null,
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
  const aeoLen = form.aeo_summary.length;

  // Default-value helpers
  const useDefault = (overrideKey: keyof FormState, defaultValue?: string | null) => {
    if (!defaultValue) return;
    if (overrideKey === "keywords") {
      const arr = defaultValue.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean);
      setForm((f) => ({ ...f, keywords: arr }));
      return;
    }
    setForm((f) => ({ ...f, [overrideKey]: defaultValue }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="font-poppins">
                SEO + AEO for <span className="text-pps-teal">{path}</span>
              </DialogTitle>
              <DialogDescription>
                Anything you set here overrides the page's hardcoded SEO. Leave a field blank to fall back to the default.
              </DialogDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 border-pps-teal/40 text-pps-teal hover:bg-pps-teal/10"
              onClick={handleGenerate}
              disabled={generating || loading || !path}
            >
              {generating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
              Generate with AI
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading
          </div>
        ) : (
          <>
            {!defaults && (
              <div className="flex items-start gap-2 text-xs bg-muted text-muted-foreground rounded-md px-3 py-2 mt-2">
                <Eye className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  Defaults haven't been recorded for this page yet. Visit{" "}
                  <a href={path ?? "#"} target="_blank" rel="noreferrer" className="underline text-pps-teal">
                    {path}
                  </a>{" "}
                  once, then reopen this dialog to see what would render without an override.
                </span>
              </div>
            )}

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
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="social">Social / OG</TabsTrigger>
                <TabsTrigger value="aeo">AEO</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                <TabsTrigger value="jsonld">JSON-LD</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <Field
                  label="Title"
                  hint={`${titleLen}/${TITLE_WARN} recommended (hard cap ${TITLE_ERR})`}
                  hintTone={titleLen > TITLE_ERR ? "error" : titleLen > TITLE_WARN ? "warn" : undefined}
                  fieldIssue={fieldIssue("title")}
                  defaultValue={defaults?.title}
                  onUseDefault={() => useDefault("title", defaults?.title)}
                >
                  <Input value={form.title} onChange={update("title")} placeholder={defaults?.title || "Page title"} maxLength={120} />
                </Field>
                <Field
                  label="Meta description"
                  hint={`${descLen}/${DESC_WARN} recommended (hard cap ${DESC_ERR})`}
                  hintTone={descLen > DESC_ERR ? "error" : descLen > DESC_WARN ? "warn" : undefined}
                  fieldIssue={fieldIssue("description")}
                  defaultValue={defaults?.description}
                  onUseDefault={() => useDefault("description", defaults?.description)}
                >
                  <Textarea
                    value={form.description}
                    onChange={update("description")}
                    rows={3}
                    placeholder={defaults?.description || "Short description shown in search results"}
                    maxLength={300}
                  />
                </Field>
                <Field
                  label="Keywords"
                  hint="Press Enter or click Add to create a keyword pill. Click a pill to remove it."
                  defaultValue={defaults?.keywords?.join(", ")}
                  onUseDefault={() => useDefault("keywords", defaults?.keywords?.join(", "))}
                >
                  <div className="flex gap-2">
                    <Input
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword(keywordInput))}
                      placeholder={defaults?.keywords?.join(", ") || "Add keyword"}
                    />
                    <Button size="sm" variant="outline" onClick={() => addKeyword(keywordInput)}>
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.keywords.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeKeyword(tag)}>
                        {tag} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </Field>
              </TabsContent>

              <TabsContent value="social" className="space-y-4 pt-4">
                <Field
                  label="OG title"
                  hint="Defaults to the Title above"
                  defaultValue={defaults?.ogTitle}
                  onUseDefault={() => useDefault("og_title", defaults?.ogTitle)}
                >
                  <Input value={form.og_title} onChange={update("og_title")} placeholder={defaults?.ogTitle} />
                </Field>
                <Field
                  label="OG description"
                  hint="Defaults to the meta description above"
                  defaultValue={defaults?.ogDescription}
                  onUseDefault={() => useDefault("og_description", defaults?.ogDescription)}
                >
                  <Textarea value={form.og_description} onChange={update("og_description")} rows={2} placeholder={defaults?.ogDescription} />
                </Field>
                <Field
                  label="OG image"
                  hint="Use the page's hardcoded hero (clear field), pick from the library, upload, or paste a URL."
                  defaultValue={defaults?.ogImage}
                  onUseDefault={() => useDefault("og_image", defaults?.ogImage)}
                >
                  <div className="space-y-2">
                    <Input
                      value={form.og_image}
                      onChange={update("og_image")}
                      placeholder={defaults?.ogImage || "https://… or /images/og.jpg"}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setForm((f) => ({ ...f, og_image: "" }))}
                        disabled={!form.og_image}
                      >
                        <X className="w-3.5 h-3.5 mr-1.5" /> Use page hero
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setLibraryOpen(true)}>
                        <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Choose from library
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1.5" />}
                        Upload new
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUpload(f);
                          e.target.value = "";
                        }}
                      />
                    </div>
                    {form.og_image && (
                      <div className="mt-2 rounded-md border border-border bg-muted/30 p-2">
                        <img
                          src={form.og_image}
                          alt="OG preview"
                          className="max-h-40 rounded object-contain mx-auto"
                          onError={(e) => ((e.currentTarget.style.display = "none"))}
                        />
                      </div>
                    )}
                  </div>
                </Field>
              </TabsContent>

              <TabsContent value="aeo" className="space-y-4 pt-4">
                <div className="text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2 border border-border">
                  <strong className="text-pps-navy">Answer Engine Optimization</strong> shapes how AI engines (ChatGPT,
                  Perplexity, Google AI Overviews) quote this page. The summary becomes a citable answer; FAQs are emitted
                  as FAQPage structured data.
                </div>

                <Field
                  label="AEO summary"
                  hint={`${aeoLen}/${AEO_WARN} recommended (hard cap ${AEO_ERR}). Lead with the answer — what is this page about, in plain language.`}
                  hintTone={aeoLen > AEO_ERR ? "error" : aeoLen > AEO_WARN ? "warn" : undefined}
                  fieldIssue={fieldIssue("aeo_summary")}
                >
                  <Textarea
                    value={form.aeo_summary}
                    onChange={update("aeo_summary")}
                    rows={4}
                    placeholder="In 2-3 sentences, answer the question this page is the answer to."
                    maxLength={800}
                  />
                </Field>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-poppins text-sm text-pps-navy">FAQ pairs</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setForm((f) => ({ ...f, aeo_faqs: [...f.aeo_faqs, { question: "", answer: "" }] }))
                      }
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" /> Add FAQ
                    </Button>
                  </div>
                  {form.aeo_faqs.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No FAQs yet. Add 3-5 natural-language questions a user might ask an AI engine.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {form.aeo_faqs.map((faq, idx) => (
                        <div key={idx} className="rounded-md border border-border p-3 space-y-2 bg-muted/20">
                          <div className="flex items-start gap-2">
                            <Input
                              value={faq.question}
                              onChange={(e) =>
                                setForm((f) => {
                                  const next = [...f.aeo_faqs];
                                  next[idx] = { ...next[idx], question: e.target.value };
                                  return { ...f, aeo_faqs: next };
                                })
                              }
                              placeholder={`Question ${idx + 1}`}
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="text-pps-raspberry hover:bg-pps-raspberry/10 shrink-0"
                              onClick={() =>
                                setForm((f) => ({ ...f, aeo_faqs: f.aeo_faqs.filter((_, i) => i !== idx) }))
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          <Textarea
                            value={faq.answer}
                            onChange={(e) =>
                              setForm((f) => {
                                const next = [...f.aeo_faqs];
                                next[idx] = { ...next[idx], answer: e.target.value };
                                return { ...f, aeo_faqs: next };
                              })
                            }
                            rows={2}
                            placeholder="Direct, quotable answer in 2-4 sentences."
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AEO JSON-LD lint preview */}
                <div className="rounded-md border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setAeoPreviewOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-muted/30 hover:bg-muted/50 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Code className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-pps-navy">FAQPage JSON-LD preview & lint</span>
                      {aeoCheck.issue ? (
                        aeoCheck.issue.level === "error" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-pps-raspberry bg-pps-raspberry/10 px-1.5 py-0.5 rounded">
                            <AlertCircle className="w-3 h-3" /> Error
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-pps-navy bg-pps-gold/15 px-1.5 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" /> Warning
                          </span>
                        )
                      ) : aeoPreview ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" /> Valid
                        </span>
                      ) : null}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{aeoPreviewOpen ? "Hide" : "Show"}</span>
                  </button>
                  {aeoPreviewOpen && (
                    <div className="p-3 bg-muted/20">
                      {aeoPreview ? (
                        <>
                          <pre className="font-mono text-[11px] text-muted-foreground whitespace-pre-wrap break-all bg-muted/40 rounded-md p-2 border border-border">
                            {aeoPreview}
                          </pre>
                          <p className="text-[10px] text-muted-foreground mt-1.5">
                            This FAQPage structured data is emitted automatically on the live page.
                            Do not duplicate it in the JSON-LD tab.
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground py-2">
                          {aeoCheck.issue?.message ?? "Add at least one complete FAQ pair to generate FAQPage JSON-LD."}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 pt-4">
                <Field
                  label="Canonical URL"
                  hint="Override the canonical link (full URL or /-relative path)"
                  fieldIssue={fieldIssue("canonical")}
                  defaultValue={defaults?.canonical}
                  onUseDefault={() => useDefault("canonical", defaults?.canonical)}
                >
                  <Input value={form.canonical} onChange={update("canonical")} placeholder={defaults?.canonical || "https://pps-website.lovable.app/this-page"} />
                </Field>

                <Field
                  label="Robots directive"
                  hint={`Default: ${defaults?.robots || "index, follow"}`}
                >
                  <div className="space-y-2">
                    <Select
                      value={robotsMode}
                      onValueChange={(v) => {
                        setRobotsMode(v);
                        if (v === "__default__") setForm((f) => ({ ...f, robots: "" }));
                        else if (v === "__custom__") setForm((f) => ({ ...f, robots: f.robots || "" }));
                        else setForm((f) => ({ ...f, robots: v }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROBOTS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex flex-col items-start">
                              <span>{opt.label}</span>
                              <span className="text-[10px] text-muted-foreground">{opt.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {robotsMode === "__custom__" && (
                      <Input
                        value={form.robots}
                        onChange={update("robots")}
                        placeholder="e.g. noindex, follow, max-snippet:-1"
                      />
                    )}
                  </div>
                </Field>
              </TabsContent>

              <TabsContent value="jsonld" className="space-y-4 pt-4">
                <Field
                  label="JSON-LD"
                  hint="Paste a single object or an array of objects. Must be valid JSON with @context and @type. AEO FAQs are emitted automatically — don't duplicate them here."
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

        <ImageLibraryDialog
          open={libraryOpen}
          onOpenChange={setLibraryOpen}
          onSelect={(url) => {
            setForm((f) => ({ ...f, og_image: url }));
            setLibraryOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  hint,
  hintTone,
  fieldIssue,
  defaultValue,
  onUseDefault,
  children,
}: {
  label: string;
  hint?: string;
  hintTone?: "warn" | "error";
  fieldIssue?: Issue;
  defaultValue?: string | null;
  onUseDefault?: () => void;
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
      <div className="flex items-center justify-between gap-2">
        <Label className="font-poppins text-sm text-pps-navy">{label}</Label>
        {defaultValue && onUseDefault && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[10px] text-pps-teal hover:bg-pps-teal/10"
            onClick={onUseDefault}
          >
            <Undo2 className="w-3 h-3 mr-1" /> Use default
          </Button>
        )}
      </div>
      {children}
      {defaultValue && (
        <p className="text-[10px] text-muted-foreground italic line-clamp-2" title={defaultValue}>
          <span className="font-semibold not-italic">Default:</span> {defaultValue}
        </p>
      )}
      {hint && <p className={`text-[11px] ${toneClass}`}>{hint}</p>}
    </div>
  );
}

function ImageLibraryDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}) {
  const { toast } = useToast();
  const [items, setItems] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (async () => {
      try {
        const folders = ["seo", ""]; // SEO uploads first, then blog images
        const seen = new Set<string>();
        const out: { name: string; url: string }[] = [];
        for (const folder of folders) {
          const { data, error } = await supabase.storage
            .from(SEO_BUCKET)
            .list(folder, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
          if (error) continue;
          for (const f of data || []) {
            if (!f.name || f.name.startsWith(".")) continue;
            if (f.id === null) continue; // folder placeholder
            const key = folder ? `${folder}/${f.name}` : f.name;
            if (seen.has(key)) continue;
            seen.add(key);
            const { data: pub } = supabase.storage.from(SEO_BUCKET).getPublicUrl(key);
            if (/\.(jpe?g|png|webp|gif|svg)$/i.test(f.name)) {
              out.push({ name: key, url: pub.publicUrl });
            }
          }
        }
        setItems(out);
      } catch (err) {
        toast({ title: "Failed to load library", description: String(err), variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [open, toast]);

  const filtered = items.filter((it) => !query.trim() || it.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-poppins">Image library</DialogTitle>
          <DialogDescription>
            Pick an image stored in the site's <span className="font-mono text-xs">{SEO_BUCKET}</span> bucket (SEO uploads + blog images).
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Search by filename"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-3"
        />
        {loading ? (
          <div className="py-12 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No images found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map((it) => (
              <button
                key={it.name}
                type="button"
                onClick={() => onSelect(it.url)}
                className="group rounded-md border border-border bg-muted/30 overflow-hidden hover:border-pps-teal hover:shadow-md transition text-left"
              >
                <div className="aspect-video bg-muted overflow-hidden">
                  <img
                    src={it.url}
                    alt={it.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                <p className="text-[10px] px-2 py-1.5 text-muted-foreground truncate" title={it.name}>{it.name}</p>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
