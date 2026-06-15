import { cn } from "@/lib/utils";

/**
 * Shared parallax background layer for final-CTA sections.
 *
 * Single source of truth for the site's parallax CTA visual:
 *  - fixed-attachment parallax on md+ screens (touch devices ignore bg-fixed,
 *    and browsers honoring `prefers-reduced-motion` get `motion-reduce:bg-scroll`)
 *  - decorative overlay tint marked aria-hidden
 *  - `image` is OPTIONAL. When no image is provided, the parallax image layer
 *    is skipped entirely and only the overlay renders (so a final CTA without
 *    an image gracefully degrades to a flat colored panel).
 *
 * Used directly by hand-rolled CTA sections, and internally by `ParallaxCTA`.
 */
interface ParallaxBackgroundProps {
  /** Background image URL (imported asset). Optional. */
  image?: string;
  /** Tailwind class(es) for the dark overlay above the image. Defaults to navy/60. */
  overlayClassName?: string;
  /** Extra classes on the image layer itself */
  className?: string;
}

export function ParallaxBackground({
  image,
  overlayClassName = "bg-navy/60",
  className,
}: ParallaxBackgroundProps) {
  return (
    <>
      {image && (
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 bg-cover bg-center md:bg-fixed motion-reduce:bg-scroll",
            className,
          )}
          style={{ backgroundImage: `url(${image})` }}
        />
      )}
      <div aria-hidden="true" className={cn("absolute inset-0", overlayClassName)} />
    </>
  );
}

export default ParallaxBackground;
