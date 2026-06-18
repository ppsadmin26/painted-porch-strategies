import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { TierBadge, TIERS } from "@/components/pps/TierBadge";

const features = [
  "Everything in IGNITE",
  "Live workshop sessions",
  "Custom strategy development",
  "Team workshop facilitation",
  "Follow-up support between sessions",
  "Action plan development",
];

const workshops = [
  {
    title: "Change-Readiness Accelerator",
    duration: "Half-day",
    description: "Intensive session to assess and accelerate your organization's change-readiness.",
    color: "border-primary",
  },
  {
    title: "Team Dynamics Workshop",
    duration: "Full-day",
    description: "Build open expression and improve collaboration within your team.",
    color: "border-lime",
  },
  {
    title: "Leadership Communication Intensive",
    duration: "2-day",
    description: "Master the art of strategic messaging and stakeholder alignment.",
    color: "border-strategic",
  },
  {
    title: "EQ for Leaders",
    duration: "Half-day",
    description: "Develop emotional intelligence competencies that distinguish exceptional leaders.",
    color: "border-gold",
  },
];

export default function AmplifyPath() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-navy py-16 md:py-24">
        <div className="container max-w-7xl mx-auto px-6">
        <div className="max-w-3xl">
            <TierBadge tier={TIERS.AMPLIFY} className="mb-6" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Targeted Workshops for Rapid Progress
            </h1>
            <p className="text-body text-white/90 leading-relaxed">
              Focused workshop sessions to address specific challenges and amplify your change-readiness with expert facilitation.
            </p>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-12 bg-strategic/10">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">What's Included in <span className="text-strategic">AMPLIFY</span></h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-strategic flex-shrink-0" />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workshop Options */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Workshop Options
            </h2>
            <p className="text-body text-foreground max-w-2xl mx-auto">
              Choose from our signature workshops or request a custom session.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {workshops.map((workshop, index) => (
              <div key={index} className={`bg-muted p-8 rounded-xl border-l-4 ${workshop.color}`}>
                <span className="text-sm font-medium text-strategic">{workshop.duration}</span>
                <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mt-2 mb-3">
                  {workshop.title}
                </h3>
                <p className="text-body text-foreground -sm leading-relaxed">
                  {workshop.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              How It Works
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-strategic/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-strategic font-bold">1</span>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-navy mb-2">Initial Conversation</h3>
              <p className="text-body -sm text-foreground">Understand your needs and goals</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-strategic/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-strategic font-bold">2</span>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-navy mb-2">Custom Design</h3>
              <p className="text-body -sm text-foreground">Tailor the workshop to your context</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-strategic/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-strategic font-bold">3</span>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-navy mb-2">Facilitate</h3>
              <p className="text-body -sm text-foreground">Deliver engaging, actionable session</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-strategic/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-strategic font-bold">4</span>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-navy mb-2">Follow-Up</h3>
              <p className="text-body -sm text-foreground">Support implementation of learnings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upgrade Path */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
            Need Ongoing Support?
          </h2>
          <p className="text-body text-foreground mb-8 max-w-2xl mx-auto">
            Upgrade to EMBODY for embedded advisory support and comprehensive transformation partnership.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/partner/embody">
              <Button className="bg-navy border-2 border-navy text-white hover:bg-transparent hover:text-navy transition-colors">
                Explore Embody <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/partner-with-us">
              <Button className="bg-transparent border-2 border-navy text-navy hover:bg-navy hover:text-white transition-colors">
                Compare All Paths
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-strategic text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Amplify?
          </h2>
          <p className="text-body text-white/90 mb-8 max-w-2xl mx-auto">
            Reach out to discuss which workshops are right for your team.
          </p>
          <Link to="/contact?scope=organization&interest=workshops&message=I'm interested in AMPLIFY workshops for our team.">
            <Button className="bg-strategic border-2 border-strategic text-white hover:bg-white hover:text-strategic text-lg py-5 px-8 transition-colors">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
