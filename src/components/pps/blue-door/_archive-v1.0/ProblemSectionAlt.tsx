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
    "Sound strategic but exceed your organizational capacity",
    "Would require operational reinforcement and readiness you haven't built",
    "Crack or crumble under the weight of execution despite good intentions"
  ];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-6">
          <p className="text-xl md:text-2xl text-navy font-bold leading-relaxed">
            There's a moment, often quiet, when a new idea begins to spark in your business.
          </p>
          <p className="text-base md:text-lg text-foreground leading-relaxed">
            Not a decision.<br />
            Not a plan.<br />
            Not a mandate.<br />
            But a question that starts with "What <span className="font-bold text-bluedoor">IF</span>?"<br />
            And a sense that your next sh<span className="text-raspberry font-bold">IF</span>t won't (or can't) look like what was done and what came before.
          </p>
          <p className="text-base md:text-lg text-foreground leading-relaxed">
            It's when the <span className="font-bold text-bluedoor">blue door</span> of discovery and decision appears.<br />
            And it's also where organizations tend to leap before they look.
          </p>
        </div>
        
        <div className="h-2 w-32 rounded-full bg-gradient-to-r from-strategic via-gold to-lime mx-auto mb-12" />
        
        <h2 className="text-2xl md:text-4xl font-bold text-navy text-center mb-6">
          The Gap Between Ambition & Architecture
        </h2>
        
        <p className="text-base md:text-lg text-foreground leading-relaxed text-center max-w-3xl mx-auto mb-12">
          There's a specific moment in every major transformation when the real question surfaces. Not <span className="font-bold italic text-raspberry">"how do we implement this?"</span> but <span className="font-bold italic text-bluedoor">"who do we need to become for this to hold?"</span> Most organizations move too fast to hear it.
        </p>
        
        <div className="grid md:grid-cols-2 gap-12 items-start mb-12">
          <div className="flex items-start justify-center">
            <p className="text-base md:text-lg text-foreground leading-relaxed text-center">
              Without a clear picture of what your organization is built to lead next, you risk pouring time, money, and energy into changes that:
            </p>
          </div>
          
          <div>
            <ul className="space-y-4">
              {problemPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Circle className="w-3 h-3 mt-2 fill-raspberry text-raspberry flex-shrink-0" />
                  <span className="text-base md:text-lg text-foreground leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div ref={calloutRef} className={`bg-raspberry/10 border-l-4 border-raspberry p-6 md:p-8 rounded-xl shadow-sm transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="font-bold text-base md:text-lg text-center text-destructive">
            The cost of this gap: burned budget, exhausted teams, lost trust from leadership, and missed opportunities because you were chasing the wrong sh<span className="text-raspberry">if</span>t.
          </p>
          <div className="flex justify-center">
            <CostCalculatorDialog />
          </div>
        </div>
      </div>
    </section>
  );
}
