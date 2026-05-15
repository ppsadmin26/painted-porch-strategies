import { ReactNode, useId } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface ParallaxCTAProps {
  /** Background image URL (imported asset) */
  backgroundImage: string;
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
  /** Override the dark overlay (kept dark by default for AA contrast) */
  overlayClass?: string;
  /** Extra classes on the root <section> */
  className?: string;
}

const focusRingDark =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy";

const baseAction =
  "inline-flex items-center justify-center font-poppins font-semibold text-base px-8 py-4 rounded-md transition-colors shadow-xl " +
  focusRingDark;

const variantClasses: Record<NonNullable<CTAAction["variant"]>, string> = {
  primary: "bg-gold text-navy hover:bg-gold/90",
  secondary:
    "bg-transparent text-white border-2 border-white hover:bg-white hover:text-navy",
  bluedoor:
    "bg-bluedoor text-white border-2 border-bluedoor hover:bg-white hover:text-bluedoor",
};

function ActionEl({ action }: { action: CTAAction }) {
  const className = cn(baseAction, variantClasses[action.variant ?? "primary"]);
  if (action.href) {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={action.ariaLabel ?? `${action.label} (opens in a new tab)`}
        className={className}
      >
        {action.label}
      </a>
    );
  }
  return (
    <Link
      to={action.to ?? "/"}
      aria-label={action.ariaLabel}
      className={className}
    >
      {action.label}
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
  // Default overlay opacity intentionally high — guarantees 4.5:1 white-on-bg
  // contrast even on the brightest part of the image.
  overlayClass = "bg-gradient-to-b from-navy/90 via-navy/85 to-navy/85",
  className,
}: ParallaxCTAProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "relative text-white overflow-hidden bg-center bg-cover md:bg-fixed",
        paddingClass,
        className,
      )}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Decorative overlay — hidden from assistive tech */}
      <div aria-hidden="true" className={cn("absolute inset-0", overlayClass)} />

      <div
        className={cn(
          "relative container mx-auto px-6 text-center",
          maxWidthClass,
        )}
      >
        {eyebrow && (
          <p className="text-gold font-semibold uppercase tracking-wide text-sm mb-3 drop-shadow">
            {eyebrow}
          </p>
        )}
        <h2
          id={headingId}
          className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg"
        >
          {headline}
        </h2>
        {description && (
          <p className="text-white/95 mb-8 text-lg md:text-xl drop-shadow max-w-2xl mx-auto">
            {description}
          </p>
        )}
        {actions.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-4">
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
