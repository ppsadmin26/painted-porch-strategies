import { useState, useEffect, useMemo } from "react";
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
import { Plus, Search, Star, Pencil, Trash2, Eye, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImportLinkedInDialog from "@/components/pps/admin/ImportLinkedInDialog";
import { Toggle } from "@/components/ui/toggle";

type PostStatus = "draft" | "pending" | "approved" | "scheduled" | "published";

interface Post {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  featured: boolean;
  publish_date: string | null;
  created_at: string;
  updated_at: string;
  author_id: string | null;
  author_name: string | null;
  primary_category: string | null;
  category_ids: string[];
}

interface Category {
  id: string;
  title: string;
}

export default function BlogPostList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [authorFilter, setAuthorFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [dateSortAsc, setDateSortAsc] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<{ id: string; full_name: string | null }[]>([]);

  // Load categories and authors once
  useEffect(() => {
    supabase
      .from("blog_categories")
      .select("id, title")
      .order("title")
      .then(({ data }) => { if (data) setCategories(data); });

    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("is_author", true)
      .eq("is_active", true)
      .order("full_name")
      .then(({ data }) => { if (data) setAuthors(data); });
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchPosts = async () => {
      setLoading(true);

      // Fetch posts with author join
      let query = supabase
        .from("blog_posts")
        .select("id, title, slug, status, featured, publish_date, created_at, updated_at, author_id, profiles!blog_posts_author_id_fkey(full_name)")
        .order("updated_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as PostStatus);
      }
      if (search) {
        query = query.ilike("title", `%${search}%`);
      }
      if (authorFilter !== "all") {
        query = query.eq("author_id", authorFilter);
      }

      const { data: postsData } = await query;

      // Fetch all post-category mappings
      const { data: postCats } = await supabase
        .from("blog_post_categories")
        .select("post_id, category_id, is_primary");

      const catMap = new Map<string, { primary: string | null; ids: string[] }>();
      if (postCats) {
        for (const pc of postCats) {
          if (!catMap.has(pc.post_id)) catMap.set(pc.post_id, { primary: null, ids: [] });
          const entry = catMap.get(pc.post_id)!;
          entry.ids.push(pc.category_id);
          if (pc.is_primary) entry.primary = pc.category_id;
        }
      }

      const categoryLookup = new Map(categories.map((c) => [c.id, c.title]));

      let mapped: Post[] = (postsData || []).map((p: any) => {
        const cats = catMap.get(p.id);
        const primaryCatId = cats?.primary || (cats?.ids.length ? cats.ids[0] : null);
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          status: p.status as PostStatus,
          featured: p.featured,
          publish_date: p.publish_date,
          created_at: p.created_at,
          updated_at: p.updated_at,
          author_id: p.author_id,
          author_name: p.profiles?.full_name || null,
          primary_category: primaryCatId ? categoryLookup.get(primaryCatId) || null : null,
          category_ids: cats?.ids || [],
        };
      });

      // Client-side category filter
      if (categoryFilter !== "all") {
        mapped = mapped.filter((p) => p.category_ids.includes(categoryFilter));
      }

      // Client-side featured filter
      if (featuredOnly) {
        mapped = mapped.filter((p) => p.featured);
      }

      setPosts(mapped);
      setLoading(false);
    };
    fetchPosts();
  }, [user, search, statusFilter, authorFilter, categoryFilter, featuredOnly, categories]);

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const dateA = a.publish_date ? new Date(a.publish_date).getTime() : 0;
      const dateB = b.publish_date ? new Date(b.publish_date).getTime() : 0;
      return dateSortAsc ? dateA - dateB : dateB - dateA;
    });
  }, [posts, dateSortAsc]);

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", postId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast({ title: "Deleted" });
    }
  };

  const statusColors: Record<PostStatus, string> = {
    draft: "bg-muted text-muted-foreground",
    pending: "bg-secondary/20 text-secondary-foreground",
    approved: "bg-accent/20 text-accent-foreground",
    scheduled: "bg-gold/20 text-gold",
    published: "bg-primary/20 text-primary",
  };

  return (
    <div className="bg-muted/30 min-h-full">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy">Blog Posts</h1>
            <p className="text-sm text-muted-foreground">Manage your blog content</p>
          </div>
          <div className="flex items-center gap-2">
            <ImportLinkedInDialog onImported={() => window.location.reload()} />
            <Button size="sm" onClick={() => navigate("/admin/posts/new")}>
              <Plus className="h-4 w-4 mr-1" /> New Post
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" aria-label="Filter by status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <Select value={authorFilter} onValueChange={setAuthorFilter}>
            <SelectTrigger className="w-40" aria-label="Filter by author">
              <SelectValue placeholder="All Authors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Authors</SelectItem>
              {authors.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.full_name || "Unnamed"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44" aria-label="Filter by category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Toggle
            size="sm"
            pressed={featuredOnly}
            onPressedChange={setFeaturedOnly}
            aria-label="Show featured only"
            className="gap-1.5 data-[state=on]:bg-secondary/10 data-[state=on]:text-secondary border border-input"
          >
            <Star className="h-4 w-4" />
            Featured
          </Toggle>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading posts...</div>
          ) : sortedPosts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No posts found</p>
              <Button onClick={() => navigate("/admin/posts/new")}>
                <Plus className="h-4 w-4 mr-1" /> Create Your First Post
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <button
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                      onClick={() => setDateSortAsc((prev) => !prev)}
                    >
                      Published Date
                      {dateSortAsc ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPosts.map((post) => (
                  <TableRow
                    key={post.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/admin/posts/${post.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {post.featured && <Star className="h-4 w-4 shrink-0 text-secondary fill-secondary" />}
                        <span className="font-medium">{post.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {post.author_name || ", "}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {post.primary_category || ", "}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[post.status]}>{post.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {post.publish_date
                        ? new Date(post.publish_date).toLocaleDateString()
                        : ", "}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        {post.slug && (post.status === "published" || post.status === "scheduled") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(`/resources/insights/${post.slug}`, "_blank")}
                            title="View on Website"
                            aria-label="View post on website"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Edit post"
                          onClick={() => navigate(`/admin/posts/${post.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          aria-label="Delete post"
                          onClick={() => handleDelete(post.id)}
                        >
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
