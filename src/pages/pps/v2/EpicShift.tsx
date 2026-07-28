import { Link } from "react-router-dom";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { useScrollAnimation, getAnimationClasses } from "@/hooks/useScrollAnimation";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import ParallaxCTA from "@/components/pps/ParallaxCTA";
import { PPSBreadcrumb } from "@/components/pps/PPSBreadcrumb";
import { Eyebrow } from "@/components/pps/Eyebrow";
import YesAndAlsoNoSection from "@/components/pps/v2/YesAndAlsoNoSection";
import { ShIFt } from "@/components/pps/v2/ShIFt";
import { ArrowRight } from "lucide-react";
import aboutHero from "@/assets/heroes/about-hero.jpg";
import leadersHero from "@/assets/heroes/leaders-hero.jpg";

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

const shifts = [
  { from: "Reactive", to: "Regenerative", body: "From responding to a move someone else made, to originating the one others respond to." },
  { from: "Resistant", to: "Resilient", body: "From bracing against what is coming, to being structurally built to absorb and use it." },
  { from: "Adequate", to: "Extraordinary", body: "From good enough to keep pace, to a position competitors cannot easily copy." },
  { from: "Transaction", to: "Transformation", body: "From surface fixes that hold for a quarter, to structural design that holds for years." },
  { from: "Insulated", to: "Integrated", body: "From siloed functions solving their own piece, to three dimensions designed as one." },
];

/**
 * DRAFT — /epic-shift. The philosophy and language reference behind the v2 site.
 */
export default function EpicShift() {
  useDocumentSeo({
    title: "Epic ShIFt | The Philosophy | Painted Porch Strategies",
    description:
      "Why we work the whole organism instead of one lever, and what the IF in shIFt is really asking of leaders.",
    robots: "noindex, nofollow",
  });

  return (
    <div className="bg-white">
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            The philosophy
          </span>
        }
        headline={
          <>
            The <span className="text-gold">IF</span> is the whole point.
          </>
        }
        description={
          <p data-body-allow>
            Shift happens to organizations that did not author it. Epic{" "}
            <ShIFt lowercase tone="gold" /> belongs to the ones that did.
          </p>
        }
        ctas={[
          { label: "See How We Work", href: "/how-we-work", isPrimary: true },
          { label: "Open Your Blue Door", href: "/blue-door", buttonClassName: "bg-bluedoor border-2 border-bluedoor text-white hover:bg-white hover:text-bluedoor" },
        ]}
        background={{ type: "image", src: aboutHero }}
        overlayClass="bg-navy/60"
      />

      <PPSBreadcrumb segments={[{ label: "Epic ShIFt" }]} />

      {/* The porch */}
      <section className="py-20 md:py-28 bg-white" aria-labelledby="the-porch">
        <div className="container max-w-4xl mx-auto px-6">
          <FadeIn>
            <Eyebrow tone="teal">Where the name comes from</Eyebrow>
            <h2 id="the-porch" className="text-3xl md:text-4xl font-bold text-navy mb-6 leading-tight">
              The Stoics did not teach in a lecture hall. They taught on a painted porch.
            </h2>
            <p className="text-lead text-charcoal mb-4">
              The <em>stoa poikile</em> was a public colonnade in Athens, open on one side, structured
              on the other. People walked in mid-conversation and left with something they could use
              that afternoon. Rigorous thinking, out in the weather, where the actual work happens.
            </p>
            <p className="text-lead text-charcoal">
              That is the posture we take into organizations. Not a framework handed down from the
              front of the room, but structured thinking applied in the open, with the people who
              have to live with the outcome.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Categorical difference */}
      <YesAndAlsoNoSection />

      {/* Five shifts */}
      <section className="py-20 md:py-28 bg-muted/40" aria-labelledby="five-shifts">
        <div className="container max-w-5xl mx-auto px-6">
          <FadeIn className="max-w-3xl mb-12">
            <Eyebrow tone="purple">Five intentional shifts</Eyebrow>
            <h2 id="five-shifts" className="text-3xl md:text-4xl font-bold text-navy mb-5 leading-tight">
              What actually has to move
            </h2>
            <p className="text-lead text-charcoal">
              Each of these is a decision about market position, not a decision about operational
              tidiness. None of them can be made in one dimension alone.
            </p>
          </FadeIn>

          <div className="space-y-4">
            {shifts.map((shift) => (
              <FadeIn key={shift.from}>
                <div className="bg-white border border-border rounded-xl p-7 shadow-sm">
                  <p className="font-poppins font-bold text-xl mb-2">
                    <span className="text-raspberry">{shift.from}</span>
                    <span className="text-charcoal/50 mx-3">to</span>
                    <span className="text-primary">{shift.to}</span>
                  </p>
                  <p className="text-body text-charcoal">{shift.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Beliefs */}
      <section className="py-20 md:py-24 bg-navy" aria-labelledby="beliefs">
        <div className="container max-w-4xl mx-auto px-6">
          <FadeIn>
            <Eyebrow tone="gold">What we hold to be true</Eyebrow>
            <h2 id="beliefs" className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
              Four beliefs that shape every engagement
            </h2>
            <ul className="list-none space-y-6">
              <li className="text-lead text-white/90 border-l-2 border-gold pl-5">
                People do not resist change. They resist being changed. Authorship is the difference
                between the two.
              </li>
              <li className="text-lead text-white/90 border-l-2 border-gold pl-5">
                Technology does not resolve organizational problems. It reveals them, faster and in
                front of more people.
              </li>
              <li className="text-lead text-white/90 border-l-2 border-gold pl-5">
                Change is the external event. Transition is the human work. Success lives in the
                second one.
              </li>
              <li className="text-lead text-white/90 border-l-2 border-gold pl-5">
                Culture, systems, and human capacity are one organism. Treating them as three
                projects is why the last three initiatives faded.
              </li>
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* Reference library pointer */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-6">
          <FadeIn>
            <p className="text-lead text-charcoal mb-6">
              Leadership development, workshops, and assessments still exist here. They support the
              work rather than define it.
            </p>
            <Link
              to="/capabilities"
              className="inline-flex items-center gap-2 font-poppins font-semibold text-primary hover:text-navy transition-colors"
            >
              Browse capabilities and reference material
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </FadeIn>
        </div>
      </section>

      <ParallaxCTA
        backgroundImage={leadersHero}
        eyebrow="Author what comes next"
        headline="The direction is still yours to write"
        description="Start where every engagement starts: a structured read of what your organization is built to carry."
        actions={[
          { label: "Open the Blue Door", to: "/blue-door", variant: "bluedoor" },
          { label: "Contact Us", to: "/contact", variant: "secondary" },
        ]}
        overlayTone="raspberry"
      />
    </div>
  );
}
