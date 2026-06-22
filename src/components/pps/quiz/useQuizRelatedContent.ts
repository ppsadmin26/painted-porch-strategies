import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  RT_TO_CONTENT_CATEGORIES,
  type ContentItem,
  type ResultType,
} from "@/data/pathFinderQuiz";

/**
 * Fetches up to 2 related content items (blog posts and/or media appearances)
 * for a given quiz result type. Returns an empty array on miss / error so the
 * dialog never shows a broken section.
 *
 * Strategy:
 *  - Pull the most recent published blog post whose primary category matches
 *    one of the mapped slugs.
 *  - Pull the most recent media appearance tagged with one of those same
 *    category slugs.
 *  - Mix one of each when both exist; fall back to two blogs if media misses.
 */
export function useQuizRelatedContent(resultType: ResultType | null | undefined) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resultType) {
      setItems([]);
      return;
    }
    const slugs = RT_TO_CONTENT_CATEGORIES[resultType] ?? [];
    if (slugs.length === 0) {
      setItems([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // Resolve category ids for the mapped slugs.
        const catRes = await supabase
          .from("blog_categories")
          .select("id, slug")
          .in("slug", slugs);
        const catIds = (catRes.data ?? []).map((c: { id: string }) => c.id);
        if (catIds.length === 0) {
          if (!cancelled) setItems([]);
          return;
        }

        const [blogRes, mediaRes] = await Promise.all([
          supabase
            .from("blog_post_categories")
            .select(
              "post:blog_posts!inner(id, slug, title, excerpt, cover_image_url, publish_date, status)"
            )
            .in("category_id", catIds)
            .limit(30),
          supabase
            .from("media_appearance_categories")
            .select(
              "appearance:media_appearances!inner(id, title, show_name, description, thumbnail_url, external_url, appearance_date)"
            )
            .in("category_id", catIds)
            .limit(30),
        ]);

        // Collect, dedupe, sort by date desc, then take top 2.
        const blogMap = new Map<string, ContentItem & { _sortKey: number }>();
        for (const row of (blogRes.data ?? []) as Array<{
          post: {
            id: string;
            slug: string | null;
            title: string;
            excerpt: string | null;
            cover_image_url: string | null;
            publish_date: string | null;
            status: string;
          } | null;
        }>) {
          const p = row.post;
          if (!p || !p.slug || p.status !== "published") continue;
          if (blogMap.has(p.id)) continue;
          blogMap.set(p.id, {
            kind: "blog",
            title: p.title,
            url: `/resources/blog/${p.slug}`,
            excerpt: p.excerpt ?? undefined,
            thumbnail: p.cover_image_url ?? undefined,
            date: p.publish_date ?? undefined,
            _sortKey: p.publish_date ? new Date(p.publish_date).getTime() : 0,
          });
        }
        const blogs = Array.from(blogMap.values())
          .sort((a, b) => b._sortKey - a._sortKey)
          .slice(0, 2)
          .map(({ _sortKey, ...rest }) => { void _sortKey; return rest as ContentItem; });

        const mediaMap = new Map<string, ContentItem & { _sortKey: number }>();
        for (const row of (mediaRes.data ?? []) as Array<{
          appearance: {
            id: string;
            title: string;
            show_name: string;
            description: string | null;
            thumbnail_url: string | null;
            external_url: string | null;
            appearance_date: string | null;
          } | null;
        }>) {
          const a = row.appearance;
          if (!a || !a.external_url) continue;
          if (mediaMap.has(a.id)) continue;
          mediaMap.set(a.id, {
            kind: "media",
            title: a.title,
            url: a.external_url,
            excerpt: a.description ?? undefined,
            thumbnail: a.thumbnail_url ?? undefined,
            date: a.appearance_date ?? undefined,
            source: a.show_name,
            _sortKey: a.appearance_date ? new Date(a.appearance_date).getTime() : 0,
          });
        }
        const media = Array.from(mediaMap.values())
          .sort((a, b) => b._sortKey - a._sortKey)
          .slice(0, 2)
          .map(({ _sortKey, ...rest }) => { void _sortKey; return rest as ContentItem; });

        // Mix: prefer 1 blog + 1 media, else fill from whichever has content.
        const mixed: ContentItem[] = [];
        if (blogs[0]) mixed.push(blogs[0]);
        if (media[0]) mixed.push(media[0]);
        if (mixed.length < 2 && blogs[1]) mixed.push(blogs[1]);
        if (mixed.length < 2 && media[1]) mixed.push(media[1]);

        if (!cancelled) setItems(mixed);
      } catch (err) {
        console.warn("useQuizRelatedContent fetch failed (non-fatal):", err);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resultType]);

  return { items, loading };
}
