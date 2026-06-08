import { Link } from "react-router-dom";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Building2,
  Cpu,
  HeartPulse,
  HandHeart,
  ArrowRight,
  Download,
  Info,
  Users,
  Briefcase,
  Sparkles,
} from "lucide-react";
import embodyHero from "@/assets/embody-concept-blueprint.jpg";
import { TIERS } from "@/components/pps/TierBadge";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import { FAQSection } from "@/components/pps/FAQSection";
import { ParallaxCTA } from "@/components/pps/ParallaxCTA";
import { BLUE_DOOR_PRICE_DISPLAY } from "@/config/blueDoor";
import embodyFinalCtaBg from "@/assets/embody-final-cta-bg.png";

/**
 * EMBODY tier page — refactored per wireframe v2
 * (.lovable/wireframes/embody-and-sprints-revised.md)
 *
 * Why this is shorter: shared content (P.A.T.H. recap, Pillars deep-dive, full
 * ROI section, partnership model band, hero stats, vs.-traditional-consulting
 * detail) now lives on /approach, /phase-zero, /partner, or moves into the
 * Pillars White Paper (coming soon). EMBODY's one job is to help the right
 * C-suite ask: "is this the right depth of partnership for us?"
 */

const audienceCards = [
  {
    icon: Briefcase,
    title: "C-suites leading a defining shIFt",
    body: "You're authoring the change, not reacting to a competitor's. You want partners at the strategic table, not vendors at the side table.",
  },
  {
    icon: Users,
    title: "Boards backing long-arc transformation",
    body: "You're funding the architecture, not a project. You measure success in the decade after go-live, not the quarter before it.",
  },
  {
    icon: Sparkles,
    title: "Founders past product-market fit",
    body: "You're moving into market-leader fit. The structures that got you here won't carry the company you intend to become.",
  },
];

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

const embodyIncludes = [
  {
    title: "Embedded executive advisory",
    body: "Monthly strategic sessions with your senior team, plus on-demand access between sessions. We sit at your table, not across from it.",
  },
  {
    title: "Architecture co-design across the Pillars",
    body: "Cultural Cornerstone, Operational Frame, and Living Ecosystem worked simultaneously, not sequentially, so capability compounds.",
  },
  {
    title: "Phase Zero stewardship through every major shIFt",
    body: "Every initiative gets architected before it gets launched. You stop reacting to change and start authoring it.",
  },
];

const traditionalVsEmbody = [
  {
    traditional: "Hands you a deck, a workbook, and a project plan.",
    embody: "Stays at the table for 6+ months.",
  },
  {
    traditional: "Sells a methodology.",
    embody: "Co-designs the architecture of sustained change.",
  },
  {
    traditional: "Executes for the near-term need.",
    embody: "Builds capacity that outlasts the engagement.",
  },
  {
    traditional: "\"Gets you through\" the change.",
    embody: "Change is now your habit on repeat.",
  },
];

const embodyVsAmplify = [
  {
    dimension: "Depth",
    amplify: "Focused 90-day Phase Zero engagement",
    embody: "Embedded 6–12+ month advisory partnership",
  },
  {
    dimension: "Scope",
    amplify: "Architects the front-end of one shIFt",
    embody: "Stewards the architecture across many shIFts",
  },
  {
    dimension: "Cadence",
    amplify: "Sprint sessions, fixed timeline",
    embody: "Recurring strategic sessions + on-demand access",
  },
  {
    dimension: "Outcome",
    amplify: "Blueprint + launch-ready roadmap",
    embody: "Permanent capacity your team owns",
  },
];

const faqs = [
  {
    question: "How is EMBODY different from traditional consulting?",
    answer:
      "Traditional consultants hand you a best-practice playbook. EMBODY is a true partnership. You're the expert on your organization. We're experts in the architecture that makes shIFt stick. Together we co-design what your organization is built to lead, then build the structural capacity to sustain it. You leave with permanent capability.",
  },
  {
    question: "How is EMBODY different from change management?",
    answer:
      "Change management starts after the direction is set. EMBODY is change origination. We partner upstream, at the strategic authorship moment, to architect the shIFt you intend to lead before a single tool gets launched.",
  },
  {
    question: "Why does EMBODY start with the Blue Door?",
    answer:
      "The Blue Door is how we (and you) see the three Painted Porch Pillars clearly. Without that reading, any partnership is a guess. With it, we co-design an EMBODY engagement that fits your actual architecture, not a template. Your investment is fully credited toward the engagement.",
  },
  {
    question: "What if the Blue Door shows we're not ready for EMBODY yet?",
    answer:
      "That's one of the most valuable things it can surface. Your results will include a Reinforcement Path that maps what needs strengthening first, often through AMPLIFY sprints or IGNITE work. We'd rather point you to the right starting line than sell you an engagement your organization can't yet carry.",
  },
  {
    question: "Can we start with AMPLIFY or IGNITE and grow into EMBODY?",
    answer:
      "Yes, and many partners do exactly that. IGNITE builds individual capacity. AMPLIFY builds team and sprint-level momentum. EMBODY is the embedded, organization-wide partnership for leaders ready to architect transformation at the structural level.",
  },
  {
    question: "What does an EMBODY partnership actually look like week to week?",
    answer:
      "Typically bi-weekly or monthly strategic sessions with senior leadership, plus office hours access in between. We move through the full P.A.T.H.: Prepare, Align, Take Off, and Habit. The exact cadence is co-designed with you.",
  },
  {
    question: "What outcomes can we expect from EMBODY?",
    answer:
      "Three things: a clearly authored direction for the shIFt you intend to lead, an organizational architecture built to sustain it across the three Painted Porch Pillars, and the internal capacity to originate the next shIFt without us.",
  },
];

export default function EmbodyPathAlt() {
  useDocumentSeo({
    title: "EMBODY | Embedded C-Suite Partnership | Painted Porch",
    description:
      "EMBODY is a 6–12+ month embedded advisory partnership for C-suites architecting transformation they intend to lead. Built to last, not to get through.",
    ogImage: embodyHero,
  });

  return (
    <div>
      {/* HERO */}
      <TierHeroSection
        tier={TIERS.EMBODY}
        badgeLabel="EMBODY™ P.A.T.H.way"
        headline={<>Architect Epic Sh<span className="text-white">IF</span>t That Lasts.</>}
        description="EMBODY is for founders and leaders ready to build permanent organizational capacity through deep, sustained partnership. This isn't consulting or change management. This is co-architecting an unshakeable foundation for sustainable transformation."
        ctas={[
          {
            label: "Explore EMBODY",
            href: "#who-embody-is-for",
            isPrimary: true,
            isAnchor: true,
          },
          {
            label: "Open the Blue Door",
            href: "/blue-door",
            buttonClassName:
              "bg-transparent border-2 border-white text-white hover:bg-white hover:text-navy",
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

      {/* WHO EMBODY IS FOR */}
      <section id="who-embody-is-for" className="py-16 md:py-24 bg-white scroll-mt-24">
        <div className="container max-w-6xl mx-auto px-6">
          {/* Stage-setter */}
          <div className="text-center mb-10 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">
              It's time to sh<span className="text-navy">IF</span>t from change moments to an innovation movement.
            </h2>
            <p className="text-lg text-foreground leading-relaxed">
              You've made the decision: you're ready for your organization to move from managing change initiatives to leading sustainable transformation. Not consultants to fix or implement change for you. Strategic partners to co-architect permanent capability in your people, your processes, and your systems.
            </p>
          </div>

          {/* The EMBODY outcome */}
          <div className="max-w-4xl mx-auto bg-lime/10 border-l-4 border-lime p-6 rounded-r-xl mb-14">
            <h3 className="text-lg md:text-xl font-poppins font-semibold text-navy mb-2">
              The <span className="text-lime">EMBODY</span> outcome you're seeking:
            </h3>
            <p className="text-lg text-foreground italic mb-2">
              We've built the internal structures and culture to architect and execute sustainable change. Continual transformation is now ours to lead.
            </p>
            <p className="text-sm text-foreground">
              Transformation becomes self-sustaining and repeatable. Your organization develops permanent capacity and practices that outlast any single initiative.
            </p>
          </div>

          <div className="text-center mb-12 max-w-3xl mx-auto">
            <p className="text-sm font-poppins font-semibold tracking-widest text-bluedoor uppercase mb-3">
              Who EMBODY is for
            </p>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">
              For leaders who want to build something that lasts, not something to get through.
            </h2>
            <p className="text-base text-foreground">
              EMBODY isn't a longer engagement because we like longer engagements. It's longer because the structural change you're after doesn't move with a workshop, a deck, or a two-quarter sprint.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {audienceCards.map((card, idx) => {
              const Icon = card.icon;
              const accents = [
                { bg: "bg-teal/15", text: "text-teal" },
                { bg: "bg-raspberry/15", text: "text-raspberry" },
                { bg: "bg-purple/15", text: "text-purple" },
              ];
              const accent = accents[idx % accents.length];
              return (
                <div key={card.title} className="bg-muted/40 p-6 rounded-xl border border-border border-t-4 border-t-navy">
                  <div className={`w-12 h-12 rounded-lg ${accent.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${accent.text}`} aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-poppins font-semibold text-navy mb-2">{card.title}</h3>
                  <p className="text-sm text-foreground">{card.body}</p>
                </div>
              );
            })}
          </div>

          {/* Pull-quote */}
          <div className="max-w-3xl mx-auto bg-muted/40 border-l-4 border-raspberry p-6 rounded-r-xl">
            <p className="text-lg md:text-xl font-poppins italic text-navy leading-relaxed">
              The cost of staying the same is rarely on the balance sheet. It shows up in the people who leave, the decisions that stall, and the sh<span className="text-raspberry font-semibold italic">IF</span>ts you watched competitors lead.
            </p>
          </div>
        </div>
      </section>


      {/* INDUSTRIES */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">
              Industries we partner with
            </h2>
            <p className="text-base text-foreground">
              Not limited by industry. Defined by C-suite commitment and a partnership mindset.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry, idx) => {
              const accents = ["text-teal", "text-lime", "text-raspberry", "text-purple"];
              const accent = accents[idx % accents.length];
              return (
                <div key={industry.title} className="bg-white p-6 rounded-xl border-t-2 border-navy/80">
                  <div className="flex items-center gap-3 mb-3">
                    <industry.icon className={`w-8 h-8 ${accent} shrink-0`} />
                    <h3 className="text-base font-poppins font-semibold text-navy leading-tight">
                      {industry.title}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {industry.items.map((item) => (
                      <li key={item} className="text-sm text-foreground flex items-start gap-2">
                        <span className={`${accent} mt-1`}>•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHAT EMBODY INCLUDES */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">
              What EMBODY looks like
            </h2>
            <p className="text-base text-foreground">
              Custom-designed to your context. Always anchored by these three.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {embodyIncludes.map((item, i) => {
              const accents = [
                { border: "border-teal", text: "text-teal" },
                { border: "border-raspberry", text: "text-raspberry" },
                { border: "border-purple", text: "text-purple" },
              ];
              const accent = accents[i % accents.length];
              return (
                <div key={item.title} className={`bg-muted/40 p-6 rounded-xl border-t-4 ${accent.border}`}>
                  <p className={`text-xs font-poppins font-semibold tracking-widest ${accent.text} uppercase mb-2`}>
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-xl font-poppins font-semibold text-navy mb-2">{item.title}</h3>
                  <p className="text-sm text-foreground">{item.body}</p>
                </div>
              );
            })}
          </div>
          <div className="max-w-3xl mx-auto text-center bg-muted/40 rounded-xl p-6">
            <p className="text-sm text-foreground mb-4">
              Built on the{" "}
              <Link to="/phase-zero#pillars" className="font-semibold text-primary hover:underline">
                Painted Porch Pillars
              </Link>{" "}
              and our <Link to="/about/approach#path" className="font-semibold text-primary hover:underline">P.A.T.H.</Link> framework. See{" "}
              <Link to="/about/approach" className="font-semibold text-primary hover:underline">
                Our Approach
              </Link>{" "}
              for the full model, or download the white paper for the deep architecture.
            </p>
            <Button
              variant="outline"
              disabled
              aria-disabled="true"
              className="border-navy/30 text-navy/60 cursor-not-allowed"
              title="The white paper is being refined."
            >
              <Download className="mr-2 w-4 h-4" /> <span>The Architecture of Organizational Sh<span className="text-navy font-semibold">IF</span>t (Coming Soon)</span>
            </Button>
          </div>

        </div>
      </section>

      {/* INVESTMENT */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="bg-white p-8 md:p-10 rounded-xl shadow-sm">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-3">
                Investment
              </h2>
              <p className="text-2xl md:text-3xl font-poppins font-bold text-navy mb-2">
                $90,000 – $360,000+
              </p>
              <p className="text-sm text-muted-foreground">
                Typically less than 1% of annual revenue. A strategic investment in permanent capacity, not a project line item.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-lime/10 p-6 rounded-lg border-l-4 border-lime">
                <h3 className="text-base font-poppins font-semibold text-navy mb-3">
                  What you walk away embodying
                </h3>
                <ul className="space-y-2">
                  {[
                    "A team that prepares and leads change faster than the market shifts",
                    "One strategic plan and direction instead of fragmented vendor projects to manage",
                    "Permanent internal capacity to architect change without us",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="w-4 h-4 text-lime flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-bluedoor/5 border border-bluedoor/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-bluedoor" />
                  <h3 className="text-base font-poppins font-semibold text-navy">
                    Prerequisite: The <span className="text-bluedoor">Blue Door</span>
                  </h3>
                </div>
                <p className="text-sm text-foreground mb-3">
                  Required before any EMBODY engagement. Your investment is fully credited toward the partnership.
                </p>
                <div className="flex items-center gap-3 text-sm mb-4">
                  <span className="font-semibold text-navy">{BLUE_DOOR_PRICE_DISPLAY}</span>
                  <span className="text-foreground/70">·</span>
                  <span className="text-foreground/70">Under 30 minutes</span>
                </div>
                <Link to="/blue-door">
                  <Button
                    variant="outline"
                    className="bg-transparent border-2 border-bluedoor text-bluedoor hover:bg-bluedoor hover:text-white transition-colors w-full"
                  >
                    Open the Blue Door <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="text-center">
              <Link to="/contact?scope=organization&interest=strategic-partnership&message=I'm interested in an EMBODY strategic partnership.">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                  Contact Us About a Partnership <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* THIS ISN'T A TRADITIONAL ENGAGEMENT */}
      <section className="py-16 md:py-24 bg-navy text-white">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-poppins font-semibold tracking-widest text-gold uppercase mb-3">
              Different by design
            </p>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4">
              This isn't a traditional implementation engagement.
            </h2>
            <p className="text-base text-white/85 max-w-2xl mx-auto">
              Typical consultancies execute for the deliverable. EMBODY is an embedded advisory partnership that optimizes for what your organization is still doing five years after we're gone.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-white/15 rounded-xl overflow-hidden border border-white/15">
            <div className="bg-navy p-6">
              <p className="text-xs font-poppins font-semibold tracking-widest text-white/70 uppercase mb-4">
                Traditional implementation consultancy
              </p>
              <ul className="space-y-3">
                {traditionalVsEmbody.map((row) => (
                  <li key={row.traditional} className="text-sm text-white/85">
                    {row.traditional}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-teal p-6">
              <p className="text-xs font-poppins font-semibold tracking-widest text-white uppercase mb-4">
                EMBODY embedded partnership
              </p>
              <ul className="space-y-3">
                {traditionalVsEmbody.map((row) => (
                  <li key={row.embody} className="text-sm text-white font-medium">
                    {row.embody}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* EMBODY vs AMPLIFY */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">
              EMBODY or AMPLIFY?
            </h2>
            <p className="text-base text-foreground max-w-2xl mx-auto">
              Not every leader needs an embedded partnership. Many start with a 90-day AMPLIFY Strategic Sprint and grow from there.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-navy">
                  <th className="py-3 px-4 font-poppins font-semibold text-navy">Dimension</th>
                  <th className="py-3 px-4 font-poppins font-semibold text-primary">AMPLIFY Sprint</th>
                  <th className="py-3 px-4 font-poppins font-semibold text-teal">EMBODY Partnership</th>
                </tr>
              </thead>
              <tbody>
                {embodyVsAmplify.map((row) => (
                  <tr key={row.dimension} className="border-b border-border/60">
                    <td className="py-3 px-4 font-semibold text-navy text-sm">{row.dimension}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{row.amplify}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{row.embody}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-8">
            <Link
              to="/partner/amplify/sprints"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              See Strategic Sprints <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection
        tierName="EMBODY"
        faqs={faqs}
        subheadline="Common questions about EMBODY partnerships"
      />

      {/* PARALLAX CTA */}
      <ParallaxCTA
        backgroundImage={embodyFinalCtaBg}
        overlayTone="purple"
        eyebrow="Built to last"
        headline={
          <>
            Ready to architect what's next?
          </>
        }
        description="Open the Blue Door, then let's see whether an embedded partnership is the right fit."
        actions={[
          { label: "Open the Blue Door", to: "/blue-door", variant: "bluedoor" },
          {
            label: "Contact Us",
            to: "/contact?scope=organization&interest=strategic-partnership",
            variant: "secondary",
          },
        ]}
      />
    </div>
  );
}
