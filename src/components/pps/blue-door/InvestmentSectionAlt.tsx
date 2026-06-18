import { Check, Clock, Mail, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import CostCalculatorDialog from "./CostCalculatorDialog";
import { BLUE_DOOR_PRICE_DISPLAY } from "@/config/blueDoor";

const includedItems = [
  "15 strategic questions assessing opportunity + capability",
  "AI-powered pattern recognition analysis",
  "20+ years change architecture experience review",
  "Detailed Executive Blue Door Brief",
  "Which shifts are viable now, which need groundwork, and which are premature",
  "Structural assessment across the Painted Porch Pillars",
  "Prerequisites for each potential shift",
  "Strategic recommendations for next steps"
];

export default function InvestmentSectionAlt() {
  const { ref: priceRef, isVisible: priceVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.3 });
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section id="investment" className="py-12 md:py-20 bg-gradient-to-br from-primary/10 via-white to-strategic/5">
      <div className="container max-w-5xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-12">
          Investment & Timeline
        </h2>
        
        <Link to="/blue-door/purchase">
          <div
            ref={priceRef}
            className={`bg-white border-4 border-bluedoor p-8 rounded-lg text-center max-w-md mx-auto mb-12 shadow-lg transition-all duration-700 ease-out hover:shadow-xl hover:scale-105 cursor-pointer ${priceVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          >
            <span className="inline-block bg-bluedoor/10 text-bluedoor font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-3">
              The Blue Door
            </span>
            <p className="text-body font-poppins font-bold text-5xl text-bluedoor">{BLUE_DOOR_PRICE_DISPLAY}</p>
          </div>
        </Link>
        
        <div ref={cardsRef} className="grid md:grid-cols-2 gap-12 mb-12">
          <div className={`bg-white p-6 rounded-lg shadow-sm border-l-4 border-strategic transition-all duration-700 ease-out ${cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h3 className="text-xl md:text-2xl font-poppins font-semibold text-strategic mb-4">
              What to Expect:
            </h3>
            <ul className="space-y-3">
              <li className="text-body flex items-start gap-3">
                <Clock className="w-5 h-5 text-strategic flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Less than 30 minutes to complete the diagnostic</span>
              </li>
              <li className="text-body flex items-start gap-3">
                <Brain className="w-5 h-5 text-strategic flex-shrink-0 mt-0.5" />
                <span className="text-foreground">72 business hours for strategic analysis</span>
              </li>
              <li className="text-body flex items-start gap-3">
                <Mail className="w-5 h-5 text-strategic flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Executive <span className="font-bold text-bluedoor">Blue Door</span> Brief delivered via email</span>
              </li>
            </ul>
          </div>
          
          <div className={`bg-white p-6 rounded-lg shadow-sm border-l-4 border-lime transition-all duration-700 ease-out delay-150 ${cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h3 className="text-xl md:text-2xl font-poppins font-semibold text-lime mb-4">
              What's Included:
            </h3>
            <ul className="space-y-2">
              {includedItems.map((item, index) => (
                <li key={index} className="text-body flex items-start gap-3">
                  <Check className="w-5 h-5 text-lime flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="text-center">
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
