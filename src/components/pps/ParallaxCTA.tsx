import { ReactNode, useId } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsPageLive } from "@/hooks/useIsPageLive";
import { ParallaxBackground } from "@/components/pps/ParallaxBackground";


/**
 * Accessible Parallax CTA section.
 *
 * Accessibility features baked in (use this for ALL future final-CTA sections):
 *  - <section aria-labelledby> tied to the heading
 *  - decorative background image + gradient overlay marked aria-hidden
 *  - WCAG-AA-safe minimum overlay opacity (navy/85 → navy/90) so white text
 *    holds 4.5:1 contrast on every image, including bright ones
 *  - real semantic <Link>/<a> focusable element (NO <Link><Button> nesting)
 *    with a high-contrast focus ring (gold) sized for dark backgrounds
 *  - drop-shadow on text to defend against image hot spots
 *  - respects prefers-reduced-motion (no parallax scroll on touch / reduced)
 */

export type CTAAction = {
  label: string;
  /** Internal route (use this OR href) */
  to?: string;
  /** External URL (use this OR to). Opens in new tab. */
  href?: string;
  /** Visual style. "primary" = gold. "secondary" = outline white. "bluedoor" = cobalt for /blue-door CTAs. */
  variant?: "primary" | "secondary" | "bluedoor";
  /** Optional aria-label override for screen readers */
  ariaLabel?: string;
};

/**
 * Preset overlay color tones. Use to vary the final-CTA background across the
 * site so it never blends with the navy footer. Pick one that fits the page's
 * theme (teal = calm/learning, purple = strategic, raspberry = bold/urgency,
 * charcoal = neutral, gold = warm/celebratory). `navy` remains available but
 * should be used sparingly because it sits directly above the navy footer.
 */
export type CTAOverlayTone =
  | "teal"
  | "purple"
  | "raspberry"
  | "charcoal"
  | "gold"
  | "navy";

const overlayToneClasses: Record<CTAOverlayTone, string> = {
  teal: "bg-gradient-to-b from-primary/90 via-primary/85 to-primary/85",
  purple: "bg-gradient-to-b from-strategic/90 via-strategic/85 to-strategic/85",
  raspberry: "bg-gradient-to-b from-raspberry/90 via-raspberry/85 to-raspberry/85",
  charcoal: "bg-gradient-to-b from-charcoal/90 via-charcoal/85 to-charcoal/85",
  gold: "bg-gradient-to-b from-navy/80 via-navy/70 to-navy/70", // gold-tinted bg w/ dark overlay for readability
  navy: "bg-gradient-to-b from-navy/90 via-navy/85 to-navy/85",
};

interface ParallaxCTAProps {
  /**
   * Background image URL (imported asset). OPTIONAL.
   * When omitted, the parallax image layer is skipped and only the overlay
   * renders, so the CTA still works (it just has no shifting backdrop).
   */
  backgroundImage?: string;
  eyebrow?: string;
  headline: ReactNode;
  description?: ReactNode;
  actions: CTAAction[];
  /** Footer note rendered below the buttons */
  footnote?: ReactNode;
  /** Override container max-width; defaults to max-w-3xl */
  maxWidthClass?: string;
  /** Vertical padding override */
  paddingClass?: string;
  /** Preset overlay color; defaults to "teal" (avoid "navy" above the footer) */
  overlayTone?: CTAOverlayTone;
  /** Full override of the overlay class. Takes precedence over overlayTone. */
  overlayClass?: string;
  /** Extra classes on the root <section> */
  className?: string;
}

const focusRingDark =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy";

// Sized to match the rest of the site's "size=lg" buttons (h-12, text-base).
const baseAction =
  "inline-flex items-center justify-center font-poppins font-semibold text-sm sm:text-base px-4 sm:px-8 min-h-12 py-3 rounded-md transition-colors shadow-lg w-full max-w-[20rem] sm:w-auto sm:max-w-full sm:min-w-[200px] whitespace-normal leading-tight text-center " +
  focusRingDark;

const variantClasses: Record<NonNullable<CTAAction["variant"]>, string> = {
  primary: "bg-gold text-navy border-2 border-gold hover:bg-gold/90",
  secondary:
    "bg-transparent text-white border-2 border-white/70 hover:bg-white hover:text-navy",
  bluedoor:
    "bg-bluedoor text-white border-2 border-bluedoor hover:bg-white hover:text-bluedoor",
};

function ActionEl({ action }: { action: CTAAction }) {
  const className = cn(baseAction, variantClasses[action.variant ?? "primary"]);
  const { isLive } = useIsPageLive(action.to ?? null);
  const inner = (
    <>
      <span className="min-w-0 whitespace-normal">{action.label}</span>
      <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
    </>
  );
  if (action.href) {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={action.ariaLabel ?? `${action.label} (opens in a new tab)`}
        className={className}
      >
        {inner}
      </a>
    );
  }
  if (!isLive) {
    return (
      <span
        aria-disabled="true"
        title="This page isn't published yet."
        className={cn(className, "opacity-70 cursor-not-allowed")}
      >
        Coming Soon
      </span>
    );
  }
  return (
    <Link
      to={action.to ?? "/"}
      aria-label={action.ariaLabel}
      className={className}
    >
      {inner}
    </Link>
  );
}

export function ParallaxCTA({
  backgroundImage,
  eyebrow,
  headline,
  description,
  actions,
  footnote,
  maxWidthClass = "max-w-3xl",
  paddingClass = "py-20 md:py-28",
  // Default away from navy so the CTA doesn't blend into the navy footer.
  // Opacity stays high to guarantee 4.5:1 white-on-bg contrast.
  overlayTone = "teal",
  overlayClass,
  className,
}: ParallaxCTAProps) {
  const headingId = useId();
  const resolvedOverlay = overlayClass ?? overlayToneClasses[overlayTone];

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "relative text-white overflow-hidden",
        paddingClass,
        className,
      )}
    >
      {/* Shared parallax image + overlay layer. Image is optional. */}
      <ParallaxBackground image={backgroundImage} overlayClassName={resolvedOverlay} />


      <div
        className={cn(
          "relative container mx-auto px-6 text-center",
          maxWidthClass,
        )}
      >
        {eyebrow && (
          <p className="text-gold font-semibold uppercase tracking-wide text-body-sm mb-3 drop-shadow">
            {eyebrow}
          </p>
        )}
        <h2
          id={headingId}
          className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg"
        >
          {headline}
        </h2>
        {description && (
          <p className="text-white/95 mb-8 text-lead md:text-xl drop-shadow max-w-2xl mx-auto">
            {description}
          </p>
        )}
        {actions.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-4 max-w-full">
            {actions.map((action) => (
              <ActionEl key={action.label} action={action} />
            ))}
          </div>
        )}
        {footnote && (
          <div className="text-sm text-white/85 mt-5 drop-shadow">{footnote}</div>
        )}
      </div>
    </section>
  );
}

export default ParallaxCTA;
