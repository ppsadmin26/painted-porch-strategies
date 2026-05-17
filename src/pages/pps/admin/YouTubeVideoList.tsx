import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BulkYouTubeImportDialog } from "@/components/pps/admin/BulkYouTubeImportDialog";
import { Toggle } from "@/components/ui/toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, Eye, ArrowUp, ArrowDown, Star, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface YouTubeVideo {
  id: string;
  title: string;
  youtube_url: string;
  youtube_video_id: string;
  duration: string | null;
  published_date: string | null;
  content_type: string;
  playlist: string | null;
  featured: boolean;
  created_at: string;
}

export default function YouTubeVideoList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [dateSortAsc, setDateSortAsc] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchVideos = async () => {
      setLoading(true);
      let query = supabase
        .from("youtube_videos")
        .select("id, title, youtube_url, youtube_video_id, duration, published_date, content_type, playlist, featured, created_at")
        .order("published_date", { ascending: dateSortAsc, nullsFirst: false });

      if (typeFilter !== "all") {
        query = query.eq("content_type", typeFilter as any);
      }
      if (featuredOnly) {
        query = query.eq("featured", true);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,playlist.ilike.%${search}%`);
      }

      const { data } = await query;
      setItems((data as YouTubeVideo[]) || []);
      setLoading(false);
    };
    fetchVideos();
  }, [user, search, typeFilter, featuredOnly, dateSortAsc, refreshKey]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    await supabase.from("youtube_video_categories").delete().eq("video_id", id);
    const { error } = await supabase.from("youtube_videos").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast({ title: "Deleted" });
    }
  };

  return (
    <div className="bg-muted/30 min-h-full">
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy">YouTube Videos</h1>
            <p className="text-sm text-muted-foreground">Manage your YouTube video content</p>
          </div>
          <div className="flex items-center gap-2">
            <BulkYouTubeImportDialog onImported={() => setRefreshKey((k) => k + 1)} />
            <Button size="sm" onClick={() => navigate("/admin/youtube/new")}>
              <Plus className="h-4 w-4 mr-1" /> New Video
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search videos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="original">Original</SelectItem>
              <SelectItem value="appearance">Appearance</SelectItem>
            </SelectContent>
          </Select>
          <Toggle
            size="sm"
            pressed={featuredOnly}
            onPressedChange={setFeaturedOnly}
            className="gap-1.5 data-[state=on]:bg-secondary/10 data-[state=on]:text-secondary border border-input"
          >
            <Star className="h-4 w-4" />
            Featured
          </Toggle>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No videos found</p>
              <Button onClick={() => navigate("/admin/youtube/new")}>
                <Plus className="h-4 w-4 mr-1" /> Add First Video
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Playlist</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => setDateSortAsc((prev) => !prev)}
                  >
                    <span className="inline-flex items-center gap-1">
                      Published
                      {dateSortAsc ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                    </span>
                  </TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/admin/youtube/${item.id}`)}>
                    <TableCell>
                      {item.featured && <Star className="h-4 w-4 text-secondary fill-secondary" />}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{item.title}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">{item.content_type}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.playlist || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.duration || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.published_date ? new Date(item.published_date).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="View on YouTube">
                          <a href={item.youtube_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/youtube/${item.id}`)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
