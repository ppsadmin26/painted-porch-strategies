import type React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * FAQ Section Component
 * 
 * Standardized FAQ section for all tier pages (IGNITE, AMPLIFY, EMBODY).
 * Follows the design system pattern established across pages:
 * 
 * STYLING GUIDE:
 * - Container: max-w-3xl centered, gradient background (from-muted to-white)
 * - Heading: "You've Got Questions. We've Got Answers." (can be customized)
 * - Accordion Items: 
 *   - bg-white with border-border/50
 *   - rounded-md corners (not lg or xl)
 *   - px-5 horizontal padding
 *   - shadow-none
 * - Trigger: font-semibold text-navy, hover:text-primary, text-base
 * - Content: text-foreground, leading-relaxed
 * - Contact CTA: outline button with navy border
 * 
 * USAGE:
 * <FAQSection 
 *   tierName="IGNITE"
 *   faqs={[{ question: "...", answer: "..." }]}
 * />
 * 
 * For categorized FAQs (like IGNITE), use:
 * <FAQSection 
 *   tierName="IGNITE"
 *   categories={[{ name: "Courses", faqs: [...] }]}
 * />
 */

export interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

export interface FAQCategory {
  name: string;
  faqs: FAQItem[];
}

interface FAQSectionProps {
  /** The tier name for context (e.g., "IGNITE", "AMPLIFY", "EMBODY") */
  tierName: string;
  /** Simple flat list of FAQs */
  faqs?: FAQItem[];
  /** Categorized FAQs (overrides faqs if provided) */
  categories?: FAQCategory[];
  /** Custom headline (defaults to "You've Got Questions. We've Got Answers.") */
  headline?: string;
  /** Custom subheadline (defaults to "Everything you need to know about {tierName}") */
  subheadline?: string;
  /** Show contact CTA at bottom (defaults to true) */
  showContactCTA?: boolean;
  /** Custom contact URL (defaults to "/contact") */
  contactUrl?: string;
  /** Custom eyebrow label color class (defaults to "text-gold") */
  eyebrowClassName?: string;
}

export function FAQSection({
  tierName,
  faqs,
  categories,
  headline = "You've Got Questions. We've Got Answers.",
  subheadline,
  showContactCTA = true,
  contactUrl = "/contact?interest=general",
  eyebrowClassName = "text-gold",
}: FAQSectionProps) {
  const defaultSubheadline = `Everything you need to know about ${tierName}`;
  
  // Flatten categories into a single list if provided
  const allFaqs = categories 
    ? categories.flatMap((cat, catIndex) => 
        cat.faqs.map((faq, faqIndex) => ({
          ...faq,
          value: `${catIndex}-${faqIndex}`,
          category: cat.name,
        }))
      )
    : (faqs || []).map((faq, index) => ({
        ...faq,
        value: `faq-${index}`,
        category: null as string | null,
      }));

  // Group by category for rendering with headers
  const hasCategories = categories && categories.length > 0;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className={`${eyebrowClassName} font-poppins font-semibold text-sm tracking-widest uppercase mb-3`}>
            Got Questions?
          </p>
          <h2 className="text-3xl md:text-4xl font-bold font-poppins text-navy mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-foreground">
            {subheadline || defaultSubheadline}
          </p>
        </div>

        {hasCategories ? (
          <div className="space-y-8">
            {categories!.map((category, catIndex) => (
              <div key={catIndex}>
                <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-4 pb-2 border-b border-border/50">
                  {category.name}
                </h3>
                <Accordion type="single" collapsible className="w-full space-y-3">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem 
                      key={faqIndex} 
                      value={`${catIndex}-${faqIndex}`}
                      className="bg-white border border-border/40 rounded-lg px-6 shadow-md"
                    >
                      <AccordionTrigger className="text-left font-semibold text-navy hover:text-primary hover:no-underline py-5 text-base">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-foreground leading-relaxed pb-5">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-3">
            {allFaqs.map((faq) => (
              <AccordionItem 
                key={faq.value} 
                value={faq.value}
                className="bg-white border border-border/40 rounded-lg px-6 shadow-md"
              >
                <AccordionTrigger className="text-left font-semibold text-navy hover:text-primary hover:no-underline py-5 text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-foreground leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {showContactCTA && (
          <div className="text-center mt-8">
            <Link to={contactUrl}>
              <Button className="bg-transparent border-2 border-navy text-navy hover:bg-navy hover:text-white transition-colors">
                More Questions? Contact Us
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
