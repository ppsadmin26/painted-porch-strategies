import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminSections } from "@/hooks/useAdminSections";
import { AdminSidebar } from "@/components/pps/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { RunBackupButton } from "@/components/pps/admin/RunBackupButton";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const { canAccessRoute, loading: sectionsLoading } = useAdminSections();

  useEffect(() => {
    if (!loading && !user) navigate("/admin/login");
  }, [user, loading, navigate]);

  // Route guard: redirect to dashboard if user lacks section access
  useEffect(() => {
    if (!loading && !sectionsLoading && user && !canAccessRoute(location.pathname)) {
      navigate("/admin", { replace: true });
    }
  }, [loading, sectionsLoading, user, location.pathname, canAccessRoute, navigate]);

  if (loading || sectionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center justify-between border-b bg-card px-4 shrink-0 gap-2">
            <SidebarTrigger className="ml-0" />
            <div className="flex items-center gap-2">
              <RunBackupButton />
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" /> Sign Out
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
