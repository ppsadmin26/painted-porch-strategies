import { useEffect, useRef, useState } from "react";

type ParallaxMode = "scroll" | "viewport";

interface UseParallaxOptions {
  /** 'scroll' multiplies window.scrollY; 'viewport' calculates based on element position */
  mode?: ParallaxMode;
  /** For 'scroll' mode: multiplier for scroll position (default: 0.4) */
  speed?: number;
  /** For 'viewport' mode: range of movement in pixels (default: 80) */
  range?: number;
  /** For 'viewport' mode: offset from center (default: range/2) */
  offset?: number;
}

/** Check if user prefers reduced motion */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useParallax<T extends HTMLElement = HTMLElement>(
  options: UseParallaxOptions = {}
) {
  const { mode = "scroll", speed = 0.4, range = 80, offset = range / 2 } = options;
  const ref = useRef<T>(null);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Listen for reduced motion preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    // Skip parallax if user prefers reduced motion
    if (reducedMotion) {
      setParallaxOffset(0);
      return;
    }

    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (mode === "scroll") {
        // Only apply when section is visible
        if (rect.bottom > 0) {
          setParallaxOffset(window.scrollY * speed);
        }
      } else {
        // Viewport mode: only apply when section is in view
        if (rect.top < windowHeight && rect.bottom > 0) {
          const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
          setParallaxOffset(progress * range - offset);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mode, speed, range, offset, reducedMotion]);

  return { ref, parallaxOffset, reducedMotion };
}
