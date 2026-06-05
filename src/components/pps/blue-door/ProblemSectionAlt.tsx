import { Circle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CostCalculatorDialog from "./CostCalculatorDialog";

export default function ProblemSectionAlt() {
  const calloutRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (calloutRef.current) observer.observe(calloutRef.current);
    return () => observer.disconnect();
  }, []);

  const problemPoints = [
    "Sound strategic but exceed your real capacity",
    "Need operational reinforcement you haven't built yet",
    "Crack under the weight of execution, no matter how good the intent"
  ];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container max-w-5xl mx-auto px-6">
        {/* Opening rhythm, centered, generous spacing */}
        <div className="text-center max-w-4xl mx-auto mb-12 space-y-4" style={{ lineHeight: '1.9' }}>
          <p className="text-xl md:text-2xl text-navy font-bold leading-relaxed">
            There's a moment, often subtle, when a new idea begins to emerge in your organization.
          </p>
          <p className="text-base md:text-lg text-foreground leading-relaxed">
            Not a decision.<br />
            Not a plan.<br />
            Not a mandate.<br />
            But a question that starts with "What <span className="font-bold text-bluedoor">IF</span>?"
          </p>
          <p className="text-base md:text-lg text-foreground leading-relaxed">
            It's when the <span className="font-bold text-bluedoor">blue door</span> appears, the threshold between sensing that something must change and knowing what your organization can actually lead.
          </p>
          <p className="text-base md:text-lg text-foreground font-semibold">
            Most organizations rush through it.
          </p>
        </div>
        
        <div className="h-2 w-32 rounded-full bg-gradient-to-r from-strategic via-gold to-lime mx-auto mb-12" />
        
        <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-6">
          The Gap Between Ambition and Architecture
        </h2>
        
        <p className="text-base md:text-lg text-foreground leading-relaxed text-center max-w-4xl mx-auto mb-4">
          The real question isn't <span className="font-bold italic text-raspberry">"how do we implement this?"</span> It's <span className="font-bold italic text-bluedoor">"who do we need to become for this to happen?"</span>
        </p>
        <p className="text-base md:text-lg text-foreground leading-relaxed text-center max-w-4xl mx-auto mb-8">
          That's the question most organizations skip, and it's the one that decides whether a transformation takes root or collapses under its own weight. Without a clear picture of what your organization is built to carry, you risk pouring time, money, and energy into changes that:
        </p>
        
        <div className="max-w-3xl mx-auto mb-12 flex justify-center">
          <ul className="space-y-4">
            {problemPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-3">
                <Circle className="w-3 h-3 mt-2 fill-raspberry text-raspberry flex-shrink-0" />
                <span className="text-base md:text-lg text-foreground leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div ref={calloutRef} className={`max-w-3xl mx-auto bg-raspberry/10 border-l-4 border-raspberry p-6 md:p-8 rounded-xl shadow-sm transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="font-bold text-base md:text-lg text-center text-destructive">
            The cost of this gap: burned budget, exhausted teams, lost leadership trust, and missed opportunities, because you were chasing a sh<span className="text-raspberry">IF</span>t your organization wasn't structured to lead.
          </p>
          <div className="flex justify-center">
            <CostCalculatorDialog />
          </div>
        </div>
      </div>
    </section>
  );
}
