import { useEffect, useState } from "react";
import { useScrollAnimation } from "./useScrollAnimation";

interface UseStaggeredAnimationOptions {
  /** Number of items to animate */
  itemCount: number;
  /** Delay between each item in ms (default: 150) */
  staggerDelay?: number;
  /** IntersectionObserver threshold (default: 0.2) */
  threshold?: number;
  /** Root margin for earlier/later triggering (default: "0px") */
  rootMargin?: string;
}

export function useStaggeredAnimation<T extends HTMLElement = HTMLElement>(
  options: UseStaggeredAnimationOptions
) {
  const { itemCount, staggerDelay = 150, threshold = 0.2, rootMargin = "0px" } = options;
  const { ref, isVisible: triggered, reducedMotion } = useScrollAnimation<T>({ threshold, rootMargin });
  const [visibleItems, setVisibleItems] = useState<boolean[]>(Array(itemCount).fill(false));

  useEffect(() => {
    if (triggered) {
      if (reducedMotion) {
        // Show all items immediately if reduced motion is preferred
        setVisibleItems(Array(itemCount).fill(true));
      } else {
        // Stagger the visibility of each item
        for (let i = 0; i < itemCount; i++) {
          setTimeout(() => {
            setVisibleItems(prev => {
              const newState = [...prev];
              newState[i] = true;
              return newState;
            });
          }, i * staggerDelay);
        }
      }
    }
  }, [triggered, itemCount, staggerDelay, reducedMotion]);

  // Reset if itemCount changes
  useEffect(() => {
    setVisibleItems(Array(itemCount).fill(false));
  }, [itemCount]);

  return { ref, visibleItems, triggered, reducedMotion };
}

/**
 * Helper to get animation classes for a staggered item
 */
export function getStaggeredItemClasses(
  isVisible: boolean,
  variant: "fade-up" | "slide-left" | "slide-right" | "scale" = "fade-up"
): string {
  const baseClasses = "transition-all duration-700 ease-out";
  
  const variants = {
    "fade-up": {
      visible: "opacity-100 translate-y-0",
      hidden: "opacity-0 translate-y-6"
    },
    "slide-left": {
      visible: "opacity-100 translate-x-0",
      hidden: "opacity-0 -translate-x-8"
    },
    "slide-right": {
      visible: "opacity-100 translate-x-0",
      hidden: "opacity-0 translate-x-8"
    },
    "scale": {
      visible: "opacity-100 scale-100",
      hidden: "opacity-0 scale-95"
    }
  };

  const { visible, hidden } = variants[variant];
  return `${baseClasses} ${isVisible ? visible : hidden}`;
}
