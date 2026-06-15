import { Building2, Handshake, TrendingUp } from "lucide-react";

const principles = [
  {
    icon: Building2,
    title: "Start in Phase Zero",
    description: "Whether you're working on yourself, your team, or your organization, extraordinary transformation begins with strategic preparation, before pressure demands it.",
  },
  {
    icon: Handshake,
    title: "Partnership, Not Services",
    description: "We don't deliver solutions to you. We co-design them with you. You're the expert of you. We're experts in transformation architecture. Together, we build what works.",
  },
  {
    icon: TrendingUp,
    title: "Progression, Not Prescription",
    description: "You might start with IGNITE and stay there. Or progress to AMPLIFY when you're ready for more depth. Or jump straight to EMBODY. Your pathway emerges from exploration and clarity, not prescription.",
  },
];

export function PathwayPhilosophySection() {
  return (
    <section className="py-16 md:py-20 bg-muted">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Why Three P.A.T.H.ways? Because No Two Sh<span className="text-raspberry font-bold">IF</span>ts are the Same.
          </h2>
          <p className="text-foreground max-w-2xl mx-auto">
            Each P.A.T.H.way is designed for a different level of commitment and transformation ambition. Where are you right now?
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {principles.map((principle, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <principle.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-3">
                {principle.title}
              </h3>
              <p className="text-foreground text-sm leading-relaxed">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
