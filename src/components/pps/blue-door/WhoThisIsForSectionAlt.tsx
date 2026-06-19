import { Check, X } from "lucide-react";
import { useStaggeredAnimation, getStaggeredItemClasses } from "@/hooks/useStaggeredAnimation";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const forItems = [
  "Executive teams weighing important decisions, sensing pressure to act but wanting to understand what their organization's architecture can genuinely support before committing",
  "Leaders who've identified a direction and want to understand what it will require before they press go",
  "Organizations prepared to look at their actual capability clearly, even if it means adjusting course"
];

const notForItems = [
  "Organizations already in execution looking for a partner to push it across the finish line - you need implementation support, not architectural examination",
  "Leaders who want validation rather than reality - this surfaces what's true, not what's comfortable",
  "Teams looking for a faster route to execution - this is the work before execution, not a shortcut around it"
];

export default function WhoThisIsForSectionAlt() {
  const { ref: cardsRef, visibleItems } = useStaggeredAnimation<HTMLDivElement>({
    itemCount: 2,
    staggerDelay: 200,
    threshold: 0.2
  });

  const { ref: comparisonRef, isVisible: comparisonVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container max-w-5xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-12">
          Is This the Right Moment to Open the Blue Door?
        </h2>
        
        <div ref={cardsRef} className="grid md:grid-cols-2 gap-8 mb-16">
          <div className={`bg-[hsl(140,60%,97%)] border-l-4 border-lime p-8 rounded-xl shadow-sm ${getStaggeredItemClasses(visibleItems[0], "slide-left")}`}>
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-lime mb-6">
              The Blue Door Is For...
            </h3>
            <ul className="space-y-4">
              {forItems.map((item, index) => (
                <li key={index} className="text-body flex items-start gap-3">
                  <Check className="w-5 h-5 text-lime flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className={`bg-raspberry/5 border-l-4 border-raspberry p-8 rounded-xl shadow-sm ${getStaggeredItemClasses(visibleItems[1], "slide-right")}`}>
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-raspberry mb-6">
              The Blue Door Is Not For...
            </h3>
            <ul className="space-y-4">
              {notForItems.map((item, index) => (
                <li key={index} className="text-body flex items-start gap-3">
                  <X className="w-5 h-5 text-raspberry flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* At / Past the Blue Door comparison */}
        <div
          ref={comparisonRef}
          className={`grid md:grid-cols-2 gap-6 transition-all duration-700 ease-out ${comparisonVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <div className="bg-bluedoor/10 border-2 border-bluedoor/30 p-6 rounded-lg text-center">
            <h4 className="text-base md:text-lg font-poppins font-bold text-bluedoor mb-2">At the Blue Door</h4>
            <p className="text-body -sm text-foreground italic">
              "We're imagining what's next, or we've picked a direction, and we want to know our organization is built to lead it before we press go"
            </p>
          </div>
          <div className="bg-muted/40 border-2 border-muted-foreground/15 p-6 rounded-lg text-center">
            <h4 className="text-base md:text-lg font-poppins font-bold text-muted-foreground mb-2">Past the Blue Door</h4>
            <p className="text-body -sm text-foreground italic">
              "We've launched our latest change initiative. We need a partner to execute what's already in motion and get it across the finish line"
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
