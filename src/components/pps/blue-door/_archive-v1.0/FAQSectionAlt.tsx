import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const faqs = [
  {
    question: "How long does the diagnostic take to complete?",
    answer: "About 15–20 minutes. You'll answer 15 strategic questions that surface both the opportunities in front of you and your capability to lead them."
  },
  {
    question: "When will I receive my Executive Blue Door Brief?",
    answer: "You'll receive your personalized Executive Blue Door Brief within 72 business hours of completing the diagnostic. The report combines AI-powered pattern recognition with 20+ years of change architecture experience from the Painted Porch team."
  },
  {
    question: "What's included in the Executive Blue Door Brief?",
    answer: "Your Executive Blue Door Brief includes 3–4 viable shifts you're positioned to explore and lead, a structural capability assessment across the Painted Porch Pillars, prerequisites for each potential path, and strategic recommendations for next steps."
  },
  {
    question: "What happens after I complete the diagnostic?",
    answer: "Based on your results, you may be invited to go deeper through our Architect Change Design Session or P.A.T.H.ways Partnership. Not everyone who completes the diagnostic will be ready for these next steps, this partnership is based on organizational readiness and mutual fit."
  },
  {
    question: "Is this diagnostic right for my organization?",
    answer: "The Blue Door is ideal for executives who know change is needed but are uncertain which direction to lead, leadership teams facing strategic inflection points, and organizations planning transformation but questioning readiness. It's not designed for organizations with strategic direction already decided or leaders seeking validation for predetermined decisions."
  },
  {
    question: "What if my organization isn't ready to shIFt?",
    answer: "That's exactly what this diagnostic helps determine. Many organizations discover through this process that certain foundational work needs to happen first. Your Executive Blue Door Brief will identify any prerequisites and provide clarity on timing, so you don't commit resources to transformation you're not yet built to lead."
  },
  {
    question: "How is this different from other strategic appraisals?",
    answer: "This isn't a feel-good appraisal. It's an evidence-based diagnostic that prevents false positives, surfaces uncomfortable truths about readiness, and flags premature shifts before you commit resources."
  },
  {
    question: "What is Phase Zero?",
    answer: "Phase Zero is the strategic work before the work, the thinking and design that happens before any building begins. It makes sure you're pursuing transformations you're actually built to lead, so you don't commit to initiatives that would break under the weight of execution."
  },
  {
    question: "How can I Do Good ShIFt?",
    answer: "At Painted Porch Strategies, we believe that to do well, we must also do good. That's why 5% of every purchase is donated to charity. Visit our Doing Good ShIFt page to see all the charities we've supported over the years.",
    link: {
      text: "See our Doing Good ShIFt page",
      url: "https://www.paintedporchstrategies.com/doing-good-shift"
    }
  }
];

export default function FAQSectionAlt() {
  const { ref: sectionRef, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="py-12 md:py-20 bg-muted/50">
      <div className="container max-w-4xl mx-auto px-6">
        <p className="text-center text-gold font-poppins font-semibold tracking-widest uppercase text-sm mb-3">
          Got Questions?
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-foreground text-center mb-10">
          Everything you need to know about The Blue Door
        </p>
        
        <div ref={sectionRef}>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className={`bg-white border border-border shadow-sm rounded-lg px-6 data-[state=open]:border-primary/30 data-[state=open]:shadow-md transition-all duration-500 ease-out ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: isVisible ? `${index * 75}ms` : '0ms' }}
              >
                <AccordionTrigger className="text-left font-poppins font-semibold text-base md:text-lg text-navy hover:text-primary py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-foreground leading-relaxed pb-4">
                  {faq.answer}
                  {faq.link && (
                    <a 
                      href={faq.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-3 text-primary font-semibold hover:underline"
                    >
                      {faq.link.text} →
                    </a>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
