import { Check, Clock, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useStaggeredAnimation, getStaggeredItemClasses } from "@/hooks/useStaggeredAnimation";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface Step {
  number: number;
  title: string;
  time: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: "Complete the Appraisal",
    time: "Less than 30 minutes",
    description: "Questions designed to surface both what shIFts are open to your organization and what you're built to lead."
  },
  {
    number: 2,
    title: "We Analyze Your Responses",
    time: "Results within 72 business hours",
    description: "AI-powered pattern recognition paired with strategic review from the Painted Porch team. 20+ years of change architecture experience."
  },
  {
    number: 3,
    title: "Receive Your Executive Brief",
    time: "PDF + interactive portal access",
    description: "A strategic reading of your organization: where you can move now, what needs reinforcement, and your recommended next steps."
  }
];

const stepColors = [
  { bg: "bg-bluedoor", text: "text-bluedoor", border: "border-bluedoor" },
  { bg: "bg-strategic", text: "text-strategic", border: "border-strategic" },
  { bg: "bg-lime", text: "text-lime", border: "border-lime" }
];

const expectItems = [
  { icon: Clock, text: "Less than 30 minutes to complete" },
  { icon: Clock, text: "Your P.A.T.H. Compass executive results delivered within 72 business hours" },
  { icon: Mail, text: "PDF + interactive portal with your full strategic reading" }
];

const includedItems = [
  "Organizational appraisal across the three Painted Porch Pillars",
  "AI-powered analysis paired with strategic review from the Painted Porch team",
  "Clear answers on: your capacity signal, your architecture, where you can move now, what needs reinforcement, and your recommended path forward",
  "Investment fully credited toward any future engagement"
];

export default function HowItWorksInvestmentSection() {
  const { ref: stepsRef, visibleItems: visibleSteps } = useStaggeredAnimation<HTMLDivElement>({
    itemCount: steps.length,
    staggerDelay: 150,
    threshold: 0.2
  });

  const { ref: investRef, isVisible: investVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.3 });
  const { ref: detailsRef, isVisible: detailsVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-primary/5 via-white to-gold/5">
      <div className="container max-w-5xl mx-auto px-6">
        {/* How It Works */}
        <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-12">
          How It Works
        </h2>
        
        <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 relative mb-16">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-stretch">
              <div 
                className={`flex-1 ${stepColors[index].bg} rounded-xl shadow-md hover:shadow-xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 ${getStaggeredItemClasses(visibleSteps[index], "fade-up")}`}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center font-poppins font-bold text-xl mb-4">
                  {step.number}
                </div>
                
                <h3 className="text-xl md:text-2xl font-poppins font-semibold text-white mb-1">
                  Step {step.number}: {step.title}
                </h3>
                
                <p className="text-sm font-semibold text-white/70 mb-3">
                  {step.time}
                </p>
                
                <p className="text-white/90 text-sm leading-relaxed flex-1">
                  {step.description}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center px-2">
                  <div className="flex items-center">
                    <div className="w-8 h-0.5 bg-muted-foreground/30" />
                    <ArrowRight className="w-5 h-5 text-muted-foreground/60 -ml-1" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile step indicators */}
        <div className="flex md:hidden justify-center mt-6 mb-16 gap-2">
          {steps.map((_, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${stepColors[index].bg}`} />
              {index < steps.length - 1 && (
                <div className="w-8 h-0.5 bg-muted-foreground/30" />
              )}
            </div>
          ))}
        </div>

        {/* Investment */}
        <Link to="/blue-door/purchase">
          <div
            ref={investRef}
            className={`bg-white border-4 border-bluedoor p-8 rounded-lg text-center max-w-md mx-auto mb-12 shadow-lg transition-all duration-700 ease-out hover:shadow-xl hover:scale-105 cursor-pointer ${investVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          >
            <span className="inline-block bg-bluedoor/10 text-bluedoor font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-3">
              The Blue Door Organizational Appraisal
            </span>
            <p className="font-poppins font-bold text-5xl text-navy">$1,500</p>
          </div>
        </Link>

        {/* What to Expect / What's Included */}
        <div ref={detailsRef} className="grid md:grid-cols-2 gap-12 mb-12">
          <div className={`bg-white p-6 rounded-lg shadow-sm border-l-4 border-strategic transition-all duration-700 ease-out ${detailsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h3 className="text-xl md:text-2xl font-poppins font-semibold text-strategic mb-4">
              What to Expect:
            </h3>
            <ul className="space-y-3">
              {expectItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={index} className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-strategic flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          
          <div className={`bg-white p-6 rounded-lg shadow-sm border-l-4 border-lime transition-all duration-700 ease-out delay-150 ${detailsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h3 className="text-xl md:text-2xl font-poppins font-semibold text-lime mb-4">
              What's Included:
            </h3>
            <ul className="space-y-3">
              {includedItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-lime flex-shrink-0 mt-0.5" />
                  <span className={`text-foreground ${index === includedItems.length - 1 ? 'font-semibold' : ''}`}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Link to="/blue-door/purchase">
            <Button className="bg-bluedoor text-white border-2 border-bluedoor text-lg md:text-xl py-5 px-12 shadow-lg hover:shadow-xl hover:bg-white hover:text-bluedoor transition-all">
              Open your Blue Door →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
