import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Users } from "lucide-react";
import { TIER_LIST } from "@/config/tiers";
import { TierBadge } from "@/components/pps/TierBadge";

const tierContent = {
  IGNITE: {
    tagline: "Light the spark. Prove this works.",
    journey: "Self-led courses, strategic assessments, and frameworks you can apply immediately, at your own pace, on your own terms.",
    features: [
      "Self-Led Courses (to spark new ideas and capabilities around Mindset, Communication, Team Dynamics, and more)",
      "Strategic Assessments (for uncovering your EQ, Working Genius, Performance DNA, or Change Leadership Style)",
      "Masterclasses (30-90 minute focused sessions on one or more Essential Elements for authoring and leading extraordinary teams and epic shIFt)",
    ],
    perfectFor: [
      "Leaders exploring Phase Zero concepts",
      "Organizations testing before full commitment",
      "Individual development investment",
      "Anyone asking \"Could this work for me?\"",
    ],
    timeline: "Self-paced",
    cta: "Explore IGNITE",
  },
  AMPLIFY: {
    tagline: "Boost momentum and alignment for your next shIFt.",
    journey: "Team workshops, strategic sprints, and cohort-based learning designed for leadership teams ready to align around transformation, together.",
    features: [
      "Executive Strategy & Team Workshops",
      "Strategic Sprints (90-day focused partnerships)",
      "Leadership Labs (peer learning with other executives and leaders)",
    ],
    perfectFor: [
      "Leadership teams needing strategic alignment",
      "Organizations exploring focused transformation",
      "Teams investing in collective capacity",
      "Anyone saying \"My team needs this together\"",
    ],
    timeline: "3-6 months (focused engagement)",
    cta: "Explore AMPLIFY",
  },
  EMBODY: {
    tagline: "Architect transformation that lasts.",
    journey: "Embedded strategic partnership (6+ months) to co-architect permanent organizational capacity, comprehensive, deep, transformative.",
    features: [
      "Architect Change Sessions (Phase Zero strategic co-design)",
      "Executive Advisory Partnership (ongoing strategic guidance)",
      "Leadership Summits (semi-annual C-suite alignment)",
      "Complete transformation architecture across all three Painted Porch Pillars",
    ],
    perfectFor: [
      "C-suite executives & organizational leaders",
      "Organizations pursuing permanent transformation",
      "Leaders ready for long-term embedded partnership",
      "Anyone committed to \"This is who we're becoming\"",
    ],
    timeline: "6+ months (with option to continue)",
    cta: "Explore EMBODY",
  },
};

export function PathwayComparisonSection() {
  return (
    <section id="pathways" className="py-16 md:py-24 bg-gradient-to-b from-white to-muted">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Your P.A.T.H.way to Extraordinary Sh<span className="text-raspberry font-bold">IF</span>t
          </h2>
          <div className="text-foreground space-y-4">
            <p>
              Most transformation programs offer you two options: buy a certification course or hire a consultant. But real transformation doesn't work that way.
            </p>
            <p>
              Each P.A.T.H.way is designed for a different level of commitment and transformation ambition.
            </p>
            <p>
              Some leaders need a spark, proof that change can work here. Some need momentum, compounded results from aligned teams. Some need permanence, unshakeable foundations that outlast any single initiative.
            </p>
            <p>
              <strong>Different depths. Different timelines. Different investments.</strong>
            </p>
            <p className="text-primary font-medium">
              But the same underlying principle: You can't architect transformation by skipping Phase Zero.
            </p>
            <p className="font-bold">
              Where are you right now? And where do you want to go and start some new sh<strong className="text-raspberry">IF</strong>t next?
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TIER_LIST.map((tier) => {
            const content = tierContent[tier.name as keyof typeof tierContent];
            
            return (
              <div
                key={tier.name}
                className={`relative ${tier.bgColor} p-8 rounded-xl border-t-4 ${tier.borderColor} flex flex-col`}
              >
                <TierBadge tier={tier} className="mb-4" />
                <p className={`text-sm font-semibold ${tier.textColor} mb-3`}>
                  {content.tagline}
                </p>
                <p className="text-foreground mb-4 text-sm leading-relaxed">
                  {content.journey}
                </p>
                
                {/* Perfect For (above The Experience) */}
                {"perfectFor" in content && content.perfectFor && (
                  <div className="mb-4">
                    <h4 className="text-base md:text-lg font-poppins font-semibold uppercase tracking-wide text-navy/70 mb-2">
                      Perfect For:
                    </h4>
                    <ul className="space-y-2">
                      {content.perfectFor.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Users className={`w-4 h-4 ${tier.textColor} flex-shrink-0 mt-0.5`} />
                          <span className="text-xs text-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}



                <div className="mt-auto">
                  {/* Timeline */}
                  <p className="text-xs text-foreground mb-4">
                    <span className="font-semibold">Timeline:</span> {content.timeline}
                  </p>
                  <Button asChild className={`w-full ${tier.solidButtonClasses} transition-colors`}>
                  <Link to={tier.href}>Explore <strong>{tier.name}</strong> <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* P.A.T.H.finder Quiz CTA */}
        <div className="flex flex-col items-center mt-12 px-4">
          <p className="text-foreground mb-4 text-center">
            Unsure which P.A.T.H.way to explore first? Take our free P.A.T.H.finder quiz
          </p>
          <Link to="/start-here" className="w-full max-w-[20rem] sm:w-auto sm:max-w-full">
            <Button className="bg-primary text-white hover:bg-primary/90 px-4 sm:px-12 py-4 sm:py-6 text-sm sm:text-lg font-semibold rounded-lg transition-colors w-full sm:w-auto max-w-full whitespace-normal h-auto leading-tight text-center">
              <span className="min-w-0 whitespace-normal">Take Free P.A.T.H.finder Quiz</span> <ArrowRight className="ml-2 w-5 h-5 shrink-0" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
