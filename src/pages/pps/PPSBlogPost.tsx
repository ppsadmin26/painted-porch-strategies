import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, User } from "lucide-react";
import ShareButton from "@/components/pps/ShareButton";
import { Badge } from "@/components/ui/badge";
import type { Json } from "@/integrations/supabase/types";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { getSiteUrl } from "@/lib/site-url";

interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

interface AuthorInfo {
  full_name: string | null;
  avatar_url: string | null;
  author_bio: string | null;
  is_guest_author: boolean;
}

interface BlogPostDetail {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  publish_date: string | null;
  cover_image_url: string | null;
  body_json: Json;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  aeo_tags: string[] | null;
  author_id: string | null;
  categories?: { title: string; color: string | null; is_primary?: boolean }[];
  author?: AuthorInfo | null;
}

const categoryHeroBg: Record<string, string> = {
  "Stoicism & Philosophy": "bg-[hsl(0,0%,30%)]",
  "Leadership": "bg-primary",
  "Change & Transformation": "bg-strategic",
  "Teams & Culture": "bg-navy",
  "Mindset & Growth": "bg-gold",
  "Resilience & Wellbeing": "bg-raspberry",
  "Communication": "bg-lime",
  "Workplace & Operations": "bg-primary",
  "Productivity & Focus": "bg-gold",
  "Resources": "bg-strategic",
  "As Seen On": "bg-navy",
};

async function fetchBlogPost(slug: string): Promise<BlogPostDetail | null> {
  const { data: post } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, publish_date, cover_image_url, body_json, seo_title, seo_description, seo_keywords, aeo_tags, author_id")
    .eq("slug", slug)
    .in("status", ["published", "scheduled"])
    .maybeSingle();

  if (!post) return null;

  let author: AuthorInfo | null = null;
  if (post.author_id) {
    const { data: authorData } = await supabase
      .from("public_authors" as any)
      .select("full_name, avatar_url, author_bio, is_guest_author")
      .eq("id", post.author_id)
      .single();
    if (authorData) author = authorData as unknown as AuthorInfo;
  }

  const { data: links } = await supabase
    .from("blog_post_categories")
    .select("category_id, is_primary")
    .eq("post_id", post.id);

  const catIds = (links || []).map((l) => l.category_id);
  const { data: categories } = catIds.length > 0
    ? await supabase.from("blog_categories").select("id, title, color").in("id", catIds).order("title")
    : { data: [] };

  const enrichedCategories = (categories || []).map((cat) => ({
    title: cat.title,
    color: cat.color,
    is_primary: (links || []).some((l) => l.category_id === cat.id && l.is_primary),
  }));

  return { ...post, categories: enrichedCategories, author };
}

function renderInline(node: TiptapNode): React.ReactNode {
  if (node.type === "text") {
    let content: React.ReactNode = node.text || "";
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === "bold") content = <strong>{content}</strong>;
        if (mark.type === "italic") content = <em>{content}</em>;
        if (mark.type === "underline") content = <u>{content}</u>;
        if (mark.type === "link") {
          const href = (mark.attrs?.href as string) || "#";
          content = <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">{content}</a>;
        }
      }
    }
    return content;
  }
  return null;
}

function renderNode(node: TiptapNode, index: number): React.ReactNode {
  const children = node.content?.map((child, i) => {
    if (child.type === "text") return renderInline(child);
    if (child.type === "listItem") return renderNode(child, i);
    if (child.type === "paragraph") return renderNode(child, i);
    return renderInline(child);
  });

  switch (node.type) {
    case "heading": {
      const level = (node.attrs?.level as number) || 2;
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      const classes: Record<number, string> = {
        1: "text-3xl font-bold text-navy mt-10 mb-4",
        2: "text-2xl font-bold text-navy mt-8 mb-4",
        3: "text-xl font-semibold text-navy mt-6 mb-3",
        4: "text-lg font-semibold text-navy mt-4 mb-2",
      };
      return <Tag key={index} className={classes[level] || classes[2]}>{children}</Tag>;
    }
    case "paragraph":
      return <p key={index} className="text-foreground leading-relaxed mb-4">{children}</p>;
    case "bulletList":
      return <ul key={index} className="list-disc ml-6 mb-4 space-y-1">{children}</ul>;
    case "orderedList":
      return <ol key={index} className="list-decimal ml-6 mb-4 space-y-1">{children}</ol>;
    case "listItem":
      return <li key={index} className="text-foreground leading-relaxed">{children}</li>;
    case "blockquote":
      return (
        <blockquote key={index} className="border-l-4 border-primary pl-4 italic my-6 text-muted-foreground">
          {children}
        </blockquote>
      );
    case "image":
      return (
        <figure key={index} className="my-8">
          <img src={node.attrs?.src as string} alt="" className="w-full rounded-lg" loading="lazy" />
        </figure>
      );
    case "youtube": {
      const src = node.attrs?.src as string;
      const videoId = src?.match(/(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]+)/)?.[1];
      if (!videoId) return null;
      return (
        <div key={index} className="my-8 aspect-video rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    default:
      return children ? <div key={index}>{children}</div> : null;
  }
}

export default function PPSBlogPost() {
  const siteUrl = getSiteUrl();
  const organizationId = `${siteUrl}#organization`;
  const organizationLogoUrl = `${siteUrl}/favicon.png`;
  const authorProfileUrls: Record<string, string> = {
    "Amy Yackowski": `${siteUrl}/amy`,
    "Rob Hunter": `${siteUrl}/rob`,
    "Sierra Ramm Cantrell": `${siteUrl}/sierra`,
  };

  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => fetchBlogPost(slug!),
    enabled: !!slug,
  });

  const canonicalUrl = post?.slug ? `${siteUrl}/resources/insights/${post.slug}` : undefined;
  const seoTitle = post?.seo_title || post?.title;
  const seoDescription = post?.seo_description || post?.excerpt || undefined;
  const authorName = post?.author?.full_name || "Amy Yackowski";
  const authorUrl = authorProfileUrls[authorName];
  const articleJsonLd = post && canonicalUrl && seoTitle ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${canonicalUrl}#article`,
    headline: seoTitle,
    description: seoDescription,
    url: canonicalUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    isPartOf: {
      "@type": "Blog",
      "@id": `${siteUrl}/resources/insights#blog`,
      url: `${siteUrl}/resources/insights`,
      name: "Painted Porch Strategies Blog",
    },
    image: post.cover_image_url
      ? {
          "@type": "ImageObject",
          url: post.cover_image_url,
        }
      : undefined,
    datePublished: post.publish_date || undefined,
    dateModified: post.publish_date || undefined,
    author: {
      "@type": "Person",
      name: authorName,
      url: authorUrl,
      description: post.author?.author_bio || undefined,
    },
    publisher: {
      "@type": "Organization",
      "@id": organizationId,
      name: "Painted Porch Strategies",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: organizationLogoUrl,
      },
    },
    keywords: [...new Set([...(post.seo_keywords || []), ...(post.aeo_tags || [])])],
    articleSection: post.categories?.map((cat) => cat.title),
    about: (post.aeo_tags || []).map((tag) => ({
      "@type": "Thing",
      name: tag,
    })),
  } : undefined;

  const pageTitle = seoTitle?.endsWith("| Painted Porch Strategies")
    ? seoTitle
    : seoTitle
      ? `${seoTitle} | Painted Porch Strategies`
      : undefined;

  useDocumentSeo({
    title: pageTitle,
    description: seoDescription,
    keywords: post ? [...(post.seo_keywords || []), ...(post.aeo_tags || [])] : undefined,
    canonical: canonicalUrl,
    robots: post ? "index, follow, max-image-preview:large" : undefined,
    ogTitle: seoTitle,
    ogDescription: seoDescription,
    ogType: post ? "article" : undefined,
    ogImage: post?.cover_image_url || undefined,
    jsonLd: articleJsonLd,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-3xl px-6">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-navy">Post Not Found</h1>
        <Link to="/resources/insights" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Insights
        </Link>
      </div>
    );
  }

  const bodyDoc = post.body_json as unknown as TiptapNode | null;
  const primaryCategory = post.categories?.find((c) => c.is_primary)?.title
    || post.categories?.[0]?.title
    || "";
  const heroBg = categoryHeroBg[primaryCategory] || "bg-primary";
  const isGuest = post.author?.is_guest_author || false;

  return (
    <div>
      {/* Hero */}
      <section className={`${heroBg} py-16 md:py-24`}>
        <div className="container max-w-4xl mx-auto px-6">
          <Link
            to="/resources/insights"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Insights
          </Link>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-white/80">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {authorName}
              {isGuest && (
                <Badge variant="outline" className="text-white/70 border-white/40 text-xs ml-1">
                  Guest Contributor
                </Badge>
              )}
            </span>
            {post.publish_date && (
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(post.publish_date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main Image */}
      {post.cover_image_url && (
        <div className="container max-w-4xl mx-auto px-6 -mt-8">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full rounded-xl shadow-lg"
          />
        </div>
      )}

      {/* Body */}
      <article className="py-12 md:py-16">
        <div className="container max-w-3xl mx-auto px-6 prose prose-lg">
          {bodyDoc?.content?.map((node, i) => renderNode(node as unknown as TiptapNode, i))}
        </div>
      </article>

      {/* Author Bio Section */}
      {post.author && post.author.author_bio && (
        <div className="container max-w-3xl mx-auto px-6 pb-8">
          <div className="border-t border-border pt-8">
            <div className="flex items-start gap-4">
              {post.author.avatar_url && (
                <img
                  src={post.author.avatar_url}
                  alt={post.author.full_name || "Author"}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-poppins font-semibold text-navy">
                    {post.author.full_name}
                  </p>
                  {isGuest && (
                    <Badge variant="outline" className="text-xs border-gold text-gold">
                      Guest Contributor
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {post.author.author_bio}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share */}
      <div className="container max-w-3xl mx-auto px-6 pb-6 flex justify-center">
        <ShareButton title={post.title} />
      </div>

      {/* Category Pills */}
      {post.categories && post.categories.length > 0 && (
        <div className="container max-w-3xl mx-auto px-6 pb-8">
          <div className="flex flex-wrap gap-2">
            {post.categories.map((cat) => {
              const colorMap: Record<string, string> = {
                "Stoicism & Philosophy": "border-purple text-purple",
                "Leadership": "border-primary text-primary",
                "Change & Transformation": "border-strategic text-strategic",
                "Teams & Culture": "border-navy text-navy",
                "Mindset & Growth": "border-gold text-gold",
                "Resilience & Wellbeing": "border-raspberry text-raspberry",
                "Communication": "border-lime text-lime",
                "Workplace & Operations": "border-primary text-primary",
                "Productivity & Focus": "border-gold text-gold",
                "Resources": "border-strategic text-strategic",
                "As Seen On": "border-navy text-navy",
              };
              const pillColors = colorMap[cat.title] || "border-muted-foreground text-muted-foreground";
              return (
                <Link
                  key={cat.title}
                  to={`/resources/insights?category=${encodeURIComponent(cat.title)}`}
                  className={`inline-block font-poppins font-semibold text-sm px-3 py-1 rounded-full border-2 bg-background hover:opacity-80 transition-opacity ${pillColors}`}
                >
                  {cat.title}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="py-16 bg-muted">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-navy mb-4">
            Want to put these ideas into action?
          </h2>
          <p className="text-foreground mb-6">
            Let's explore how to apply these principles in your organization.
          </p>
          <Link to="/contact?scope=organization&interest=organizational-advisory&message=I'd like to discuss applying these ideas in our organization.">
            <button className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
              Start a Conversation
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
