import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { TIER_LIST } from "@/config/tiers";

const tierFeatures = {
  IGNITE: [
    "On-demand video courses",
    "Downloadable templates & frameworks",
    "Self-assessment tools",
    "Community forum access",
  ],
  AMPLIFY: [
    "Live workshop sessions",
    "Custom strategy development",
    "Team workshop facilitation",
    "Follow-up support between sessions",
  ],
  EMBODY: [
    "Weekly strategic sessions",
    "On-site facilitation",
    "Leadership team coaching",
    "Custom program development",
    "Priority access & support",
  ],
};

const tierDescriptions = {
  IGNITE: "Access our library of tools, templates, and on-demand masterclasses to build change-readiness at your own pace.",
  AMPLIFY: "3-6 month focused engagement to address specific challenges and accelerate your change-readiness.",
  EMBODY: "6-12+ month deep partnership for organizations committed to comprehensive transformation.",
};

const tierCtas = {
  IGNITE: "Get Started",
  AMPLIFY: "Contact Us",
  EMBODY: "Let's Talk",
};

const tierContactUrls = {
  IGNITE: "/contact?scope=Yourself&interest=self-paced&message=I'm interested in IGNITE self-paced learning.",
  AMPLIFY: "/contact?scope=organization&interest=organizational-advisory&message=I'm interested in organizational advisory.",
  EMBODY: "/contact?scope=organization&interest=strategic-partnership&message=I'm interested in an EMBODY strategic partnership.",
};

export default function PPSPricing() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-navy py-16 md:py-24">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
              Pricing
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Three Engagement P.A.T.H.ways
            </h1>
            <p className="text-body text-white/90 leading-relaxed">
              Choose the level of partnership that fits your organization's needs and readiness. Every engagement begins with understanding where you are and where you want to go.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Philosophy */}
      <section className="py-12 bg-muted">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Transparent, Flat-Fee Pricing
            </h2>
            <p className="text-body text-foreground max-w-2xl mx-auto">
              We believe in clarity. All engagements are priced as flat fees, no surprise bills, no scope creep charges. You know exactly what you're investing before we begin.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {TIER_LIST.map((tier) => {
              const features = tierFeatures[tier.name as keyof typeof tierFeatures];
              const description = tierDescriptions[tier.name as keyof typeof tierDescriptions];
              const cta = tierCtas[tier.name as keyof typeof tierCtas];
              
              return (
                <div
                  key={tier.name}
                  className={`relative ${tier.bgColor} p-8 rounded-xl border-t-4 ${tier.borderColor}`}
                >
                  <tier.icon className={`w-10 h-10 ${tier.textColor} mb-4`} />
                  <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-1">
                    {tier.name}
                  </h3>
                  <p className={`text-body-sm font-medium ${tier.textColor} mb-4`}>
                    {tier.tagline}
                  </p>
                  <p className="text-body text-foreground mb-6 -sm leading-relaxed">
                    {description}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {features.map((feature, i) => (
                      <li key={i} className="text-body flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-lime flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className={`w-full ${tier.solidButtonClasses} transition-colors`}>
                  <Link to={tierContactUrls[tier.name as keyof typeof tierContactUrls]}>{cta} <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-3xl mx-auto px-6">
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-6 text-center">
              What's Included in Every Engagement
            </h3>
            <ul className="space-y-4">
              <li className="text-body flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-lime flex-shrink-0" />
                <div>
                  <span className="font-semibold text-navy">Clear Scope & Timeline</span>
                  <p className="text-body -sm text-foreground">Detailed proposal with deliverables and milestones</p>
                </div>
              </li>
              <li className="text-body flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-lime flex-shrink-0" />
                <div>
                  <span className="font-semibold text-navy">Stoic Principles Foundation</span>
                  <p className="text-body -sm text-foreground">All work grounded in reason, logic, purpose, and virtue</p>
                </div>
              </li>
              <li className="text-body flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-lime flex-shrink-0" />
                <div>
                  <span className="font-semibold text-navy">5% Charitable Donation</span>
                  <p className="text-body -sm text-foreground">Every fee includes a donation to the charity of your choice</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Start CTA */}
      <section className="py-16 md:py-24 bg-gradient-strategic text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Begin Your Transformation?
          </h2>
          <p className="text-body text-white/90 mb-8 max-w-2xl mx-auto">
            Reach out to learn more about finding the right pathway for your organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact?scope=organization&interest=organizational-advisory&message=I'm interested in organizational advisory.">
              <Button className="bg-primary border-2 border-primary text-white hover:bg-white hover:text-primary text-lg py-5 px-8 transition-colors">
                Contact Us
              </Button>
            </Link>
            <Link to="/blue-door">
              <Button className="bg-bluedoor border-2 border-bluedoor text-white hover:bg-white hover:text-bluedoor text-lg py-5 px-8 transition-colors">
                Take the Free Assessment
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
