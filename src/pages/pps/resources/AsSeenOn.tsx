import { useState, useMemo } from "react";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import asSeenOnHero from "@/assets/heroes/as-seen-on-hero.jpg";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic, Radio, Newspaper, Video, MonitorPlay, Users, Search, X, ChevronLeft, ChevronRight, ChevronDown, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface MediaAppearance {
  id: string;
  media_type: string;
  show_name: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  external_url: string | null;
  appearance_date: string | null;
  featured: boolean;
  categories?: { title: string; color: string | null }[];
}

const mediaTypeConfig: Record<string, { icon: typeof Mic; label: string; color: string; iconColor: string }> = {
  podcast: { icon: Mic, label: "Podcast", color: "bg-primary/10", iconColor: "text-primary" },
  interview: { icon: Radio, label: "Interview", color: "bg-raspberry/10", iconColor: "text-raspberry" },
  article: { icon: Newspaper, label: "Article", color: "bg-lime/10", iconColor: "text-lime" },
  webinar: { icon: MonitorPlay, label: "Webinar", color: "bg-strategic/10", iconColor: "text-strategic" },
  video: { icon: Video, label: "Video", color: "bg-gold/10", iconColor: "text-gold" },
  panel: { icon: Users, label: "Panel", color: "bg-navy/10", iconColor: "text-navy" },
};

const categoryColors: Record<string, string> = {
  "Stoicism & Philosophy": "border-purple bg-purple/10 text-purple",
  "Leadership": "border-primary bg-primary/10 text-primary",
  "Change & Transformation": "border-strategic bg-strategic/10 text-strategic",
  "Teams & Culture": "border-navy bg-navy/10 text-navy",
  "Mindset & Growth": "border-gold bg-gold/10 text-gold",
  "Resilience & Wellbeing": "border-raspberry bg-raspberry/10 text-raspberry",
  "Communication": "border-lime bg-lime/10 text-lime",
  "Workplace & Operations": "border-primary bg-primary/10 text-primary",
  "Productivity & Focus": "border-gold bg-gold/10 text-gold",
  "Resources": "border-strategic bg-strategic/10 text-strategic",
  "As Seen On": "border-navy bg-navy/10 text-navy",
};

const categoryBorderColors: Record<string, string> = {
  "Stoicism & Philosophy": "border-purple",
  "Leadership": "border-primary",
  "Change & Transformation": "border-strategic",
  "Teams & Culture": "border-navy",
  "Mindset & Growth": "border-gold",
  "Resilience & Wellbeing": "border-raspberry",
  "Communication": "border-lime",
  "Workplace & Operations": "border-primary",
  "Productivity & Focus": "border-gold",
  "Resources": "border-strategic",
  "As Seen On": "border-navy",
};

const PER_PAGE_OPTIONS = [6, 9, 12, 18, 24];
const MEDIA_TYPES = ["podcast", "interview", "article", "webinar", "video", "panel"];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

async function fetchAppearances(): Promise<MediaAppearance[]> {
  const { data: appearances, error } = await supabase
    .from("media_appearances")
    .select("*")
    .order("featured", { ascending: false })
    .order("appearance_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!appearances) return [];

  const ids = appearances.map((a) => a.id);
  const { data: links } = await supabase
    .from("media_appearance_categories")
    .select("appearance_id, category_id")
    .in("appearance_id", ids);

  const catIds = [...new Set((links || []).map((l) => l.category_id))];
  const { data: categories } = catIds.length > 0
    ? await supabase.from("blog_categories").select("id, title, color").in("id", catIds)
    : { data: [] };

  const catMap = new Map((categories || []).map((c) => [c.id, c]));

  return appearances.map((a) => ({
    ...a,
    categories: (links || [])
      .filter((l) => l.appearance_id === a.id)
      .map((l) => catMap.get(l.category_id))
      .filter(Boolean) as { title: string; color: string | null }[],
  }));
}

export default function AsSeenOn() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const cat = searchParams.get("category");
    return cat ? [cat] : [];
  });
  const [selectedTypes, setSelectedTypes] = useState<string[]>(() => {
    const t = searchParams.get("type");
    return t ? [t] : [];
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

  const { data: appearances, isLoading } = useQuery<MediaAppearance[]>({
    queryKey: ["media-appearances"],
    queryFn: fetchAppearances,
  });

  const { data: allCategories = [] } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("blog_categories").select("title").order("title");
      return (data || []).map((c) => c.title);
    },
  });

  const filteredAppearances = useMemo(() => {
    if (!appearances) return [];
    return appearances.filter((a) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        a.categories?.some((c) => selectedCategories.includes(c.title));
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(a.media_type);
      const matchesSearch =
        !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.show_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesType && matchesSearch;
    });
  }, [appearances, selectedCategories, selectedTypes, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredAppearances.length / perPage));
  const paginatedAppearances = filteredAppearances.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setCurrentPage(1);
  };
  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };
  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSearchQuery("");
    setCurrentPage(1);
  };
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };
  const handlePerPageChange = (val: string) => {
    setPerPage(Number(val));
    setCurrentPage(1);
  };

  return (
    <div>
      {/* Hero */}
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-strategic/90 text-white font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Media
          </span>
        }
        headline="As Seen On"
        description="Podcasts, interviews, and media appearances featuring our team sharing insights on change, leadership, and transformation."
        ctas={[
          { label: "Contact for Media", href: "/contact?interest=speaking&message=I'm reaching out about a media or speaking opportunity.", isPrimary: true },
        ]}
        background={{ type: "image", src: asSeenOnHero }}
        overlayClass="bg-navy/50"
        minHeightClass="min-h-[60vh]"
      />

      {/* Filters & Search */}
      <section className="bg-white border-b border-border sticky top-0 z-20">
        <div className="container max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search appearances..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Media Type filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-[180px] bg-muted justify-between font-normal">
                  {selectedTypes.length === 0
                    ? "All Types"
                    : `${selectedTypes.length} type${selectedTypes.length > 1 ? "s" : ""}`}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-2" align="start">
                <div className="flex flex-col gap-1">
                  {MEDIA_TYPES.map((type) => {
                    const config = mediaTypeConfig[type];
                    return (
                      <label
                        key={type}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer text-sm"
                      >
                        <Checkbox
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={() => handleTypeToggle(type)}
                        />
                        <config.icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
                        {config.label}
                      </label>
                    );
                  })}
                </div>
                {selectedTypes.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-xs"
                    onClick={() => { setSelectedTypes([]); setCurrentPage(1); }}
                  >
                    Clear
                  </Button>
                )}
              </PopoverContent>
            </Popover>

            {/* Category multi-select */}
            {allCategories.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-[220px] bg-muted justify-between font-normal">
                    {selectedCategories.length === 0
                      ? "All Categories"
                      : `${selectedCategories.length} selected`}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-2" align="start">
                  <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
                    {allCategories.map((cat) => (
                      <label
                        key={cat}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer text-sm"
                      >
                        <Checkbox
                          checked={selectedCategories.includes(cat)}
                          onCheckedChange={() => handleCategoryToggle(cat)}
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                  {selectedCategories.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 text-xs"
                      onClick={() => { setSelectedCategories([]); setCurrentPage(1); }}
                    >
                      Clear all
                    </Button>
                  )}
                </PopoverContent>
              </Popover>
            )}

            {/* Per-page */}
            <Select value={String(perPage)} onValueChange={handlePerPageChange}>
              <SelectTrigger className="w-full md:w-[130px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PER_PAGE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active filter pills */}
          {(selectedCategories.length > 0 || selectedTypes.length > 0 || searchQuery) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedTypes.map((type) => {
                const config = mediaTypeConfig[type];
                return (
                  <span key={type} className="inline-flex items-center gap-1 text-xs font-medium bg-strategic/10 text-strategic px-3 py-1 rounded-full">
                    {config?.label || type}
                    <button onClick={() => handleTypeToggle(type)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
              {selectedCategories.map((cat) => (
                <span key={cat} className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {cat}
                  <button onClick={() => handleCategoryToggle(cat)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-gold/20 text-gold px-3 py-1 rounded-full">
                  "{searchQuery}"
                  <button onClick={() => handleSearchChange("")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <span className="text-xs text-muted-foreground self-center">
                {filteredAppearances.length} result{filteredAppearances.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: perPage }).map((_, i) => (
                <div key={i} className="bg-muted rounded-xl animate-pulse h-80" />
              ))}
            </div>
          ) : paginatedAppearances.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground mb-4">
                No appearances found matching your criteria.
              </p>
              <Button variant="outline" onClick={handleClearAll}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedAppearances.map((appearance) => {
                  const config = mediaTypeConfig[appearance.media_type] || mediaTypeConfig.podcast;
                  const IconComponent = config.icon;
                  const primaryCategory = appearance.categories?.[0]?.title;
                  const borderColor = primaryCategory
                    ? categoryBorderColors[primaryCategory] || "border-primary"
                    : "border-primary";

                  const CardWrapper = appearance.external_url ? "a" : "div";
                  const cardProps = appearance.external_url
                    ? { href: appearance.external_url, target: "_blank", rel: "noopener noreferrer" }
                    : {};

                  return (
                    <CardWrapper
                      key={appearance.id}
                      {...cardProps}
                      className={`block group bg-card rounded-xl border-l-4 ${borderColor} transition-all hover:shadow-lg h-full flex flex-col overflow-hidden ${appearance.external_url ? "cursor-pointer" : ""}`}
                    >
                      {/* Thumbnail */}
                      {appearance.thumbnail_url ? (
                        <div className="relative overflow-hidden">
                          <img
                            src={appearance.thumbnail_url}
                            alt={appearance.title}
                            className="w-full aspect-[16/9] object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className={`relative w-full aspect-[16/9] ${config.color} flex items-center justify-center`}>
                          <IconComponent className={`w-12 h-12 ${config.iconColor} opacity-30`} />
                        </div>
                      )}

                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                          <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
                        </div>
                        <span className={`text-sm font-medium ${config.iconColor}`}>
                          {appearance.show_name}
                        </span>
                        <h3 className="font-poppins font-semibold text-lg text-navy mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {appearance.title}
                        </h3>
                        <p className="text-foreground text-sm leading-relaxed mb-4 line-clamp-3 group-hover:line-clamp-none transition-all flex-1" title={appearance.description || ""}>
                          {appearance.description}
                        </p>

                        {appearance.categories && appearance.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {appearance.categories.map((cat) => (
                              <span
                                key={cat.title}
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                                  categoryColors[cat.title] || "border-primary bg-primary/10 text-primary"
                                }`}
                              >
                                {cat.title}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                          {appearance.appearance_date && (
                            <span className="text-xs text-muted-foreground">
                              {formatDate(appearance.appearance_date)}
                            </span>
                          )}
                          {appearance.external_url && (
                            <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:underline ml-auto">
                              View <ExternalLink className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </CardWrapper>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={page === currentPage ? "bg-primary text-white pointer-events-none" : ""}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="gap-1"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>

      {/* Speaking CTA */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
            Book Us for Your Podcast or Event
          </h2>
          <p className="text-lg text-foreground mb-8 max-w-2xl mx-auto">
            Our team is available for podcasts, interviews, keynotes, and panel discussions on change management, leadership, and organizational transformation.
          </p>
          <Link to="/speaking">
            <Button className="bg-navy hover:bg-navy/90 text-white text-lg py-5 px-8">
              Learn About Speaking
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-strategic text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Organization?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Hearing about transformation is inspiring. Making it happen requires partnership.
          </p>
          <Link to="/contact?scope=organization&interest=organizational-advisory&message=I'm interested in learning more after watching your media appearances.">
            <Button className="bg-primary hover:bg-primary/90 text-white text-lg py-5 px-8">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
