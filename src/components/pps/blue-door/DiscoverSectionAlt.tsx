import { Building2, Compass, Brain, Check } from "lucide-react";
import { Eyebrow } from "@/components/pps/Eyebrow";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useStaggeredAnimation, getStaggeredItemClasses } from "@/hooks/useStaggeredAnimation";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const pillars = [
  {
    icon: Building2,
    title: "Cultural Cornerstone",
    description: "How leaders author direction, own decisions, and shape culture under pressure.",
    bgClass: "bg-[hsl(220,60%,95%)]",
    iconBgClass: "bg-[hsl(220,50%,90%)]",
    borderClass: "border-navy",
    textClass: "text-navy"
  },
  {
    icon: Compass,
    title: "Operational Frame",
    description: "How work and decisions move, where things flow well, and where friction builds up.",
    bgClass: "bg-strategic/10",
    iconBgClass: "bg-strategic/15",
    borderClass: "border-strategic",
    textClass: "text-strategic"
  },
  {
    icon: Brain,
    title: "Living Ecosystem",
    description: "How individuals and teams adapt, decide, and navigate complexity without burning out.",
    bgClass: "bg-gold/10",
    iconBgClass: "bg-gold/15",
    borderClass: "border-gold",
    textClass: "text-gold"
  }
];

const compassItems = [
  "Which shifts align with your organization's current reality. Not what sounds good on paper, but what you can responsibly commit to and lead today.",
  "Where you can move now from existing strength, and where reinforcement has to come first.",
  "Why some shifts are premature, and what needs reinforcement before they become viable.",
  "Your recommended path forward, with personalized next steps based on your organization's architecture."
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
        {/* Header */}
        <div className="text-center mb-12">
          <Eyebrow variant="pill" className="mb-4">From Uncertainty to Clarity</Eyebrow>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Go from "What <span className="text-raspberry font-bold">IF</span>?" to "Where Next?"
          </h2>
          <p className="text-body text-muted-foreground max-w-4xl mx-auto">
            What's possible and realistically available for your organization <em>right now</em>? Not in theory, not at full potential, but given how your leadership, systems, and people are structured today.
          </p>
          <p className="text-body text-muted-foreground max-w-4xl mx-auto mt-4">
            The Blue Door surfaces that reality in less than 30 minutes. replacing uncertainty with a clearer understanding of where opportunity exists, where to move now, and what deserves attention first. No more strategic paralysis, no FOBO (fear of better options), no nagging worry that this will go sideways. Just a clear path and compass forward.&nbsp;
          </p>
        </div>

        {/* Pillars */}
        <div className="mb-12">
          <h3 className="text-xl md:text-2xl font-semibold text-navy text-center mb-6">
            We look at three core areas, the <span className="text-raspberry">Painted Porch Pillars</span>
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
                  <p className="text-body -sm text-foreground">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* P.A.T.H. Compass outcomes */}
        <div
          ref={outcomesRef}
          className={`transition-all duration-700 ease-out ${outcomesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <h3 className="text-xl md:text-2xl font-semibold text-navy text-center mb-6">
            Your Blue Door appraisal will show you...
          </h3>
          
          <div className="space-y-3 max-w-3xl mx-auto mb-8">
            {compassItems.map((item, index) => (
              <div key={index} className="flex gap-3 items-start">
                <Check className="w-5 h-5 text-lime flex-shrink-0 mt-0.5" />
                <p className="text-body text-foreground">{item}</p>
              </div>
            ))}
          </div>

          <div className="bg-bluedoor/10 border-l-4 border-bluedoor p-4 md:p-6 rounded-xl shadow-sm max-w-4xl mx-auto">
            <p className="text-body text-bluedoor font-medium text-center">
              Every Blue Door appraisal pairs AI-powered pattern recognition with 20+ years of change architecture experience. This isn't a template. It's a strategic reading built from your organization's specific reality.
            </p>
          </div>

          <div className="text-center mt-8">
            <Link to="/blue-door/purchase">
              <Button className="bg-bluedoor text-white border-2 border-bluedoor text-base sm:text-lg md:text-xl py-4 sm:py-5 px-6 sm:px-12 shadow-lg hover:shadow-xl hover:bg-white hover:text-bluedoor transition-all max-w-full whitespace-normal h-auto">
                Open your Blue Door →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
