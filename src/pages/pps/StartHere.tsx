import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { ArrowRight, CheckCircle } from "lucide-react";
import { TIER_LIST } from "@/config/tiers";
import { TierBadge } from "@/components/pps/TierBadge";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import { usePathFinderQuiz } from "@/components/pps/quiz/PathFinderQuizProvider";
import startHereHero from "@/assets/heroes/start-here-hero.jpg";

const pathwayDetails = {
  IGNITE: {
    idealFor: [
      "Individual leaders seeking personal development",
      "Teams wanting to build skills at their own pace",
      "Organizations exploring change-readiness concepts",
    ],
  },
  AMPLIFY: {
    idealFor: [
      "Teams facing specific challenges",
      "Organizations preparing for a change initiative",
      "Leaders who want expert facilitation",
    ],
  },
  EMBODY: {
    idealFor: [
      "Organizations undergoing major transformation",
      "Leadership teams needing ongoing support",
      "Companies committed to culture evolution",
    ],
  },
};

export default function StartHere() {
  useDocumentSeo({
    title: "Start Here | Discover Your P.A.T.H.way | Painted Porch",
    description: "Not sure where to start? Discover the P.A.T.H.way that fits your team: IGNITE, AMPLIFY, or EMBODY. Find your partnership in a few minutes.",
    ogImage: startHereHero,
  });
  const { open: openQuiz } = usePathFinderQuiz();
  const location = useLocation();

  // Auto-open the quiz on landing AND whenever the user re-navigates to /start-here
  // (e.g., clicking "Discover Your P.A.T.H.way" in the nav while already on this page).
  // location.key changes on every navigation, even to the same path.
  useEffect(() => {
    const t = setTimeout(openQuiz, 350);
    return () => clearTimeout(t);
  }, [openQuiz, location.key]);

  return (
    <div>
      {/* Hero */}
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Start Here
          </span>
        }
        headline="Find Your P.A.T.H.way"
        description="Not sure where to begin? Our P.A.T.H.finder quiz will surface the right partnership style and specific programs to start with on the Painted Porch."
        ctas={[]}
        background={{ type: "image", src: startHereHero }}
        overlayClass="bg-navy/50"
        minHeightClass="min-h-[60vh]"
      />

      {/* Reopen quiz button — sits just under hero so the user always has it */}
      <section className="bg-white py-8">
        <div className="container max-w-3xl mx-auto px-6 text-center">
          <Button
            onClick={openQuiz}
            className="bg-primary border-2 border-primary text-white hover:bg-transparent hover:text-primary px-6 sm:px-10 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-lg transition-colors max-w-full whitespace-normal h-auto"
          >
            Take the P.A.T.H.finder Quiz <ArrowRight className="ml-2 w-5 h-5 shrink-0" />
          </Button>
          <p className="text-sm text-foreground/70 mt-3">About 3 minutes. Email yourself the results when you're done.</p>
        </div>
      </section>


      {/* Quick Assessment */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Which P.A.T.H.way is Right for You?
            </h2>
            <p className="text-lg text-foreground max-w-2xl mx-auto">
              Each partnership style is designed for different stages, budgets, and depth of engagement.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TIER_LIST.map((tier) => {
              const details = pathwayDetails[tier.name as keyof typeof pathwayDetails];
              return (
                <div
                  key={tier.name}
                  className={`${tier.bgColor} p-8 rounded-xl border-t-4 ${tier.borderColor}`}
                >
                  <TierBadge tier={tier} className="mb-4" />
                  <p className="text-sm font-medium text-primary mb-6">
                    {tier.tagline}
                  </p>
                  <h4 className="text-base md:text-lg font-semibold text-navy mb-3">Ideal for:</h4>
                  <ul className="space-y-2 mb-6">
                    {details.idealFor.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className={`w-4 h-4 ${tier.textColor} flex-shrink-0 mt-0.5`} />
                        <span className="text-sm text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className={`w-full ${tier.outlineButtonClasses} transition-colors`}>
                  <Link to={tier.href}>Learn More <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Still Not Sure */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
            Still Not Sure?
          </h2>
          <p className="text-lg text-foreground mb-8 max-w-2xl mx-auto">
            The best way to determine the right pathway is a conversation. Contact us and we'll help you find the perfect fit.
          </p>
          <Link to="/contact?interest=general&message=I took the P.A.T.H. quiz and would like to discuss my results.">
            <Button className="bg-primary border-2 border-primary text-white hover:bg-transparent hover:text-primary text-lg py-5 px-8 transition-colors">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>

      {/* Resources */}
      <ExploreBeforeDecideSection
        freeResourcesDescription="Get a taste of our frameworks and tools with our free resources."
      />
    </div>
  );
}
