import { cn } from "@/lib/utils";

/**
 * Shared parallax background layer for final-CTA sections that need custom
 * inner markup (multiple button groups, grids, etc.) and therefore can't use
 * the higher-level `ParallaxCTA` component.
 *
 * Handles:
 *  - fixed-attachment parallax on md+ screens (skipped on touch/mobile and
 *    automatically disabled by browsers honoring `prefers-reduced-motion`
 *    via the `motion-reduce:bg-scroll` utility)
 *  - decorative overlay tint marked aria-hidden
 *
 * Use this whenever you'd otherwise hand-roll
 * `<div className="absolute inset-0 bg-cover bg-center md:bg-fixed" />`
 * plus a separate overlay div.
 */
interface ParallaxBackgroundProps {
  /** Background image URL (imported asset) */
  image: string;
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
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-cover bg-center md:bg-fixed motion-reduce:bg-scroll",
          className,
        )}
        style={{ backgroundImage: `url(${image})` }}
      />
      <div aria-hidden="true" className={cn("absolute inset-0", overlayClassName)} />
    </>
  );
}

export default ParallaxBackground;
