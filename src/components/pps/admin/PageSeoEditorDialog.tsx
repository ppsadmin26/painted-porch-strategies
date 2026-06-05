import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";
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

export default function PageSeoEditorDialog({ path, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exists, setExists] = useState(false);

  useEffect(() => {
    if (!open || !path) return;
    setLoading(true);
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

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!path) return;
    setSaving(true);
    try {
      let jsonldParsed: unknown = null;
      if (form.jsonld.trim()) {
        try {
          jsonldParsed = JSON.parse(form.jsonld);
        } catch {
          toast({ title: "Invalid JSON-LD", description: "JSON-LD must be valid JSON.", variant: "destructive" });
          setSaving(false);
          return;
        }
      }
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
        jsonld: jsonldParsed as never,
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
                hint={`${form.title.length}/60 chars recommended`}
              >
                <Input value={form.title} onChange={update("title")} placeholder="Page title" maxLength={120} />
              </Field>
              <Field
                label="Meta description"
                hint={`${form.description.length}/160 chars recommended`}
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
              <Field label="Canonical URL" hint="Override the canonical link (full URL or /-relative path)">
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
                hint="Paste a single object or an array of objects. Must be valid JSON."
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
          <Button onClick={handleSave} disabled={saving || loading}>
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
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="font-poppins text-sm text-pps-navy">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
