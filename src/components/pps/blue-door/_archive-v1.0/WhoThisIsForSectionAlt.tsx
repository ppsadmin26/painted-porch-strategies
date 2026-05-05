import { Check, X } from "lucide-react";
import { useStaggeredAnimation, getStaggeredItemClasses } from "@/hooks/useStaggeredAnimation";

const forItems = [
  "Executives who know change is coming but aren't sure which direction to lead",
  "Leadership teams at a crossroads without clear consensus on what's next",
  "Organizations eyeing transformation but questioning whether they're ready",
  "Leaders who want a clear picture of their capacity before committing resources"
];

const notForItems = [
  "Organizations that already know their direction (you need execution partners, not exploration)",
  "Leaders looking for validation of decisions already made (this reveals reality, not justification)",
  "Companies looking for quick fixes without structural change",
  "Teams wanting someone to do the work for them (we architect, you build)"
];

export default function WhoThisIsForSectionAlt() {
  const { ref: cardsRef, visibleItems } = useStaggeredAnimation<HTMLDivElement>({
    itemCount: 2,
    staggerDelay: 200,
    threshold: 0.2
  });

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container max-w-6xl mx-auto px-6">
        <h2 className="text-2xl md:text-4xl font-bold text-navy text-center mb-12">
          Is This the Right Moment To Open the Blue Door?
        </h2>
        
        <div ref={cardsRef} className="grid md:grid-cols-2 gap-8">
          <div className={`bg-gradient-to-br from-lime/10 to-primary/10 border-l-4 border-lime p-8 rounded-xl shadow-sm ${getStaggeredItemClasses(visibleItems[0], "slide-left")}`}>
            <h3 className="font-poppins font-bold text-xl md:text-2xl text-lime mb-6">
              The Blue Door is For...
            </h3>
            <ul className="space-y-4">
              {forItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-lime flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className={`bg-gradient-to-br from-raspberry/10 to-raspberry/5 border-l-4 border-raspberry p-8 rounded-xl shadow-sm ${getStaggeredItemClasses(visibleItems[1], "slide-right")}`}>
            <h3 className="font-poppins font-bold text-xl md:text-2xl text-raspberry mb-6">
              The Blue Door is Not For...
            </h3>
            <ul className="space-y-4">
              {notForItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-raspberry flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
