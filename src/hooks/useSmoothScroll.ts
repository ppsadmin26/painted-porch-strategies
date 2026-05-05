import { useCallback } from "react";

interface UseSmoothScrollOptions {
  /** Offset from the top of the target element in pixels (default: 0) */
  offset?: number;
  /** Scroll behavior (default: "smooth") */
  behavior?: ScrollBehavior;
}

export function useSmoothScroll(options: UseSmoothScrollOptions = {}) {
  const { offset = 0, behavior = "smooth" } = options;

  const scrollToId = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior });
    }
  }, [offset, behavior]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior });
  }, [behavior]);

  const handleAnchorClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href");
    if (href?.startsWith("#")) {
      e.preventDefault();
      const id = href.slice(1);
      if (id) {
        scrollToId(id);
      } else {
        scrollToTop();
      }
    }
  }, [scrollToId, scrollToTop]);

  return { scrollToId, scrollToTop, handleAnchorClick };
}
