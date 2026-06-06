import { Link } from "react-router-dom";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { Button } from "@/components/ui/button";
import { CheckCircle, Building2, Cpu, Users, HeartPulse, HandHeart, Compass, Brain } from "lucide-react";
import embodyHero from "@/assets/embody-concept-blueprint.jpg";
import { TierBadge, TIERS } from "@/components/pps/TierBadge";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import { FAQSection, type FAQItem } from "@/components/pps/FAQSection";
import { ExploreBeforeCommitSection } from "@/components/pps/partner/ExploreBeforeCommitSection";
import embodyFinalCtaBg from "@/assets/embody-final-cta-bg.png";
import { PartnerIncludedSection } from "@/components/pps/partner";
import ClientLogoMarquee from "@/components/pps/ClientLogoMarquee";
import StatCard, { StatSources } from "@/components/pps/StatCard";

// Phase cards data
const phases = [
  {
    number: 1,
    title: "Discovery & Design",
    duration: "30-60 Days",
    color: "border-primary",
    accentBg: "bg-primary/10",
    accentText: "text-primary",
    sections: [
      {
        title: "Blue Door",
        subtitle: "(if not completed)",
        items: [
          "Comprehensive organizational assessment",
          "Written report with Pillar scores",
          "Strategic dashboard access",
          "Personal debrief",
        ],
      },
      {
        title: "Stakeholder Discovery",
        items: [
          "Interviews with key executives and leaders",
          "Organizational context deep-dive",
          "Culture and capacity assessment",
          "Constraint and opportunity identification",
        ],
      },
      {
        title: "Partnership Design",
        items: [
          "Co-design partnership structure",
          "Define outcomes and success metrics",
          "Establish cadences and touchpoints",
          "Align on roles and accountability",
        ],
      },
    ],
    deliverable: "Partnership Agreement & Transformation Architecture Blueprint",
    timeline: "4-8 weeks",
  },
  {
    number: 2,
    title: "Architect Change",
    duration: "6-12+ Months",
    color: "border-gold",
    accentBg: "bg-gold/10",
    accentText: "text-gold",
    sections: [
      {
        title: "Strategic Advisory",
        items: [
          "Ongoing access to Amy Yackowski and the Painted Porch team of advisors",
          "Phase Zero™ strategic design sessions",
          "P.A.T.H. framework application to initiatives",
          "Co-architect transformation strategy that your team can sustain independently",
          "Decision support and strategic guidance",
        ],
      },
      {
        title: "Transformation Architecture",
        items: [
          "Design across all three Painted Porch Pillars",
          "Custom framework and tool development",
          "Stakeholder alignment facilitation",
        ],
      },
      {
        title: "Leadership Development",
        items: [
          "Executive coaching touchpoints",
          "Team capacity building",
          "Leadership operating model refinement",
          "Change Ambassador Network design",
        ],
      },
    ],
    deliverable: "Living Transformation Architecture (evolves throughout partnership)",
    timeline: "6-12 months (or longer based on scope)",
  },
  {
    number: 3,
    title: "Embed & Sustain",
    duration: "Final 3-6 Months",
    color: "border-lime",
    accentBg: "bg-lime/10",
    accentText: "text-lime",
    sections: [
      {
        title: "Capability Transfer",
        items: [
          "Build internal capability to sustain architecture",
          "Train internal champions and facilitators",
          "Document practices and protocols",
          "Establish self-sustaining rhythms",
        ],
      },
      {
        title: "Ongoing Options",
        items: [
          "Invitation to Leadership Summit (semi-annually)",
          "Retained advisory relationship (as-needed)",
          "Annual strategic planning partnership",
          "Complete transition to internal ownership",
        ],
      },
    ],
    deliverable: "Self-Sustaining Transformation Capacity",
    timeline: "Final 3-6 months of partnership",
  },
];

// Pillars data - Color gradient: Navy (cool) → Purple (bridge) → Gold (warm)
const pillars = [
  {
    number: 1,
    title: "Cultural Cornerstone",
    subtitle: "Leadership & Culture",
    icon: Building2,
    // Navy: Deep, authoritative, stable - the foundation everything else builds upon
    borderColor: "border-l-navy",
    bgColor: "bg-[hsl(220,60%,95%)]",
    iconBg: "bg-[hsl(220,50%,90%)]",
    accentText: "text-navy",
    definition: "Your leaders, your culture, and how decisions get made together.",
    architect: [
      "Leadership capacity for strategic authorship",
      "Cultural platforms where change can be built",
      "Executive alignment and decision protocols",
      "Change authorship capability",
    ],
  },
  {
    number: 2,
    title: "Operational Frame",
    subtitle: "Workflows & Systems",
    icon: Compass,
    // Purple: Wisdom, strategic depth - bridges analytical and innovative
    borderColor: "border-l-strategic",
    bgColor: "bg-strategic/10",
    iconBg: "bg-strategic/15",
    accentText: "text-strategic",
    definition: "Your systems, workflows, and decision pathways that turn strategy into real work.",
    architect: [
      "Workflow design for market leadership",
      "System integration that enables value creation",
      "Operational capacity for transformation",
      "Process architecture aligned with strategy",
    ],
  },
  {
    number: 3,
    title: "Living Ecosystem",
    subtitle: "Human Capacity",
    icon: Brain,
    // Gold: Warm, human value, potential - the only warm color among the three
    borderColor: "border-l-gold",
    bgColor: "bg-gold/10",
    iconBg: "bg-gold/15",
    accentText: "text-gold",
    definition: "The judgment, communication, and resilience your people bring to the work.",
    architect: [
      "Distributed judgment capability",
      "Navigation skills for complexity",
      "Adaptive capacity that can't be automated",
      "Resilience and strategic thinking throughout your organization",
    ],
  },
];

// Industries data
const industries = [
  {
    icon: HeartPulse,
    title: "Healthcare Organizations",
    items: [
      "Navigating industry disruption",
      "Building strategic capacity for continuous change",
      "Architecting cultural transformation",
    ],
  },
  {
    icon: Cpu,
    title: "Technology Companies",
    items: [
      "Scaling through hypergrowth",
      "Leadership development during rapid expansion",
      "Operational architecture for scale",
    ],
  },
  {
    icon: Building2,
    title: "Professional Services Firms",
    items: [
      "Strategic repositioning",
      "Leadership transition preparation",
      "Building transformation capability",
    ],
  },
  {
    icon: HandHeart,
    title: "Non-Profit Organizations",
    items: [
      "Mission realignment and strategic clarity",
      "Building capacity for sustainable impact",
      "Leadership team development",
    ],
  },
];

// Testimonials data
const testimonials = [
  {
    quote: "We thought we needed change management consultants. What we got was so much more valuable, strategic partners who helped us architect transformation capacity we'll have forever. The Blue Door revealed we weren't ready. The 18-month partnership built foundations that now support everything we do. Worth every dollar.",
    name: "CEO",
    company: "Healthcare Organization",
    detail: "18-month EMBODY partnership, now independent",
  },
  {
    quote: "Amy doesn't tell you what to do. She asks questions that reveal what you already know but haven't articulated. Our leadership team went from fragmented to aligned. Our culture went from resistant to enabling. We're now leading transformation that would have failed two years ago.",
    name: "Chief Strategy Officer",
    company: "Technology Company",
    detail: "12-month EMBODY partnership, continuing with Leadership Summits",
  },
  {
    quote: "The EMBODY partnership wasn't comfortable. Amy challenged assumptions we'd held for years. She asked whether we were actually ready (we weren't). But she also partnered with us to build the capacity we needed. Now we architect change consciously instead of reacting to pressure. That's permanent competitive advantage.",
    name: "Chief People Officer",
    company: "Professional Services Firm",
    detail: "24-month EMBODY partnership across two major transformations",
  },
];

// FAQ data
const faqs = [
  {
    question: "How is EMBODY different from traditional consulting?",
    answer: "Traditional consultants hand you a best-practice playbook and call it a strategy. EMBODY is a true partnership. You're the expert of your organization. We're experts in the architecture that positions shIFt to stick. Together, we co-design what your organization is built to lead, then build the structural capacity to sustain it. You leave with permanent capability.",
  },
  {
    question: "How is EMBODY different from change management?",
    answer: "Change management starts after the direction is set. It manages resistance and pushes adoption of decisions already made. EMBODY is change origination. We partner upstream, at the strategic authorship moment, to architect the shIFt you intend to lead before a single tool gets launched. This is Phase Zero™ work, the work before the work, and it's where market leadership is actually decided.",
  },
  {
    question: "Why does EMBODY start with The Blue Door?",
    answer: "The Blue Door Organizational Appraisal is how we see your three Painted Porch Pillars™ clearly: Cultural Cornerstone, Operational Frame, and Living Ecosystem. It surfaces what your organization is built to carry right now and what needs to be reinforced. Without that reading, any partnership is a guess. With it, we co-design an EMBODY engagement that fits your actual architecture, not a template. Your investment is fully credited toward the engagement.",
  },
  {
    question: "What if the Blue Door shows we're not ready for EMBODY yet?",
    answer: "That's one of the most valuable things The Blue Door can surface. Your P.A.T.H. Compass will include a Reinforcement Path that maps what needs strengthening first, often through AMPLIFY sprints or IGNITE work. We'll be straightforward. We'd rather point you to the right starting line than sell you an engagement your organization can't yet carry.",
  },
  {
    question: "Can we start with AMPLIFY or IGNITE and grow into EMBODY?",
    answer: "Yes, and many partners do exactly that. IGNITE builds individual capacity. AMPLIFY builds team and sprint-level momentum. EMBODY is the embedded, organization-wide partnership for leaders ready to architect transformation at the structural level. Starting smaller is a smart way to feel the partnership before committing to the deeper work.",
  },
  {
    question: "What does an EMBODY partnership actually look like week to week?",
    answer: "Typically bi-weekly or monthly strategic sessions with senior leadership, plus office hours access in between. We move through the full P.A.T.H.™: Prepare, Align, Take Off, and Habit. The exact cadence is co-designed with you. EMBODY is not a fixed program. It's an embedded partnership shaped around the shIFt you're authoring.",
  },
  {
    question: "Can you partner alongside our internal change team?",
    answer: "Absolutely. We're complementary, not competitive. Internal teams often own execution and adoption beautifully. We work upstream of that, co-designing the strategic architecture and building your team's capacity so the work continues long after our partnership ends.",
  },
  {
    question: "What happens if our leadership changes mid-partnership?",
    answer: "Leadership transitions are exactly when architecture matters most. We've designed EMBODY to live in your organization's structure, not in a single relationship. When leadership shifts, we re-anchor the work, bring new leaders into the architecture, and keep the transformation grounded in what your organization is built to lead.",
  },
  {
    question: "What outcomes can we expect from EMBODY?",
    answer: "EMBODY partners leave with three things: a clearly authored direction for the shIFt you intend to lead, an organizational architecture built to sustain it across the three Painted Porch Pillars™, and the internal capacity to originate the next shIFt without us. The goal isn't dependence on Painted Porch. It's a fortified porch where your people can lead change instead of being changed by it.",
  },
];

// P.A.T.H.way steps
const pathwaySteps = [
  { step: 1, title: "Blue Door", desc: "Blue Door Organizational Appraisal (investment credited toward engagement)" },
  { step: 2, title: "Results & Debrief", desc: "Strategic conversation with us about readiness and fit" },
  { step: 3, title: "Discovery (If Qualified)", desc: "Co-design partnership structure, outcomes, and investment" },
  { step: 4, title: "Partnership Agreement", desc: "Formalize commitment and begin designing and building your transformation architecture" },
];

export default function EmbodyPathAltArchiveV2() {
  useDocumentSeo({
    title: "EMBODY (Archive v2) | Painted Porch",
    description: "Archived version of the EMBODY page preserved for reference and marketing material reuse.",
    ogImage: embodyHero,
  });
  return (
    <div>
      <div className="bg-gold/90 text-navy text-center py-2 text-sm font-semibold font-poppins">
        ⚠️ ARCHIVE (v2) — preserved for reference. <a href="/partner/embody" className="underline">View current version →</a>
      </div>
      {/* SECTION 1: HERO */}
      <TierHeroSection
        tier={TIERS.EMBODY}
        badgeLabel="EMBODY P.A.T.H.way"
        headline={<>Architect Epic Sh<span className="text-raspberry">IF</span>t That Lasts.</>}
        
        description="EMBODY is for founders and leaders ready to build permanent organizational capacity through deep, sustained partnership. This isn't consulting or change management. This is co-architecting an unshakeable foundation for sustainable transformation."
        ctas={[
          {
            label: "Open the Blue Door",
            href: "/blue-door",
            buttonClassName: "bg-bluedoor border-2 border-bluedoor text-white hover:bg-white hover:text-bluedoor",
          },
        ]}
        background={{
          type: "video",
          src: embodyHero,
          poster: embodyHero,
          slotKey: "embody-hero",
        }}
        overlayClass="bg-navy/30"
        minHeightClass="min-h-[500px]"
      />

      {/* SECTION 2: THE EMBODY CLIENT (ICP) */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6 text-center">
            It's Time to Sh<span className="text-raspberry">IF</span>t From Change Moments to an Innovation Movement.
          </h2>
          <p className="text-lg text-foreground leading-relaxed mb-10 max-w-4xl mx-auto text-center">
            You've made the decision: you're ready for your organization to shift from managing change initiatives to leading sustainable transformation. You're not looking for consultants to fix or implement change for you, you're ready for strategic partners to co-architect permanent capability in your people, your processes, and your systems.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Where you're at */}
            <div className="bg-gold/10 p-8 rounded-xl">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-gold mb-4">Where you're at:</h3>
              <ul className="space-y-3">
                {[
                  "You're ready to stop treating change like on-off projects and build a culture of continuous innovation",
                  "You want co-creation, not outsourcing",
                  "You've learned that brilliant strategy fails without organizational capacity to execute it",
                  "You understand transformation happens through people, not to them",
                  "You're asking: \"Can we even do what we're planning?\"",
                  "You're open to slowing down to do it right",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What you know */}
            <div className="bg-primary/10 p-8 rounded-xl">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-primary mb-4">What you know:</h3>
              <ul className="space-y-3">
                {[
                  "Great people + great process = extraordinary outcomes",
                  "Transformation without leadership alignment and ownership fails",
                  "You can't architect on top of assumptions, Phase Zero reveals candid clarity on operational capability and capacity",
                  "Quick fixes mask structural problems; foundations enable lasting change",
                  "Sustainable, repeatable transformation requires time for architecture, integration, and embedding",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Outcome seeking */}
          <div className="bg-lime/10 border-l-4 border-lime p-6 rounded-r-xl mb-12">
            <h3 className="text-xl md:text-2xl font-poppins font-semibold text-lime mb-2">The <span className="text-navy">EMBODY</span> outcome you're seeking:</h3>
            <p className="text-lg text-foreground italic mb-2">
              "We've built the internal structures and culture to architect and execute sustainable change, continual transformation is now ours to lead."
            </p>
            <p className="text-foreground">
              Transformation becomes self-sustaining and repeatable. Your organization develops permanent capacity and practices that outlasts any single initiative.
            </p>
          </div>

          {/* What EMBODY Provides */}
          <div className="mb-12">
            <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-6 text-center">What EMBODY Partnership Provides:</h3>
            <p className="text-muted-foreground mb-4 text-center">Comprehensive engagement for organizations ready for permanent transformation:</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "6-12+ month embedded partnership, Strategic advisory and executive co-architecting",
                "Complete transformation architecture, Systematic capability building across your organization",
                "Leadership development integration, Your team learns to architect change, not just execute it",
                "Communication strategy and execution, Organizational alignment systems that stick",
                "Change infrastructure design, Self-sustaining transformation capability built into your DNA",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-white border border-border/50 p-4 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
      {/* SECTION 3: WHO WE WORK WITH (qualifier) */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Organizations We Partner With
            </h2>
            <p className="text-lg text-foreground max-w-3xl mx-auto">
              EMBODY partnerships aren't limited by industry, they're defined by organizational readiness and executive commitment to building transformation capability that becomes permanently yours.
            </p>
          </div>

          {/* Industry Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {industries.map((industry, i) => (
              <div key={i} className="bg-white p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <industry.icon className="w-8 h-8 text-gold shrink-0" />
                  <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy" style={{ fontSize: '1.0625rem' }}>{industry.title}</h3>
                </div>
                <ul className="space-y-2">
                  {industry.items.map((item, j) => (
                    <li key={j} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-gold mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* What They Share */}
          <div className="bg-gold/10 p-8 rounded-xl">
            <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-4 text-center">What They Share:</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "C-suite commitment to transformation",
                "Organizational readiness for deep work",
                "Recognition that quick fixes don't work",
                "Partnership mindset (\"we architect together\")",
                "Long-term orientation (not project-based thinking)",
              ].map((trait, i) => (
                <div key={i} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full">
                  <CheckCircle className="w-4 h-4 text-gold" />
                  <span className="text-sm text-navy font-medium">{trait}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* SECTION 4: THE EMBODY PARTNERSHIP EXPERIENCE */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              The EMBODY Partnership Experience
            </h2>
            <p className="text-lg text-foreground max-w-3xl mx-auto">
              Every EMBODY partnership is custom-designed based on your organizational context, transformation ambition, and capacity assessment. But here's the typical structure:
            </p>
          </div>

          {/* Phase Cards - 2 + 1 Layout */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {phases.slice(0, 2).map((phase) => (
              <div key={phase.number} className={`bg-white p-6 md:p-8 rounded-xl border-t-4 ${phase.color} shadow-sm flex flex-col`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg ${phase.accentBg} flex items-center justify-center`}>
                    <span className={`${phase.accentText} font-bold`}>{phase.number}</span>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy">{phase.title}</h3>
                    <span className={`text-sm font-medium ${phase.accentText}`}>{phase.duration}</span>
                  </div>
                </div>

                {phase.sections.map((section, idx) => (
                  <div key={idx} className="mb-4">
                    <h4 className="text-base md:text-lg font-semibold text-navy mb-2">
                      {section.title} {section.subtitle && <span className="font-normal text-muted-foreground">{section.subtitle}</span>}
                    </h4>
                    <ul className="space-y-1.5">
                      {section.items.map((item, i) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <span className={`${phase.accentText} mt-1`}>•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div className="mt-auto pt-4 border-t border-border/50">
                  <p className="text-sm"><strong className="text-navy">Deliverable:</strong> {phase.deliverable}</p>
                  <p className="text-sm text-muted-foreground mt-1"><strong>Timeline:</strong> {phase.timeline}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Phase 3 - Full Width */}
          <div className={`bg-white p-6 md:p-8 rounded-xl border-t-4 ${phases[2].color} shadow-sm`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg ${phases[2].accentBg} flex items-center justify-center`}>
                <span className={`${phases[2].accentText} font-bold`}>{phases[2].number}</span>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy">{phases[2].title}</h3>
                <span className={`text-sm font-medium ${phases[2].accentText}`}>{phases[2].duration}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {phases[2].sections.map((section, idx) => (
                <div key={idx}>
                  <h4 className="text-base md:text-lg font-semibold text-navy mb-2">{section.title}</h4>
                  <ul className="space-y-1.5">
                    {section.items.map((item, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className={`${phases[2].accentText} mt-1`}>•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-sm"><strong className="text-navy">Deliverable:</strong> {phases[2].deliverable}</p>
              <p className="text-sm text-muted-foreground mt-1"><strong>Timeline:</strong> {phases[2].timeline}</p>
            </div>
          </div>

          {/* The Painted Porch Partnership Model */}
          <div className="bg-navy text-white p-8 rounded-xl text-center mt-8">
            <h3 className="text-xl md:text-2xl font-poppins font-semibold text-white mb-4">The Painted Porch Partnership Model:</h3>
            <p className="text-white/90 mb-4">
              <strong className="text-gold">You're the expert</strong> of your organizational context, your culture, your constraints.
            </p>
            <p className="text-white/90 mb-4">
              <strong className="text-gold">We're experts</strong> in transformation architecture and Phase Zero design.
            </p>
            <p className="text-white/90">
              Together, we build what actually works in YOUR reality, not what works in theory.
            </p>
            <p className="text-gold font-medium mt-4">
              This isn't consulting. This isn't training. This is co-architecting permanent organizational capacity.
            </p>
          </div>
        </div>
      </section>
      {/* BREATHING SECTION: Quote Strip */}
      <section className="py-12 md:py-16 bg-muted">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <blockquote className="text-2xl md:text-3xl font-poppins font-semibold text-navy italic leading-relaxed">
            "The relevant question is not simply what shall we do tomorrow, but rather what shall we do today in order to get ready for tomorrow."
          </blockquote>
          <p className="mt-4 text-muted-foreground text-sm">Peter Drucker</p>
        </div>
      </section>
      {/* SECTION 5: THE THREE PAINTED PORCH PILLARS */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Architect Embodied Adaptability & Continuous Sh<span className="text-raspberry">IF</span>t
            </h2>
            <p className="text-lg text-foreground max-w-4xl mx-auto mb-4">
              The Painted Porch Pillars are your organization's structural capabilities for leading the change you're attempting. While most advisors work on one dimension at a time, leadership first, then processes, then people, that creates fissures where transformation fumbles, fizzles, or fails.
            </p>
            <p className="text-lg font-semibold text-navy max-w-3xl mx-auto">
              EMBODY partnerships integrate all three Pillars simultaneously so change capability compounds instead of cracks.
            </p>
          </div>

          {/* Pillar Cards - 3 across */}
          <div className="grid md:grid-cols-3 gap-6 mt-12 mb-8">
            {pillars.map((pillar) => (
              <div key={pillar.number} className={`${pillar.bgColor} p-6 rounded-xl border-l-4 ${pillar.borderColor}`}>
                {/* Icon + Title/Subtitle row */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 ${pillar.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <pillar.icon className={`w-6 h-6 ${pillar.accentText}`} />
                  </div>
                  <div>
                    <h3 className={`text-xl md:text-2xl font-poppins font-semibold ${pillar.accentText} leading-tight`}>{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground">{pillar.subtitle}</p>
                  </div>
                </div>

                <p className="text-sm text-foreground leading-relaxed mb-4">
                  {pillar.definition}
                </p>

                <div>
                  <h4 className="text-base md:text-lg font-semibold text-navy mb-2">What We'll Architect:</h4>
                  <ul className="space-y-1.5">
                    {pillar.architect.map((a, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className={`${pillar.accentText} mt-1`}>•</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Framework callout → Phase Zero */}
          <div className="bg-muted/60 border border-navy/10 rounded-xl p-5 md:p-6 mb-8 text-center">
            <p className="text-foreground leading-relaxed">
              These three Pillars are the universal framework Phase Zero
              examines. For the full definitions, the diagnostic questions,
              and what strong footing looks like across each Pillar,{" "}
              <Link
                to="/phase-zero#foundations"
                className="font-semibold text-primary hover:underline"
              >
                see the framework on the Phase Zero page →
              </Link>
            </p>
          </div>
        </div>
      </section>
      {/* SECTION 6: INVESTMENT & ROI */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Build Continual Innovation & Sustainable Transformation
            </h2>
            <p className="text-lg text-foreground max-w-3xl mx-auto mb-6">
              EMBODY partnerships are designed to make change a habit, where you own and lead your continuous evolution versus simply manage your next change project.
            </p>
            <p className="text-foreground mb-2">They are custom-designed based on your organizational scope, transformation ambition, and partnership duration.</p>
            <p className="text-2xl md:text-3xl font-bold text-navy mt-6">
              Typical Investment: $90,000 – $360,000+
            </p>
            <p className="text-muted-foreground">(less than 1% of your annual revenue)</p>
            <p className="text-foreground mt-4">
              This is a strategic investment in permanent organizational capacity, not a project expense.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* What You're Investing In */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-6">What You're Investing In:</h3>
              <ul className="space-y-4">
                {[
                  "Permanent transformation architecture we co-architect with your leadership, Designed for your context, owned by your organization",
                  "Strategic partnership with transformation architects, Deep expertise applied to YOUR context",
                  "Phase Zero foundations, Strategic clarity before resource commitment",
                  "Self-sustaining organizational capacity, Your team learns to architect change independently",
                  "Co-designed transformation infrastructure, Built specifically for your reality, not theory",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-navy font-medium">
                <strong>The outcome:</strong> You build the internal structures and culture to architect and execute sustainable change, where continual transformation becomes yours to lead.
              </p>
            </div>

            {/* The ROI */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-6">The ROI of Strategic Architecture:</h3>
              <p className="text-muted-foreground mb-4">Organizations with transformation architecture:</p>
              <ul className="space-y-4">
                {[
                  { title: "Navigate change without crisis or burnout", desc: "Not because crisis won't happen, but you'll be prepared to address it without panic or setbacks" },
                  { title: "Scale capabilities as fast as they scale operations", desc: "Not because they \"move fast and break things\" but through sustained, structural change standards" },
                  { title: "Make strategic pivots confidently", desc: "Because they're built for adaptation and innovation" },
                  { title: "Retain talent", desc: "Because transformation doesn't break people and is part of their cultural DNA" },
                  { title: "Create competitive advantage", desc: "Because they have the capacity and capability for continual, high-performance change" },
                ].map((item, i) => (
                  <li key={i}>
                    <span className="font-semibold text-navy">{item.title}</span>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-gold font-medium">
                <strong>The ultimate outcome:</strong> Your team becomes transformation architects who no longer need external partnership. This is success, we build you not to need us.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* SECTION 6.5: WHAT'S INCLUDED IN EVERY ENGAGEMENT */}
      <PartnerIncludedSection />
      {/* SECTION 7: BLUE DOOR */}
      <section className="py-16 md:py-20 bg-bluedoor text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Strategic Clarity Before Partnership Commitment
          </h2>
          <p className="text-lg text-white/90 mb-6 max-w-3xl mx-auto">
            You can't architect transformation on assumptions. Our <strong>Blue Door</strong> assesses your organizational capacity across the Painted Porch Pillars, determines partnership fit, and provides the strategic foundation for designing your next Epic Sh<span className="text-raspberry font-bold">IF</span>t.
          </p>
          <p className="text-xl font-semibold text-gold mb-8">
            Investment is fully credited toward EMBODY partnership
          </p>
          <div className="flex justify-center">
            <Link to="/blue-door">
              <Button className="bg-white border-2 border-white text-bluedoor hover:bg-transparent hover:text-white text-lg py-6 px-8 transition-colors">
                Learn more about the Blue Door
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* SECTION 8: TRUST SIGNALS */}
      <ClientLogoMarquee />
      {/* SECTION 9: CONTINUAL TRANSFORMATION / FINAL INVITATION */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
              "Continual Transformation Is Now Ours to Lead."
            </h2>
            <p className="text-lg text-foreground mb-4">
              <strong className="text-navy">That's the <span className="text-navy">EMBODY</span> outcome.</strong> But not every organization is ready for it yet.
            </p>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Some need to start with IGNITE (individual capacity). Some need AMPLIFY first (team alignment). Some need to build organizational readiness before deep partnership makes sense.
            </p>
            <p className="text-gold font-semibold mb-8">And that's completely okay.</p>
            
            <p className="text-foreground mb-4">But if you're a C-suite executive who understands:</p>
            <ul className="inline-block text-left mb-8">
              {[
                "Transformation happens through people, not to them",
                "You need strategic partners to co-architect, not consultants to implement change for you",
                "Your organization is asking: \"Can we even do what we're planning?\"",
                "You're ready for permanent capability built into your DNA",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-xl font-semibold text-gold">
              Then let's explore whether EMBODY partnership makes sense.
            </p>
          </div>

          {/* P.A.T.H.way Steps */}
          <div className="mb-12">
            <h3 className="text-xl md:text-2xl font-poppins font-semibold text-center text-navy mb-8">
              Your P.A.T.H.way to EMBODY Lasting Transformation:
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {pathwaySteps.map((step) => (
                <div key={step.step} className="bg-white p-6 rounded-xl text-center">
                  <div className="w-10 h-10 rounded-full bg-gold text-white font-bold flex items-center justify-center mx-auto mb-3">
                    {step.step}
                  </div>
                  <h4 className="text-base md:text-lg font-semibold text-navy mb-2">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Side-by-Side CTA Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-bluedoor/10 p-8 rounded-xl border border-bluedoor/30">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-bluedoor mb-4">
                Open the Blue Door
              </h3>
              <p className="text-foreground mb-6">
                Our <strong className="text-bluedoor">Blue Door Organizational Appraisal</strong> provides the diagnostic foundation for EMBODY partnership fit. Complete the appraisal, receive your strategic report, then we'll schedule a partnership exploration conversation.
              </p>
              <Button asChild className="bg-bluedoor border-2 border-bluedoor text-white font-semibold w-full py-6 hover:bg-transparent hover:text-bluedoor transition-colors">
                  <Link to="/blue-door">Open the Blue Door</Link>
                </Button>
            </div>
            <div className="bg-white p-8 rounded-xl border border-border">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-4">
                Questions About EMBODY Partnership?
              </h3>
              <p className="text-foreground mb-6">
                Complete our partnership inquiry form with your organizational context and questions. We'll review and connect with resources and next steps.
              </p>
              <Button asChild className="bg-transparent border-2 border-navy text-navy hover:bg-navy hover:text-white w-full py-6 transition-colors">
                  <Link to="/contact?scope=organization&interest=strategic-partnership&message=I'm interested in an EMBODY strategic partnership.">Contact Us About Partnership</Link>
                </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10: FAQ */}
      <FAQSection 
        tierName="EMBODY"
        faqs={faqs}
        subheadline="Everything you need to know about EMBODY partnerships"
      />

      {/* SECTION 10.5: EXPLORE BEFORE YOU COMMIT */}
      <ExploreBeforeCommitSection />

      {/* SECTION 10.75: THE HUMAN COST, why EMBODY's depth is the answer */}
      <section className="py-16 md:py-24 bg-white" aria-labelledby="human-cost-heading">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <span className="inline-block bg-raspberry/10 text-raspberry font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
              The Human Cost
            </span>
            <h2 id="human-cost-heading" className="text-3xl md:text-4xl font-bold text-navy mb-4 scroll-mt-24">
              This is what unarchitected change does to people.
            </h2>
            <p className="text-lg text-foreground leading-relaxed">
              EMBODY isn&rsquo;t a longer engagement because we like longer
              engagements. It&rsquo;s a longer engagement because the numbers
              below don&rsquo;t move with a workshop, a slide deck, or a
              two-quarter sprint. They move when the architecture itself
              changes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <StatCard
              statId="gallup_engagement"
              accentClass="text-raspberry"
              footnoteNumber={1}
            />
            <StatCard
              statId="mck_health_burnout"
              accentClass="text-gold"
              footnoteNumber={2}
            />
            <StatCard
              statId="deloitte_exhausted"
              accentClass="text-pps-purple"
              footnoteNumber={3}
            />
          </div>

          <div className="mt-10 max-w-3xl mx-auto bg-muted/50 border-l-4 border-gold p-6 rounded-r-xl">
            <p className="text-foreground italic leading-relaxed">
              EMBODY exists so this stops happening on your watch. Permanent
              capacity, built into your organization, so transformation becomes
              something your people lead instead of something done to them.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border/60 max-w-3xl mx-auto">
            <p className="text-xs font-poppins font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Sources
            </p>
            <StatSources
              statIds={["gallup_engagement", "mck_health_burnout", "deloitte_exhausted"]}
            />
          </div>
        </div>
      </section>



      {/* SECTION 11: SHIFT HAPPENS CLOSING */}
      <section className="relative py-16 md:py-20 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img src={embodyFinalCtaBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-navy/60" />
        </div>
        <div className="container max-w-3xl mx-auto px-6 text-center relative z-10">
            <p className="text-2xl font-bold text-gold mb-6">
              Sh<span className="text-raspberry">IF</span>t happens. Will you architect it, or react to it?
            </p>
            <p className="text-white/90 mb-4">
              You understand <strong className="text-white">transformation happens through people, not to them</strong>. That brilliant strategy fails without organizational capacity. That you can't architect on top of assumptions.
            </p>
            <p className="text-white/90 mb-4">
              <strong className="text-gold">You're the expert</strong> of your organizational context, your culture, your constraints.
              <br />
              <strong className="text-gold">We're experts</strong> in transformation architecture and Phase Zero design.
            </p>
            <p className="text-white/90 mb-6">
              <strong className="text-white">Together,</strong> we build what works in YOUR reality, permanent capacity where <strong className="text-gold">continual transformation becomes yours to lead</strong>.
            </p>
            <p className="text-xl font-semibold text-gold">
              This is your invitation to co-architect what comes next.
            </p>
        </div>
      </section>
    </div>
  );
}
