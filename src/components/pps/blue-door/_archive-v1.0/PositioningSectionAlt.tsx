import { useEffect, useRef, useState } from "react";
import { DoorOpen } from "lucide-react";

export default function PositioningSectionAlt() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setCardsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    if (cardsRef.current) observer.observe(cardsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-strategic/5 via-white to-bluedoor/5">
      <div className="container max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-navy mb-12 flex items-center justify-center gap-3">
          <DoorOpen className="w-10 h-10 md:w-16 md:h-16 text-bluedoor flex-shrink-0" />
          <span>
            The <span className="text-bluedoor">Blue Door</span> Opens Before
            <br />
            Your Next Sh<span className="text-bluedoor font-bold">IF</span>t Happens
          </span>
        </h2>

        <p className="text-base md:text-lg text-foreground leading-relaxed mb-4">
          <span className="font-bold text-bluedoor">The Blue Door</span> opens at the moment of "What <span className="font-bold text-bluedoor">IF</span>…?", when you're determining what shift to imagine and pursue, not how to implement what's already been decided.
        </p>

        <p className="text-base md:text-lg text-foreground leading-relaxed mb-8">
          It's not about choosing a direction or committing to a shift. It's about pausing early - before imagination hardens into strategy, timelines, or execution - to answer one important question:
        </p>

        <div className="text-center max-w-3xl mx-auto mb-8">
          <p className="text-lg md:text-xl text-bluedoor leading-relaxed mb-6 font-bold italic">What's possible for your organization <span className="underline">right now</span>?</p>
          <p className="text-base md:text-lg text-foreground leading-relaxed mb-6">
            Not hypothetically. Not at full potential. But given how your leadership, systems, and people are structured right now - to decide, design, and deliver what's next.
          </p>
          <p className="text-base md:text-lg text-foreground leading-relaxed mb-6">
            Your technology instinct may be right. Your operational focus is probably spot on. What tends to be missing in making these a success isn't a lack of clear strategy or execution, it's your organizational identity capable of holding both. That's the 20% that determines whether the other 80% sticks.
          </p>
        </div>

        <p className="text-base md:text-lg text-foreground leading-relaxed mb-4">
          <span className="font-bold text-bluedoor">The Blue Door</span> is for leaders at the threshold of their next sh<span className="text-raspberry font-bold">IF</span>t: imagining what to pursue before committing resources, time, and money to make it happen. This isn't about limiting what's possible. It's about grounding it in reality.
        </p>

        <p className="text-base md:text-lg text-foreground leading-relaxed mb-12 font-bold">
          This is what we call Phase Zero: the strategic work before the execution work begins.
        </p>

        <div ref={cardsRef} className="grid md:grid-cols-2 gap-6">
          <div className={`bg-bluedoor/10 border-2 border-bluedoor p-6 rounded-lg transition-all duration-700 ease-out ${cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <h3 className="text-xl md:text-2xl font-poppins font-semibold text-bluedoor mb-3">
              At the Blue Door
            </h3>
            <p className="text-foreground">
              "We haven't yet decided what shift to explore and make happen next"
            </p>
          </div>

          <div className={`bg-muted/50 border-2 border-muted-foreground/30 p-6 rounded-lg transition-all duration-700 ease-out delay-150 ${cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <h3 className="text-xl md:text-2xl font-poppins font-semibold text-foreground mb-3">
              Past the Blue Door
            </h3>
            <p className="text-foreground">
              "We know what we're building, we need help implementing it"
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
