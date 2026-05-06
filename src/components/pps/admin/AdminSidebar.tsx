import { FileText, Mic, Users, LayoutDashboard, Settings, Youtube, Video, Database, Wand2, ShieldCheck, KeyRound, ListChecks, Mail, Inbox } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAdminSections, type AdminSection } from "@/hooks/useAdminSections";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems: { title: string; url: string; icon: any; section?: AdminSection }[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Blog Posts", url: "/admin/posts", icon: FileText, section: "Blog" },
  { title: "Media Appearances", url: "/admin/media", icon: Mic, section: "Media" },
  { title: "YouTube Videos", url: "/admin/youtube", icon: Youtube, section: "YouTube" },
  { title: "Site Videos", url: "/admin/videos", icon: Video },
  { title: "Backups", url: "/admin/backups", icon: Database },
  { title: "Restore Wizard", url: "/admin/restore", icon: Wand2 },
  { title: "Integrity Check", url: "/admin/verify", icon: ShieldCheck },
  { title: "Secrets Handoff", url: "/admin/secrets-handoff", icon: KeyRound },
  { title: "Migration Checklist", url: "/admin/migration-checklist", icon: ListChecks },
  { title: "Site Emails", url: "/admin/emails", icon: Mail },
  { title: "Email Health & Queue", url: "/admin/emails/queue", icon: Inbox },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Account", url: "/admin/account", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { role, canAccess } = useAdminSections();

  const isActive = (path: string) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  const visibleItems = navItems.filter((item) => {
    // Users page is admin-only
    if (item.url === "/admin/users" && role !== "admin") return false;
    // Site Videos is admin-only
    if (item.url === "/admin/videos" && role !== "admin") return false;
    // Backups is admin-only
    if (item.url === "/admin/backups" && role !== "admin") return false;
    if (item.url === "/admin/restore" && role !== "admin") return false;
    if (item.url === "/admin/verify" && role !== "admin") return false;
    if (item.url === "/admin/secrets-handoff" && role !== "admin") return false;
    if (item.url === "/admin/migration-checklist" && role !== "admin") return false;
    if (item.url === "/admin/emails" && role !== "admin") return false;
    if (item.url === "/admin/emails/queue" && role !== "admin") return false;
    // Section-gated items
    if (item.section) return canAccess(item.section);
    return true;
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {collapsed ? "PPS" : "Painted Porch Admin"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
