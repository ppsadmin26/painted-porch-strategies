/**
 * Partner With Us Hub Page
 * 
 * Hybrid implementation combining:
 * - NEW: Strategic P.A.T.H.way messaging and philosophy
 * - NEW: Updated tier content with accurate pricing and offerings
 * - NEW: How to Choose decision framework
 * - NEW: Differentiators section
 * - NEW: Social proof testimonials
 * - PRESERVED: Transparent flat-fee pricing messaging
 * - PRESERVED: 5% charitable donation commitment
 * - PRESERVED: "What's Included in Every Engagement" section
 * 
 * See: PPS_Partner_With_Us_Hub_Page_FINAL_CORRECTED_02.05.2026.md
 */

import {
  PartnerHeroSection,
  PathwayComparisonSection,
  HowToChooseSection,
  BlueDoorCalloutSection,
  PartnerIncludedSection,
  ExploreBeforeCommitSection,
  FinalInvitationSection,
} from "@/components/pps/partner";
import { PhilosophyApproachSection } from "@/components/pps/partner/PhilosophyApproachSection";
import { FAQSection } from "@/components/pps/FAQSection";

import ClientLogoMarquee from "@/components/pps/ClientLogoMarquee";

const partnerFaqs = [
  {
    question: "What's the difference between IGNITE, AMPLIFY, and EMBODY?",
    answer: "IGNITE is self-paced individual development — courses, assessments, and masterclasses you complete on your own schedule. AMPLIFY is cohort and team-based learning through workshops, strategic sprints, and Leadership Labs. EMBODY is an embedded executive partnership for full organizational transformation. Each P.A.T.H.way builds on the last, but you can start wherever fits your needs.",
  },
  {
    question: "Do I need to start with IGNITE before moving to AMPLIFY or EMBODY?",
    answer: "No. Your starting point is yours to choose. Many leaders begin with IGNITE to build personal capacity, then progress to AMPLIFY or EMBODY. Others jump directly into AMPLIFY workshops or EMBODY partnerships based on their organization's readiness and goals.",
  },
  {
    question: "How do I know which P.A.T.H.way is right for me?",
    answer: "Consider where you are right now: If you're exploring change concepts individually, start with IGNITE. If you're ready to activate your team, AMPLIFY is your journey. If you're a senior leader ready for embedded, sustained transformation, EMBODY is designed for you. Our How to Choose section above can also guide your decision.",
  },
  {
    question: "Can I mix offerings from different P.A.T.H.ways?",
    answer: "Absolutely. Many leaders take IGNITE courses for personal development while their teams participate in AMPLIFY workshops. The P.A.T.H.ways are designed to complement each other, not restrict you.",
  },
  {
    question: "What does 'Phase Zero' mean?",
    answer: "Phase Zero™ is the strategic preparation that happens before any project kicks off. It's the readiness work — mindset, alignment, and architectural design — that most change initiatives skip. It's the foundation everything at Painted Porch is built on.",
  },
  {
    question: "Is there a commitment or contract required?",
    answer: "IGNITE offerings are individual purchases with no ongoing commitment. AMPLIFY engagements are typically 3–6 month partnerships. EMBODY partnerships run 6–12+ months. Every engagement starts with a conversation to make sure it's the right fit for both sides.",
  },
  {
    question: "What industries do you work with?",
    answer: "Our frameworks are industry-agnostic. We've partnered with leaders in healthcare staffing, technology, professional services, and more. The principles of Phase Zero and human-centered change apply wherever people drive results.",
  },
];

export default function PartnerWithUsAlt() {
  return (
    <div>
      {/* Section 1: Hero */}
      <PartnerHeroSection />

      {/* Section 2: Three P.A.T.H.ways Comparison */}
      <PathwayComparisonSection />

      {/* Section 3: Our Philosophy & Approach (tabbed) */}
      <PhilosophyApproachSection />

      {/* Section 4: How to Choose */}
      <HowToChooseSection />

      {/* Section 4b: Blue Door Callout */}
      <BlueDoorCalloutSection />

      {/* PRESERVED: Custom Options + Included Items (flat-fee pricing, 5% donation) */}
      <PartnerIncludedSection />

      {/* Section 6: Trust Signals */}
      <ClientLogoMarquee />

      {/* Section 7: FAQ */}
      <FAQSection 
        tierName="Partnership"
        subheadline="Everything you need to know about our P.A.T.H.ways"
        faqs={partnerFaqs}
      />

      {/* Section 8: Explore Before You Commit */}
      <ExploreBeforeCommitSection />

      {/* Section 9: Final Invitation */}
      <FinalInvitationSection />
    </div>
  );
}
