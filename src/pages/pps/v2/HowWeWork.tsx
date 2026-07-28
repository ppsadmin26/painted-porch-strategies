import { Link } from "react-router-dom";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { useScrollAnimation, getAnimationClasses } from "@/hooks/useScrollAnimation";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import ParallaxCTA from "@/components/pps/ParallaxCTA";
import { PPSBreadcrumb } from "@/components/pps/PPSBreadcrumb";
import { Eyebrow } from "@/components/pps/Eyebrow";
import { ShIFt } from "@/components/pps/v2/ShIFt";
import { Check, X, ArrowRight } from "lucide-react";
import approachHero from "@/assets/heroes/approach-hero.jpg";
import phaseZeroHero from "@/assets/heroes/phase-zero-hero.jpg";

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

const stages = [
  {
    step: "Appraise",
    accent: "text-bluedoor",
    border: "border-l-bluedoor",
    bg: "bg-bluedoor/5",
    body: "A structured read of all three Pillars at the same time. Not a survey and not a score. We surface where the current design and the intended direction have come apart, and what that gap is costing in speed.",
  },
  {
    step: "Prepare",
    accent: "text-navy",
    border: "border-l-navy",
    bg: "bg-[hsl(220,60%,96%)]",
    body: "Leaders get clear on what change they could credibly lead, and whether the organization is structurally capable of leading it. This is Phase Zero™: the work before the work.",
  },
  {
    step: "Align",
    accent: "text-strategic",
    border: "border-l-strategic",
    bg: "bg-strategic/10",
    body: "We co-design the architecture. Decision rights, operating cadence, governance, and the human capacity that has to carry it. Culture, systems, and people designed together, not in sequence.",
  },
  {
    step: "Hand off",
    accent: "text-gold",
    border: "border-l-gold",
    bg: "bg-gold/10",
    body: "You take it from here. The build belongs to your team, with the capability and the judgment already inside the room. We stay reachable, not resident.",
  },
];

const fit = [
  "Senior leadership is at a real decision point, not a hypothetical one",
  "Someone with authority is in the room and stays in the room",
  "You are willing to look at culture, operations, and people together",
  "You want the capability to live inside your team when we leave",
];

const notFit = [
  "You need a single workshop to satisfy a training requirement",
  "The decision is already made and you need validation for it",
  "Only one dimension is on the table and the other two are off limits",
  "You are looking for a long-term embedded vendor",
];

/**
 * DRAFT — /how-we-work. Engagement architecture and scope boundary.
 */
export default function HowWeWork() {
  useDocumentSeo({
    title: "How We Work | Painted Porch Strategies",
    description:
      "Our engagement architecture: appraise, prepare, align, hand off. We design the building. You construct it.",
    robots: "noindex, nofollow",
  });

  return (
    <div className="bg-white">
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            The engagement architecture
          </span>
        }
        headline="We design the building. You construct it."
        description={
          <p data-body-allow>
            A defined arc with a defined end. We work the whole organism at the design stage, then we
            hand the build to the people who have to live with it.
          </p>
        }
        ctas={[
          { label: "Open Your Blue Door", href: "/blue-door", isPrimary: true, buttonClassName: "bg-bluedoor border-2 border-bluedoor text-white hover:bg-white hover:text-bluedoor" },
          { label: "Contact Us", href: "/contact" },
        ]}
        background={{ type: "image", src: approachHero }}
        overlayClass="bg-navy/55"
      />

      <PPSBreadcrumb items={[{ label: "How We Work" }]} />

      {/* Stages */}
      <section className="py-20 md:py-28 bg-white" aria-labelledby="stages">
        <div className="container max-w-5xl mx-auto px-6">
          <FadeIn className="max-w-3xl mb-12">
            <Eyebrow tone="teal">The arc</Eyebrow>
            <h2 id="stages" className="text-3xl md:text-4xl font-bold text-navy mb-5 leading-tight">
              Four stages, and then we are done
            </h2>
            <p className="text-lead text-charcoal">
              Every stage reads culture, operations, and human capacity at the same time. Pulling one
              lever and hoping the other two follow is the pattern we exist to break.
            </p>
          </FadeIn>

          <div className="space-y-5">
            {stages.map((stage, i) => (
              <FadeIn key={stage.step}>
                <div className={`${stage.bg} ${stage.border} border-l-4 rounded-xl p-7 flex gap-6`}>
                  <span className={`font-poppins font-bold text-3xl ${stage.accent} shrink-0`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className={`font-poppins font-bold text-xl mb-2 ${stage.accent}`}>{stage.step}</h3>
                    <p className="text-body text-charcoal">{stage.body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Scope boundary */}
      <section className="py-16 md:py-20 bg-navy" aria-labelledby="boundary">
        <div className="container max-w-4xl mx-auto px-6">
          <FadeIn>
            <Eyebrow tone="gold">The boundary</Eyebrow>
            <h2 id="boundary" className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              The engagement ends at the close of Align
            </h2>
            <p className="text-lead text-white/90 mb-4">
              This is not a limitation we apologize for. It is the logical end of the work we do. The
              value of designing the whole organism disappears the moment we become one more
              dependency inside it.
            </p>
            <p className="text-lead text-white/90">
              You leave with the architecture, the decision rights, and the capability to carry the
              next <ShIFt lowercase tone="gold" /> without us.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Fit */}
      <section className="py-20 md:py-28 bg-white" aria-labelledby="fit">
        <div className="container max-w-5xl mx-auto px-6">
          <FadeIn className="max-w-3xl mb-10">
            <Eyebrow tone="purple">Qualification</Eyebrow>
            <h2 id="fit" className="text-3xl md:text-4xl font-bold text-navy mb-5 leading-tight">
              This work has conditions
            </h2>
            <p className="text-lead text-charcoal">
              Whole-organism design only works when all three dimensions are genuinely on the table.
              We would rather say so early than deliver a fraction of what is possible.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            <FadeIn>
              <div className="h-full bg-primary/5 border-l-4 border-l-primary rounded-xl p-7">
                <h3 className="font-poppins font-bold text-xl text-primary mb-4">Strong fit</h3>
                <ul className="list-none space-y-3">
                  {fit.map((item) => (
                    <li key={item} className="text-body text-charcoal flex gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
            <FadeIn>
              <div className="h-full bg-raspberry/5 border-l-4 border-l-raspberry rounded-xl p-7">
                <h3 className="font-poppins font-bold text-xl text-raspberry mb-4">Not a fit</h3>
                <ul className="list-none space-y-3">
                  {notFit.map((item) => (
                    <li key={item} className="text-body text-charcoal flex gap-3">
                      <X className="w-5 h-5 text-raspberry shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>

          <FadeIn>
            <div className="mt-10">
              <Link
                to="/epic-shift"
                className="inline-flex items-center gap-2 font-poppins font-semibold text-primary hover:text-navy transition-colors"
              >
                Read the philosophy behind this
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <ParallaxCTA
        backgroundImage={phaseZeroHero}
        eyebrow="Start at the threshold"
        headline="Find out what your organization is actually built to carry"
        description="The Blue Door reads all three Pillars together, before resources get committed in the wrong direction."
        actions={[
          { label: "Open the Blue Door", to: "/blue-door", variant: "bluedoor" },
          { label: "Contact Us", to: "/contact", variant: "secondary" },
        ]}
        overlayTone="purple"
      />
    </div>
  );
}
