import { Link } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/pps/TierBadge";
import { type TierConfig } from "@/config/tiers";
import LazyHeroVideo from "@/components/pps/LazyHeroVideo";
import { useParallax } from "@/hooks/useParallax";

interface HeroCTA {
  label: string;
  href: string;
  /** If true, uses anchor link (href="#section") instead of router Link */
  isAnchor?: boolean;
  /** If true, uses primary tier styling; otherwise uses outline white */
  isPrimary?: boolean;
  /** Optional className override that fully replaces the default button classes */
  buttonClassName?: string;
  icon?: ReactNode;
}

interface TierHeroSectionProps {
  /** Tier config for badge styling (optional - if not provided, uses custom badge) */
  tier?: TierConfig;
  /** Custom badge label (overrides default tier badge label) */
  badgeLabel?: string;
  /** Custom badge content (overrides tier badge entirely) */
  customBadge?: ReactNode;
  /** Main headline */
  headline: string | ReactNode;
  /** Optional highlighted portion of headline (renders in gold) */
  headlineHighlight?: string;
  /** Optional subheadline (italic, gold text) */
  subheadline?: string;
  /** Main description paragraph(s) */
  description: string | ReactNode;
  /** Call-to-action buttons */
  ctas: HeroCTA[];
  /** Background - can be image URL, video source, or admin-managed slot */
  background: {
    type: "image" | "video";
    src: string;
    /** Fallback image for video poster */
    poster?: string;
    /** If provided, the video src is fetched from `site_videos` for this slot key (admin-managed) */
    slotKey?: string;
  };
  /** Overlay color class (default: "bg-navy/40") */
  overlayClass?: string;
  /** Inner text box class (default: "bg-black/50 backdrop-blur-sm") */
  textBoxClass?: string;
  /** Minimum height class (default: "min-h-[70vh]") */
  minHeightClass?: string;
  /** Extra classes (e.g. object-position) applied to the background media element */
  mediaClassName?: string;
}

/**
 * Standardized Hero Section for tier pages and hub pages.
 * 
 * Features:
 * - Left-justified content (80% width on md+)
 * - Semi-opaque backdrop blur text container
 * - Video or image backgrounds with overlay
 * - Consistent badge, headline, description, CTA structure
 * 
 * Used by: PartnerWithUsAlt, IgnitePathAlt, AmplifyPathAlt, EmbodyPathAlt
 */
export function TierHeroSection({
  tier,
  badgeLabel,
  customBadge,
  headline,
  headlineHighlight,
  subheadline,
  description,
  ctas,
  background,
  overlayClass = "bg-navy/40",
  textBoxClass = "bg-black/50 backdrop-blur-sm",
  minHeightClass = "min-h-[70vh]",
  mediaClassName = "",
}: TierHeroSectionProps) {
  // Staggered text fade-in (matches Blue Door HeroSectionAlt)
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Determine primary button styling based on tier or default
  const getPrimaryButtonClasses = () => {
    if (tier) {
      return tier.solidButtonClasses;
    }
    return "bg-gold border-2 border-gold text-navy hover:bg-white hover:text-gold";
  };

  const { ref: sectionRef, parallaxOffset } = useParallax<HTMLElement>({
    mode: "scroll",
    speed: 0.25,
  });

  const bgTransform = `translateY(${parallaxOffset}px) scale(1.08)`;

  return (
    <section ref={sectionRef} className={`relative isolate ${minHeightClass} flex items-center overflow-hidden`}>
      {/* Background (parallax wrapper) */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: bgTransform }}
      >
      {background.type === "video" ? (
        background.slotKey ? (
          <LazyHeroVideo
            slotKey={background.slotKey}
            posterUrl={background.poster ?? background.src}
            fallbackVideoUrl={background.src}
            className="absolute inset-0 w-full h-full"
            mediaClassName={mediaClassName}
          />
        ) : (
          <video
            src={background.src}
            poster={background.poster}
            autoPlay
            loop
            muted
            playsInline
            className={`absolute inset-0 w-full h-full object-cover ${mediaClassName}`}
          />
        )
      ) : (
        <img
          src={background.src}
          alt=""
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover ${mediaClassName}`}
        />
      )}
      </div>

      {/* Overlay */}
      <div className={`absolute inset-0 ${overlayClass}`} />

      <div className="container max-w-7xl mx-auto px-6 relative z-10 py-16 md:py-24">
        <div className="md:w-4/5">
          <div className={`${textBoxClass} p-8 md:p-12 rounded-xl`}>
            {/* Badge */}
            {(customBadge || tier) && (
              <div
                className={`transition-all duration-700 ease-out ${
                  isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                }`}
              >
                {customBadge ? customBadge : tier ? (
                  <TierBadge tier={tier} label={badgeLabel} className="mb-6" />
                ) : null}
              </div>
            )}

            {/* Headline */}
            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight transition-all duration-700 ease-out delay-150 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {typeof headline === "string" && headlineHighlight ? (
                <>
                  {headline.split(headlineHighlight)[0]}
                  <span className="text-gold">{headlineHighlight}</span>
                  {headline.split(headlineHighlight)[1]}
                </>
              ) : (
                headline
              )}
            </h1>

            {/* Subheadline */}
            {subheadline && subheadline.trim() !== "" && (
              <p
                className={`text-lead text-gold italic mb-4 transition-all duration-700 ease-out delay-300 ${
                  isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                {subheadline}
              </p>
            )}

            {/* Description */}
            <div
              className={`text-lead text-white/90 mb-8 max-w-3xl transition-all duration-700 ease-out delay-300 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {/* Render multi-line string with line breaks if it contains \n */}
              {typeof description === "string" ? (
                <p data-body-allow className="whitespace-pre-line">{description}</p>
              ) : (
                description
              )}
            </div>

            {/* CTAs */}
            <div
              className={`flex flex-col sm:flex-row sm:flex-wrap gap-4 max-w-full transition-all duration-700 ease-out delay-500 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {ctas.map((cta, index) => {
                const responsiveButtonSizing = "text-base sm:text-lg py-4 sm:py-6 px-4 sm:px-8 transition-colors w-full sm:w-auto max-w-full whitespace-normal h-auto leading-tight text-center min-w-0";
                const buttonClasses = cta.buttonClassName
                  ? `${cta.buttonClassName} ${responsiveButtonSizing}`
                  : cta.isPrimary
                  ? `${getPrimaryButtonClasses()} ${responsiveButtonSizing}`
                  : `bg-transparent border-2 border-white/70 text-white hover:bg-white hover:text-navy ${responsiveButtonSizing}`;

                const content = (
                  <Button className={buttonClasses}>
                    <span className="min-w-0 whitespace-normal">{cta.label}</span>
                    {cta.icon}
                  </Button>
                );

                if (cta.isAnchor) {
                  return (
                    <a key={index} href={cta.href} className="w-full sm:w-auto max-w-full">
                      {content}
                    </a>
                  );
                }

                return (
                  <Link key={index} to={cta.href} className="w-full sm:w-auto max-w-full">
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
