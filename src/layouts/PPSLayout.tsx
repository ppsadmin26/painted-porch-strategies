import { useLayoutEffect, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import PPSNavigation from "@/components/pps/PPSNavigation";
import PPSFooter from "@/components/pps/PPSFooter";
import PageGate from "@/components/pps/PageGate";
import GitHubSyncBanner from "@/components/pps/admin/GitHubSyncBanner";

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

export default function PPSLayout() {
  const { pathname } = useLocation();

  // Immediate scroll before paint
  useLayoutEffect(() => {
    scrollToTop();
  }, [pathname]);

  // Safety net: scroll again after async content (images/videos) may have shifted layout
  useEffect(() => {
    scrollToTop();
    const timer = setTimeout(scrollToTop, 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <GitHubSyncBanner />
      <PPSNavigation />
      <main className="flex-1">
        <PageGate>
          <Outlet />
        </PageGate>
      </main>
      <PPSFooter />
    </div>
  );
}

