import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FAQSection, type FAQCategory } from "@/components/pps/FAQSection";
import LazyHeroVideo from "@/components/pps/LazyHeroVideo";
import faqHero from "@/assets/faq-hero.jpg";

const sitewideFaqCategories: FAQCategory[] = [
  {
    name: "General",
    faqs: [
      {
        question: "What does Painted Porch Strategies do?",
        answer: "We partner with leaders and organizations to architect transformation capacity before implementation begins. Grounded in Stoic philosophy and 20+ years of change expertise, we co-design the cultural cornerstone, operational frame, and living ecosystem required for sustainable, human-centered change.",
      },
      {
        question: "What does 'Phase Zero™' mean?",
        answer: "Phase Zero is the strategic preparation that happens before any project kicks off. It's the readiness work, mindset, alignment, and architectural design, that most change initiatives skip. It's the foundation everything at Painted Porch is built on.",
      },
      {
        question: "Why is it called 'Painted Porch'?",
        answer: "The name comes from the ancient stoa poikile, the 'painted porch' in Athens where Zeno taught Stoicism. It was an open-air gathering place for learning, dialogue, and practical wisdom. We carry that spirit into modern organizational change.",
      },
      {
        question: "What industries do you work with?",
        answer: "Our frameworks are industry-agnostic. We've partnered with leaders in healthcare staffing, technology, professional services, and more. The principles of Phase Zero and human-centered change apply wherever people drive results.",
      },
      {
        question: "How is Painted Porch different from traditional consulting?",
        answer: "Traditional consultants deliver packaged solutions based on what worked elsewhere. We partner with you to co-design transformation architecture specific to your context. You're the expert of your organization. We're experts in transformation architecture. Together, we build permanent capacity, not dependency.",
      },
    ],
  },
  {
    name: "Choosing Your P.A.T.H.way",
    faqs: [
      {
        question: "What's the difference between IGNITE, AMPLIFY, and EMBODY?",
        answer: "IGNITE is self-paced individual development, courses, assessments, and masterclasses you complete on your own schedule. AMPLIFY is cohort and team-based learning through workshops, strategic sprints, and Leadership Labs. EMBODY is an embedded executive partnership for full organizational transformation. Each P.A.T.H.way builds on the last, but you can start wherever fits your needs.",
      },
      {
        question: "How do I know which P.A.T.H.way is right for me?",
        answer: "Consider where you are right now: If you're exploring change concepts individually, start with IGNITE. If you're ready to activate your team, AMPLIFY is your journey. If you're a senior leader ready for embedded, sustained transformation, EMBODY is designed for you.",
      },
      {
        question: "Do I need to start with IGNITE before moving to AMPLIFY or EMBODY?",
        answer: "No. Your starting point is yours to choose. Many leaders begin with IGNITE to build personal capacity, then progress to AMPLIFY or EMBODY. Others jump directly into AMPLIFY workshops or EMBODY partnerships based on their organization's readiness and goals.",
      },
      {
        question: "Can I mix offerings from different P.A.T.H.ways?",
        answer: "Absolutely. Many leaders take IGNITE courses for personal development while their teams participate in AMPLIFY workshops. The P.A.T.H.ways are designed to complement each other, not restrict you.",
      },
      {
        question: "Is there a commitment or contract required?",
        answer: "IGNITE offerings are individual purchases with no ongoing commitment. AMPLIFY engagements are typically 3–6 month partnerships. EMBODY partnerships run 6–12+ months. Every engagement starts with a conversation to make sure it's the right fit for both sides.",
      },
    ],
  },
  {
    name: "IGNITE, Courses",
    faqs: [
      {
        question: "Do I need to take courses in a specific order?",
        answer: "No. Start with whichever program addresses your most pressing development priority. Many leaders find Radical Mindfulness (ground preparation) or Leading Change (Phase Zero foundations) to be natural starting points.",
      },
      {
        question: "How long does it take to complete each course?",
        answer: "Courses range from 8-12 modules if you follow the suggested pace. Because they're self-paced, you can move faster or slower based on your schedule. You have lifetime access.",
      },
      {
        question: "Can I get organizational funding for courses?",
        answer: "Absolutely. Many leaders expense IGNITE courses as professional development. We provide invoices and can work with your L&D team if needed.",
      },
      {
        question: "What if I purchase a single course but later want a bundle?",
        answer: "Start with one program. As an alumni of our programs, you'll receive a discount that may be applied to any future course or other individual offers from the Painted Porch.",
      },
      {
        question: "Can I access courses on mobile devices?",
        answer: "Yes. All courses are accessible on desktop, tablet, and mobile devices so you can learn wherever works best for you.",
      },
    ],
  },
  {
    name: "IGNITE, Assessments",
    faqs: [
      {
        question: "Do assessments expire?",
        answer: "No. Once you purchase an assessment, you schedule any optional debrief at your convenience (within 12 months of purchase).",
      },
      {
        question: "Which assessment should I take first?",
        answer: "It depends on your development priorities. The Shift Architect Assessment is ideal if you're preparing to lead transformation. EQ-i 2.0 if you want emotional intelligence insights. Working Genius if you need to understand your work energy patterns. Performance DNA if you want your complete success blueprint.",
      },
      {
        question: "Can I take multiple assessments?",
        answer: "Yes. Many leaders take 2-3 assessments to get a comprehensive view of their capacity, strengths, and development priorities.",
      },
      {
        question: "Are debriefs included with all assessments?",
        answer: "Debriefs are optional and vary by assessment. Check individual assessment details for specific offerings.",
      },
      {
        question: "Can my team take assessments together?",
        answer: "Yes. Team pricing is available for Working Genius, EQ-i 2.0, and Performance DNA. Contact us for team rates and group debrief options.",
      },
    ],
  },
  {
    name: "IGNITE, Masterclasses",
    faqs: [
      {
        question: "How long are masterclasses?",
        answer: "Masterclasses are focused 30-90 minute sessions designed to illuminate specific Phase Zero concepts without requiring weeks of commitment.",
      },
      {
        question: "Are masterclasses live or recorded?",
        answer: "Both. Attend live for interaction and Q&A, or access the recording if the timing doesn't work for your schedule.",
      },
      {
        question: "Do I need to complete courses before attending masterclasses?",
        answer: "No. Masterclasses are standalone learning experiences that work whether you're new to Phase Zero concepts or deepening existing knowledge.",
      },
    ],
  },
  {
    name: "AMPLIFY",
    faqs: [
      {
        question: "What's the difference between IGNITE and AMPLIFY?",
        answer: "IGNITE is self-paced individual development (courses, assessments, masterclasses). AMPLIFY is cohort and team-based learning (workshops, strategic sprints, Leadership Labs). IGNITE builds your capacity. AMPLIFY builds your leadership, team, or organizational capacity and skills.",
      },
      {
        question: "Can I start with IGNITE and progress to AMPLIFY later?",
        answer: "Absolutely. Many leaders start with IGNITE to build personal capacity, then progress to AMPLIFY Leadership Labs for deeper peer learning—or bring Phase Zero concepts to their teams through AMPLIFY workshops and strategic sprints.",
      },
    ],
  },
  {
    name: "AMPLIFY, Leadership Labs",
    faqs: [
      {
        question: "When is the next Leadership Lab cohort?",
        answer: "We run Leadership Labs a few times per year. Join the waitlist and you'll be the first to know when new dates are announced.",
      },
      {
        question: "What happens after I join the waitlist?",
        answer: "You'll receive a confirmation that you're on the list. When we schedule the next cohort, waitlist members get first access and priority enrollment before we open spots to the public.",
      },
      {
        question: "Is there any cost to join the waitlist?",
        answer: "No. Joining the waitlist is completely free and there's no obligation. It simply ensures you're notified first when enrollment opens.",
      },
      {
        question: "What's the format for Leadership Labs?",
        answer: "Leadership Labs are 6-12 week cohort-style programs with bi-weekly or monthly sessions, peer accountability, and individual coaching touchpoints. Each lab focuses on a specific theme (Stractical Leadership, Leading Change, etc.) and is capped at 25 leaders from different organizations.",
      },
    ],
  },
  {
    name: "EMBODY",
    faqs: [
      {
        question: "How is your EMBODY partnership different from change management consultants?",
        answer: "Change management focuses on implementing predefined changes by managing resistance, driving adoption, and delivering transitions downstream. We do change origination—we partner with you to architect transformation capacity upstream, before implementation begins. After change management, you've executed a change. After EMBODY partnership, you've built the capacity to originate and architect your own transformations without external dependency.",
      },
      {
        question: "Can we start with AMPLIFY and progress to EMBODY?",
        answer: "Absolutely. Many organizations start with AMPLIFY workshop or sprint to test partnership fit, then progress to EMBODY when deeper work makes sense.",
      },
      {
        question: "Do we need the Blue Door Organizational Appraisal before discovery?",
        answer: "Not required, but highly recommended. Our Blue Door Organizational Appraisal provides the diagnostic foundation that informs discovery conversation and partnership design.",
      },
      {
        question: "How often do you meet with us during our EMBODY partnership?",
        answer: "Typically bi-weekly or monthly formal sessions, plus regular office hours access between sessions. Exact cadence is co-designed based on your needs and transformation pace.",
      },
      {
        question: "Can you work with our internal change management team?",
        answer: "Absolutely! We often partner with internal teams, building their capacity while providing strategic guidance. We're not competitive with internal teams—we're complementary.",
      },
      {
        question: "What happens if leadership changes during partnership?",
        answer: "We work through leadership transitions as part of the partnership. Often, leadership transition is exactly when transformation architecture matters most.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[40vh] flex items-center overflow-hidden">
        <LazyHeroVideo
          slotKey="faq-hero"
          posterUrl={faqHero}
          className="absolute inset-0 w-full h-full"
        />
        
        <div className="container max-w-6xl mx-auto px-6 relative z-10 py-16 md:py-24">
          <div className="md:w-4/5">
            <div className="bg-black/65 backdrop-blur-sm p-8 md:p-12 rounded-xl">
              <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
                Resources
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Frequently Asked Questions
              </h1>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl">
                Everything you need to know about Painted Porch Strategies, our P.A.T.H.ways, and how we partner with leaders to architect extraordinary outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <FAQSection
        tierName="Painted Porch Strategies"
        categories={sitewideFaqCategories}
        subheadline="Browse by topic or search for your question below."
        showContactCTA={true}
      />
    </div>
  );
}
