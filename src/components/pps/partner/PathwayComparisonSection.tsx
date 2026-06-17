import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Users } from "lucide-react";
import { TIER_LIST } from "@/config/tiers";
import { TierBadge } from "@/components/pps/TierBadge";

const tierContent = {
  IGNITE: {
    tagline: "SELF: Light the spark. Prove this works.",
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
    tagline: "Team: Boost momentum and alignment for your next shIFt.",
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
    tagline: "Organization: Architect transformation that lasts.",
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
      <div className="container max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Three Ways to Partner. One Philosophy.
          </h2>
          <div className="text-foreground space-y-4">
            <p>
              Whether you're looking for personal growth, stronger team performance, or organization-wide transformation, every P.A.T.H.way is grounded in the same principles:
            </p>
            <div className="py-4 space-y-3 font-bold text-lg text-navy">
              <p>Reason.</p>
              <p>Logic.</p>
              <p>Purpose.</p>
              <p>Virtue.</p>
            </div>
            <p>
              What changes is the scale of application, the depth of engagement, and what you're trying to accomplish.
            </p>
            <p>
              There is no required sequence, <span className="font-bold">only the right next step for you on your path.</span>
            </p>
          </div>
        </div>

        {/* Pathway Cards Header */}
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-extrabold text-navy mb-6">
            Start Where You Are
          </h3>
          <div className="text-foreground space-y-3">
            <p>Some people arrive looking for greater clarity, confidence, and capability in their own work.&nbsp;Others are responsible for teams, departments, or entire organizations.</p>
            <p>P.A.T.H.ways are designed to meet you where you are and provide a clear direction for what comes next.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TIER_LIST.map((tier) => {
            const content = tierContent[tier.name as keyof typeof tierContent];
            
            return (
              <div
                key={tier.name}
                className={`relative ${tier.bgColor} p-8 rounded-xl border-t-4 ${tier.borderColor} flex flex-col h-full`}
              >
                <div className="flex-1">
                  <TierBadge tier={tier} className="mb-4" />
                  <p className={`text-sm font-semibold ${tier.textColor} mb-3`}>
                    {content.tagline}
                  </p>
                  <p className="text-foreground mb-4 text-sm leading-relaxed">
                    {content.journey}
                  </p>
                </div>

                {/* Perfect For */}
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

                {/* Timeline + CTA */}
                <div className="mt-auto">
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
