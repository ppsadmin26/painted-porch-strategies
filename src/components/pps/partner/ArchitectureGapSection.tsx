/**
 * The Architecture Gap, McKinsey + Gartner stats framed against the Painted Porch Pillars.
 * Lives on /partner between Philosophy & Approach and How To Choose.
 */
import StatCard, { StatSources } from "@/components/pps/StatCard";
import { Building2, Compass, Brain, ArrowRight } from "lucide-react";

const rows = [
  {
    statId: "mck_ai_readiness" as const,
    footnote: 1,
    pillar: "Cultural Cornerstone",
    pillarSub: "Leadership & Culture",
    shift:
      "AI doesn't fail because the tools are weak. It fails because the organization beneath it isn't architected to hold it. That's foundational work, not a rollout plan.",
    icon: Building2,
    accentText: "text-navy",
    accentBg: "bg-[hsl(220,50%,90%)]",
    border: "border-navy",
  },
  {
    statId: "mck_complexity" as const,
    footnote: 2,
    pillar: "Operational Frame",
    pillarSub: "Workflows & Systems",
    shift:
      "Complexity compounds when work flows around structure instead of through it. We redesign the operational frame so strategy actually moves.",
    icon: Compass,
    accentText: "text-strategic",
    accentBg: "bg-strategic/15",
    border: "border-strategic",
  },
  {
    statId: "gartner_adoption" as const,
    footnote: 3,
    pillar: "Phase Zero Authorship",
    pillarSub: "The work before the work",
    shift:
      "Adoption fails when leaders skip the authorship phase. Phase Zero is where you decide what's worth building before you ask people to build it.",
    icon: Brain,
    accentText: "text-gold",
    accentBg: "bg-gold/15",
    border: "border-gold",
  },
  {
    statId: "gartner_trust" as const,
    footnote: 4,
    pillar: "Living Ecosystem",
    pillarSub: "Capacity & Judgment",
    shift:
      "Trust isn't a comms problem. It's the byproduct of an architecture that respects the people inside it. That's where adoption becomes durable.",
    icon: Brain,
    accentText: "text-raspberry",
    accentBg: "bg-raspberry/15",
    border: "border-raspberry",
  },
];

const statIds = rows.map((r) => r.statId);

export default function ArchitectureGapSection() {
  return (
    <section className="py-16 md:py-24 bg-white" aria-labelledby="architecture-gap-heading">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <span className="badge-gold mb-4 inline-block">The Architecture Gap</span>
          <h2 id="architecture-gap-heading" className="text-3xl md:text-4xl font-bold text-navy mb-4">
            The reality every leader is navigating right now.
          </h2>
          <p className="text-lg text-foreground leading-relaxed">
            The data tells the same story we hear from leaders every week: the
            problem isn&rsquo;t the strategy. It&rsquo;s the architecture
            underneath it. Here&rsquo;s what we&rsquo;re working with, and where
            the Porch Pillars come in.
          </p>
        </div>

        <div className="space-y-5">
          {rows.map((row, i) => (
            <div
              key={i}
              className={`grid md:grid-cols-12 gap-6 md:gap-8 items-stretch bg-white border-l-4 ${row.border} rounded-xl shadow-sm overflow-hidden`}
            >
              {/* Reality */}
              <div className="md:col-span-5 p-6 md:p-7 bg-muted/40">
                <p className="text-[0.7rem] uppercase tracking-[0.2em] font-poppins font-semibold text-muted-foreground mb-3">
                  The Reality
                </p>
                <StatCard
                  statId={row.statId}
                  variant="editorial"
                  accentClass={row.accentText}
                  footnoteNumber={row.footnote}
                  className="border-l-0 pl-0 py-0"
                />
              </div>

              {/* Shift */}
              <div className="md:col-span-7 p-6 md:p-7 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${row.accentBg} flex items-center justify-center flex-shrink-0`}>
                    <row.icon className={`w-5 h-5 ${row.accentText}`} />
                  </div>
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.2em] font-poppins font-semibold text-muted-foreground">
                      The Shift
                    </p>
                    <p className={`text-base font-poppins font-semibold ${row.accentText}`}>
                      {row.pillar}{" "}
                      <span className="text-muted-foreground font-normal">
                        · {row.pillarSub}
                      </span>
                    </p>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed">{row.shift}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sources */}
        <div className="mt-10 pt-6 border-t border-border/60 max-w-3xl mx-auto">
          <p className="text-xs font-poppins font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Sources
          </p>
          <StatSources statIds={statIds} />
        </div>
      </div>
    </section>
  );
}
