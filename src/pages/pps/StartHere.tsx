import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { TIER_LIST } from "@/config/tiers";
import { TierBadge } from "@/components/pps/TierBadge";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
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
        description="Not sure where to begin? This guide will help you identify the right engagement level for your needs, goals, and readiness."
        ctas={[
          { label: "Take the P.A.T.H.finder Quiz", href: "/blue-door", isPrimary: true },
        ]}
        background={{ type: "image", src: startHereHero }}
        overlayClass="bg-navy/50"
        minHeightClass="min-h-[60vh]"
      />

      {/* Quick Assessment */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
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
                  <h4 className="font-semibold text-navy mb-3">Ideal for:</h4>
                  <ul className="space-y-2 mb-6">
                    {details.idealFor.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className={`w-4 h-4 ${tier.textColor} flex-shrink-0 mt-0.5`} />
                        <span className="text-sm text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={tier.href}>
                    <Button className={`w-full ${tier.outlineButtonClasses} transition-colors`}>
                      Learn More <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
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
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Explore Before You Commit
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/resources/free" className="bg-muted p-6 rounded-xl hover:shadow-lg transition-all group">
              <h3 className="font-poppins font-semibold text-lg text-navy mb-2 group-hover:text-primary">
                Free Resources
              </h3>
              <p className="text-sm text-foreground mb-4">
                Get a taste of our frameworks and tools with our free resources.
              </p>
              <span className="text-primary font-semibold text-sm">
                Browse Resources →
              </span>
            </Link>
            <Link to="/resources/insights" className="bg-muted p-6 rounded-xl hover:shadow-lg transition-all group">
              <h3 className="font-poppins font-semibold text-lg text-navy mb-2 group-hover:text-primary">
                Read Insights
              </h3>
              <p className="text-sm text-foreground mb-4">
                Explore our thinking on change, leadership, and transformation.
              </p>
              <span className="text-primary font-semibold text-sm">
                Read Insights →
              </span>
            </Link>
            <Link to="/resources/youtube" className="bg-muted p-6 rounded-xl hover:shadow-lg transition-all group">
              <h3 className="font-poppins font-semibold text-lg text-navy mb-2 group-hover:text-primary">
                Watch Videos
              </h3>
              <p className="text-sm text-foreground mb-4">
                See our approach in action through our video content.
              </p>
              <span className="text-primary font-semibold text-sm">
                Watch Videos →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
