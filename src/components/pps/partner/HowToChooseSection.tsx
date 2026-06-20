import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Info, ArrowRight } from "lucide-react";
import { TIERS } from "@/config/tiers";
import { BLUE_DOOR_PRICE_DISPLAY } from "@/config/blueDoor";
import { usePathFinderQuiz } from "@/components/pps/quiz/PathFinderQuizProvider";

const choiceCards = [
  {
    tier: TIERS.IGNITE,
    conditions: [
      "You're exploring Phase Zero for the first time",
      "You want to prove transformation works before bigger investment",
      "You're focused on your own leadership development",
      "You're still evaluating what direction makes the most sense for your reality",
      "You want flexibility and self-paced learning",
    ],
    cta: {
      primary: { label: "Explore IGNITE", href: "/partner/ignite" },
    },
  },
  {
    tier: TIERS.AMPLIFY,
    conditions: [
      "Your leadership team is misaligned on strategic direction",
      "You're exploring focused transformation (not total overhaul)",
      "You've completed IGNITE and want more depth",
      "You want cohort learning with peer leaders",
    ],
    cta: {
      primary: { label: "Explore AMPLIFY", href: "/partner/amplify" },
    },
  },
  {
    tier: TIERS.EMBODY,
    conditions: [
      "You're a C-suite executive pursuing permanent transformation",
      "Your organization is facing significant strategic change",
      "You want embedded partnership, not project-based work",
      "You're ready for 6-12+ month commitment",
      "You're building organizational capability that lasts beyond any single initiative",
    ],
    cta: {
      primary: { label: "Explore EMBODY", href: "/partner/embody" },
    },
  },
];

export function HowToChooseSection() {
  const { open: openQuiz } = usePathFinderQuiz();
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-muted to-white">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Not Sure Which P.A.T.H.way Fits Where You Are?
          </h2>
          <p className="text-body text-foreground max-w-2xl mx-auto">
            No problem, we've got you. Here's how to think about it:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {choiceCards.map((card, index) => (
            <div 
              key={index} 
              className={`bg-white p-6 rounded-xl border-t-4 ${card.tier.borderColor} shadow-sm flex flex-col`}
            >
              <h3 className={`text-xl md:text-2xl font-poppins font-bold ${card.tier.textColor} mb-4`}>
                Start with {card.tier.name} if...
              </h3>
              <ul className="space-y-3 mb-6 flex-1">
                {card.conditions.map((condition, i) => (
                  <li key={i} className="text-body flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-lime flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{condition}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-auto">
                <Button asChild className={`w-full ${card.tier.solidButtonClasses} transition-colors text-sm`}>
                  <Link to={card.cta.primary.href}>Explore <strong>{card.tier.name}</strong></Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* P.A.T.H.finder Quiz CTA */}
        <div className="flex flex-col items-center mt-12 px-4">
          <p className="text-body text-foreground mb-4 text-center">
            At a fork in your P.A.T.H.way decision? Take our P.A.T.H.finder quiz to determine which direction is best based on your needs.
          </p>
          <Button
            onClick={openQuiz}
            className="bg-primary border-2 border-primary text-white hover:bg-transparent hover:text-primary px-4 sm:px-12 py-4 sm:py-6 text-sm sm:text-lg font-semibold rounded-lg transition-colors w-full max-w-[20rem] sm:w-auto sm:max-w-full whitespace-normal h-auto leading-tight text-center"
          >
            <span className="min-w-0 whitespace-normal">Take Free P.A.T.H.finder Quiz</span> <ArrowRight className="ml-2 w-5 h-5 shrink-0" />
          </Button>
        </div>
      </div>
    </section>
  );
}

export function BlueDoorCalloutSection() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="bg-bluedoor/10 rounded-xl p-6 md:p-8">
          <div className="flex items-start gap-2 mb-3">
            <Info className="w-5 h-5 text-bluedoor flex-shrink-0 mt-1" />
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy">
              Exploring on Behalf of Your Team or Organization?
            </h3>
          </div>
          <p className="text-body text-foreground mb-6">
            If you're responsible for leading change, setting direction, or navigating a major decision, the <span className="text-bluedoor font-bold">Blue Door</span> often provides the clearest place to begin.&nbsp;It offers a structured appraisal of your organization's current reality and reveals which opportunities, challenges, and priorities deserve attention first.
            <br /><br />
            For many leaders, it becomes the bridge between possibility and action.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-bold text-bluedoor">{BLUE_DOOR_PRICE_DISPLAY}</span>
              <span className="text-foreground/60">|</span>
              <span className="text-foreground/70">Less than 30 minutes</span>
            </div>
            <Link to="/blue-door">
              <Button className="bg-transparent border-2 border-bluedoor text-bluedoor hover:bg-bluedoor hover:text-white transition-colors">
                Learn More <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
