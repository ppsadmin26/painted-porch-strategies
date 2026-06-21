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
import { ArrowLeft, Save, Loader2, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  title: string;
  color: string | null;
}

export default function YouTubeVideoEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isNew = id === "new";

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [playlist, setPlaylist] = useState("");
  const [contentType, setContentType] = useState("original");
  const [channelTitle, setChannelTitle] = useState("");
  const [featured, setFeatured] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState("");
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [youtubePlaylists, setYoutubePlaylists] = useState<{ id: string; title: string; itemCount: number }[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  useEffect(() => {
    supabase.from("blog_categories").select("id, title, color").order("title").then(({ data }) => {
      setAllCategories(data || []);
    });
  }, []);

  useEffect(() => {
    if (isNew || !user) return;
    const load = async () => {
      const { data } = await supabase.from("youtube_videos").select("*").eq("id", id).single();
      if (data) {
        setYoutubeUrl(data.youtube_url);
        setTitle(data.title);
        setDescription(data.description || "");
        setThumbnailUrl(data.thumbnail_url || "");
        setDuration(data.duration || "");
        setPublishedDate(data.published_date || "");
        setPlaylist(data.playlist || "");
        setContentType(data.content_type);
        setChannelTitle(data.channel_title || "");
        setFeatured(data.featured);
        setYoutubeVideoId(data.youtube_video_id);
      }
      const { data: links } = await supabase.from("youtube_video_categories").select("category_id").eq("video_id", id!);
      setSelectedCategoryIds((links || []).map((l) => l.category_id));
    };
    load();
  }, [id, isNew, user]);

  const handleFetchMetadata = async () => {
    if (!youtubeUrl.trim()) {
      toast({ title: "Paste a YouTube URL first", variant: "destructive" });
      return;
    }
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-youtube-metadata", {
        body: { url: youtubeUrl },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
        setFetching(false);
        return;
      }
      setTitle(data.title || "");
      setDescription(data.description || "");
      setThumbnailUrl(data.thumbnail_url || "");
      setDuration(data.duration || "");
      setPublishedDate(data.published_date || "");
      setChannelTitle(data.channel_title || "");
      setYoutubeVideoId(data.youtube_video_id || "");
      if (data.playlists?.length) {
        setYoutubePlaylists(data.playlists);
        setLoadingPlaylists(false);
      }
      toast({ title: "Metadata fetched!" });
    } catch (e: any) {
      toast({ title: "Fetch failed", description: e.message, variant: "destructive" });
    }
    setFetching(false);
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handleSave = async () => {
    if (!title.trim() || !youtubeUrl.trim() || !youtubeVideoId.trim()) {
      toast({ title: "Title and YouTube URL are required. Fetch metadata first.", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      title,
      description: description || null,
      youtube_url: youtubeUrl,
      youtube_video_id: youtubeVideoId,
      thumbnail_url: thumbnailUrl || null,
      duration: duration || null,
      published_date: publishedDate || null,
      playlist: playlist || null,
      content_type: contentType as any,
      channel_title: channelTitle || null,
      featured,
      updated_at: new Date().toISOString(),
    };

    let videoId = id;

    if (isNew) {
      const { data, error } = await supabase.from("youtube_videos").insert(payload).select("id").single();
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      videoId = data.id;
    } else {
      const { error } = await supabase.from("youtube_videos").update(payload).eq("id", id!);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
    }

    // Sync categories
    await supabase.from("youtube_video_categories").delete().eq("video_id", videoId!);
    if (selectedCategoryIds.length > 0) {
      await supabase.from("youtube_video_categories").insert(
        selectedCategoryIds.map((cid) => ({ video_id: videoId!, category_id: cid }))
      );
    }

    toast({ title: isNew ? "Video added!" : "Saved!" });
    setSaving(false);
    navigate("/admin/youtube");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/youtube")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex items-center gap-2">
            {youtubeUrl && !isNew && (
              <Button variant="outline" size="sm" onClick={() => window.open(youtubeUrl, "_blank")}>
                <Youtube className="h-4 w-4 mr-1" /> View on YouTube
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* URL + Fetch */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <label className="text-sm font-medium mb-1.5 block">YouTube URL *</label>
          <div className="flex gap-3">
            <Input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1"
            />
            <Button onClick={handleFetchMetadata} disabled={fetching} variant="outline">
              {fetching ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Youtube className="h-4 w-4 mr-1" />}
              {fetching ? "Fetching..." : "Fetch Metadata"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Paste a YouTube URL and click "Fetch Metadata" to auto-fill title, thumbnail, duration, and publish date.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video title" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." rows={4} />
            </div>

            {/* Thumbnail Preview */}
            {thumbnailUrl && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Thumbnail Preview</label>
                <img src={thumbnailUrl} alt="Thumbnail" className="w-full max-w-md aspect-[16/9] object-cover rounded-lg" />
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1.5 block">Thumbnail URL</label>
              <Input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="Auto-filled from fetch" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Content Type</label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original Content</SelectItem>
                  <SelectItem value="appearance">Appearance / Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Duration</label>
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 12:34" />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Published Date</label>
              <Input type="date" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Playlist</label>
              <Select value={playlist || "__none__"} onValueChange={(v) => setPlaylist(v === "__none__" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingPlaylists ? "Loading playlists..." : "Select playlist"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No playlist</SelectItem>
                  {playlist && !youtubePlaylists.some((pl) => pl.title === playlist) && (
                    <SelectItem value={playlist}>{playlist} (current)</SelectItem>
                  )}
                  {youtubePlaylists.map((pl) => (
                    <SelectItem key={pl.id} value={pl.title}>
                      {pl.title} ({pl.itemCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!youtubePlaylists.length && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Click "Fetch Metadata" above to load all channel playlists.
                </p>
              )}
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
