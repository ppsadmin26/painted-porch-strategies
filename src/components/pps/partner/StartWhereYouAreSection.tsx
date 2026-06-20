import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";
import { TIER_LIST } from "@/config/tiers";
import { TierBadge } from "@/components/pps/TierBadge";

const tierContent = {
  IGNITE: {
    tagline: "SELF: Light the spark. Prove this works.",
    journey:
      "Self-led courses, assessments, and frameworks you can apply immediately, at your own pace, on your own terms.",
    perfectFor: [
      "Leaders exploring Phase Zero concepts",
      "Organizations exploring before making a larger investment",
      "Individual development investment",
      'Anyone asking "Could this work for me?"',
    ],
    timeline: "Self-paced",
  },
  AMPLIFY: {
    tagline: "TEAM: Build momentum and collective capability",
    journey:
      "Team workshops, strategic sprints, and cohort-based learning designed for leadership teams ready to build alignment around transformation, together.",
    perfectFor: [
      "Leadership teams needing strategic alignment",
      "Organizations exploring focused capability building",
      "Teams investing in collective capacity",
      'Anyone saying "My team needs to navigate this together"',
    ],
    timeline: "3-6 months (focused engagement)",
  },
  EMBODY: {
    tagline: "ORG: Architect transformation that lasts.",
    journey:
      "Embedded strategic partnership (6+ months) to co-architect permanent organizational capacity, capability, and adaptability.",
    perfectFor: [
      "C-suite executives & organizational leaders",
      "Organizations pursuing permanent transformation",
      "Leaders ready for long-term embedded partnership",
      'Anyone committed to "This is who we\'re becoming"',
    ],
    timeline: "6+ months (with option to continue)",
  },
};

export function StartWhereYouAreSection() {
  return (
    <section id="start-where-you-are" className="py-16 md:py-24 bg-muted">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-navy mb-6">
            Start Where You Are
          </h2>
          <div className="text-foreground space-y-3">
            <p className="text-body">
              Some people arrive looking for greater clarity, confidence, and capability in their own work.&nbsp;Others are responsible for teams, departments, or entire organizations.
            </p>
            <p className="text-body">
              P.A.T.H.ways are designed to meet you where you are and provide a clear direction forward.
            </p>
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
                <div className="flex flex-col pb-8">
                  <div className="flex-shrink-0">
                    <TierBadge tier={tier} className="mb-4" />
                    <p className={`text-body-sm font-semibold ${tier.textColor} mb-6`}>
                      {content.tagline}
                    </p>
                  </div>
                  <p className="text-body text-foreground leading-relaxed mt-6">
                    {content.journey}
                  </p>
                </div>

                <div className="flex-1 flex flex-col">
                  <h3 className="text-base md:text-lg font-poppins font-semibold uppercase tracking-wide text-navy/70 mb-2">
                    Perfect For:
                  </h3>
                  <ul className="space-y-2">
                    {content.perfectFor.map((item, i) => (
                      <li key={i} className="text-body flex items-start gap-2">
                        <Users className={`w-4 h-4 ${tier.textColor} flex-shrink-0 mt-0.5`} />
                        <span className="text-body-sm text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4">
                  <p className="text-body text-foreground mb-4">
                    <span className="font-semibold">Timeline:</span> {content.timeline}
                  </p>
                  <Button asChild className={`w-full ${tier.solidButtonClasses} transition-colors`}>
                    <Link to={tier.href}>
                      Explore <strong>{tier.name}</strong> <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* P.A.T.H.finder Quiz CTA */}
        <div className="flex flex-col items-center mt-12 px-4">
          <p className="text-body text-foreground mb-4 text-center">
            Unsure which P.A.T.H.way to explore first? Take our free P.A.T.H.finder quiz
          </p>
          <Link to="/start-here" className="w-full max-w-[20rem] sm:w-auto sm:max-w-full">
            <Button className="bg-primary text-white hover:bg-primary/90 px-4 sm:px-12 py-4 sm:py-6 text-sm sm:text-lg font-semibold rounded-lg transition-colors w-full sm:w-auto max-w-full whitespace-normal h-auto leading-tight text-center">
              <span className="min-w-0 whitespace-normal">Take Free P.A.T.H.finder Quiz</span>
              <ArrowRight className="ml-2 w-5 h-5 shrink-0" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
