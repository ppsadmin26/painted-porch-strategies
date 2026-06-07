import { Link } from "react-router-dom";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Users, User, Landmark, Link2, AlertTriangle, Radio, Crosshair } from "lucide-react";
import amplifyHeroImage from "@/assets/amplify-hero-lightbulb-v3.jpg";
import amplifyFinalCtaBg from "@/assets/amplify-final-cta-bg.jpg";
import { TierBadge, TIERS } from "@/components/pps/TierBadge";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import { FAQSection, type FAQItem } from "@/components/pps/FAQSection";
import { PartnerIncludedSection, ExploreBeforeCommitSection } from "@/components/pps/partner";

import ClientLogoMarquee from "@/components/pps/ClientLogoMarquee";

// Team Signals
const teamSignals = [
  {
    title: "Misalignment",
    description: "Your team is talented individually, but not aligned strategically. Everyone's moving in slightly different directions.",
  },
  {
    title: "Surface-Level Change",
    description: "You've tried transformation initiatives that resulted in \"checkbox change\", compliance without shared commitment, activity without lasting adoption.",
  },
  {
    title: "Reactive Mode",
    description: "Your team is constantly firefighting. Strategic thinking gets crowded out by tactical urgency.",
  },
  {
    title: "Individual Capacity, Team Gaps",
    description: "Individuals and leaders are capable, but team dynamics undermine transformation. Silos, conflict, and unclear accountability limit progress.",
  },
];

// Individual Leader Signals
const leaderSignals = [
  {
    title: "Seeking Depth",
    description: "You've completed foundational programs (like IGNITE) and want more advanced development alongside peers who are equally committed to growth.",
  },
  {
    title: "Craving Community",
    description: "You want to learn with other executives who understand your challenges, creating accountability, shared wisdom, and lasting professional relationships.",
  },
  {
    title: "Need for Structure",
    description: "You're ready for structured, guided development that goes beyond self-study or isolated learning.",
  },
  {
    title: "Transformation Mindset",
    description: "You want to become a transformation architect, someone who can design and lead change with confidence, not just react to it.",
  },
];

// Three AMPLIFY Formats
const amplifyFormats = [
  {
    title: "Align Your\nTeam",
    audience: "Organizations & Teams",
    format: "Half-day to multi-day intensive strategic & leadership workshops",
    icon: Users,
    color: "border-gold",
    bgColor: "bg-gold/10",
    perfectFor: [
      "Seeking leadership team alignment",
      "Planning strategic kickoff for transformation",
      "Pursuing rapid team development",
      "Targeting focused skill-building",
    ],
    topics: [
      "Architect Change: Phase Zero™ Strategic Design",
      "P.A.T.H. Framework Application",
      "Painted Porch Pillars Assessment",
      "Change Resilience Navigation",
      "Leadership Operating Model Design",
    ],
    timeline: "Half-day to multi-day workshops",
    investment: "Starting at $5,000",
    cta: "Explore Workshops",
    ctaLink: "/partner/amplify/workshops",
  },
  {
    title: "Activate Transformation",
    audience: "Organizations & Teams",
    format: "Focused 90-day partnerships",
    icon: Crosshair,
    color: "border-lime",
    bgColor: "bg-lime/10",
    perfectFor: [
      "Experiencing a specific transformation challenge",
      "Planning pre-implementation Phase Zero design",
      "Preparing strategic planning for major change",
      "Building alignment before launch",
    ],
    timeline: "90 days (focused engagement)",
    investment: "Starting at $36,000",
    cta: "Explore Strategic Sprints",
    ctaLink: "/partner/amplify/sprints",
  },
  {
    title: "Accelerate Your Leadership",
    audience: "Individual Leaders",
    format: "Peer learning with other leaders",
    icon: User,
    color: "border-teal",
    bgColor: "bg-teal/10",
    perfectFor: [
      "Wanting peer wisdom",
      "Exploring Phase Zero with accountability",
      "Building network of transformation architects",
      "Deepening strategic capacity over time",
    ],
    timeline: "6-12 weeks (cohort-based)",
    investment: "Starts at $2,000 per participant",
    cta: "Explore Leader Labs",
    ctaLink: "/partner/amplify/labs",
  },
];

// Data arrays for workshops, sprints, and labs moved to dedicated subpages

// FAQ Items
const faqItems = [
  {
    question: "How is AMPLIFY different from IGNITE?",
    answer: "IGNITE is self-paced individual development. AMPLIFY is team-based learning (workshops, sprints, cohorts). IGNITE builds your capacity. AMPLIFY builds team or organizational capacity.",
  },
  {
    question: "What's the format for Leadership Labs?",
    answer: "Leadership Labs are 6-12 week cohort-style programs with bi-weekly or monthly sessions, peer accountability, and individual coaching touchpoints. Each lab focuses on a specific theme (Stractical Leadership, Leading Change, etc.) and is capped at 25 leaders from different organizations.",
  },
  {
    question: "How do I know if a Leadership Lab is right for me?",
    answer: "Leadership Labs are designed for individual leaders ready to deepen their transformation capacity through peer learning, whether you're developing yourself before bringing concepts to your team or investing in your own leadership independent of organizational initiatives.",
  },
  {
    question: "Can I join a Leadership Lab if I'm also bringing my team to a workshop?",
    answer: "Absolutely. Many leaders participate in labs for their own development while separately engaging their teams in workshops or sprints. Leadership Labs focus on individual leadership capacity; workshops/sprints focus on team alignment.",
  },
  {
    question: "Do we need the Blue Door Organizational Appraisal before AMPLIFY?",
    answer: "Not required for leadership labs. Required for Strategic Sprints and multi-day workshops. Highly recommended (but not required) for single-day workshops. Our Blue Door Organizational Appraisal provides the diagnostic foundation for workshop focus and sprint partnerships.",
  },
  {
    question: "Can we do a workshop first, then decide on Strategic Sprint?",
    answer: "Absolutely. Many teams start with a workshop to test fit, then progress to sprint if deeper partnership makes sense.",
  },
  {
    question: "What if our team is geographically distributed?",
    answer: "We facilitate virtual workshops and sprints effectively. In-person is ideal when possible, but not required.",
  },
  {
    question: "What's included in the investment?",
    answer: "Pre-work, facilitation, frameworks/tools, post-workshop resources, and ongoing advisory sessions for questions and continued guidance.",
  },
];

// ROI Lists
const costOfSkipping = [
  "Transformation initiative fumbles (delays), fizzles (descoped), or failures (Over 70% - industry research)",
  "Millions invested in technology that isn't fully adopted or ROI realized",
  "Leadership teams misaligned, working in different directions",
  "Employee burnout and turnover from constant change without clarity",
  "Change theater, activity without real transformation",
];

const whatAmplifyEliminates = [
  "Failed initiatives due to lack of Phase Zero preparation",
  "Misalignment that undermines transformation",
  "Resistance from being changed vs. authoring change",
  "Wasted investment in tactical solutions to strategic problems",
  "Leadership team dysfunction during transformation",
];

const whatAmplifyEnables = [
  "Strategic alignment that accelerates transformation",
  "Shared language that eliminates confusion",
  "Phase Zero architecture that makes change sustainable",
  "Team capacity that outlasts any single initiative",
  "Transformation that compounds instead of exhausting",
];

export default function AmplifyPathAlt() {
  useDocumentSeo({
    title: "AMPLIFY P.A.T.H.way | 90-Day Sprints | Painted Porch Strategies",
    description: "Boost momentum that aligns, activates, and accelerates your team's next shIFt. AMPLIFY pairs Phase Zero work with focused 90-day partnership sprints.",
    ogImage: amplifyHeroImage,
  });
  return (
    <div>
      {/* SECTION 1: HERO */}
      <TierHeroSection
        tier={TIERS.AMPLIFY}
        badgeLabel="AMPLIFY P.A.T.H.way"
        headline={<>Boost Momentum That Aligns, Activates, and Accelerates Your Next Sh<span className="text-[hsl(263,85%,78%)]">IF</span>t.</>}
        subheadline="When you're ready to architect change with clarity and confidence."
        description="AMPLIFY is for leadership teams seeking alignment AND individual leaders pursuing peer learning, creating compound momentum through team workshops, strategic sprints, and leadership labs."
        ctas={[
          {
            label: "Explore AMPLIFY",
            href: "#amplify-formats",
            isAnchor: true,
            isPrimary: true,
          },
          {
            label: "Discover Your P.A.T.H.way",
            href: "/start-here",
            isPrimary: false,
          },
        ]}
        background={{
          type: "video",
          src: amplifyHeroImage,
          poster: amplifyHeroImage,
          slotKey: "amplify-hero",
        }}
        overlayClass="bg-navy/30"
        minHeightClass="min-h-[500px]"
      />

      {/* SECTION 2: WHO AMPLIFY IS FOR */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              You Know What Sh<span className="text-[hsl(263,70%,55%)]">IF</span>t You Want to Make Happen,  Now You Need to Build the Capacity for It.
            </h2>
            <p className="text-lg text-foreground max-w-2xl mx-auto">
              Our AMPLIFY P.A.T.H.way is designed for two audiences, organizations/teams seeking alignment AND individual leaders wanting peer learning.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Teams Column */}
            <div className="bg-gold/5 p-8 rounded-xl border-t-4 border-gold flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-gold" />
                <h3 className="text-xl md:text-2xl font-poppins font-bold text-gold">Organizations & Teams</h3>
              </div>
              <p className="text-sm font-semibold text-strategic mb-4">4 Signals Your Team is Ready for AMPLIFY Workshop or Strategic Sprint:</p>
              <div className="space-y-4">
                {teamSignals.map((signal, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Radio className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-gold">{signal.title}:</span>
                      <span className="text-sm text-foreground ml-1">{signal.description}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-foreground mt-6 italic">
                If any of these resonate, AMPLIFY team workshops or strategic sprints are designed for you.
              </p>
              <div className="mt-auto pt-6">
                <Button asChild className="bg-gold text-white border-2 border-gold hover:bg-white hover:text-gold transition-colors w-full">
                  <Link to="/partner/amplify/workshops" className="block">Explore Team Options</Link>
                </Button>
              </div>
            </div>

            {/* Individual Leaders Column */}
            <div className="bg-teal/5 p-8 rounded-xl border-t-4 border-teal flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-8 h-8 text-teal" />
                <h3 className="text-xl md:text-2xl font-poppins font-bold text-teal">Individual Leaders</h3>
              </div>
              <p className="text-sm font-semibold text-teal mb-4">4 Signals You're Ready for AMPLIFY Leadership Labs:</p>
              <div className="space-y-4">
                {leaderSignals.map((signal, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Radio className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-teal">{signal.title}:</span>
                      <span className="text-sm text-foreground ml-1">{signal.description}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-foreground mt-6 italic">
                If this resonates, AMPLIFY Leadership Labs are designed for you.
              </p>
              <div className="mt-auto pt-6">
                <Button asChild variant="outline" className="border-teal text-teal hover:bg-teal hover:text-white hover:border-teal transition-colors w-full">
                  <Link to="/partner/amplify/labs" className="block">Explore Leader Options</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE AMPLIFY EXPERIENCE - Three Formats */}
      <section id="amplify-formats" className="py-16 md:py-24 bg-muted">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Three Ways to AMPLIFY Your Next Sh<span className="text-[hsl(263,70%,55%)]">IF</span>t
            </h2>
            <p className="text-lg text-foreground max-w-2xl mx-auto">
              Choose a P.A.T.H.way based on whether you're developing or expanding capabilities to sh<span className="text-[hsl(263,70%,55%)] font-bold">IF</span>t for your team/organization or yourself as an individual leader.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {amplifyFormats.map((format, index) => (
              <div key={index} className={`bg-white p-8 rounded-xl border-t-4 ${format.color} flex flex-col`}>
                <format.icon className={`w-10 h-10 mb-4 ${format.color.replace('border-', 'text-')}`} />
                <h3 className={`text-xl md:text-2xl font-poppins font-bold mb-1 whitespace-pre-line ${format.color.replace('border-', 'text-')}`}>
                  {format.title}
                </h3>
                <p className="text-sm font-semibold text-foreground mb-2">For: {format.audience}</p>
                <p className="text-sm text-foreground mb-4">{format.format}</p>

                <p className="text-xs font-semibold text-navy uppercase tracking-wide mb-2">Perfect If You're:</p>
                <ul className="space-y-2 mb-4">
                  {format.perfectFor.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-lime flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>



                <div className="mt-auto">
                  <div className="border-t border-foreground/10 pt-4">
                    <p className="text-xs text-foreground"><span className="font-semibold">Timeline:</span> {format.timeline}</p>
                    <p className="text-xs text-foreground"><span className="font-semibold">Investment:</span> {format.investment}</p>
                  </div>

                  <Button asChild className={`w-full ${format.color.replace('border-', 'bg-')} text-white border-2 ${format.color} hover:bg-white ${format.color.replace('border-', 'hover:text-')} transition-colors`}>
                  <Link to={format.ctaLink} className="block mt-4">{format.cta}</Link>
                </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* SECTION: INVESTMENT & ROI (moved above Which ShIFt) */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-navy">
              The ROI of Phase Zero Architecture
            </h2>
            <p className="text-lg text-foreground max-w-3xl mx-auto">
              When strategic authorship & architecture is intentionally designed, innovation amplifies and sh<span className="text-[hsl(263,70%,55%)] font-bold">IF</span>t happens. AMPLIFY partnerships represent a strategic investment in transformation. Leaders invest because the cost of skipping Phase Zero far exceeds the investment in building it.
            </p>
          </div>

          {/* Side-by-side comparison table */}
          <div className="overflow-x-auto">
            <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy text-center mb-6">
              Quick Comparison: Cost vs. Eliminates vs. Enables
            </h3>
            <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
              <thead>
                <tr>
                  <th className="text-center p-4 font-poppins font-semibold text-gold border-b-2 border-gold/40 bg-gold/10 w-1/3">
                    Cost of Skipping Phase Zero
                  </th>
                  <th className="text-center p-4 font-poppins font-semibold text-raspberry border-b-2 border-raspberry/40 bg-raspberry/10 w-1/3">
                    What AMPLIFY Eliminates
                  </th>
                  <th className="text-center p-4 font-poppins font-semibold text-lime border-b-2 border-lime/40 bg-lime/10 w-1/3">
                    What AMPLIFY Enables
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.max(costOfSkipping.length, whatAmplifyEliminates.length, whatAmplifyEnables.length) }).map((_, i) => (
                  <tr key={i} className="align-top">
                    <td className="p-4 text-sm text-foreground bg-gold/5 border-b border-gold/15">
                      {costOfSkipping[i] ? (
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                          <span>{costOfSkipping[i]}</span>
                        </div>
                      ) : null}
                    </td>
                    <td className="p-4 text-sm text-foreground bg-raspberry/5 border-b border-raspberry/15">
                      {whatAmplifyEliminates[i] ? (
                        <div className="flex items-start gap-2">
                          <span className="text-raspberry font-bold">✗</span>
                          <span>{whatAmplifyEliminates[i]}</span>
                        </div>
                      ) : null}
                    </td>
                    <td className="p-4 text-sm text-foreground bg-lime/5 border-b border-lime/15">
                      {whatAmplifyEnables[i] ? (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-lime flex-shrink-0 mt-0.5" />
                          <span>{whatAmplifyEnables[i]}</span>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-navy mt-12 text-lg italic">
            Strategic architecture isn't optional for transformation that lasts; it's foundational. AMPLIFY provides the partnership to build it properly.
          </p>

          {/* CTA to next step */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact?scope=organization&interest=amplify&message=I'm ready to explore an AMPLIFY partnership.">
              <Button size="lg" className="bg-strategic text-white hover:bg-strategic/90">
                Start Your AMPLIFY Partnership <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/blue-door">
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-2 border-bluedoor text-bluedoor hover:bg-bluedoor hover:text-white transition-colors"
              >
                Begin with The Blue Door
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION: Which ShIFt, Workshop vs. Sprint vs. Leader Lab */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-6">
          <h3 className="text-xl md:text-2xl font-semibold text-navy text-center mb-8">
            Which Sh<span className="text-[hsl(263,70%,55%)]">IF</span>t: Workshop vs. Sprint vs. Leader Lab
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gold/5 p-6 rounded-xl flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-gold flex-shrink-0" />
                <h4 className="text-base md:text-lg font-poppins font-bold text-gold">Choose TEAM WORKSHOP if:</h4>
              </div>
              <ul className="space-y-3 flex-grow">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">You need rapid team alignment (1-3 days)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">You have specific topic to explore intensively</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Your team needs shared language/framework</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">You want to test Phase Zero concepts before deeper commitment</span>
                </li>
              </ul>
              <Button asChild className="w-full bg-gold text-white border-2 border-gold hover:bg-white hover:text-gold transition-colors">
                  <Link to="/partner/amplify/workshops" className="block mt-6">Explore Workshops</Link>
                </Button>
            </div>

            <div className="bg-lime/5 p-6 rounded-xl flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <Crosshair className="w-6 h-6 text-lime flex-shrink-0" />
                <h4 className="text-base md:text-lg font-poppins font-bold text-lime">Choose STRATEGIC SPRINT if:</h4>
              </div>
              <ul className="space-y-3 flex-grow">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-lime flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">You have major transformation ahead (next 6-12 months)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-lime flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">You need Phase Zero architecture before implementation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-lime flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">You want ongoing partnership over 90 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-lime flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Your team needs more than single workshop</span>
                </li>
              </ul>
              <Button asChild className="w-full bg-lime text-white border-2 border-lime hover:bg-white hover:text-lime transition-colors">
                  <Link to="/partner/amplify/sprints" className="block mt-6">Explore Strategic Sprints</Link>
                </Button>
            </div>

            <div className="bg-teal/5 p-6 rounded-xl flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-6 h-6 text-teal flex-shrink-0" />
                <h4 className="text-base md:text-lg font-poppins font-bold text-teal">Choose LEADERSHIP LAB if:</h4>
              </div>
              <ul className="space-y-3 flex-grow">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">You're an individual leader (not bringing your team)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">You want peer learning and accountability</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">You're exploring Phase Zero for yourself first</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">You want structured development over 6-12 weeks</span>
                </li>
              </ul>
              <Button asChild className="w-full bg-teal text-white border-2 border-teal hover:bg-white hover:text-teal transition-colors">
                  <Link to="/partner/amplify/labs" className="block mt-6">Explore Leader Labs</Link>
                </Button>
            </div>
          </div>

          <div className="text-center mt-12 bg-white p-6 rounded-xl">
            <p className="text-lg text-navy font-semibold mb-4">Not Sure?</p>
            <p className="text-foreground mb-6">
              Contact us to discuss which format aligns with your needs, timeline, and transformation ambition.
            </p>
            <Link to="/contact?scope=organization&interest=workshops&message=I'm interested in AMPLIFY workshops for our team.">
              <Button variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white transition-colors">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* BREATHING SECTION: Quote Strip (relocated) */}
      <section className="py-14 md:py-20 bg-gradient-to-br from-strategic via-strategic to-strategic/80">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <blockquote className="text-2xl md:text-3xl font-poppins font-semibold text-white italic leading-relaxed">
            "We cannot solve our problems with the same thinking we used when we created them."
          </blockquote>
          <p className="mt-4 text-white/70 text-sm">Albert Einstein</p>
        </div>
      </section>

      {/* SECTION 9: WHAT HAPPENS AFTER AMPLIFY */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Taking Your Sh<span className="text-[hsl(263,70%,55%)]">IF</span>t to the Next Level
            </h2>
            <p className="text-lg text-foreground max-w-3xl mx-auto">
              Most AMPLIFY partnerships reveal one of two things: your team got what you needed and you're ready to execute, or you realize you need deeper, ongoing partnership. That's exactly what EMBODY is designed for.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amplify/10 flex items-center justify-center">
                  <TIERS.AMPLIFY.icon className="w-5 h-5 text-amplify" />
                </div>
                <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy">Continue in <span className="text-strategic">AMPLIFY</span></h3>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="text-sm text-foreground">• Additional workshops on different topics</li>
                <li className="text-sm text-foreground">• Follow-up sprint after initial implementation</li>
                <li className="text-sm text-foreground">• Join a Leadership Lab for ongoing individual development</li>
                <li className="text-sm text-foreground">• Quarterly or semi-annual strategic leadership/team alignment sessions</li>
              </ul>
              <p className="text-xs text-muted-foreground italic">
                Best for: Teams who want periodic strategic partnership without full EMBODY engagement
              </p>
            </div>

            <div className="bg-navy/10 p-8 rounded-xl border-t-4 border-navy">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-navy/20 flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-navy" />
                </div>
                <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy">Progress to EMBODY</h3>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="text-sm text-foreground">• 6-12+ month embedded partnership</li>
                <li className="text-sm text-foreground">• Executive advisory relationship</li>
                <li className="text-sm text-foreground">• Ongoing Leadership Summits</li>
                <li className="text-sm text-foreground">• Full transformation architecture</li>
              </ul>
              <p className="text-xs text-muted-foreground italic mb-4">
                Best for: Organizations ready for permanent capacity-building with sustained partnership
              </p>
              <Button asChild className="bg-transparent border-2 border-navy text-navy hover:bg-navy hover:text-white w-full transition-colors">
                  <Link to="/partner/embody">Explore EMBODY <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
            </div>

            <div className="bg-white p-8 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy">Maintain Connection</h3>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="text-sm text-foreground">• Join our semi-annual Leadership Summits (open to AMPLIFY alumni)</li>
                <li className="text-sm text-foreground">• Access to tools, frameworks, and resources</li>
                <li className="text-sm text-foreground">• Ongoing community of transformation architects</li>
                <li className="text-sm text-foreground">• Future AMPLIFY engagements as needs emerge</li>
              </ul>
              <p className="text-xs text-muted-foreground italic">
                Best for: Leaders who want ongoing connection without active partnership
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 11: TRUST SIGNALS */}
      <ClientLogoMarquee />

      {/* SECTION 12: FAQ */}
      <FAQSection 
        tierName="AMPLIFY"
        faqs={faqItems}
        subheadline="Everything you need to know about AMPLIFY partnerships"
      />

      {/* SECTION 12.5: NEED SOMETHING CUSTOM + INCLUDED */}
      <PartnerIncludedSection />

      {/* SECTION 12.75: EXPLORE BEFORE YOU COMMIT */}
      <ExploreBeforeCommitSection />

      {/* SECTION 13: FINAL CTA */}
      <section className="py-16 md:py-24 text-white relative">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${amplifyFinalCtaBg})` }} />
        <div className="absolute inset-0 bg-navy/60" />
        <div className="container max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to AMPLIFY Your Next Sh<span className="text-[hsl(263,70%,55%)]">IF</span>t?
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Strategic architecture creates transformation that lasts. Choose your pathway below.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl text-center">
              <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4">For Organizations & Teams</h3>
              <p className="text-white/90 mb-6">Start with strategic clarity.</p>
              <Button asChild className="bg-bluedoor hover:bg-bluedoor/90 text-white w-full mb-4">
                  <Link to="/blue-door">Start Your Organizational Appraisal</Link>
                </Button>
              <p className="text-sm text-white/70">
                Our Blue Door Organizational Appraisal provides the diagnostic foundation for workshop focus and sprint partnerships.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl text-center">
              <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4">For Individual Leaders</h3>
              <p className="text-white/90 mb-6">Have questions about a Leadership Lab?</p>
              <Button asChild className="bg-teal hover:bg-teal/90 text-white w-full mb-4">
                  <Link to="/contact?scope=Yourself&interest=leadership-lab&message=I have questions about Leadership Labs and would like to learn more.">Inquire About Leadership Labs</Link>
                </Button>
              <p className="text-sm text-white/70">
                Submit your inquiry and we will reach out with details about upcoming leadership lab opportunities.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-white/90 mb-4">Have Questions First?</p>
            <Link to="/contact?scope=organization&interest=organizational-advisory&message=I'm interested in AMPLIFY partnership options.">
              <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#00006B] transition-colors">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
