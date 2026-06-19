import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface UseScrollAnimationOptions {
  /** IntersectionObserver threshold (default: 0.1) */
  threshold?: number;
  /** Whether to trigger only once (default: true) */
  triggerOnce?: boolean;
  /** Root margin for earlier/later triggering (default: "0px") */
  rootMargin?: string;
}

export function useScrollAnimation<T extends HTMLElement = HTMLElement>(
  options: UseScrollAnimationOptions = {}
) {
  const { threshold = 0.1, triggerOnce = true, rootMargin = "0px" } = options;
  const ref = useRef<T>(null);
  // Default to visible so any non-scrolling consumer (crawlers, screenshot
  // bots, JS-disabled snapshots, search engines) sees fully-rendered content.
  // We only flip to hidden if we can confirm the element is below the fold,
  // and only then will the IntersectionObserver animate it back in.
  const [isVisible, setIsVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Listen for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Before paint, if the element is below the fold, hide it so the observer
  // can animate it in on scroll. Elements already in view stay visible.
  useLayoutEffect(() => {
    if (reducedMotion) {
      setIsVisible(true);
      return;
    }
    if (typeof window === "undefined") return;
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const isBelowFold = rect.top >= window.innerHeight;
      const isAboveFold = rect.bottom <= 0;
      if (isBelowFold || isAboveFold) {
        setIsVisible(false);
      }
    }
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, triggerOnce, rootMargin, reducedMotion]);

  return { ref, isVisible, reducedMotion };
}

/** 
 * Helper to generate animation classes based on visibility
 * Returns empty string if reduced motion is preferred
 */
export function getAnimationClasses(
  isVisible: boolean,
  reducedMotion: boolean,
  visibleClasses: string = "opacity-100 translate-y-0",
  hiddenClasses: string = "opacity-0 translate-y-6"
): string {
  if (reducedMotion) return visibleClasses;
  return isVisible ? visibleClasses : hiddenClasses;
}
