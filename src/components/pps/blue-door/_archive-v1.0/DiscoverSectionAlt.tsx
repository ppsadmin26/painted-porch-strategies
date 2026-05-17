import { Target, Blocks, AlertTriangle, Map, Compass, Building2, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useStaggeredAnimation, getStaggeredItemClasses } from "@/hooks/useStaggeredAnimation";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const pillars = [
  {
    icon: Building2,
    title: "Cultural Cornerstone",
    description: "Leadership authorship, decision-holding, and cultural response under pressure.",
    color: "navy",
    bgClass: "bg-[hsl(220,60%,95%)]",
    iconBgClass: "bg-[hsl(220,50%,90%)]",
    borderClass: "border-navy",
    textClass: "text-navy"
  },
  {
    icon: Compass,
    title: "Operational Frame",
    description: "How work and decisions flow - where clarity exists and where friction accumulates.",
    color: "strategic",
    bgClass: "bg-strategic/10",
    iconBgClass: "bg-strategic/15",
    borderClass: "border-strategic",
    textClass: "text-strategic"
  },
  {
    icon: Brain,
    title: "Living Ecosystem",
    description: "Individual and team judgment, adaptability, and the real bandwidth to navigate complexity without burnout.",
    color: "gold",
    bgClass: "bg-gold/10",
    iconBgClass: "bg-gold/15",
    borderClass: "border-gold",
    textClass: "text-gold"
  }
];

const outcomes = [
  {
    text: "Which shifts align with your organization's actual capacity—not just what sounds good strategically",
    icon: Target,
    color: "text-bluedoor"
  },
  {
    text: "The structural prerequisites behind each potential direction",
    icon: Blocks,
    color: "text-strategic"
  },
  {
    text: "Why certain shifts are premature and what would need to change first",
    icon: AlertTriangle,
    color: "text-gold"
  },
  {
    text: "Your viable P.A.T.H.ways forward—clear direction on what to pursue now vs. later",
    icon: Map,
    color: "text-lime"
  }
];

export default function DiscoverSectionAlt() {
  const { ref: pillarsRef, visibleItems: pillarsVisible } = useStaggeredAnimation<HTMLDivElement>({
    itemCount: pillars.length,
    staggerDelay: 150,
    threshold: 0.2
  });

  const { ref: outcomesRef, isVisible: outcomesVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.2
  });

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Go from "What IF" to "Where Next"
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            <span className="font-bold text-bluedoor">The Blue Door</span> is a strategic operational appraisal that maps how your organization is actually structured for change today. You'll gain clarity on what you should consider exploring, where you're positioned to move now, and whether you have the structures in place to architect and execute your next shift.
          </p>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mt-4">
            No more strategic paralysis, FOBO (fear of better options), or worry this will all go sideways. Just a clear path and compass to guide you forward.
          </p>
        </div>

        <div className="mb-12">
          <h3 className="text-xl md:text-2xl font-semibold text-navy text-center mb-6">
            We examine three core areas—the <span className="text-raspberry">Painted Porch Pillars</span>
          </h3>
          
          <div ref={pillarsRef} className="grid md:grid-cols-3 gap-6">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={index}
                  className={`${pillar.bgClass} rounded-xl shadow-sm hover:shadow-md border-l-4 ${pillar.borderClass} p-6 transition-all duration-300 hover:-translate-y-1 ${getStaggeredItemClasses(pillarsVisible[index], "fade-up")}`}
                >
                  <div className={`w-12 h-12 rounded-full ${pillar.iconBgClass} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${pillar.textClass}`} />
                  </div>
                  <h4 className={`text-base md:text-lg font-poppins font-semibold ${pillar.textClass} mb-2`}>
                    {pillar.title}
                  </h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div
          ref={outcomesRef}
          className={`transition-all duration-700 ease-out ${outcomesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <h3 className="text-xl md:text-2xl font-semibold text-navy text-center mb-6">
            Your Executive Blue Door Brief Will Show You
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {outcomes.map((outcome, index) => {
              const Icon = outcome.icon;
              return (
                <div key={index} className="flex gap-3 items-start bg-white rounded-xl shadow-sm hover:shadow-md p-4 transition-all duration-300">
                  <Icon className={`w-5 h-5 ${outcome.color} flex-shrink-0 mt-0.5`} />
                  <p className="text-foreground">{outcome.text}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-bluedoor/10 border-l-4 border-bluedoor p-4 md:p-6 rounded-xl shadow-sm max-w-2xl mx-auto">
            <p className="text-base md:text-lg text-bluedoor font-medium text-center">
              This clarity sets your strategic direction and prepares you to architect change that's structurally sound and built to last.
            </p>
          </div>

          <div className="text-center mt-8">
            <Link to="/blue-door/purchase">
              <Button className="bg-bluedoor text-white border-2 border-bluedoor text-lg md:text-xl py-5 px-12 shadow-lg hover:shadow-xl hover:bg-white hover:text-bluedoor transition-all">
                Open the Blue Door →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
