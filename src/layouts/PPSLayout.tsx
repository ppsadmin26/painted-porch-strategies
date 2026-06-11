import { useLayoutEffect, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import PPSNavigation from "@/components/pps/PPSNavigation";
import PPSFooter from "@/components/pps/PPSFooter";
import PageGate from "@/components/pps/PageGate";
import GitHubSyncBanner from "@/components/pps/admin/GitHubSyncBanner";
import { PathFinderQuizProvider } from "@/components/pps/quiz/PathFinderQuizProvider";

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  // Also reset documentElement/body in case overflow is on a different root
  if (document.documentElement) document.documentElement.scrollTop = 0;
  if (document.body) document.body.scrollTop = 0;
}

// Disable browser's automatic scroll restoration so we control it
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

export default function PPSLayout() {
  const { pathname, hash } = useLocation();

  // Immediate scroll before paint — skip when navigating to an in-page anchor
  useLayoutEffect(() => {
    if (hash) return;
    scrollToTop();
  }, [pathname, hash]);

  // Safety net: scroll again after async content (images/videos/lazy routes) may have shifted layout
  useEffect(() => {
    if (hash) return;
    scrollToTop();
    const t1 = setTimeout(scrollToTop, 50);
    const t2 = setTimeout(scrollToTop, 200);
    const t3 = setTimeout(scrollToTop, 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname, hash]);


  return (
    <PathFinderQuizProvider>
      <div className="min-h-screen flex flex-col overflow-x-hidden">
        <GitHubSyncBanner />
        <PPSNavigation />
        <main className="flex-1">
          <PageGate>
            <Outlet />
          </PageGate>
        </main>
        <PPSFooter />
      </div>
    </PathFinderQuizProvider>
  );
}

