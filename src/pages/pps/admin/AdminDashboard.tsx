import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { FileText, Mic, Users, Youtube, ToggleLeft, Database, PackageOpen, Mail, Receipt, Rocket } from "lucide-react";

interface Stats {
  posts: number;
  media: number;
  youtube: number;
  users: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ posts: 0, media: 0, youtube: 0, users: 0 });

  useEffect(() => {
    const load = async () => {
      const [postsRes, mediaRes, youtubeRes, usersRes] = await Promise.all([
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("media_appearances").select("id", { count: "exact", head: true }),
        supabase.from("youtube_videos").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        posts: postsRes.count ?? 0,
        media: mediaRes.count ?? 0,
        youtube: youtubeRes.count ?? 0,
        users: usersRes.count ?? 0,
      });
    };
    load();
  }, []);

  const cards = [
    { title: "Blog Posts", count: stats.posts, icon: FileText, href: "/admin/posts", description: "Manage articles and thought leadership" },
    { title: "Media Appearances", count: stats.media, icon: Mic, href: "/admin/media", description: "Manage As Seen On content" },
    { title: "YouTube Videos", count: stats.youtube, icon: Youtube, href: "/admin/youtube", description: "Manage YouTube video content" },
    { title: "Users", count: stats.users, icon: Users, href: "/admin/users", description: "Manage team accounts and roles" },
    { title: "Page Status", count: 0, icon: ToggleLeft, href: "/admin/pages", description: "Mark pages as Live or Draft" },
    { title: "Backups", count: 0, icon: Database, href: "/admin/backups", description: "View history and run backups now" },
    { title: "Migrate", count: 0, icon: PackageOpen, href: "/admin/migrate", description: "Export everything for a remix or import into a new project" },
    { title: "Site Emails", count: 0, icon: Mail, href: "/admin/emails", description: "Preview, test, and view source for every system email" },
    { title: "Refund Requests", count: 0, icon: Receipt, href: "/admin/refunds", description: "Review refund requests and notify customers" },
    { title: "Program Launches", count: 0, icon: Rocket, href: "/admin/course-launches", description: "Flip programs Live and notify the launch list" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy">
          Painted Porch Admin
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome to the content management portal
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card
            key={card.title}
            className="p-6 cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => navigate(card.href)}
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <card.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold font-poppins text-navy">{card.count}</p>
                <p className="font-medium text-sm">{card.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
