import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Youtube, Play, Search, X, ChevronLeft, ChevronRight, Star, ArrowUpDown } from "lucide-react";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import youtubeHero from "@/assets/heroes/youtube-hero.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface YouTubeVideo {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  youtube_video_id: string;
  thumbnail_url: string | null;
  duration: string | null;
  published_date: string | null;
  playlist: string | null;
  content_type: string;
  channel_title: string | null;
  featured: boolean;
  categories?: { title: string; color: string | null }[];
}

type SortOption = "date-desc" | "date-asc" | "featured" | "category" | "playlist";

async function fetchVideos(): Promise<YouTubeVideo[]> {
  const { data: videos, error } = await supabase
    .from("youtube_videos")
    .select("*")
    .order("published_date", { ascending: false, nullsFirst: false });

  if (error) throw error;

  const { data: catLinks } = await supabase
    .from("youtube_video_categories")
    .select("video_id, category_id");

  const { data: categories } = await supabase
    .from("blog_categories")
    .select("id, title, color");

  const catMap = new Map((categories || []).map((c) => [c.id, c]));

  return (videos || []).map((v) => ({
    ...v,
    categories: (catLinks || [])
      .filter((l) => l.video_id === v.id)
      .map((l) => catMap.get(l.category_id))
      .filter(Boolean) as { title: string; color: string | null }[],
  }));
}

function sortVideos(videos: YouTubeVideo[], sort: SortOption): YouTubeVideo[] {
  const copy = [...videos];
  switch (sort) {
    case "date-desc":
      return copy.sort((a, b) => (b.published_date || "").localeCompare(a.published_date || ""));
    case "date-asc":
      return copy.sort((a, b) => (a.published_date || "").localeCompare(b.published_date || ""));
    case "featured":
      return copy.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (b.published_date || "").localeCompare(a.published_date || ""));
    case "category":
      return copy.sort((a, b) => (a.categories?.[0]?.title || "zzz").localeCompare(b.categories?.[0]?.title || "zzz"));
    case "playlist":
      return copy.sort((a, b) => (a.playlist || "zzz").localeCompare(b.playlist || "zzz"));
    default:
      return copy;
  }
}

export default function YouTubePage() {
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["youtube-videos"],
    queryFn: fetchVideos,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [playlistFilter, setPlaylistFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 12;

  const playlists = useMemo(() => {
    const set = new Set<string>();
    videos.forEach((v) => v.playlist && set.add(v.playlist));
    return Array.from(set).sort();
  }, [videos]);

  const allCategories = useMemo(() => {
    const map = new Map<string, string>();
    videos.forEach((v) => v.categories?.forEach((c) => map.set(c.title, c.color || "#007697")));
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [videos]);

  const filtered = useMemo(() => {
    const result = videos.filter((v) => {
      if (contentTypeFilter !== "all" && v.content_type !== contentTypeFilter) return false;
      if (playlistFilter !== "all" && v.playlist !== playlistFilter) return false;
      if (selectedCategory !== "all" && !v.categories?.some((c) => c.title === selectedCategory)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return v.title.toLowerCase().includes(q) || (v.description || "").toLowerCase().includes(q) || (v.channel_title || "").toLowerCase().includes(q);
      }
      return true;
    });
    return sortVideos(result, sortBy);
  }, [videos, contentTypeFilter, playlistFilter, selectedCategory, searchQuery, sortBy]);

  const hasActiveFilters = contentTypeFilter !== "all" || playlistFilter !== "all" || selectedCategory !== "all" || searchQuery.length > 0;

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const paginated = filtered.slice((safeCurrentPage - 1) * PER_PAGE, safeCurrentPage * PER_PAGE);

  // Reset to page 1 when filters/sort change
  const filterKey = `${contentTypeFilter}-${playlistFilter}-${selectedCategory}-${searchQuery}-${sortBy}`;
  useMemo(() => setCurrentPage(1), [filterKey]);

  return (
    <div>
      {/* Hero */}
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-raspberry/90 text-white font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Video Content
          </span>
        }
        headline="YouTube Channel"
        description="Video content, tutorials, and conversations on leadership, change management, and organizational transformation."
        ctas={[
          { label: "Subscribe on YouTube", href: "https://youtube.com/@paintedporchstrategies", isPrimary: true },
        ]}
        background={{ type: "image", src: youtubeHero }}
        overlayClass="bg-navy/50"
        minHeightClass="min-h-[60vh]"
      />

      {/* Filters */}
      <section className="py-6 bg-white border-b sticky top-[72px] z-20">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="original">Original</SelectItem>
                <SelectItem value="appearance">Appearances</SelectItem>
              </SelectContent>
            </Select>
            {playlists.length > 0 && (
              <Select value={playlistFilter} onValueChange={setPlaylistFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Playlists" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Playlists</SelectItem>
                  {playlists.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {allCategories.length > 0 && (
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories.map(([title]) => (
                    <SelectItem key={title} value={title}>{title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[160px]">
                <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="featured">Featured First</SelectItem>
                <SelectItem value="category">By Category</SelectItem>
                <SelectItem value="playlist">By Playlist</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setContentTypeFilter("all");
                  setPlaylistFilter("all");
                  setSelectedCategory("all");
                }}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Videos Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading videos...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">
                {videos.length === 0 ? "No videos yet — check back soon!" : "No videos match your filters."}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setContentTypeFilter("all");
                    setPlaylistFilter("all");
                    setSelectedCategory("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {filtered.length} video{filtered.length !== 1 ? "s" : ""}
                {totalPages > 1 && ` · Page ${safeCurrentPage} of ${totalPages}`}
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginated.map((video) => (
                  <a
                    key={video.id}
                    href={video.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted rounded-xl overflow-hidden group cursor-pointer hover:shadow-lg transition-all block"
                  >
                    <div className="aspect-video relative flex items-center justify-center overflow-hidden">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-navy/20" />
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-raspberry flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
                      {video.duration && (
                        <span className="absolute bottom-2 right-2 bg-navy/80 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </span>
                      )}
                      {video.featured && (
                        <span className="absolute top-2 right-2 bg-gold text-navy text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" /> FEATURED
                        </span>
                      )}
                      {video.content_type === "appearance" && (
                        <span className="absolute top-2 left-2 bg-purple/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                          APPEARANCE
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      {video.categories && video.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {video.categories.map((cat) => (
                            <span key={cat.title} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {cat.title}
                            </span>
                          ))}
                        </div>
                      )}
                      <h3 className="font-poppins font-semibold text-lg text-navy mt-1 mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="text-sm text-foreground line-clamp-2 group-hover:line-clamp-none transition-all" title={video.description}>
                          {video.description}
                        </p>
                      )}
                      {(video.published_date || video.playlist) && (
                        <div className="flex flex-col gap-1 mt-3 text-xs text-muted-foreground">
                          {video.playlist && (
                            <span className="truncate">{video.playlist}</span>
                          )}
                          {video.published_date && (
                            <span>{new Date(video.published_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => { setCurrentPage((p) => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
                      .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1]) > 1) acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, idx) =>
                        p === "..." ? (
                          <span key={`ellipsis-${idx}`} className="px-2 py-1 text-sm text-muted-foreground">…</span>
                        ) : (
                          <Button
                            key={p}
                            variant={p === safeCurrentPage ? "default" : "outline"}
                            size="sm"
                            className="min-w-[36px]"
                            onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          >
                            {p}
                          </Button>
                        )
                      )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => { setCurrentPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-strategic text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Want to Go Deeper?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Our videos are a great introduction, but real transformation requires guided partnership. Let's explore how we can work together.
          </p>
          <Link to="/contact?interest=general&message=I've been watching your videos and would like to explore working together.">
            <Button className="bg-primary hover:bg-primary/90 text-white text-lg py-5 px-8">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
