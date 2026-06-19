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
    "Need operational reinforcement that hasn't been built yet",
    "Exceed what your organization can hold, no matter how strong the intent"
  ];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container max-w-5xl mx-auto px-6">
        {/* Opening rhythm, centered, generous spacing */}
        <div className="text-center max-w-4xl mx-auto mb-12 space-y-4" style={{ lineHeight: '1.9' }}>
          <p className="text-body text-navy font-bold !not-italic">
            There's a moment that arrives in most organizations, often without announcement.
          </p>
          <p className="text-body text-foreground">
            Not a decision.<br />
            Or a plan.<br />
            And not a mandate.<br /><br />
            But a question that starts to take shape: <strong><em>"What could our organization actually lead next?"</em></strong>
          </p>
          <p className="text-body text-foreground whitespace-pre-line">
            That question is the threshold. And what's on the other side of it isn't strategy, but reality.{"\n\n"}
            The reality of what your leadership culture can carry. The reality of what your systems are built to move. The reality of what your people have the capacity to navigate without burning out or breaking down.
          </p>
          <p className="text-body text-foreground font-semibold">
            Few leaders create enough space to examine this reality clearly before committing to a direction.
          </p>
        </div>
        
        <div className="h-2 w-32 rounded-full bg-gradient-to-r from-strategic via-gold to-lime mx-auto mb-12" />
        
        <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-6">
          The Gap Between Ambition and Architecture
        </h2>
        
        <p className="text-body text-foreground text-center max-w-4xl mx-auto mb-4">
          The real question isn't <span className="font-bold italic text-raspberry">"How do we implement or carry this out?"</span>&nbsp;<br />
          It's <span className="font-bold italic text-bluedoor">"Does our organization have the architecture to lead it?"</span>
        </p>
        <p className="text-body text-foreground text-center max-w-4xl mx-auto mb-8">
          That's the question most often skipped, and it's the one that decides whether a transformation takes root or collapses under its own weight.&nbsp;<br /><br /><br />
          Without a clear picture of your organization's actual capability, you risk committing time, resources, and credibility to changes that:
        </p>
        
        <div className="max-w-3xl mx-auto mb-12 flex justify-center">
          <ul className="space-y-4">
            {problemPoints.map((point, index) => (
              <li key={index} className="text-body flex items-start gap-3">
                <Circle className="w-3 h-3 mt-2 fill-raspberry text-raspberry flex-shrink-0" />
                <span className="text-base md:text-lg text-foreground leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div ref={calloutRef} className={`max-w-3xl mx-auto bg-raspberry/10 border-l-4 border-raspberry p-6 md:p-8 rounded-xl shadow-sm transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-body font-bold text-center text-destructive">
            The hidden cost of building beyond your architecture:&nbsp;burned budget, exhausted teams, lost leadership trust, and missed opportunities, because you were chasing a sh<span className="text-raspberry font-bold">IF</span>t your organization wasn't structured to lead.
          </p>
          <div className="flex justify-center">
            <CostCalculatorDialog />
          </div>
        </div>
      </div>
    </section>
  );
}
