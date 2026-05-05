import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Upload, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  title: string;
  color: string | null;
}

export default function MediaAppearanceEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const isNew = id === "new";

  const [mediaType, setMediaType] = useState("podcast");
  const [showName, setShowName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [appearanceDate, setAppearanceDate] = useState("");
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);



  useEffect(() => {
    supabase.from("blog_categories").select("id, title, color").order("title").then(({ data }) => {
      setAllCategories(data || []);
    });
  }, []);

  useEffect(() => {
    if (isNew || !user) return;
    const load = async () => {
      const { data } = await supabase.from("media_appearances").select("*").eq("id", id).single();
      if (data) {
        setMediaType(data.media_type);
        setShowName(data.show_name);
        setTitle(data.title);
        setDescription(data.description || "");
        setThumbnailUrl(data.thumbnail_url || "");
        setExternalUrl(data.external_url || "");
        setAppearanceDate(data.appearance_date || "");
        setFeatured(data.featured);
      }
      const { data: links } = await supabase.from("media_appearance_categories").select("category_id").eq("appearance_id", id!);
      setSelectedCategoryIds((links || []).map((l) => l.category_id));
    };
    load();
  }, [id, isNew, user]);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `media-appearances/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("blog-images").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(path);
      setThumbnailUrl(urlData.publicUrl);
    }
    setUploading(false);
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handleSave = async () => {
    if (!title.trim() || !showName.trim()) {
      toast({ title: "Title and Show Name are required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      media_type: mediaType as any,
      show_name: showName,
      title,
      description: description || null,
      thumbnail_url: thumbnailUrl || null,
      external_url: externalUrl || null,
      appearance_date: appearanceDate || null,
      featured,
      updated_at: new Date().toISOString(),
    };

    let appearanceId = id;

    if (isNew) {
      const { data, error } = await supabase.from("media_appearances").insert(payload).select("id").single();
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      appearanceId = data.id;
    } else {
      const { error } = await supabase.from("media_appearances").update(payload).eq("id", id!);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
    }

    // Sync categories
    await supabase.from("media_appearance_categories").delete().eq("appearance_id", appearanceId!);
    if (selectedCategoryIds.length > 0) {
      await supabase.from("media_appearance_categories").insert(
        selectedCategoryIds.map((cid) => ({ appearance_id: appearanceId!, category_id: cid }))
      );
    }

    toast({ title: isNew ? "Created!" : "Saved!" });
    setSaving(false);
    navigate("/admin/media");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/media")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex items-center gap-2">
            {externalUrl && !isNew && (
              <Button variant="outline" size="sm" onClick={() => window.open(externalUrl, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-1" /> View on Website
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Appearance title" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Show / Publication Name *</label>
              <Input value={showName} onChange={(e) => setShowName(e.target.value)} placeholder="e.g. The Change Management Show" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." rows={4} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">External URL</label>
              <Input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://..." />
            </div>

            {/* Thumbnail */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Thumbnail Image</label>
              {thumbnailUrl && (
                <img src={thumbnailUrl} alt="Thumbnail" className="w-full max-w-sm aspect-[16/9] object-cover rounded-lg mb-3" />
              )}
              <div className="flex gap-3 items-center">
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
                  <Button variant="outline" size="sm" asChild disabled={uploading}>
                    <span><Upload className="h-4 w-4 mr-1" /> {uploading ? "Uploading..." : "Upload Image"}</span>
                  </Button>
                </label>
                <span className="text-xs text-muted-foreground">or paste URL:</span>
                <Input
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Media Type</label>
              <Select value={mediaType} onValueChange={setMediaType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="podcast">Podcast</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="panel">Panel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Appearance Date</label>
              <Input type="date" value={appearanceDate} onChange={(e) => setAppearanceDate(e.target.value)} />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={featured} onCheckedChange={(v) => setFeatured(!!v)} />
                <span className="text-sm font-medium">Featured</span>
              </label>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Categories</label>
              <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto border border-border rounded-lg p-2">
                {allCategories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted cursor-pointer text-sm">
                    <Checkbox
                      checked={selectedCategoryIds.includes(cat.id)}
                      onCheckedChange={() => toggleCategory(cat.id)}
                    />
                    {cat.title}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
