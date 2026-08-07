import { Link } from "react-router-dom";
import { DoorOpen, ArrowRight, HelpCircle, Hammer } from "lucide-react";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { useScrollAnimation, getAnimationClasses } from "@/hooks/useScrollAnimation";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import ParallaxCTA from "@/components/pps/ParallaxCTA";
import ClientLogoMarquee from "@/components/pps/ClientLogoMarquee";
import StatMarquee from "@/components/pps/StatMarquee";
import { Eyebrow } from "@/components/pps/Eyebrow";
import YesAndAlsoNoSection from "@/components/pps/v2/YesAndAlsoNoSection";
import { ShIFt } from "@/components/pps/v2/ShIFt";
import homeHero from "@/assets/heroes/home-hero.jpg";
import blueDoorHero from "@/assets/blue-door-hero.jpg";

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

/**
 * DRAFT — Epic ShIFt alternative homepage (/home-v2).
 * Not linked from navigation. Gated to draft in `page_status`.
 */
export default function HomeV2() {
  useDocumentSeo({
    title: "Epic ShIFt | Painted Porch Strategies",
    description:
      "We partner with leaders at the threshold of what is next, designing culture, operations, and human capacity at the same time so the shift holds.",
    robots: "noindex, nofollow",
  });

  return (
    <div className="bg-white">
      {/* 1. Hero */}
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Change Origination
          </span>
        }
        headline={
          <>
            Author the <ShIFt tone="gold" /> you intend to lead.
          </>
        }
        description={
          <p data-body-allow>
            Most organizations spend their energy reacting to change someone else started. We partner
            with leaders at the threshold of what is next, while the direction is still yours to
            write.
          </p>
        }
        ctas={[
          { label: "Open Your Blue Door", href: "/blue-door", isPrimary: true, buttonClassName: "bg-bluedoor border-2 border-bluedoor text-white hover:bg-white hover:text-bluedoor" },
          { label: "See How We Work", href: "/how-we-work" },
        ]}
        background={{ type: "image", src: homeHero }}
        overlayClass="bg-navy/55"
      />

      <StatMarquee statIds={["mck_complexity", "gartner_adoption", "gallup_engagement"]} />

      {/* 2. The moment */}
      <section className="py-20 md:py-28 bg-white" aria-labelledby="the-moment">
        <div className="container max-w-4xl mx-auto px-6">
          <FadeIn>
            <Eyebrow tone="teal">The moment</Eyebrow>
            <h2 id="the-moment" className="text-3xl md:text-4xl font-bold text-navy mb-6 leading-tight">
              There is a quiet moment before every real change, where a bigger question forms.
            </h2>
            <p className="text-lead text-charcoal mb-4">
              It rarely arrives as a crisis. It shows up as a growth curve that is bending faster than
              the org chart, a market opening that will not stay open, a technology decision that
              suddenly touches everything.
            </p>
            <p className="text-lead text-charcoal">
              You already know something is going to move. What you are weighing is whether the
              organization you have today can carry the organization you are about to become.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* 3. The one question */}
      <section className="py-16 md:py-20 bg-navy" aria-labelledby="the-question">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <Eyebrow tone="gold">The one question</Eyebrow>
            <h2 id="the-question" className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
              Does our organization have the architecture to lead this?
            </h2>
            <p className="text-lead text-white/85">
              Not the appetite. Not the intention. The architecture. That question is where every
              engagement here begins.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* 4 + 5. Yes, and also no + the three Pillars */}
      <YesAndAlsoNoSection />

      {/* 6. The Blue Door — three framings for comparison */}
      <section className="py-20 md:py-28 bg-muted/40" aria-labelledby="blue-door">
        <div className="container max-w-5xl mx-auto px-6">
          <FadeIn className="max-w-3xl mb-10">
            <Eyebrow tone="cobalt">Where it starts</Eyebrow>
            <h2 id="blue-door" className="text-3xl md:text-4xl font-bold text-navy mb-5 leading-tight">
              <span className="text-bluedoor font-bold">The Blue Door</span>
            </h2>
            <p className="text-body text-charcoal/70 italic">
              Draft note: three framings below. Pick one and the other two get deleted.
            </p>
          </FadeIn>

          <div className="space-y-6">
            {/* A */}
            <FadeIn>
              <div className="bg-white border-l-4 border-bluedoor rounded-xl p-8 shadow-sm">
                <Eyebrow tone="cobalt">Framing A: Possibility first</Eyebrow>
                <p className="text-lead text-charcoal mb-4">
                  Before you commit budget, headcount, and eighteen months of attention, there is a
                  version of this move that is bigger than the one currently on the table. The Blue
                  Door is a structured organizational appraisal that reads all three Pillars at once
                  and shows you which one you are actually positioned to lead.
                </p>
                <p className="text-body text-charcoal">
                  The expensive number is not what a misfire costs. It is the market position you
                  could have taken and did not.
                </p>
              </div>
            </FadeIn>

            {/* B */}
            <FadeIn>
              <div className="bg-white border-l-4 border-bluedoor rounded-xl p-8 shadow-sm">
                <Eyebrow tone="cobalt">Framing B: The honest mirror</Eyebrow>
                <p className="text-lead text-charcoal mb-4">
                  Your organization was designed, structurally and culturally, for a version of itself
                  that no longer exists. That is not a failure. It is what happens to every
                  organization that grew. The Blue Door is a structured organizational appraisal that
                  names exactly where the design and the ambition have come apart.
                </p>
                <p className="text-body text-charcoal">
                  What becomes visible is not a list of problems. It is the shape of what you are
                  built to carry next.
                </p>
              </div>
            </FadeIn>

            {/* C */}
            <FadeIn>
              <div className="bg-white border-l-4 border-bluedoor rounded-xl p-8 shadow-sm">
                <Eyebrow tone="cobalt">Framing C: The deliberate pause</Eyebrow>
                <p className="text-lead text-charcoal mb-4">
                  Serious leaders take one deliberate pause before they commit. The Blue Door is that
                  pause, made structured: an organizational appraisal across culture, operations, and
                  human capacity, read together rather than one at a time.
                </p>
                <p className="text-body text-charcoal">
                  A single-lever assessment cannot show you this, because the answer lives in how the
                  three interact.
                </p>
              </div>
            </FadeIn>
          </div>

          <FadeIn>
            <div className="mt-10">
              <Link
                to="/blue-door"
                className="inline-flex items-center gap-2 bg-bluedoor text-white font-poppins font-semibold text-base px-8 h-12 rounded-md hover:bg-white hover:text-bluedoor border-2 border-bluedoor transition-colors focus-ring-on-dark"
              >
                <DoorOpen className="w-5 h-5" aria-hidden="true" />
                Open the Blue Door
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 7. The boundary */}
      <section className="py-20 md:py-24 bg-white" aria-labelledby="the-boundary">
        <div className="container max-w-4xl mx-auto px-6">
          <FadeIn>
            <Eyebrow tone="purple">The boundary</Eyebrow>
            <h2 id="the-boundary" className="text-3xl md:text-4xl font-bold text-navy mb-6 leading-tight">
              We design the building. You construct it.
            </h2>
            <p className="text-lead text-charcoal mb-4">
              Because the unit of work is the whole organism at the design stage, the engagement ends
              at the close of Align. You leave with the architecture, the decision rights, and the
              capability inside your own team to build it.
            </p>
            <p className="text-lead text-charcoal mb-8">
              We are not looking for a permanent seat at your table. We are looking for the moment
              you stop needing one.
            </p>
            <Link
              to="/how-we-work"
              className="inline-flex items-center gap-2 font-poppins font-semibold text-primary hover:text-navy transition-colors"
            >
              See how we work
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* 8. Proof */}
      <ClientLogoMarquee />

      {/* 9. Final CTA */}
      <ParallaxCTA
        backgroundImage={blueDoorHero}
        eyebrow="The threshold of what is next"
        headline={
          <>
            What is your organization becoming, and is it built to carry that?
          </>
        }
        description="Start with a structured appraisal of all three Pillars, then decide what you want to lead."
        actions={[
          { label: "Open the Blue Door", to: "/blue-door", variant: "bluedoor" },
          { label: "Contact Us", to: "/contact", variant: "secondary" },
        ]}
        overlayTone="teal"
      />
    </div>
  );
}
