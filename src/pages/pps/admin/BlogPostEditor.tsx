import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Save, Eye, ExternalLink, Upload, X, Star, Sparkles, Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import TiptapEditor from "@/components/pps/admin/TiptapEditor";

type PostStatus = "draft" | "pending" | "approved" | "scheduled" | "published";

interface Category {
  id: string;
  title: string;
  slug: string;
  color: string;
}

interface BlogPostDraftValues {
  title: string;
  slug: string;
  excerpt: string;
  bodyJson: any;
  coverImageUrl: string;
  status: PostStatus;
  featured: boolean;
  publishDate: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  geoTags: string[];
  aeoTags: string[];
  selectedCategories: string[];
  primaryCategoryId: string | null;
  authorId: string | null;
}

interface BlogPostLocalDraft {
  version: 1;
  savedAt: string;
  values: BlogPostDraftValues;
}

const emptyBodyJson = { type: "doc", content: [{ type: "paragraph" }] };

const getDraftStorageKey = (postId?: string | null) => `pps-blog-post-editor-draft:${postId || "new"}`;

export default function BlogPostEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const isNew = !id || id === "new";

  // Post fields
  const [title, setTitle] = useState("Untitled Post");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [bodyJson, setBodyJson] = useState<any>(emptyBodyJson);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [status, setStatus] = useState<PostStatus>("draft");
  const [featured, setFeatured] = useState(false);
  const [publishDate, setPublishDate] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [geoTags, setGeoTags] = useState<string[]>([]);
  const [aeoTags, setAeoTags] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [geoInput, setGeoInput] = useState("");
  const [aeoInput, setAeoInput] = useState("");

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [primaryCategoryId, setPrimaryCategoryId] = useState<string | null>(null);

  // Author
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [authors, setAuthors] = useState<{ id: string; full_name: string | null; is_guest_author: boolean }[]>([]);

  const [userRole, setUserRole] = useState<string>("editor");

  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [postLoaded, setPostLoaded] = useState(isNew);
  const [draftReady, setDraftReady] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const restoredDraftRef = useRef(false);
  const lastSavedSnapshotRef = useRef<string | null>(null);
  const latestDraftRef = useRef<BlogPostDraftValues | null>(null);
  const lastPersistedDraftRef = useRef<string | null>(null);
  const draftStorageKey = getDraftStorageKey(id);

  const isContributor = userRole === "contributor";

  const buildDraftValues = (): BlogPostDraftValues => ({
    title,
    slug,
    excerpt,
    bodyJson,
    coverImageUrl,
    status,
    featured,
    publishDate,
    seoTitle,
    seoDescription,
    seoKeywords,
    geoTags,
    aeoTags,
    selectedCategories,
    primaryCategoryId,
    authorId,
  });

  const applyDraftValues = (values: BlogPostDraftValues) => {
    setTitle(values.title);
    setSlug(values.slug);
    setExcerpt(values.excerpt);
    setBodyJson(values.bodyJson || emptyBodyJson);
    setCoverImageUrl(values.coverImageUrl || "");
    setStatus(values.status || "draft");
    setFeatured(Boolean(values.featured));
    setPublishDate(values.publishDate || "");
    setSeoTitle(values.seoTitle || "");
    setSeoDescription(values.seoDescription || "");
    setSeoKeywords(values.seoKeywords || []);
    setGeoTags(values.geoTags || []);
    setAeoTags(values.aeoTags || []);
    setSelectedCategories(values.selectedCategories || []);
    setPrimaryCategoryId(values.primaryCategoryId || null);
    setAuthorId(values.authorId || null);
  };

  const persistLocalDraft = (values: BlogPostDraftValues) => {
    try {
      const payload = JSON.stringify({
        version: 1,
        savedAt: new Date().toISOString(),
        values,
      } satisfies BlogPostLocalDraft);
      if (payload !== lastPersistedDraftRef.current) {
        localStorage.setItem(draftStorageKey, payload);
        lastPersistedDraftRef.current = payload;
      }
    } catch {
      // If local storage is unavailable or full, keep editing without blocking the page.
    }
  };

  // Default author to current user for contributors (and new posts)
  useEffect(() => {
    if (isContributor && user && !authorId) {
      setAuthorId(user.id);
    }
  }, [isContributor, user, authorId]);


  // Load categories, authors, and current user role
  useEffect(() => {
    supabase
      .from("blog_categories")
      .select("*")
      .order("title")
      .then(({ data }) => {
        if (data) setCategories(data as Category[]);
      });

    supabase
      .from("profiles")
      .select("id, full_name, is_guest_author")
      .eq("is_author", true)
      .eq("is_active", true)
      .order("full_name")
      .then(({ data }) => {
        if (data) setAuthors(data);
      });

    // Fetch current user's role
    if (user) {
      supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setUserRole(data.role);
        });
    }
  }, [user]);

  // Load post if editing
  useEffect(() => {
    restoredDraftRef.current = false;
    setDraftReady(false);
    setHasUnsavedChanges(false);

    if (isNew || !id) {
      setPostLoaded(true);
      return;
    }

    setPostLoaded(false);
    const loadPost = async () => {
      const { data: post } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();
      if (!post) return navigate("/admin/posts");

      setTitle(post.title);
      setSlug(post.slug || "");
      setExcerpt(post.excerpt || "");
      setAuthorId(post.author_id || null);
      setBodyJson(post.body_json || emptyBodyJson);
      setCoverImageUrl(post.cover_image_url || "");
      setStatus(post.status as PostStatus);
      setFeatured(post.featured);
      setPublishDate(post.publish_date ? new Date(post.publish_date).toISOString().slice(0, 16) : "");
      setSeoTitle(post.seo_title || "");
      setSeoDescription(post.seo_description || "");
      setSeoKeywords(post.seo_keywords || []);
      setGeoTags(post.geo_tags || []);
      setAeoTags(post.aeo_tags || []);

      // Load post categories (including primary flag)
      const { data: postCats } = await supabase
        .from("blog_post_categories")
        .select("category_id, is_primary")
        .eq("post_id", id);
      if (postCats) {
        setSelectedCategories(postCats.map((c: any) => c.category_id));
        const primary = postCats.find((c: any) => c.is_primary);
        if (primary) setPrimaryCategoryId(primary.category_id);
      }
      setPostLoaded(true);
    };
    loadPost();
  }, [id, isNew, navigate]);

  useEffect(() => {
    if (!postLoaded || restoredDraftRef.current) return;

    const snapshot = JSON.stringify(buildDraftValues());
    lastSavedSnapshotRef.current = snapshot;
    restoredDraftRef.current = true;

    try {
      const rawDraft = localStorage.getItem(draftStorageKey);
      if (rawDraft) {
        const draft = JSON.parse(rawDraft) as BlogPostLocalDraft;
        if (draft?.version === 1 && draft.values) {
          applyDraftValues(draft.values);
          setHasUnsavedChanges(true);
          toast({
            title: "Unsaved edits restored",
            description: "Your browser kept a local copy after the page refreshed.",
          });
        }
      }
    } catch {
      localStorage.removeItem(draftStorageKey);
    } finally {
      setDraftReady(true);
    }
  }, [postLoaded, draftStorageKey]);

  useEffect(() => {
    if (!draftReady) return;

    const values = buildDraftValues();
    latestDraftRef.current = values;
    const snapshot = JSON.stringify(values);
    const changed = snapshot !== lastSavedSnapshotRef.current;
    setHasUnsavedChanges(changed);

    if (!changed) return;

    persistLocalDraft(values);

  }, [
    draftReady,
    draftStorageKey,
    title,
    slug,
    excerpt,
    bodyJson,
    coverImageUrl,
    status,
    featured,
    publishDate,
    seoTitle,
    seoDescription,
    seoKeywords,
    geoTags,
    aeoTags,
    selectedCategories,
    primaryCategoryId,
    authorId,
  ]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isNew || !slug) setSlug(generateSlug(val));
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    const ext = file.name.split(".").pop();
    const path = `covers/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("blog-images").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
      setCoverImageUrl(data.publicUrl);
    }
    setUploadingCover(false);
  };

  const addTag = (
    input: string,
    setInput: (v: string) => void,
    tags: string[],
    setTags: (v: string[]) => void
  ) => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag: string, tags: string[], setTags: (v: string[]) => void) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    // Auto-determine scheduled vs published
    let effectiveStatus: PostStatus = status;
    if (status === "published" || status === "scheduled") {
      const pubDate = publishDate ? new Date(publishDate) : null;
      if (pubDate && pubDate > new Date()) {
        effectiveStatus = "scheduled";
      } else {
        effectiveStatus = "published";
      }
    }

    const postData = {
      title,
      slug: slug || generateSlug(title),
      excerpt: (seoDescription && seoDescription.trim().length > 0) ? seoDescription : excerpt,
      body_json: bodyJson,
      cover_image_url: coverImageUrl || null,
      status: effectiveStatus,
      featured,
      author_id: authorId || user.id,
      publish_date: publishDate ? new Date(publishDate).toISOString() : null,
      seo_title: seoTitle,
      seo_description: seoDescription,
      seo_keywords: seoKeywords,
      geo_tags: geoTags,
      aeo_tags: aeoTags,
      updated_at: new Date().toISOString(),
    };

    try {
      let postId = id;

      if (isNew) {
        const { data, error } = await supabase
          .from("blog_posts")
          .insert(postData)
          .select("id")
          .single();
        if (error) throw error;
        postId = data.id;
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", id);
        if (error) throw error;
      }

      // Sync categories with primary flag
      await supabase.from("blog_post_categories").delete().eq("post_id", postId!);
      if (selectedCategories.length > 0) {
        await supabase.from("blog_post_categories").insert(
          selectedCategories.map((catId) => ({
            post_id: postId!,
            category_id: catId,
            is_primary: catId === primaryCategoryId,
          }))
        );
      }

      toast({ title: "Saved!", description: `Post ${isNew ? "created" : "updated"} successfully.` });
      lastSavedSnapshotRef.current = JSON.stringify(buildDraftValues());
      localStorage.removeItem(draftStorageKey);
      setHasUnsavedChanges(false);
      if (isNew) navigate(`/admin/posts/${postId}`, { replace: true });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(catId)) {
        // If removing the primary category, clear primary
        if (primaryCategoryId === catId) setPrimaryCategoryId(null);
        return prev.filter((c) => c !== catId);
      }
      // Auto-set as primary if it's the first category selected
      if (prev.length === 0) setPrimaryCategoryId(catId);
      return [...prev, catId];
    });
  };

  const togglePrimary = (catId: string) => {
    setPrimaryCategoryId((prev) => (prev === catId ? null : catId));
  };

  const statusColors: Record<PostStatus, string> = {
    draft: "bg-muted text-muted-foreground",
    pending: "bg-secondary/20 text-secondary-foreground",
    approved: "bg-accent/20 text-accent-foreground",
    scheduled: "bg-gold/20 text-gold",
    published: "bg-primary/20 text-primary",
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/posts")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Posts
            </Button>
            <Badge className={statusColors[status]}>{status.toUpperCase()}</Badge>
          </div>
          <div className="flex items-center gap-2">
            {slug && (status === "published" || status === "scheduled") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/resources/insights/${slug}`, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-1" /> View on Website
              </Button>
            )}
            <Button variant="outline" size="sm" disabled>
              <Eye className="h-4 w-4 mr-1" /> Preview
            </Button>
            {!isNew && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30">
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove "{title}" and its category links. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={async () => {
                        try {
                          await supabase.from("blog_post_categories").delete().eq("post_id", id!);
                          const { error } = await supabase.from("blog_posts").delete().eq("id", id!);
                          if (error) throw error;
                          toast({ title: "Deleted", description: "Post removed." });
                          navigate("/admin/posts");
                        } catch (err: any) {
                          toast({ title: "Delete failed", description: err.message, variant: "destructive" });
                        }
                      }}
                    >
                      Delete post
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6`}>
        {/* Main Content */}
        <div className="space-y-6">
          {/* Cover Image */}
          <div>
            {coverImageUrl ? (
              <div className="relative rounded-lg overflow-hidden">
                <img src={coverImageUrl} alt="Cover" className="w-full h-64 object-cover" />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => setCoverImageUrl("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-card">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  {uploadingCover ? "Uploading..." : "Click to upload cover image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCoverUpload(file);
                  }}
                />
              </label>
            )}
          </div>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post Title"
            className="w-full text-3xl md:text-4xl font-poppins font-bold bg-transparent border-none outline-none text-navy placeholder:text-muted-foreground"
          />

          {/* Excerpt, auto-synced from SEO description on save */}
          <div className="space-y-1">
            <Textarea
              value={(seoDescription && seoDescription.trim().length > 0) ? seoDescription : excerpt}
              onChange={(e) => {
                if (seoDescription && seoDescription.trim().length > 0) {
                  setSeoDescription(e.target.value);
                  setExcerpt(e.target.value);
                } else {
                  setExcerpt(e.target.value);
                }
              }}
              placeholder="Write a brief excerpt..."
              className="resize-none text-base"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Auto-synced with the SEO description. Edits here update both.
            </p>
          </div>

          {/* Editor */}
          <TiptapEditor content={bodyJson} onChange={setBodyJson} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Accordion type="multiple" defaultValue={["status", ...(isContributor ? [] : ["author", "categories", "seo"])]} className="space-y-3">
            {/* Author - hidden for contributors */}
            {!isContributor && (
            <AccordionItem value="author" className="bg-card rounded-lg border border-border px-4">
              <AccordionTrigger className="text-sm font-semibold">Author</AccordionTrigger>
              <AccordionContent className="pb-4">
                <Select value={authorId || ""} onValueChange={(v) => setAuthorId(v || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select author..." />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.full_name || "Unnamed"}{a.is_guest_author ? " (Guest)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Authors are managed in User Management.
                </p>
              </AccordionContent>
            </AccordionItem>
            )}

            {/* Status & Publishing */}
            <AccordionItem value="status" className="bg-card rounded-lg border border-border px-4">
              <AccordionTrigger className="text-sm font-semibold">Status & Publishing</AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <div>
                  <Label>Status</Label>
                  {isContributor ? (
                    <>
                      <Select
                        value={status}
                        onValueChange={(v) => {
                          if (v === "draft" || v === "pending") setStatus(v as PostStatus);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          {status !== "draft" && status !== "pending" && (
                            <SelectItem value={status} disabled>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Contributors can set status to Draft or Pending.
                      </p>
                    </>
                  ) : (
                    <Select value={status} onValueChange={(v) => setStatus(v as PostStatus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {!isContributor && (
                <>
                  <div>
                    <Label>Publish Date/Time</Label>
                    <Input
                      type="datetime-local"
                      value={publishDate}
                      onChange={(e) => setPublishDate(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to publish immediately when status is set to Published.
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Featured Post</Label>
                    <Switch checked={featured} onCheckedChange={setFeatured} />
                  </div>
                </>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Remaining sections - hidden for contributors */}
            {!isContributor && (
            <>
              {/* Slug */}
              <AccordionItem value="slug" className="bg-card rounded-lg border border-border px-4">
                <AccordionTrigger className="text-sm font-semibold">URL Slug</AccordionTrigger>
                <AccordionContent className="pb-4">
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="post-url-slug" />
                  <p className="text-xs text-muted-foreground mt-1">/resources/insights/{slug || "..."}</p>
                </AccordionContent>
              </AccordionItem>

              {/* Categories */}
              <AccordionItem value="categories" className="bg-card rounded-lg border border-border px-4">
                <AccordionTrigger className="text-sm font-semibold">Categories</AccordionTrigger>
                <AccordionContent className="pb-4 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Click to toggle. Click the <Star className="inline h-3 w-3" /> to set as primary (determines hero color).
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                      const isSelected = selectedCategories.includes(cat.id);
                      const isPrimary = primaryCategoryId === cat.id;
                      return (
                        <div key={cat.id} className="flex items-center gap-0.5">
                          <button
                            onClick={() => toggleCategory(cat.id)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                              isSelected
                                ? isPrimary
                                  ? "border-gold bg-gold/15 text-gold font-bold ring-1 ring-gold/40"
                                  : "border-primary bg-primary/10 text-primary font-medium"
                                : "border-border text-muted-foreground hover:border-primary/50"
                            }`}
                          >
                            {isPrimary && <Star className="inline h-3 w-3 mr-1 fill-current" />}
                            {cat.title}
                          </button>
                          {isSelected && (
                            <button
                              onClick={() => togglePrimary(cat.id)}
                              title={isPrimary ? "Remove as primary" : "Set as primary"}
                              className={`p-1 rounded-full transition-colors ${
                                isPrimary
                                  ? "text-gold hover:text-gold/70"
                                  : "text-muted-foreground/40 hover:text-gold"
                              }`}
                            >
                              <Star className={`h-3.5 w-3.5 ${isPrimary ? "fill-current" : ""}`} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {selectedCategories.length > 0 && !primaryCategoryId && (
                    <p className="text-xs text-amber-600 font-medium">
                      ⚠ No primary category set, hero color will default to teal.
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* SEO / AEO / GEO, Generate All */}
              <div className="bg-card rounded-lg border border-border px-4 py-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2"
                  disabled={generatingTags}
                  onClick={async () => {
                    setGeneratingTags(true);
                    try {
                      const { data, error } = await supabase.functions.invoke("generate-seo-tags", {
                        body: { postId: id, title, excerpt, bodyJson, mode: "preview" },
                      });
                      if (error) throw error;
                      if (data.seo_title) setSeoTitle(data.seo_title);
                      if (data.seo_description) {
                        setSeoDescription(data.seo_description);
                        setExcerpt(data.seo_description);
                      }
                      if (data.seo_keywords) setSeoKeywords(data.seo_keywords);
                      if (data.aeo_tags) setAeoTags(data.aeo_tags);
                      if (data.geo_tags) setGeoTags(data.geo_tags);
                      toast({ title: "Tags generated!", description: "Review and tweak before saving." });
                    } catch (err: any) {
                      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
                    } finally {
                      setGeneratingTags(false);
                    }
                  }}
                >
                  {generatingTags ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Generate SEO / AEO / GEO with AI</>
                  )}
                </Button>
              </div>

              {/* SEO */}
              <AccordionItem value="seo" className="bg-card rounded-lg border border-border px-4">
                <AccordionTrigger className="text-sm font-semibold">SEO Settings</AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div>
                    <Label>SEO Title</Label>
                    <Input
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder={title}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{(seoTitle || title).length}/60 characters</p>
                  </div>
                  <div>
                    <Label>Meta Description</Label>
                    <Textarea
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="Brief description for search engines..."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{seoDescription.length}/160 characters</p>
                  </div>
                  <div>
                    <Label>Keywords</Label>
                    <div className="flex gap-2">
                      <Input
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(keywordInput, setKeywordInput, seoKeywords, setSeoKeywords))}
                        placeholder="Add keyword"
                      />
                      <Button size="sm" variant="outline" onClick={() => addTag(keywordInput, setKeywordInput, seoKeywords, setSeoKeywords)}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {seoKeywords.map((tag) => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag, seoKeywords, setSeoKeywords)}>
                          {tag} <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* GEO Tags */}
              <AccordionItem value="geo" className="bg-card rounded-lg border border-border px-4">
                <AccordionTrigger className="text-sm font-semibold">GEO Tags</AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div className="flex gap-2">
                    <Input
                      value={geoInput}
                      onChange={(e) => setGeoInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(geoInput, setGeoInput, geoTags, setGeoTags))}
                      placeholder="Add GEO tag"
                    />
                    <Button size="sm" variant="outline" onClick={() => addTag(geoInput, setGeoInput, geoTags, setGeoTags)}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {geoTags.map((tag) => (
                      <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => removeTag(tag, geoTags, setGeoTags)}>
                        {tag} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* AEO Tags */}
              <AccordionItem value="aeo" className="bg-card rounded-lg border border-border px-4">
                <AccordionTrigger className="text-sm font-semibold">AEO Tags</AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  <div className="flex gap-2">
                    <Input
                      value={aeoInput}
                      onChange={(e) => setAeoInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(aeoInput, setAeoInput, aeoTags, setAeoTags))}
                      placeholder="Add AEO tag"
                    />
                    <Button size="sm" variant="outline" onClick={() => addTag(aeoInput, setAeoInput, aeoTags, setAeoTags)}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {aeoTags.map((tag) => (
                      <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => removeTag(tag, aeoTags, setAeoTags)}>
                        {tag} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </>
            )}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
