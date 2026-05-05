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
  const [isVisible, setIsVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Listen for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Check immediately (before paint) if element is already in viewport
  useLayoutEffect(() => {
    if (reducedMotion) {
      setIsVisible(true);
      return;
    }
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setIsVisible(true);
      }
    }
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || isVisible && triggerOnce) {
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
  }, [threshold, triggerOnce, rootMargin, reducedMotion, isVisible]);

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
