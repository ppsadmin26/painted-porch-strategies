import { Link } from "react-router-dom";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { useScrollAnimation, getAnimationClasses } from "@/hooks/useScrollAnimation";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import ParallaxCTA from "@/components/pps/ParallaxCTA";
import { PPSBreadcrumb } from "@/components/pps/PPSBreadcrumb";
import { Eyebrow } from "@/components/pps/Eyebrow";
import { ArrowRight, Mic, GraduationCap, ClipboardCheck, BookOpen } from "lucide-react";
import servicesHero from "@/assets/heroes/services-hero.jpg";
import resourcesHero from "@/assets/heroes/resources-hero.jpg";

function FadeIn({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible, reducedMotion } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${getAnimationClasses(isVisible, reducedMotion)} ${className}`}
    >
      {children}
    </div>
  );
}

const groups = [
  {
    icon: GraduationCap,
    title: "Workshops and labs",
    accent: "text-primary",
    border: "border-t-primary",
    body: "Focused sessions on communication, collaboration, conflict, resilience, and team dynamics. Useful on their own, and stronger when they sit inside a designed architecture.",
    to: "/partner/amplify/workshops",
    cta: "See workshops",
  },
  {
    icon: ClipboardCheck,
    title: "Assessments",
    accent: "text-strategic",
    border: "border-t-strategic",
    body: "Working Genius, emotional intelligence, and team diagnostics. Instruments we use inside engagements, available separately when a team wants a read on one dimension.",
    to: "/working-genius",
    cta: "Explore assessments",
  },
  {
    icon: Mic,
    title: "Speaking",
    accent: "text-gold",
    border: "border-t-gold",
    body: "Keynotes and workshop sessions for conferences and leadership gatherings. The philosophy, delivered to a room rather than designed into an organization.",
    to: "/speaking",
    cta: "View speaking topics",
  },
  {
    icon: BookOpen,
    title: "Insights and guides",
    accent: "text-navy",
    border: "border-t-navy",
    body: "Written thinking on organizational design, change origination, and the pattern behind failed initiatives. Free, and the fastest way to see how we think.",
    to: "/resources",
    cta: "Read the library",
  },
];

/**
 * DRAFT — /capabilities. Supporting capability library, deliberately positioned
 * as reference material rather than an actively marketed track.
 */
export default function Capabilities() {
  useDocumentSeo({
    title: "Capabilities | Painted Porch Strategies",
    description:
      "Workshops, assessments, speaking, and written insight. Supporting capability that sits underneath the design work, not in front of it.",
    robots: "noindex, nofollow",
  });

  return (
    <div className="bg-white">
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Supporting capability
          </span>
        }
        headline="What sits underneath the work"
        description={
          <p data-body-allow>
            These are real capabilities we bring, and they are not the headline. The design work is
            the headline. This is the material that supports it.
          </p>
        }
        ctas={[
          { label: "See How We Work", href: "/how-we-work", isPrimary: true },
          { label: "Contact Us", href: "/contact" },
        ]}
        background={{ type: "image", src: servicesHero }}
        overlayClass="bg-navy/60"
      />

      <PPSBreadcrumb segments={[{ label: "Capabilities" }]} />

      <section className="py-20 md:py-28 bg-white" aria-labelledby="capabilities">
        <div className="container max-w-6xl mx-auto px-6">
          <FadeIn className="max-w-3xl mb-12">
            <Eyebrow tone="teal">Reference, not a track</Eyebrow>
            <h2 id="capabilities" className="text-3xl md:text-4xl font-bold text-navy mb-5 leading-tight">
              A single workshop will not change an organization
            </h2>
            <p className="text-lead text-charcoal mb-4">
              We say that plainly because it is the honest version. A session on conflict, or an
              assessment on team dynamics, moves one dimension while the other two stay where they
              were.
            </p>
            <p className="text-lead text-charcoal">
              These offerings are worth doing, and they are most valuable when they sit inside a
              structure that was designed to hold them.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <FadeIn key={group.title}>
                <div className={`h-full bg-white border border-border ${group.border} border-t-4 rounded-xl p-7 shadow-sm flex flex-col`}>
                  <group.icon className={`w-8 h-8 mb-4 ${group.accent}`} aria-hidden="true" />
                  <h3 className={`font-poppins font-bold text-xl mb-3 ${group.accent}`}>{group.title}</h3>
                  <p className="text-body text-charcoal mb-6 flex-1">{group.body}</p>
                  <Link
                    to={group.to}
                    className={`inline-flex items-center gap-2 font-poppins font-semibold ${group.accent} hover:text-navy transition-colors`}
                  >
                    {group.cta}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <ParallaxCTA
        backgroundImage={resourcesHero}
        eyebrow="If you want the whole thing"
        headline="The design work is where the leverage lives"
        description="Start with a structured appraisal across all three Pillars, then decide what to build."
        actions={[
          { label: "Open the Blue Door", to: "/blue-door", variant: "bluedoor" },
          { label: "See How We Work", to: "/how-we-work", variant: "secondary" },
        ]}
        overlayTone="charcoal"
      />
    </div>
  );
}
