import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FeaturedPost {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  publish_date: string | null;
  cover_image_url: string | null;
  categories?: { title: string }[];
}

async function fetchFeaturedPosts(): Promise<FeaturedPost[]> {
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, publish_date, cover_image_url")
    .eq("status", "published")
    .eq("featured", true)
    .order("publish_date", { ascending: false });

  if (!posts || posts.length === 0) return [];

  const postIds = posts.map((p) => p.id);
  const { data: links } = await supabase
    .from("blog_post_categories")
    .select("post_id, category_id")
    .in("post_id", postIds);

  const catIds = [...new Set((links || []).map((l) => l.category_id))];
  const { data: categories } = catIds.length > 0
    ? await supabase.from("blog_categories").select("id, title").in("id", catIds)
    : { data: [] };

  const catMap = new Map((categories || []).map((c) => [c.id, c]));

  return posts.map((post) => ({
    ...post,
    categories: (links || [])
      .filter((l) => l.post_id === post.id)
      .map((l) => catMap.get(l.category_id))
      .filter(Boolean) as { title: string }[],
  }));
}

export function useFeaturedPosts(limit?: number) {
  return useQuery<FeaturedPost[]>({
    queryKey: ["featured-posts", limit],
    queryFn: async () => {
      const posts = await fetchFeaturedPosts();
      return limit ? posts.slice(0, limit) : posts;
    },
  });
}
