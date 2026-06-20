import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Info, Compass, GitBranch, Columns3, Shield, Settings, Lightbulb, Users, Brain, MessageSquare, Landmark } from "lucide-react";
import architectChangeThumb from "@/assets/workshops/architect-change-thumb.jpg";
import pillarsThumb from "@/assets/workshops/pillars-assessment-thumb.jpg";
import pathThumb from "@/assets/workshops/path-framework-thumb.jpg";
import resilienceThumb from "@/assets/workshops/change-resilience-thumb.jpg";
import leadershipOpThumb from "@/assets/workshops/leadership-operating-thumb.jpg";
import teamBuildingThumb from "@/assets/workshops/team-building-thumb.jpg";
import mindfulnessThumb from "@/assets/workshops/mindfulness-leadership-thumb.jpg";
import communicationThumb from "@/assets/workshops/communication-architecture-thumb.jpg";
import stoicThumb from "@/assets/workshops/stoic-leadership-thumb.jpg";
import { PPSBreadcrumb } from "@/components/pps/PPSBreadcrumb";
import { FAQSection, type FAQCategory } from "@/components/pps/FAQSection";
import { ParallaxCTA } from "@/components/pps/ParallaxCTA";
import { Eyebrow } from "@/components/pps/Eyebrow";
import { usePathFinderQuiz } from "@/components/pps/quiz/PathFinderQuizProvider";
import { BLUE_DOOR_PRICE_DISPLAY } from "@/config/blueDoor";


const workshopFaqCategories: FAQCategory[] = [
  {
    name: "Workshops",
    faqs: [
      {
        question: "Do we need the Blue Door Organizational Appraisal before a workshop?",
        answer: "The Blue Door Organizational Appraisal is required for all Phase Zero Strategic Workshops and Strategic Sprints. It's not required for our Leadership & Team Development Workshops, though many teams still find it valuable for context. Your Blue Door investment is credited toward any booked engagement.",
      },
      {
        question: "Can we do a workshop first, then decide on a Strategic Sprint?",
        answer: "Absolutely. Many teams start with a workshop to test fit, then progress to sprint if deeper partnership makes sense.",
      },
      {
        question: "What if our team is geographically distributed?",
        answer: "We facilitate virtual workshops effectively. In-person is ideal when possible, but not required.",
      },
    ],
  },
  {
    name: "General",
    faqs: [
      {
        question: "How is AMPLIFY different from IGNITE?",
        answer: "IGNITE is self-paced individual development. AMPLIFY is team-based learning (workshops, sprints, cohorts). IGNITE builds your capacity. AMPLIFY builds team or organizational capacity.",
      },
      {
        question: "What's included in the investment?",
        answer: "Pre-work, facilitation, frameworks/tools, post-workshop resources, and ongoing advisory sessions for questions and continued guidance.",
      },
    ],
  },
];

const workshopTopics = [
  {
    id: "architectChange",
    title: "Architect Change: Phase Zero Strategic Design",
    image: architectChangeThumb,
    challenge: "Your team jumps straight to execution without designing what you're building. Projects launch before strategic foundations exist.",
    highlights: [
      "What Phase Zero is and why most teams skip it",
      "How to architect transformation before building it",
      "The cost of skipping strategic preparation",
      "Decision framework for Phase Zero investment",
      "Team alignment on what requires architecture vs. execution",
    ],
    format: "Full to multi-day workshop",
    investment: "Starting at $36,000",
    note: "Prerequisite: Blue Door",
  },
  {
    id: "architectureOfOrganizationalShift",
    title: "The Architecture of Organizational ShIFt",
    image: pillarsThumb,
    challenge: "You're not sure if your organization is built to carry the transformation you're considering. You need a clear-eyed assessment of capacity and an architecture designed to navigate uncertainty rather than react to it.",
    highlights: [
      "The three Painted Porch Pillars (Cultural Cornerstone, Operational Frame, Living Ecosystem) and how they reveal organizational readiness",
      "Gap analysis: where you're strong, where you're vulnerable",
      "How to design systems that navigate uncertainty instead of reacting to it",
      "Roadmap for strengthening vulnerable pillars before transformation begins",
      "Clear decision on whether to proceed, pause, or redesign your initiative",
    ],
    format: "Full to multi-day workshop",
    investment: "Starting at $36,000",
    note: "Prerequisite: Blue Door",
  },
  {
    id: "pathToLastingChange",
    title: "The P.A.T.H. to Navigating Change",
    image: pathThumb,
    challenge: "Your team doesn't have a shared framework for navigating transformation. Everyone approaches change differently.",
    highlights: [
      "The P.A.T.H. framework (Prepare → Align → Take Off → Habits)",
      "Where your team is in the P.A.T.H. right now",
      "Common mistakes at each stage and how to avoid them",
      "Team protocols for using P.A.T.H. going forward",
      "Roadmap for completing Phase Zero preparation",
    ],
    format: "Full-day workshop",
    investment: "Starting at $36,000",
    note: "Prerequisite: Blue Door",
  },
  {
    id: "cultivatingChangeResilience",
    title: "Cultivating Change Resilience",
    image: resilienceThumb,
    challenge: "Your team treats pushback as an obstacle rather than valuable feedback. You're not building organizational capacity to navigate and learn from what people are telling you.",
    highlights: [
      "Why people don't resist change, they resist being changed",
      "How to distinguish between legitimate feedback and fear of the unknown",
      "Navigation strategies for building resilience through feedback",
      "How Phase Zero addresses pushback before it starts",
      "A navigation playbook for building organizational resilience",
    ],
    format: "Half to full-day workshop",
    investment: "Starting at $15,000",
    note: "Prerequisite: Blue Door",
  },
  {
    id: "leadershipOM",
    title: "Leadership OM: A 21st-Century Operating Model for Organizational Evolution",
    image: leadershipOpThumb,
    challenge: "Your leadership team doesn't have clear decision-making protocols, communication rhythms, or accountability structures for transformation.",
    highlights: [
      "How decisions get made (and by whom)",
      "Communication cadences, channels, and escalation protocols",
      "Accountability structures that create follow-through",
      "Exploring each leader's Working Genius and its impact on team dynamics",
      "A documented Leadership OM your team commits to",
    ],
    format: "Full-day workshop",
    investment: "$25,000",
    note: "Prerequisite: Blue Door",
  },
];

export default function AmplifyWorkshops() {
  const { open: openQuiz } = usePathFinderQuiz();
  return (
    <div>
      <PPSBreadcrumb
        segments={[
          { label: "Partner", href: "/partner" },
          { label: "AMPLIFY", href: "/partner/amplify" },
          { label: "Team Workshops" },
        ]}
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <Link
            to="/partner/amplify"
            className="inline-flex items-center gap-2 text-sm text-strategic hover:underline mb-8"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to AMPLIFY Overview
          </Link>

          <div className="text-center mb-12">
            <Eyebrow variant="plain" tone="primary" as="p">AMPLIFY · Team Workshops</Eyebrow>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy mb-4">
              Workshops That Architect Your Next Sh<span className="text-strategic font-bold">IF</span>t
            </h1>
            <p className="text-body text-foreground max-w-2xl mx-auto">
              From Phase Zero strategy sessions to leadership and team development, our workshops align teams and build the capacity to lead change well.
            </p>
          </div>

          {/* Phase Zero Strategic Workshops header */}
          <div className="text-center mb-8">
            <span className="inline-block bg-bluedoor/10 text-bluedoor font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
              Blue Door Required
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-3">
              Phase Zero&trade; Strategic Workshops
            </h2>
            <p className="text-body text-foreground max-w-2xl mx-auto">
              Design the architecture of your next transformation before you build it. These workshops align your leadership team around what you're authoring and why.
            </p>
          </div>

          {/* All Phase Zero workshops */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {workshopTopics.map((workshop, index) => {
              return (
                <div key={index} id={workshop.id} className="rounded-xl flex flex-col overflow-hidden border border-border scroll-mt-24">
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-3">
                      <img
                        src={workshop.image}
                        alt={workshop.title}
                        loading="lazy"
                        className="w-full h-40 sm:w-28 sm:h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div>
                        <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy leading-tight mb-1">{workshop.title}</h3>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="text-foreground font-medium">{workshop.format}</span>
                          <span className="text-foreground">|</span>
                          <span className="text-lime font-semibold">{workshop.investment}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4 bg-raspberry/5 border border-raspberry/20 rounded-lg p-4">
                      <p className="text-body -sm font-semibold text-raspberry mb-1">The Challenge:</p>
                      <p className="text-body -sm text-foreground">{workshop.challenge}</p>
                    </div>
                    <div className="flex-grow">
                      <p className="text-body -sm font-semibold text-navy mb-2">What You'll Walk Away With:</p>
                      <ul className="space-y-1">
                        {workshop.highlights.map((item, i) => (
                          <li key={i} className="text-body flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-lime flex-shrink-0 mt-1" />
                            <span className="text-xs text-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Blue Door Callout */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 md:pr-12 flex flex-col md:flex-row items-start md:items-center gap-6 mb-12">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-bluedoor" />
                <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy">Authoring Your Next Sh<span className="text-strategic font-bold">IF</span>t Begins At the <span className="text-bluedoor">Blue Door</span></h3>
              </div>
              <p className="text-body -sm text-foreground mb-2 mt-4">
                The <span className="font-bold text-bluedoor">Blue Door</span> is our organizational appraisal (less than 30 minutes) that reveals where your business and leadership stands on the path to transformation so that you can lead with clarity and build with confidence.
              </p>
              <p className="text-body -sm text-foreground/70 italic mb-3">
                Required for Phase Zero Strategic Workshops and all Strategic Sprints. Not required for Leadership &amp; Team Development Workshops.
              </p>
              <p className="text-body -sm text-foreground/70 italic mb-3">
                The Blue Door investment will be credited toward any booked engagement.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold text-navy">{BLUE_DOOR_PRICE_DISPLAY}</span>
                <span className="text-foreground/70">|</span>
                <span className="text-foreground/70">Less than 30 minutes</span>
              </div>
            </div>
            <Link to="/blue-door">
              <Button variant="outline" className="bg-transparent border-2 border-bluedoor text-bluedoor hover:bg-bluedoor hover:text-white transition-colors">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Leadership & Team Development Workshops */}
          <div id="leadership-team-development" className="mb-12 scroll-mt-24">
            <div className="text-center mb-8">
              <span className="inline-block bg-gold/10 text-gold font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
                Ready to Book
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-3">
                Leadership & Team Development Workshops
              </h2>
              <p className="text-body text-foreground max-w-2xl mx-auto">
                Build the capacity your organization needs to lead and adapt to change. These workshops strengthen the foundational skills that make transformation possible and the extraordinary achievable.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  id: "createExtraordinaryTeams",
                  icon: Users,
                  title: "Create Extraordinary Teams",
                  image: teamBuildingThumb,
                  description: "Why most team-building fails, and what high-performing teams actually do differently. Move beyond trust falls to build teams that collaborate, challenge, and create together.",
                  duration: "Half-day to full-day",
                  investment: "Starting at $7,500",
                  outcomes: [
                    "Identify team dynamics that accelerate (or block) performance",
                    "Build shared language for healthy conflict and collaboration",
                    "Create team operating agreements with accountability",
                    "Strengthen trust through vulnerability and shared purpose",
                  ],
                },
                {
                  id: "radicalMindfulnessB2B",
                  icon: Brain,
                  title: "Radically Mindful Leadership",
                  image: mindfulnessThumb,
                  description: "Practical mindfulness techniques for executives who don't have time for mindfulness. Build the awareness, focus, and emotional regulation that transform how leaders show up.",
                  duration: "Half-day to full-day",
                  investment: "Starting at $7,500",
                  outcomes: [
                    "Develop a personal mindfulness practice that fits your schedule",
                    "Strengthen emotional regulation under pressure",
                    "Improve focus and decision-making clarity",
                    "Create team rituals that build collective presence",
                  ],
                },
                {
                  id: "masterYourMessageB2B",
                  icon: MessageSquare,
                  title: "Master Your Message",
                  image: communicationThumb,
                  description: "Beyond the announcement email: How to design communication that actually drives behavior change. Build the messaging infrastructure that makes change stick.",
                  duration: "Half-day to full-day",
                  investment: "Starting at $7,500",
                  outcomes: [
                    "Design communication cadences that build momentum",
                    "Craft messages that address the 'why' people actually need",
                    "Build feedback loops that surface real concerns early",
                    "Create a communication playbook for your next initiative",
                  ],
                },
                {
                  id: "stoicismB2B",
                  icon: Landmark,
                  title: "Stoicism in the Workplace",
                  image: stoicThumb,
                  description: "Ancient philosophy meets contemporary challenges. How reason, logic, purpose, and virtue create resilient leaders who navigate complexity with clarity and conviction.",
                  duration: "Half-day to full-day",
                  investment: "Starting at $7,500",
                  outcomes: [
                    "Apply Stoic principles to everyday leadership decisions",
                    "Build resilience through strategic preparation (Premeditatio Malorum)",
                    "Develop the capacity to lead through uncertainty and ambiguity",
                    "Create a personal leadership philosophy grounded in virtue and purpose",
                  ],
                },
              ].map((workshop, index) => {
                return (
                  <div
                    key={index}
                    id={workshop.id}
                    className="rounded-xl border border-border p-6 flex flex-col scroll-mt-24"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-3">
                      <img
                        src={workshop.image}
                        alt={workshop.title}
                        loading="lazy"
                        className="w-full h-40 sm:w-28 sm:h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div>
                        <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy leading-tight mb-1">{workshop.title}</h3>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="text-foreground font-medium">{workshop.duration}</span>
                          <span className="text-foreground">|</span>
                          <span className="text-lime font-semibold">{workshop.investment}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-body -sm text-foreground mb-4">{workshop.description}</p>
                    <div className="flex-grow">
                      <p className="text-body -sm font-semibold text-navy mb-2">What You'll Walk Away With:</p>
                      <ul className="space-y-1">
                        {workshop.outcomes.map((item, i) => (
                          <li key={i} className="text-body flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-lime flex-shrink-0 mt-1" />
                            <span className="text-xs text-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-body text-foreground/70 italic mt-4">No <span className="font-bold text-bluedoor">Blue Door</span> required</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center mt-12 bg-muted/40 border border-border rounded-xl p-8">
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-3">
              Don&rsquo;t see exactly what you&rsquo;re looking for?
            </h3>
            <p className="text-body text-foreground max-w-2xl mx-auto mb-3">
              The workshops above are a sample of what we run most often. We also offer other sessions across our core topic areas, and most can be delivered as a <Link to="/speaking" className="font-semibold text-teal hover:text-teal/80 underline underline-offset-2">keynote or speaking session</Link> or expanded into a <strong>workshop</strong>:
            </p>
            <p className="text-body text-foreground max-w-2xl mx-auto mb-6">
              <span className="font-semibold text-navy">Change &amp; Innovation</span>
              <span className="text-foreground/50"> &middot; </span>
              <span className="font-semibold text-navy">Leadership &amp; Culture</span>
              <span className="text-foreground/50"> &middot; </span>
              <span className="font-semibold text-navy">Communication</span>
              <span className="text-foreground/50"> &middot; </span>
              <span className="font-semibold text-navy">Resilience &amp; Wellbeing</span>
              <span className="text-foreground/50"> &middot; </span>
              <span className="font-semibold text-navy">Mindfulness</span>
              <span className="text-foreground/50"> &middot; </span>
              <span className="font-semibold text-navy">Team Dynamics</span>
            </p>
            <p className="text-body text-foreground max-w-2xl mx-auto mb-6">
              Take the P.A.T.H.finder quiz so we can recommend the workshop or speaking session that best fits where you&rsquo;re headed, or contact us to talk through your topic.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={openQuiz}
                className="bg-teal text-white hover:bg-teal/90 h-auto min-h-12 px-4 sm:px-8 py-3 text-base font-semibold whitespace-normal"
              >
                Take the P.A.T.H.finder Quiz <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto min-h-12 px-4 sm:px-8 py-3 text-base font-semibold whitespace-normal"
              >
                <Link to="/contact?scope=organization&interest=workshops&message=I'd like to discuss a workshop or speaking topic for our team.">
                  Contact Us to Talk It Through
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </section>

      <FAQSection
        tierName="AMPLIFY"
        categories={workshopFaqCategories}
        subheadline="Common questions about AMPLIFY workshops"
      />

      {/* Final CTA */}
      <ParallaxCTA
        backgroundImage={architectChangeThumb}
        overlayTone="purple"
        headline={<>Ready to AMPLIFY Your Team&rsquo;s Next Sh<span className="text-white font-bold">IF</span>t?</>}
        description={
          <>
            Our workshops are co-designed around your context, your challenges, and your transformation goals.
            <br />
            <span className="font-semibold">Let&rsquo;s design the right experience for your team.</span>
          </>
        }
        actions={[
          {
            label: "Contact Us to Get Started",
            to: "/contact?scope=organization&interest=workshops&message=I'm interested in AMPLIFY workshops for our team.",
            variant: "primary",
          },
          { label: "Discover Your P.A.T.H.way", to: "/start-here", variant: "secondary" },
        ]}
        footnote={
          <Link to="/partner" className="text-white/80 hover:text-white underline">
            Explore All Partnership Options
          </Link>
        }
      />
    </div>
  );
}
