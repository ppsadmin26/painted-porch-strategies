import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Global scroll-to-top guard.
 *
 * React Router does not reset scroll position on route changes, so pages
 * rendered outside PPSLayout (e.g. /amy, /rob, /sierra link-in-bio hubs)
 * would otherwise inherit the previous page's scroll offset. This component
 * scrolls to the top on every pathname change, while leaving hash-based
 * deep-linking to the dedicated ScrollToHash component.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [pathname, hash]);

  return null;
}
