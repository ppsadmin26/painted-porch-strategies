import { Check, ArrowRight } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useStaggeredAnimation, getStaggeredItemClasses } from "@/hooks/useStaggeredAnimation";

interface Step {
  number: number;
  title: string;
  time: string;
  description: string | null;
  bullets?: ReactNode[];
}

const steps: Step[] = [
  {
    number: 1,
    title: "Answer 15 Strategic Questions",
    time: "(less than 30 minutes)",
    description: "Questions designed to surface both opportunity (what shifts are available) and capability (what you're built to lead)."
  },
  {
    number: 2,
    title: "We Review Your Responses",
    time: "(within 72 business hours)",
    description: "Strategic analysis combining AI pattern recognition with 20+ years of change architecture & design experience from the Painted Porch team."
  },
  {
    number: 3,
    title: "Receive Your Executive Blue Door Brief",
    time: "Detailed report showing:",
    description: null,
    bullets: [
      "3-4 shifts you're positioned to imagine and explore",
      "Organizational capability assessment across the Painted Porch Pillars",
      <>Which sh<span className="font-bold text-bluedoor">IF</span>ts align with your actual organizational capability</>,
      "Not just what sounds good on paper, but what you're actually positioned to lead",
      "Recommended next steps"
    ]
  }
];

export default function HowItWorksSectionAlt() {
  const { ref: stepsRef, visibleItems: visibleSteps } = useStaggeredAnimation<HTMLDivElement>({
    itemCount: steps.length,
    staggerDelay: 150,
    threshold: 0.2
  });

  const stepColors = [
    { bg: "bg-strategic", text: "text-strategic", border: "border-strategic" },
    { bg: "bg-gold", text: "text-gold", border: "border-gold" },
    { bg: "bg-lime", text: "text-lime", border: "border-lime" }
  ];

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-primary/5 via-white to-gold/5">
      <div className="container max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-12">
          How It Works
        </h2>
        
        <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 relative">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-stretch">
              <div 
                className={`flex-1 bg-white rounded-xl shadow-md hover:shadow-xl border-t-4 ${stepColors[index].border} p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 ${getStaggeredItemClasses(visibleSteps[index], "fade-up")}`}
              >
                <div className={`w-12 h-12 rounded-full ${stepColors[index].bg} text-white flex items-center justify-center font-poppins font-bold text-xl mb-4`}>
                  {step.number}
                </div>
                
                <h3 className={`text-xl md:text-2xl font-poppins font-semibold ${stepColors[index].text} mb-2`}>
                  Step {step.number}: {step.title}
                </h3>
                
                <p className={`text-sm font-semibold ${stepColors[index].text} mb-3`}>
                  {step.time}
                </p>
                
                {step.description && (
                  <p className="text-foreground text-sm leading-relaxed flex-1">
                    {step.description}
                  </p>
                )}
                
                {step.bullets && (
                  <ul className="space-y-2 flex-1">
                    {step.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className={`w-4 h-4 ${stepColors[index].text} flex-shrink-0 mt-0.5`} />
                        <span className="text-foreground text-sm">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center px-2">
                  <div className="flex items-center">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/60" />
                    <ArrowRight className="w-5 h-5 text-muted-foreground/60 -ml-1" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex md:hidden justify-center mt-6 gap-2">
          {steps.map((_, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${stepColors[index].bg}`} />
              {index < steps.length - 1 && (
                <div className="w-8 h-0.5 bg-muted-foreground/30" />
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link to="/blue-door/purchase">
            <Button className="bg-bluedoor text-white border-2 border-bluedoor text-lg md:text-xl py-5 px-12 shadow-lg hover:shadow-xl hover:bg-white hover:text-bluedoor transition-all">
              Open the Blue Door →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
