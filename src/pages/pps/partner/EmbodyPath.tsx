import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { TierBadge, TIERS } from "@/components/pps/TierBadge";

const features = [
  "Everything in ACCELERATE",
  "Weekly strategic sessions",
  "On-site facilitation",
  "Leadership team coaching",
  "Custom program development",
  "Priority access & support",
  "Change management consulting",
  "Organizational design guidance",
];

const engagementTypes = [
  {
    title: "Transformation Partnership",
    duration: "6-12 months",
    description: "Comprehensive change management support for major organizational initiatives.",
    ideal: "Organizations undergoing significant transformation",
    color: "border-strategic",
  },
  {
    title: "Leadership Development",
    duration: "Ongoing",
    description: "Continuous coaching and development for your leadership team.",
    ideal: "Growing organizations building leadership bench",
    color: "border-primary",
  },
  {
    title: "Culture Evolution",
    duration: "12+ months",
    description: "Long-term partnership to shift organizational culture and ways of working.",
    ideal: "Organizations ready for deep cultural change",
    color: "border-lime",
  },
];

export default function EmbodyPath() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-navy py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <TierBadge tier={TIERS.EMBODY} className="mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Embedded Advisory Partnership
            </h1>
            <p className="text-lg text-white/90 leading-relaxed">
              Deep partnership for organizations committed to comprehensive transformation with ongoing advisory support.
            </p>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-12 bg-navy/10">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">What's Included in EMBODY</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-navy flex-shrink-0" />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement Types */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Engagement Options
            </h2>
            <p className="text-lg text-foreground max-w-2xl mx-auto">
              Tailored partnerships designed around your specific transformation needs.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {engagementTypes.map((type, index) => (
              <div key={index} className={`bg-muted p-8 rounded-xl border-t-4 ${type.color}`}>
                <span className="text-sm font-medium text-navy">{type.duration}</span>
                <h3 className="font-poppins font-semibold text-xl text-navy mt-2 mb-3">
                  {type.title}
                </h3>
                <p className="text-foreground text-sm leading-relaxed mb-4">
                  {type.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold">Ideal for:</span> {type.ideal}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
                How EMBODY Works
              </h2>
              <p className="text-lg text-foreground leading-relaxed mb-6">
                EMBODY partnerships are built on deep integration with your organization. We become an extension of your leadership team, providing strategic guidance, hands-on facilitation, and continuous support.
              </p>
              <p className="text-lg text-foreground leading-relaxed">
                This isn't consulting from the outside — it's transformation from within.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="font-poppins font-semibold text-xl text-navy mb-6">
                Partnership Structure
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-navy/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-navy font-bold text-sm">1</span>
                  </div>
                  <div>
                    <span className="font-semibold text-navy">Weekly Sessions</span>
                    <p className="text-sm text-foreground">Regular strategy and progress discussions</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-navy/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-navy font-bold text-sm">2</span>
                  </div>
                  <div>
                    <span className="font-semibold text-navy">On-Site Days</span>
                    <p className="text-sm text-foreground">Regular in-person facilitation and coaching</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-navy/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-navy font-bold text-sm">3</span>
                  </div>
                  <div>
                    <span className="font-semibold text-navy">Priority Support</span>
                    <p className="text-sm text-foreground">Direct access when you need guidance</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-navy/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-navy font-bold text-sm">4</span>
                  </div>
                  <div>
                    <span className="font-semibold text-navy">Custom Programs</span>
                    <p className="text-sm text-foreground">Bespoke training and development content</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-strategic text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready for Deep Partnership?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            EMBODY partnerships are selective. Let's discuss whether this level of engagement is right for your organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact?scope=organization&interest=strategic-partnership&message=I'm interested in an EMBODY strategic partnership.">
              <Button className="bg-navy border-2 border-navy text-white hover:bg-white hover:text-navy text-lg py-5 px-8 transition-colors">
                Request a Conversation
              </Button>
            </Link>
            <Link to="/partner">
              <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-navy text-lg py-5 px-8 transition-colors">
                Compare All Paths
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
