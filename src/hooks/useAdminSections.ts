import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AdminSection = "Blog" | "Media" | "YouTube";

const ALL_SECTIONS: AdminSection[] = ["Blog", "Media", "YouTube"];

/** Maps route prefixes to required sections */
const ROUTE_SECTION_MAP: Record<string, AdminSection> = {
  "/admin/posts": "Blog",
  "/admin/media": "Media",
  "/admin/youtube": "YouTube",
};

export function useAdminSections() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [editorSections, setEditorSections] = useState<AdminSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("role, editor_sections")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setRole(data.role);
          setEditorSections((data.editor_sections ?? []) as AdminSection[]);
        }
        setLoading(false);
      });
  }, [user]);

  const allowedSections: AdminSection[] =
    role === "admin"
      ? ALL_SECTIONS
      : role === "contributor"
        ? ["Blog"]
        : editorSections;

  const canAccess = (section: AdminSection) => allowedSections.includes(section);

  const ADMIN_ONLY_PREFIXES = [
    "/admin/users",
    "/admin/videos",
    "/admin/pages",
    "/admin/backups",
    "/admin/migrate",
    "/admin/restore",
    "/admin/verify",
    "/admin/secrets-handoff",
    "/admin/migration-checklist",
    "/admin/emails",
    "/admin/policy-notifications",
    "/admin/security",
    "/admin/offerings-coverage",
  ];

  const canAccessRoute = (path: string) => {
    if (ADMIN_ONLY_PREFIXES.some((p) => path.startsWith(p)) && role !== "admin") {
      return false;
    }
    for (const [prefix, section] of Object.entries(ROUTE_SECTION_MAP)) {
      if (path.startsWith(prefix)) return canAccess(section);
    }
    // Dashboard, Account, etc. are always accessible
    return true;
  };


  return { role, allowedSections, canAccess, canAccessRoute, loading };
}
