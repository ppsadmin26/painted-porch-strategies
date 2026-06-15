import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Plus, Search, Pencil, Trash2, Mic, Radio, Newspaper, Video, MonitorPlay, Users, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mediaTypeIcons: Record<string, typeof Mic> = {
  podcast: Mic,
  interview: Radio,
  article: Newspaper,
  webinar: MonitorPlay,
  video: Video,
  panel: Users,
};

interface Appearance {
  id: string;
  media_type: string;
  show_name: string;
  title: string;
  appearance_date: string | null;
  external_url: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export default function MediaAppearanceList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Appearance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateSortAsc, setDateSortAsc] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      let query = supabase
        .from("media_appearances")
        .select("id, media_type, show_name, title, appearance_date, external_url, featured, created_at, updated_at")
        .order("appearance_date", { ascending: dateSortAsc, nullsFirst: false });

      if (typeFilter !== "all") {
        query = query.eq("media_type", typeFilter as any);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,show_name.ilike.%${search}%`);
      }

      const { data } = await query;
      setItems((data as Appearance[]) || []);
      setLoading(false);
    };
    fetch();
  }, [user, search, typeFilter, dateSortAsc]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this appearance?")) return;
    const { error } = await supabase.from("media_appearances").delete().eq("id", id);
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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy">Media Appearances</h1>
            <p className="text-sm text-muted-foreground">Manage your As Seen On content</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => navigate("/admin/media/new")}>
              <Plus className="h-4 w-4 mr-1" /> New Appearance
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input aria-label="Search appearances" placeholder="Search appearances..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40" aria-label="Filter by type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="podcast">Podcast</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="article">Article</SelectItem>
              <SelectItem value="webinar">Webinar</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="panel">Panel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No appearances found</p>
              <Button onClick={() => navigate("/admin/media/new")}>
                <Plus className="h-4 w-4 mr-1" /> Add First Appearance
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Show / Publication</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => setDateSortAsc((prev) => !prev)}
                  >
                    <span className="inline-flex items-center gap-1">
                      Date
                      {dateSortAsc ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                    </span>
                  </TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const Icon = mediaTypeIcons[item.media_type] || Mic;
                  return (
                    <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/admin/media/${item.id}`)}>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm capitalize">{item.media_type}</span>
                        </div>
                      </TableCell>
                      <TableCell><span className="font-medium">{item.title}</span></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.show_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.appearance_date ? new Date(item.appearance_date).toLocaleDateString() : ", "}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          {item.external_url && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="View on Website" aria-label="View on website">
                              <a href={item.external_url} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit appearance" onClick={() => navigate(`/admin/media/${item.id}`)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" aria-label="Delete appearance" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
