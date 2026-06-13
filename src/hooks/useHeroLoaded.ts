import { useEffect, useState } from "react";

/**
 * Shared "hero text fade-in" trigger.
 * Returns `isLoaded` which flips true ~80ms after mount, matching the
 * standardized stagger used by TierHeroSection, PartnerHeroSection,
 * and HeroSectionAlt (Blue Door).
 *
 * Pair with Tailwind classes like:
 *   `transition-all duration-700 ease-out delay-150
 *    ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`
 */
export function useHeroLoaded(delay = 80): boolean {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return isLoaded;
}
