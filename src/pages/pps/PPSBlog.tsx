import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Search, X, ChevronLeft, ChevronRight, ChevronDown, Star, ExternalLink } from "lucide-react";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import blogHero from "@/assets/blog-hero.jpg";
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
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { getSiteUrl } from "@/lib/site-url";

interface BlogPost {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  publish_date: string | null;
  featured: boolean;
  cover_image_url: string | null;
  status: string;
  categories?: { title: string; color: string | null; is_primary?: boolean }[];
  externalUrl?: string | null;
}

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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

const PER_PAGE_OPTIONS = [6, 9, 12, 18, 24];

async function fetchBlogPosts(): Promise<BlogPost[]> {
  const [postsResult, appearancesResult] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, publish_date, featured, cover_image_url, status")
      .in("status", ["published", "scheduled"])
      .lte("publish_date", new Date().toISOString())
      .order("featured", { ascending: false })
      .order("publish_date", { ascending: false }),
    supabase
      .from("media_appearances")
      .select("*")
      .order("appearance_date", { ascending: false, nullsFirst: false }),
  ]);

  if (postsResult.error) throw postsResult.error;
  const posts = postsResult.data || [];
  const appearances = appearancesResult.data || [];

  const postIds = posts.map((p) => p.id);
  const { data: postLinks } = postIds.length > 0
    ? await supabase
        .from("blog_post_categories")
        .select("post_id, category_id, is_primary")
        .in("post_id", postIds)
    : { data: [] };

  const appearanceIds = appearances.map((a) => a.id);
  const { data: appearanceLinks } = appearanceIds.length > 0
    ? await supabase
        .from("media_appearance_categories")
        .select("appearance_id, category_id")
        .in("appearance_id", appearanceIds)
    : { data: [] };

  const allCatIds = [
    ...new Set([
      ...(postLinks || []).map((l) => l.category_id),
      ...(appearanceLinks || []).map((l) => l.category_id),
    ]),
  ];
  const { data: categories } = allCatIds.length > 0
    ? await supabase.from("blog_categories").select("id, title, color").in("id", allCatIds)
    : { data: [] };

  const catMap = new Map((categories || []).map((c) => [c.id, c]));

  const blogItems: BlogPost[] = posts.map((post) => {
    const postCatLinks = (postLinks || []).filter((l) => l.post_id === post.id);
    const cats = postCatLinks
      .map((l) => {
        const cat = catMap.get(l.category_id);
        return cat ? { ...cat, is_primary: !!(l as any).is_primary } : null;
      })
      .filter(Boolean) as { title: string; color: string | null; is_primary?: boolean }[];
    cats.sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.title.localeCompare(b.title);
    });
    return { ...post, categories: cats };
  });

  const asSeenOnCategory = { title: "As Seen On", color: "#00006B" };
  const appearanceItems: BlogPost[] = appearances.map((a) => {
    const existingCats = (appearanceLinks || [])
      .filter((l) => l.appearance_id === a.id)
      .map((l) => catMap.get(l.category_id))
      .filter(Boolean) as { title: string; color: string | null }[];

    const hasAsSeenOn = existingCats.some((c) => c.title === "As Seen On");
    const finalCats = hasAsSeenOn ? existingCats : [asSeenOnCategory, ...existingCats];

    return {
      id: `appearance-${a.id}`,
      title: a.title,
      slug: null,
      excerpt: a.description || `${a.show_name}, ${a.media_type}`,
      publish_date: a.appearance_date,
      featured: a.featured,
      cover_image_url: a.thumbnail_url,
      status: "published",
      categories: finalCats,
      externalUrl: a.external_url,
    };
  });

  // De-dupe: if a blog post and a media appearance share the same external URL,
  // prefer the blog post (richer content) and drop the appearance from the feed.
  const blogExternalUrls = new Set(
    appearances
      .filter((a) => a.external_url)
      .map((a) => a.external_url as string)
  );
  // Build set of external URLs referenced by blog posts (via body_json links would be heavy;
  // instead match on title similarity OR explicit slug pattern). Use title match as proxy.
  const blogTitles = new Set(blogItems.map((b) => b.title.toLowerCase().trim()));
  const dedupedAppearances = appearanceItems.filter((a) => {
    // Drop appearance if a blog post has a near-identical title prefix
    const at = a.title.toLowerCase().trim();
    for (const bt of blogTitles) {
      if (bt.includes(at) || at.includes(bt.split(" (")[0])) return false;
    }
    return true;
  });

  const allItems = [...blogItems, ...dedupedAppearances];
  allItems.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    const dateA = a.publish_date ? new Date(a.publish_date).getTime() : 0;
    const dateB = b.publish_date ? new Date(b.publish_date).getTime() : 0;
    return dateB - dateA;
  });

  return allItems;
}

export default function PPSBlog() {
  const siteUrl = getSiteUrl();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const cat = searchParams.get("category");
    return cat ? [cat] : [];
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["blog-posts"],
    queryFn: fetchBlogPosts,
  });

  const allCategories = useMemo(() => {
    if (!posts) return [];
    const cats = new Set<string>();
    posts.forEach((p) => p.categories?.forEach((c) => cats.add(c.title)));
    return Array.from(cats).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        post.categories?.some((c) => selectedCategories.includes(c.title));
      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategories, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / perPage));
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const blogListingJsonLd = useMemo(() => {
    const listItems = paginatedPosts.map((post, index) => {
      const itemUrl = post.externalUrl
        ? post.externalUrl
        : post.slug
          ? `${siteUrl}/resources/insights/${post.slug}`
          : `${siteUrl}/resources/insights`;

      const primaryCategory =
        post.categories?.find((category) => category.is_primary)?.title ||
        post.categories?.[0]?.title;

      return {
        "@type": "ListItem",
        position: index + 1 + (currentPage - 1) * perPage,
        url: itemUrl,
        item: {
          "@type": post.externalUrl ? "Article" : "BlogPosting",
          headline: post.title,
          description: post.excerpt || undefined,
          datePublished: post.publish_date || undefined,
          image: post.cover_image_url ? [post.cover_image_url] : undefined,
          about: primaryCategory
            ? [{ "@type": "Thing", name: primaryCategory }]
            : undefined,
        },
      };
    });

    return [
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Painted Porch Strategies Blog",
        description:
          "Explore Painted Porch Strategies articles, ideas, and media on leadership, communication, resilience, and organizational shift.",
        url: `${siteUrl}/resources/insights`,
        inLanguage: "en-US",
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Painted Porch Strategies Blog Listing",
        description:
          "A paginated listing of articles and featured media from Painted Porch Strategies.",
        url: `${siteUrl}/resources/insights`,
        numberOfItems: filteredPosts.length,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: listItems,
      },
    ];
  }, [paginatedPosts, currentPage, perPage, filteredPosts.length, siteUrl]);

  useDocumentSeo({
    title: "Insights | Painted Porch Strategies",
    description:
      "Explore Painted Porch Strategies articles, ideas, and media on leadership, communication, resilience, and organizational shift.",
    canonical: `${siteUrl}/resources/insights`,
    robots: "index, follow, max-image-preview:large",
    ogTitle: "Insights | Painted Porch Strategies",
    ogDescription:
      "Explore Painted Porch Strategies articles, ideas, and media on leadership, communication, resilience, and organizational shift.",
    ogType: "website",
    jsonLd: blogListingJsonLd,
  });

  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setCurrentPage(1);
  };
  const handleClearCategories = () => {
    setSelectedCategories([]);
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
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        {/* Animated background image */}
        <div
          className="absolute inset-0 bg-cover bg-center animate-slow-float"
          style={{ backgroundImage: `url(${blogHero})` }}
        />
        <div className="absolute inset-0 bg-navy/40" />
        <div className="container max-w-7xl mx-auto px-6 relative z-10 py-16 md:py-24">
          <div className="md:w-4/5">
            <div className="bg-black/50 backdrop-blur-sm p-8 md:p-12 rounded-xl">
              <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
                Thoughts from the Porch
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Insights on Change, Leadership & Transformation
              </h1>
              <div className="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl">
                <p>Practical wisdom on building change-ready organizations. Stoic principles applied to modern business challenges.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Search Bar */}
      <section className="bg-white border-b border-border sticky top-0 z-20">
        <div className="container max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
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

            {/* Category multi-select */}
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
                    onClick={handleClearCategories}
                  >
                    Clear all
                  </Button>
                )}
              </PopoverContent>
            </Popover>

            {/* Per-page selector */}
            <Select value={String(perPage)} onValueChange={handlePerPageChange}>
              <SelectTrigger aria-label="Posts per page" className="w-full md:w-[130px] bg-muted">
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
          {(selectedCategories.length > 0 || searchQuery) && (
            <div className="flex flex-wrap gap-2 mt-3">
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
                {filteredPosts.length} result{filteredPosts.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: perPage }).map((_, i) => (
                <div key={i} className="bg-muted rounded-xl animate-pulse h-80" />
              ))}
            </div>
          ) : paginatedPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground mb-4">
                No articles found matching your criteria.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategories([]);
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedPosts.map((post) => {
                  const primaryCategory = post.categories?.find((c) => c.is_primary)?.title || post.categories?.[0]?.title || "General";
                  const borderColor =
                    categoryBorderColors[primaryCategory] || "border-primary";

                  const isExternal = !!post.externalUrl;

                  const cardContent = (
                    <article
                      className={`bg-card rounded-xl border-l-4 ${borderColor} transition-all hover:shadow-lg h-full flex flex-col overflow-hidden`}
                    >
                      {post.cover_image_url ? (
                        <div className="relative overflow-hidden">
                          {post.featured && (
                            <span className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 bg-gold text-navy text-[11px] font-poppins font-semibold px-2 py-0.5 rounded-full shadow-sm">
                              <Star className="w-3 h-3 fill-current" /> Featured
                            </span>
                          )}
                          <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-full aspect-[16/9] object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="relative w-full aspect-[16/9] bg-navy/5 flex items-center justify-center">
                          {post.featured && (
                            <span className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 bg-gold text-navy text-[11px] font-poppins font-semibold px-2 py-0.5 rounded-full shadow-sm">
                              <Star className="w-3 h-3 fill-current" /> Featured
                            </span>
                          )}
                          <div className="text-center px-6">
                            <span className="font-poppins font-semibold text-navy/40 text-sm leading-tight line-clamp-2">
                              {post.title}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>

                        <p className="text-foreground text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
                          {post.excerpt}
                        </p>

                        {post.categories && post.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {post.categories.map((cat) => (
                              <span
                                key={cat.title}
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                                  categoryColors[cat.title] ||
                                  "border-primary bg-primary/10 text-primary"
                                }`}
                              >
                                {cat.title}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                          {post.publish_date && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {formatDate(post.publish_date)}
                            </span>
                          )}
                          <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:underline">
                            {isExternal ? (
                              <>View <ExternalLink className="w-4 h-4" /></>
                            ) : (
                              <>Read <ArrowRight className="w-4 h-4" /></>
                            )}
                          </span>
                        </div>
                      </div>
                    </article>
                  );

                  if (isExternal) {
                    return (
                      <a
                        key={post.id}
                        href={post.externalUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        {cardContent}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={post.id}
                      to={`/pps/resources/insights/${post.slug}`}
                      className="block group"
                    >
                      {cardContent}
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="flex flex-wrap items-center justify-center gap-2 mt-12 px-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </Button>

                  {(() => {
                    const pages: (number | "ellipsis")[] = [];
                    const w = 1;
                    for (let i = 1; i <= totalPages; i++) {
                      if (
                        i === 1 ||
                        i === totalPages ||
                        (i >= currentPage - w && i <= currentPage + w)
                      ) {
                        pages.push(i);
                      } else if (pages[pages.length - 1] !== "ellipsis") {
                        pages.push("ellipsis");
                      }
                    }
                    return pages.map((page, idx) =>
                      page === "ellipsis" ? (
                        <span key={`e-${idx}`} className="px-1 text-muted-foreground select-none">
                          …
                        </span>
                      ) : (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={
                            page === currentPage
                              ? "bg-primary text-white pointer-events-none"
                              : ""
                          }
                        >
                          {page}
                        </Button>
                      )
                    );
                  })()}

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

      {/* Newsletter CTA */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
            Get Insights Delivered
          </h2>
          <p className="text-lg text-foreground mb-8 max-w-2xl mx-auto">
            Subscribe to receive our latest thinking on change-readiness,
            leadership development, and organizational transformation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              aria-label="Email address for newsletter" placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="bg-primary hover:bg-primary/90 text-white py-3 px-6">
              Subscribe
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">We will NOT SPAM you. Unsubscribe at any time.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-strategic text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Apply These Ideas?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Reading is one thing, implementation is another. Let's discuss how
            to put these principles to work in your organization.
          </p>
          <Link to="/contact?scope=organization&interest=organizational-advisory&message=I'd like to discuss applying these ideas in our organization.">
            <Button className="bg-primary hover:bg-primary/90 text-white text-lg py-5 px-8">
              Start a Conversation
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
