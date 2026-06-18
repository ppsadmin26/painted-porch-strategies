import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Building2, Handshake, TrendingUp, Target, BookOpen } from "lucide-react";

const ShIFt = ({ lowercase = false }: { lowercase?: boolean }) => (
  <>
    {lowercase ? "sh" : "Sh"}<span className="text-raspberry font-bold">IF</span>t
  </>
);

const principles = [
  {
    icon: Building2,
    title: "Phaze Zero First, Always",
    tagline: "Every meaningful shIFt starts with clarity.",
    description: "Before committing time, resources, and energy, we examine what's true, what's assumed, and what deserves deeper exploration.",
    contrast: "We architect foundations, not implement initiatives.",
  },
  {
    icon: Handshake,
    title: "We Partner, Not Consult",
    tagline: "You're the expert of you.",
    description: "The strongest solutions emerge when perspective meets context. You bring the realities of your organization. We bring structure, challenge, and disciplined inquiry.",
    contrast: "Together, we build what actually works in YOUR reality.",
  },
  {
    icon: Target,
    title: "A Culture of Continuous Innovation",
    tagline: "Foundations for a continually evolving future.",
    description: (
      <>
        Success is not measured by a completed project. It's reflected in stronger leaders, healthier systems, and greater confidence in navigating uncertainty or whatever <ShIFt lowercase /> happens next.
      </>
    ),
    contrast: "When we're done, you've become transformation architects yourselves.",
  },
  {
    icon: BookOpen,
    title: "Ancient Wisdom, Modern Realities",
    tagline: "Not trendy frameworks.",
    description: "Our work is grounded in the enduring principles of the Stoic philosophy - strategic preparation, resilience, and conscious design - applied to the realities leaders, teams, and organizations face today.",
    contrast: "Premeditatio Malorum: Prepare for adversity before pressure demands it. That's the original Phase Zero.",
  },
  {
    icon: TrendingUp,
    title: "Progression, Not Prescription",
    tagline: "Your pathway emerges from clarity.",
    description: <>You might start with <Link to="/partner/ignite" className="font-bold text-gold hover:underline">IGNITE</Link> and stay there. Or progress to <Link to="/partner/amplify" className="font-bold text-strategic hover:underline">AMPLIFY</Link> when you're ready for more depth. Or jump straight to <Link to="/partner/embody" className="font-bold text-navy hover:underline">EMBODY</Link>. Your pathway emerges from exploration, not prescription.</>,
    contrast: <span className="font-bold">Your starting point is yours to choose. Your momentum is yours to own.</span>,
    isEncapsulation: true,
  },
];

export function PhilosophyApproachSection({ showEncapsulationCard = true }: { showEncapsulationCard?: boolean }) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Why Partner With Painted Porch Strategies?
          </h2>
          <p className="text-body text-foreground max-w-2xl mx-auto">
            Because the work begins long before transformation becomes visible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {principles.filter(p => !p.isEncapsulation).map((principle, index) => (
            <div 
              key={index} 
              className="bg-gradient-to-br from-primary/5 to-gold/10 p-8 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <principle.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy">
                  {principle.title}
                </h3>
              </div>
              <p className="text-body text-primary font-medium -sm mb-3">
                {principle.tagline}
              </p>
              <p className="text-body text-foreground -sm leading-relaxed mb-4">
                {principle.description}
              </p>
              <p className="text-body text-navy font-bold -sm italic border-t border-navy/10 pt-4">
                {principle.contrast}
              </p>
            </div>
          ))}
        </div>

        {/* Encapsulation card - full width at bottom */}
        {showEncapsulationCard && principles.filter(p => p.isEncapsulation).map((principle, index) => (
          <div 
            key={index} 
            className="mt-6 bg-gradient-to-r from-primary/5 to-gold/10 border border-primary/20 p-8 md:p-10 rounded-xl text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <principle.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy">
                {principle.title}
              </h3>
            </div>
            <p className="text-body text-primary font-medium mb-4">
              {principle.tagline}
            </p>
            <p className="text-body text-foreground leading-relaxed max-w-2xl mx-auto mb-4">
              {principle.description}
            </p>
            <p className="text-body text-navy font-medium italic">
              {principle.contrast}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
