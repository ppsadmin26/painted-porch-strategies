import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const faqs = [
  {
    question: "How do I know if the Blue Door is what I need?",
    answer: "If you're imagining what's next, or you've picked a direction and want to know your organization is built to lead it before you press go, you're at the Blue Door. That's exactly what this appraisal is built for.\n\nIf you've already launched a change initiative and need a partner to execute what's in motion, you're past the Blue Door. You need implementation partnership, not architectural examination. We can still help. <a href='/contact' class='text-bluedoor underline hover:text-navy transition-colors'>Contact us</a> and we'll point you in the right direction."
  },
  {
    question: "How is this different from other readiness assessments?",
    answer: "Most readiness assessments assume the direction is already set and the work is in motion. They measure how much communication and management effort it will take to push a change forward, how hard you'll have to push to get it across the finish line. They focus on completion, not necessarily success.\n\nThe Blue Door works upstream of that question. It surfaces what's actually viable now, based on what your organization is built to carry, before you commit to any one direction. The question isn't how hard you'll have to push to finish, but whether the change will stand up once you do. That's the difference between change management and change origination.\n\nAnd every P.A.T.H. Compass is built from your specific responses. AI-powered pattern recognition combined with strategic review from the Painted Porch team."
  },
  {
    question: "What happens after I complete the appraisal?",
    answer: "You'll get an immediate confirmation. Within 72 business hours, your P.A.T.H. Compass is delivered as both a PDF and portal access. If your responses show strong alignment for strategic co-design partnership, we'll include a debrief invitation to walk through your results together. Your $1,500 investment is fully credited toward any future engagement."
  },
  {
    question: "What's included in my P.A.T.H. Compass?",
    answer: null,
    richContent: true
  },
  {
    question: "What if my organization isn't ready to shIFt?",
    answer: "That's one of the most valuable things the Blue Door can surface. Knowing you're not yet ready, and understanding exactly what needs to change first, is worth far more than launching a change initiative your organization can't sustain. Your P.A.T.H. Compass includes a Reinforcement Path that maps what needs strengthening, and in what order.\n\nReadiness isn't a yes-or-no question. It's an architectural one."
  },
  {
    question: "What is Phase Zero?",
    answer: "Phase Zero is the strategic work before execution begins. Imagining which shIFt to pursue and architecting how to lead it, before committing resources to building it. The Blue Door is your entry point to Phase Zero. It surfaces what your organization is actually built to carry, so you can make grounded decisions about what comes next."
  }
];

const compassSections = [
  { name: "Capacity Signal", desc: "what your organization is built to carry right now" },
  { name: "Organizational Architecture", desc: "strength and vulnerability across the three Painted Porch Pillars" },
  { name: "Move Now Map", desc: "where you can act immediately from existing strength" },
  { name: "Reinforcement Path", desc: "what needs to change before deeper transformation can take root" },
  { name: "Your Recommended P.A.T.H.way", desc: "personalized next steps based on your specific architecture" }
];

export default function FAQSectionAlt() {
  const { ref: sectionRef, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="py-12 md:py-20 bg-muted/50">
      <div className="container max-w-4xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-foreground text-center mb-10">
          Everything you need to know about the Blue Door
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
                  {faq.richContent ? (
                    <div>
                      <p className="mb-3">
                        Your P.A.T.H. Compass is a strategic reading of your organization. You receive both a PDF and interactive portal access that includes:
                      </p>
                      <ul className="space-y-2">
                        {compassSections.map((section, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-lime font-bold">•</span>
                            <span><strong>{section.name}</strong>, {section.desc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    faq.answer?.split('\n\n').map((paragraph, i) => (
                      <p
                        key={i}
                        className={i > 0 ? 'mt-3' : ''}
                        dangerouslySetInnerHTML={{ __html: paragraph }}
                      />
                    ))
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
