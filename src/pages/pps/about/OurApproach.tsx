import { Link } from "react-router-dom";
import { CheckCircle, X } from "lucide-react";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import ParallaxCTA from "@/components/pps/ParallaxCTA";
import PartnershipPromise from "@/components/pps/PartnershipPromise";
import approachHero from "@/assets/heroes/approach-hero.jpg";
import blueDoorHero from "@/assets/blue-door-hero.jpg";

const coreValues = [
  {
    number: "01",
    title: "Purpose",
    description:
      "We exist to change how people design, define, and connect with their work, so they can lead with more clarity, more strength, and more meaning.",
    detail:
      "That shows up as mindful leaders, resilient teams, and communication that actually lands.",
    color: "bg-strategic/10",
    borderColor: "border-strategic",
  },
  {
    number: "02",
    title: "Partnership",
    description:
      "You are the expert on your life and your organization. We bring frameworks, real questions, and outside perspective. You bring the context only you can see.",
    detail:
      "We act as a guide and advisor, not a vendor. The win is when you can carry the work without us.",
    color: "bg-primary/10",
    borderColor: "border-primary",
  },
  {
    number: "03",
    title: "Stewardship",
    description:
      "Real results come from shared commitment, trust, and clear accountability on both sides of the table.",
    detail:
      "We are here to do good work that is financially worth it and personally worth it, where talent, purpose, and contribution all line up.",
    color: "bg-lime/10",
    borderColor: "border-lime",
  },
];

const beliefs = [
  "People are the load-bearing part of every transformation.",
  "Clarity comes before strategy, not after it.",
  "Real questions are more useful than confident answers.",
  "Frameworks are tools, not religions.",
  "Change that does not respect culture will not hold.",
];

const rejects = [
  "Change theater that looks busy but moves nothing.",
  "One-size playbooks dropped on a unique organization.",
  "Treating people like obstacles to manage.",
  "Tech rollouts that skip the human work.",
  "Speed for its own sake.",
];

const createConditions = [
  "Leaders who can name what they are really trying to build.",
  "Teams who can disagree well and decide together.",
  "Systems that match how work actually flows.",
  "Cultures where the next change does not feel like the first.",
];

export default function OurApproach() {
  return (
    <div>
      {/* Hero */}
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            How We Work
          </span>
        }
        headline="Our Approach"
        description={
          <>
            <p className="mb-4">
              The strongest people and organizations build three things on
              purpose:{" "}
              <span className="font-semibold text-gold">emotional resilience</span>,{" "}
              <span className="font-semibold text-gold">quality connection</span>,
              and{" "}
              <span className="font-semibold text-gold">clear communication</span>.
            </p>
            <p>
              That mix is what lets change actually take hold and last.
            </p>
          </>
        }
        ctas={[
          { label: "Partner With Us", href: "/partner", isPrimary: true },
        ]}
        background={{ type: "image", src: approachHero }}
        overlayClass="bg-navy/50"
        minHeightClass="min-h-[60vh]"
      />

      {/* Core Values */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-foreground max-w-2xl mx-auto">
              Three values that decide how we show up in every partnership.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {coreValues.map((value, index) => (
              <div
                key={index}
                className={`${value.color} p-8 rounded-xl border-t-4 ${value.borderColor}`}
              >
                <span className="text-4xl font-bold text-navy/20 font-poppins">
                  {value.number}
                </span>
                <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mt-2 mb-4">
                  {value.title}
                </h3>
                <p className="text-foreground leading-relaxed mb-4">
                  {value.description}
                </p>
                <p className="text-foreground/80 text-sm leading-relaxed">
                  {value.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manifesto: What we believe / reject */}
      <section className="py-16 md:py-24 bg-muted/60">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-poppins font-semibold uppercase tracking-[0.2em] text-primary mb-3">
              Our Manifesto
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              What we stand for, and what we will not do.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-7 border-t-4 border-lime shadow-sm">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-lime mb-4">
                What we believe:
              </h3>
              <ul className="space-y-3">
                {beliefs.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-foreground leading-relaxed">
                    <CheckCircle className="w-5 h-5 text-lime flex-shrink-0 mt-1" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl p-7 border-t-4 border-raspberry shadow-sm">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-raspberry mb-4">
                What we reject:
              </h3>
              <ul className="space-y-3">
                {rejects.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-foreground leading-relaxed">
                    <X className="w-5 h-5 text-raspberry flex-shrink-0 mt-1" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What we create the conditions for */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-poppins font-semibold uppercase tracking-[0.2em] text-gold mb-3">
              The Conditions We Build Together
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              What our work makes possible.
            </h2>
            <p className="text-lg text-foreground leading-relaxed">
              We do not deliver change. We build the conditions where the
              right change becomes possible, and where your team can carry
              it.
            </p>
          </div>
          <ul className="space-y-4 max-w-2xl mx-auto">
            {createConditions.map((c) => (
              <li
                key={c}
                className="flex items-start gap-3 bg-muted/50 rounded-lg p-4"
              >
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <span className="text-foreground leading-relaxed">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The Painted Porch promise + Where we fit */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-gradient-to-br from-navy to-navy/90 text-white rounded-2xl p-8 md:p-10 border-b-4 border-gold shadow-xl">
              <p className="text-xs font-poppins font-semibold uppercase tracking-[0.2em] text-gold mb-3">
                The Painted Porch Promise
              </p>
              <h3 className="text-xl md:text-2xl font-poppins font-bold mb-5">
                You will not need us forever.
              </h3>
              <p className="text-white/90 leading-relaxed mb-4">
                The point of partnership is not a long contract. It is your
                team becoming the people who can author the next change on
                their own.
              </p>
              <p className="text-gold font-semibold">
                Success is when we design ourselves out of the equation.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-navy/10">
              <p className="text-xs font-poppins font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                Where We Fit
              </p>
              <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-5">
                Upstream of the rollout.
              </h3>
              <p className="text-foreground leading-relaxed mb-4">
                Most advisors arrive after the decision is made. We come in
                earlier, while you are still deciding what change to lead
                and whether your organization can carry it.
              </p>
              <p className="text-foreground leading-relaxed">
                That is the work we call{" "}
                <Link
                  to="/phase-zero"
                  className="font-semibold text-primary hover:underline"
                >
                  Phase Zero
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <ParallaxCTA
        backgroundImage={blueDoorHero}
        overlayClass="bg-gradient-to-b from-navy/60 via-navy/40 to-navy/25"
        eyebrow="Start Here"
        headline="The Blue Door is the simplest place to begin."
        description="A structured conversation about where your organization actually stands, before the next big decision gets locked in."
        actions={[
          { label: "Open the Blue Door", to: "/blue-door", variant: "bluedoor" },
          { label: "Find Your P.A.T.H.way", to: "/start-here", variant: "secondary" },
        ]}
      />

      <PartnershipPromise />
    </div>
  );
}
