import { Building2, Compass, Brain, Cpu, Users, Workflow } from "lucide-react";
import { Eyebrow } from "@/components/pps/Eyebrow";
import { useScrollAnimation, getAnimationClasses } from "@/hooks/useScrollAnimation";

function FadeIn({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible, reducedMotion } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${getAnimationClasses(isVisible, reducedMotion)} ${className}`}
    >
      {children}
    </div>
  );
}

const levers = [
  {
    icon: Users,
    label: "Culture work",
    accent: "text-primary",
    border: "border-t-primary",
    body: "Builds trust, alignment, and shared language. Then people walk back into unclear decision rights and systems that still reward the old behavior. That is not engagement. That is informed helplessness.",
  },
  {
    icon: Cpu,
    label: "Technology",
    accent: "text-strategic",
    border: "border-t-strategic",
    body: "Modernizes the platform and exposes every design flaw that used to be survivable. The tool becomes the villain in a story that was really about organizational authorship.",
  },
  {
    icon: Workflow,
    label: "Operational design",
    accent: "text-gold",
    border: "border-t-gold",
    body: "Maps the workflow and produces an elegant structure on paper. In practice it yields compliance without commitment, because the human dimension got flattened into swimlanes.",
  },
];

const pillars = [
  {
    icon: Building2,
    title: "Cultural Cornerstone",
    role: "The leadership capacity to author direction",
    accent: "text-navy",
    bg: "bg-[hsl(220,60%,96%)]",
    border: "border-l-navy",
    body: "Who decides, how they decide, and whether your leaders can shape what comes next instead of reacting to it.",
  },
  {
    icon: Compass,
    title: "Operational Frame",
    role: "The systems, processes, and governance that execute it",
    accent: "text-strategic",
    bg: "bg-strategic/10",
    border: "border-l-strategic",
    body: "How decisions flow, how coordination happens, and whether the operating model can carry what the organization is becoming.",
  },
  {
    icon: Brain,
    title: "Living Ecosystem",
    role: "The adaptive, human infrastructure that sustains it",
    accent: "text-gold",
    bg: "bg-gold/10",
    border: "border-l-gold",
    body: "Judgment, communication, and resilience spread through the organization, so the design holds after the engagement ends.",
  },
];

/**
 * "Yes, and Also No" — the categorical differentiation section.
 *
 * This is not a "we do more than they do" claim. It is a different unit of
 * work: one lever versus the whole organism. Sourced from the Insights article
 * "Are We a Culture Consultancy? A Tech Advisory? An Operational Design Firm?"
 */
export default function YesAndAlsoNoSection() {
  return (
    <section className="py-20 md:py-28 bg-white" aria-labelledby="yes-and-also-no">
      <div className="container max-w-6xl mx-auto px-6">
        <FadeIn className="max-w-3xl mb-14">
          <Eyebrow tone="teal">Yes, and also no</Eyebrow>
          <h2 id="yes-and-also-no" className="text-3xl md:text-4xl font-bold text-navy mb-6 leading-tight">
            We get introduced as the culture people. Or the tech transition people. Or the ops people.
          </h2>
          <p className="text-lead text-charcoal">
            All three are true. None of them is the whole answer. Engage us for any one of those in
            isolation and you get a fraction of what is possible, and the real problem stays
            structurally intact.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {levers.map((lever) => (
            <FadeIn key={lever.label}>
              <div className={`h-full bg-white border border-border ${lever.border} border-t-4 rounded-xl p-7 shadow-sm`}>
                <lever.icon className={`w-8 h-8 mb-4 ${lever.accent}`} aria-hidden="true" />
                <h3 className={`font-poppins font-bold text-xl mb-3 ${lever.accent}`}>{lever.label}</h3>
                <p className="text-body text-charcoal">{lever.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn>
          <div className="bg-navy rounded-2xl p-8 md:p-12 mb-16">
            <p className="text-lead text-white/95 max-w-3xl">
              Each of these is real work, done well by good people. Each one alone leaves the other
              two untouched, and the untouched dimensions eventually pull the organization back to
              where it started.
            </p>
            <p className="text-lead text-gold font-poppins font-semibold mt-5">
              We do not pick a lever. We work the whole organism.
            </p>
          </div>
        </FadeIn>

        <FadeIn className="max-w-3xl mb-10">
          <Eyebrow tone="gold">The Painted Porch Pillars</Eyebrow>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-5 leading-tight">
            Three dimensions, designed at the same time
          </h2>
          <p className="text-lead text-charcoal">
            Not health first and then smart. Not systems first and then people. Culture is what
            emerges when the architecture is right. The architecture holds when the culture supports
            it. The technology works when both are built to carry it.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <FadeIn key={pillar.title}>
              <div className={`h-full ${pillar.bg} ${pillar.border} border-l-4 rounded-xl p-7`}>
                <pillar.icon className={`w-8 h-8 mb-4 ${pillar.accent}`} aria-hidden="true" />
                <h3 className={`font-poppins font-bold text-xl mb-2 ${pillar.accent}`}>{pillar.title}</h3>
                <p className="text-caption font-poppins font-semibold uppercase tracking-wider text-charcoal/70 mb-3">
                  {pillar.role}
                </p>
                <p className="text-body text-charcoal">{pillar.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn>
          <p className="text-lead text-charcoal max-w-3xl mt-10">
            Most advisory firms work inside one of these. The integration, designing all three at
            once so they reinforce each other, is what most organizations have never experienced.
            We call the result your <strong className="text-navy">Fortified Porch</strong>, and it is
            the reason the last three initiatives may not have delivered what you banked on.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
