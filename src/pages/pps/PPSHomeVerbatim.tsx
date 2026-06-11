import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Compass,
  Building2,
  Brain,
  DoorOpen,
  Users,
  Lightbulb,
  Target,
  HeartHandshake,
  TrendingUp,
  Compass as CompassIcon,
  Zap,
  FileText,
  Wrench,
  Mic,
} from "lucide-react";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import ParallaxCTA from "@/components/pps/ParallaxCTA";
import ClientLogoMarquee from "@/components/pps/ClientLogoMarquee";
import { useFeaturedPosts } from "@/hooks/useFeaturedPosts";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import homeHero from "@/assets/heroes/home-hero.jpg";

/* "shIFt" with raspberry IF */
const ShIFt = () => (
  <>
    Sh<span className="text-raspberry font-bold">IF</span>t
  </>
);

const threeAmQuestions = [
  "Are we solving the right problem, or just reacting to the loudest pressure?",
  "Are we aligned enough for this to actually work?",
  "Can our organization realistically sustain what comes next?",
];

const everyConversation: { text: string; bold: string[] }[] = [
  { text: "The {b} conversation.", bold: ["strategy"] },
  { text: "The {b} and {b} conversation.", bold: ["technology", "AI"] },
  { text: "The {b} conversation.", bold: ["operational"] },
  { text: "The {b} conversation.", bold: ["leadership"] },
  { text: "The {b} conversation.", bold: ["culture"] },
];

const stillTryingTo: {
  label: string;
  icon: typeof Target;
  bg: string;
  border: string;
  iconColor: string;
}[] = [
  { label: "Deliver measurable results", icon: Target, bg: "bg-primary/5", border: "border-primary/30", iconColor: "text-primary" },
  { label: "Support your people", icon: HeartHandshake, bg: "bg-raspberry/5", border: "border-raspberry/30", iconColor: "text-raspberry" },
  { label: "Sustain continual growth", icon: TrendingUp, bg: "bg-lime/5", border: "border-lime/30", iconColor: "text-lime" },
  { label: "Maintain strategic alignment", icon: CompassIcon, bg: "bg-bluedoor/5", border: "border-bluedoor/30", iconColor: "text-bluedoor" },
  { label: "Adapt and pivot in real time", icon: Zap, bg: "bg-gold/10", border: "border-gold/40", iconColor: "text-gold" },
];

const phaseZeroBefore = [
  "Before another initiative is announced.",
  "Before another restructuring conversation kicks off.",
  "Before scaling something that already feels stretched or scattered.",
  "Before delivery is designed around assumptions that were never fully aligned.",
];

const phaseZeroQuestions = [
  { label: "Not just:", q: "What should we do next?" },
  { label: "But:", q: "What is this organization actually trying to become?" },
  { label: "And:", q: "What would it take to make that future sustainable?" },
];

const pillars = [
  {
    icon: Building2,
    title: "Cultural Cornerstone",
    subtitle: "Leadership & Culture",
    description:
      "Your leadership, culture, values, and the relational architecture that shape how your organization leads, decides, and evolves.",
    color: "text-navy",
    bgColor: "bg-[hsl(220,60%,95%)]",
    iconBg: "bg-[hsl(220,50%,90%)]",
  },
  {
    icon: Compass,
    title: "Operational Frame",
    subtitle: "Workflows & Systems",
    description:
      "Your systems, workflows, structures, and decision pathways that move strategy from intention into reality.",
    color: "text-strategic",
    bgColor: "bg-strategic/10",
    iconBg: "bg-strategic/15",
  },
  {
    icon: Brain,
    title: "Living Ecosystem",
    subtitle: "Human Capacity",
    description:
      "Your individual and collective capacity, judgment, communication, resilience, and mindset needed to sustain meaningful shIFt.",
    color: "text-gold",
    bgColor: "bg-gold/10",
    iconBg: "bg-gold/15",
  },
];

const discover = [
  {
    title: "Which shifts align with your organization's current capacity",
    copy: "Not simply what sounds strategically promising, but what your people, systems, leadership, and operations are realistically positioned to sustain.",
  },
  {
    title: "The conditions influencing each possible direction",
    copy: "What needs strengthening, clarifying, or aligning before momentum compounds complexity.",
  },
  {
    title: "Where acceleration may be outpacing coherence",
    copy: "So you avoid scaling fragmentation, unfinished work, and organizational exhaustion.",
  },
  {
    title: "Your most viable P.A.T.H.ways forward",
    copy: "Clarity around which directions are worth pursuing now, later, or not at all.",
  },
];

export default function PPSHomeVerbatim() {
  useDocumentSeo({
    title: "Home (Verbatim Archive) | Painted Porch Strategies",
    description: "Archived verbatim home page kept for internal reference.",
    robots: "noindex, nofollow",
  });

  const { data: posts } = useFeaturedPosts(3);

  return (
    <div>
      {/* ============================================================ */}
      {/* Hero                                                          */}
      {/* ============================================================ */}
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Phase Zero™ &middot; The Work Before the Work
          </span>
        }
        headline={
          <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.25rem] leading-[1.05] tracking-tight">
            It&rsquo;s Time to Do Epic <ShIFt />.
          </span>
        }
        subheadline=""
        description={
          <span className="block space-y-3 sm:space-y-4 text-base sm:text-lg leading-relaxed tracking-[0.005em]">
            <span className="block text-xl sm:text-2xl md:text-[1.65rem] font-poppins font-semibold italic text-gold leading-snug tracking-tight mt-1 mb-3 sm:mb-4">
              Before momentum outruns alignment.
            </span>
            <span className="block">You aren&rsquo;t short on vision.</span>
            <span className="block">Or resolve and experience.</span>
            <span className="block">
              Or methodologies, frameworks, and advisors.
            </span>
            <span className="block font-bold">
              You&rsquo;ve adopted and outgrown more than one.
            </span>
            <span className="block">
              <span className="font-bold">What&rsquo;s harder to find is clarity</span> &ndash; the kind that
              comes before strategy hardens the direction, the announcement
              activates the initiative, and resources commit to what comes
              next.
            </span>
            <span className="block">
              Because the question usually isn&rsquo;t IF your
              organization can execute. It&rsquo;s if <span className="font-bold">what you&rsquo;re
              building is aligned with who your organization is trying to
              become</span>.
            </span>
            <span className="block text-white pt-1">
              The Painted Porch exists in the space before acceleration
              compounds complexity &ndash; where clarity, alignment, and
              sustainable movement begin.
            </span>
          </span>
        }
        ctas={[
          {
            label: "Open the Blue Door",
            href: "/blue-door",
            buttonClassName:
              "bg-bluedoor border-2 border-bluedoor text-white hover:bg-white hover:text-bluedoor",
            icon: <ArrowRight className="ml-2 w-5 h-5" />,
          },
          {
            label: "Discover Your P.A.T.H.way",
            href: "/start-here",
            icon: <ArrowRight className="ml-2 w-5 h-5" />,
          },
        ]}
        background={{ type: "image", src: homeHero }}
        overlayClass="bg-navy/55"
      />

      {/* ============================================================ */}
      {/* 3AM Questions strip                                           */}
      {/* ============================================================ */}
      <section className="py-12 bg-muted">
        <div className="container max-w-6xl mx-auto px-6">
          <p className="text-center text-sm font-poppins font-semibold uppercase tracking-[0.12em] sm:tracking-[0.18em] text-primary mb-8">
            The 3AM questions leaders are asking
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {threeAmQuestions.map((q, i) => (
              <div key={i} className="text-center">
                <p className="text-primary font-bold italic leading-relaxed">
                  &ldquo;{q}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* There's a lot of ShIFt happening (verbatim)                   */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="badge-gold mb-4 inline-block">It&rsquo;s Not Just You...</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy leading-tight">
              There&rsquo;s a lot of <ShIFt /> happening right now.
            </h2>
          </div>

          <div className="space-y-5 text-lg text-foreground leading-relaxed">
            <p>And it feels like every important conversation is happening at the same time.</p>
            <ul className="space-y-1.5 text-foreground/85 pl-1">
              {everyConversation.map((c, i) => {
                const parts = c.text.split("{b}");
                return (
                  <li key={i}>
                    {parts.map((p, j) => (
                      <span key={j}>
                        {p}
                        {j < c.bold.length && (
                          <span className="font-bold text-raspberry">{c.bold[j]}</span>
                        )}
                      </span>
                    ))}
                  </li>
                );
              })}
            </ul>
            <p>Meanwhile, your organization is still trying to:</p>
            <ul
              role="list"
              aria-label="Ongoing organizational priorities"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2 list-none p-0"
            >
              {stillTryingTo.map(({ label, icon: Icon, bg, border, iconColor }) => (
                <li
                  key={label}
                  aria-label={label}
                  className={`${bg} border ${border} rounded-lg px-3 py-4 text-center text-sm font-poppins font-semibold text-navy leading-snug flex flex-col items-center gap-2`}
                >
                  <Icon className={`w-6 h-6 ${iconColor}`} aria-hidden="true" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            <p>
              Even successful organizations can start feeling stretched when
              priorities, expectations, systems, and pace are all evolving
              simultaneously.
            </p>
            <p>
              Often the issue isn&rsquo;t effort. It&rsquo;s that your
              organization has outgrown the structures, assumptions, or
              operating rhythms that once worked well enough to get here.
            </p>
            <p>
              And <strong className="font-bold">pushing harder in the wrong direction doesn&rsquo;t change
              the direction</strong>. It simply compounds the cost of getting there.
            </p>
            <p>
              The frustration that surfaces in moments like this is rarely
              random; it&rsquo;s a signal that <strong className="font-bold">clarity is needed before
              committing to another direction</strong> that eventually leaves your
              organization feeling fragmented, unfinished, or unsustainable.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Phase Zero gradient CTA (verbatim)                            */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gold/10 via-gold/5 to-white text-navy">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="inline-block bg-navy text-white font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
              Phase Zero
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-navy">
              The clarity that accelerates your next big <ShIFt />.
            </h2>
          </div>

          <div className="space-y-2 text-lg text-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            {phaseZeroBefore.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <p className="text-lg text-foreground mb-3 max-w-2xl mx-auto leading-relaxed">
            Phase Zero exists to create clarity before your next major
            decision hardens into execution.
          </p>
          <p className="text-lg text-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            It&rsquo;s the threshold work that helps your organization see
            itself clearly before determining what comes next.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10">
            {phaseZeroQuestions.map((p) => (
              <div
                key={p.label}
                className="bg-white rounded-xl p-5 border-l-4 border-gold shadow-sm"
              >
                <p className="font-poppins font-semibold text-gold text-sm mb-2">
                  {p.label}
                </p>
                <p className="font-poppins italic text-lg text-navy leading-snug">
                  &ldquo;{p.q}&rdquo;
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-4 text-lg text-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            <p>
              Because not every opportunity strengthens the organization
              pursuing it, and not every change creates the conditions needed
              to sustain what comes after it.
            </p>
            <p>
              Some organizations become exhausted not from lack of effort, but
              from the accumulated weight of unfinished work, competing
              priorities, fragmented initiatives, and directions that never
              fully aligned in the first place.
            </p>
          </div>

          <div className="text-center">
            <Link to="/phase-zero">
              <Button className="bg-navy border-2 border-navy text-white hover:bg-white hover:text-navy text-lg py-5 px-8 transition-colors">
                Explore Phase Zero™
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* The Blue Door (verbatim)                                      */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-flex items-center gap-2 bg-bluedoor/10 text-bluedoor font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
                <DoorOpen className="w-4 h-4" />
                A Different Kind of Strategic Conversation
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
                The Blue Door Organizational Appraisal.
              </h2>
              <div className="space-y-4 text-lg text-foreground leading-relaxed mb-6">
                <p>
                  The Blue Door was designed for organizations seeking clarity
                  before committing to what comes next.
                </p>
                <p>
                  Not because something has already failed. Or because your
                  leadership lacks capability. And certainly not because your
                  organization isn&rsquo;t working hard enough.
                </p>
                <p>
                  Most organizations already have talented people, strong
                  intentions, and teams pushing hard toward meaningful goals.
                  But effort alone doesn&rsquo;t always create coherence.
                </p>
                <p>
                  This isn&rsquo;t an organizational health assessment or a
                  readiness score. It&rsquo;s a structured reflection process
                  designed to clarify what kind of change your organization
                  can confidently execute before major pivots become active
                  pursuit.
                </p>
              </div>
              <Link to="/blue-door">
                <Button className="bg-bluedoor border-2 border-bluedoor text-white hover:bg-white hover:text-bluedoor text-lg py-5 px-8 transition-colors">
                  Open the Blue Door
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <p className="text-sm font-poppins font-semibold uppercase tracking-wider text-bluedoor mb-5">
                What You&rsquo;ll Discover
              </p>
              <ul className="space-y-5">
                {discover.map((d, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-bluedoor/10 text-bluedoor font-poppins font-bold text-xs flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-poppins font-semibold text-navy leading-snug mb-1">
                        {d.title}
                      </p>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {d.copy}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Discover Your P.A.T.H.way (verbatim)                          */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <span className="badge-gold mb-4 inline-block">Discover Your P.A.T.H.way</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Your compass for where to begin.
            </h2>
            <p className="text-lg text-foreground leading-relaxed">
              Not everyone arrives at the Painted Porch navigating the same
              kind of challenge or asking the same kinds of questions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gold/10 border border-gold/30 p-8 rounded-xl flex flex-col">
              <div className="w-12 h-12 bg-gold/25 rounded-lg flex items-center justify-center mb-4">
                <Compass className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-3">
                Exploring for Yourself?
              </h3>
              <p className="text-foreground mb-4 leading-relaxed flex-grow">
                You may be exploring how to communicate, lead, collaborate,
                and navigate change more intentionally in the work
                you&rsquo;re already doing. Courses, assessments, masterclasses,
                and self-guided tools through IGNITE.
              </p>
              <Link
                to="/start-here"
                className="text-gold font-semibold hover:underline inline-flex items-center mt-auto"
              >
                Discover Your P.A.T.H.way
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>

            <div className="bg-bluedoor/10 border border-bluedoor/30 p-8 rounded-xl flex flex-col">
              <div className="w-12 h-12 bg-bluedoor/25 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-bluedoor" />
              </div>
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-3">
                Exploring for Your Team or Organization?
              </h3>
              <p className="text-foreground mb-4 leading-relaxed flex-grow">
                You&rsquo;re trying to answer larger organizational questions
                around growth, alignment, leadership capacity, technology
                integration, and what your organization is realistically ready
                to take on next. The Blue Door is where to begin.
              </p>
              <Link
                to="/blue-door"
                className="text-bluedoor font-semibold hover:underline inline-flex items-center mt-auto"
              >
                Open the Blue Door
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Our Painted Porch (Pillars)                                   */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-6xl mx-auto px-6">
          {/* Opening narrative */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="badge-gold mb-4 inline-block">Our Painted Porch</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
              The foundation beneath the movement.
            </h2>
            <div className="space-y-4 text-lg text-foreground leading-relaxed">
              <p className="italic text-foreground/80">
                Over time, we&rsquo;ve noticed a simple, yet complex pattern:
              </p>
              <p>
                <strong className="font-bold text-navy">Change is easier to start than it is to sustain</strong>, especially
                when people, systems, leadership, and expectations are all
                trying to evolve at the same time.
              </p>
              <p>
                Most organizations already know how to launch initiatives.
                What&rsquo;s harder is building the clarity, alignment, and
                organizational architecture required to sustain what comes
                after the launch.
              </p>
            </div>

            <div className="mt-10 pt-8 border-t border-navy/10">
              <p className="text-base text-foreground/70 mb-3">
                Everything at Painted Porch Strategies is designed around one
                central idea:
              </p>
              <p className="font-poppins text-2xl font-semibold italic text-navy leading-snug">
                Sustainable movement requires more than momentum. Clarity is the catalyst for what gets decided, what moves forward, and what happens next.
              </p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* Integrated framework: P.A.T.H. → Pillars → Bedrock → Porch    */}
          {/* ============================================================ */}
          <div className="relative max-w-5xl mx-auto">

            {/* Unified white "blueprint" card holding PATH → Pillars → Bedrock */}
            <div className="bg-white rounded-3xl border border-navy/10 shadow-sm p-6 sm:p-8 md:p-12">

              {/* LAYER 1: P.A.T.H. */}
              <section
                id="the-way-forward"
                aria-labelledby="path-heading"
                className="scroll-mt-24 scroll-smooth"
              >
                <div className="text-center mb-5">
                  <p className="text-xs font-poppins font-semibold uppercase tracking-[0.2em] text-gold">
                    The Way Forward
                  </p>
                  <h3 id="path-heading" className="text-xl md:text-2xl font-poppins font-bold text-navy mt-1">
                    Your P.A.T.H. to Sustainable Change
                  </h3>
                  <p className="text-sm md:text-base text-foreground/80 mt-3 max-w-2xl mx-auto leading-relaxed">
                    A way of thinking about and navigating intentional, sustainable
                    progress.
                  </p>
                </div>

                {/* Steps with winding road behind. Road SVG = grid width (so 4 colors align with 4 boxes). Flat extension bars stretch the road into the white card's padding on each side. */}
                <div className="relative pb-10 md:pb-14 mb-2">
                  {/* Left curved extension (teal), continues the road's tangent up-and-out toward the white card's left edge */}
                  <svg
                    viewBox="0 0 100 200"
                    className="absolute top-[42%] -translate-y-1/2 -left-6 sm:-left-8 md:-left-12 w-6 sm:w-8 md:w-12 h-[120%] sm:h-[140%] pointer-events-none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    {/* Mobile: match main road (sw=20, opacity=0.4, dash 6/6) */}
                    <path
                      className="sm:hidden"
                      d="M 0 70 C 30 70, 60 100, 100 100"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="20"
                      strokeLinecap="round"
                      opacity="0.4"
                    />
                    <path
                      className="sm:hidden"
                      d="M 0 70 C 30 70, 60 100, 100 100"
                      fill="none"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeDasharray="6 6"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                    {/* Desktop: match main road (sw=28, opacity=0.6, dash 8/8) */}
                    <path
                      className="hidden sm:block"
                      d="M 0 50 C 30 50, 60 100, 100 100"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="28"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                    <path
                      className="hidden sm:block"
                      d="M 0 50 C 30 50, 60 100, 100 100"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeDasharray="8 8"
                      strokeLinecap="round"
                      opacity="0.7"
                    />
                  </svg>
                  {/* Right curved extension (lime), continues the road's tangent up-and-out from the H box toward the white card's right edge */}
                  <svg
                    viewBox="0 0 100 200"
                    className="absolute top-[42%] -translate-y-1/2 -right-6 sm:-right-8 md:-right-12 w-6 sm:w-8 md:w-12 h-[120%] sm:h-[140%] pointer-events-none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    {/* Mobile: match main road (sw=20, opacity=0.4, dash 6/6) */}
                    <path
                      className="sm:hidden"
                      d="M 0 100 C 40 88, 60 70, 100 70"
                      fill="none"
                      stroke="hsl(var(--lime))"
                      strokeWidth="20"
                      strokeLinecap="round"
                      opacity="0.4"
                    />
                    <path
                      className="sm:hidden"
                      d="M 0 100 C 40 88, 60 70, 100 70"
                      fill="none"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeDasharray="6 6"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                    {/* Desktop: match main road (sw=28, opacity=0.6, dash 8/8) */}
                    <path
                      className="hidden sm:block"
                      d="M 0 100 C 40 80, 60 50, 100 50"
                      fill="none"
                      stroke="hsl(var(--lime))"
                      strokeWidth="28"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                    <path
                      className="hidden sm:block"
                      d="M 0 100 C 40 80, 60 50, 100 50"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeDasharray="8 8"
                      strokeLinecap="round"
                      opacity="0.7"
                    />
                  </svg>

                  {/* Mobile: flatter curve, lighter opacity, thinner stroke */}
                  <svg
                    viewBox="0 0 1200 200"
                    className="sm:hidden absolute top-[42%] -translate-y-1/2 inset-x-0 w-full h-[120%] pointer-events-none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <defs>
                      <path
                        id="ppsRoadMobile"
                        d="M 0 100 C 100 100, 200 70, 300 100 S 500 130, 600 100 S 800 70, 900 100 S 1100 130, 1200 100"
                      />
                      <clipPath id="ppsRoadMobileClip1"><rect x="0" y="0" width="300" height="200" /></clipPath>
                      <clipPath id="ppsRoadMobileClip2"><rect x="300" y="0" width="300" height="200" /></clipPath>
                      <clipPath id="ppsRoadMobileClip3"><rect x="600" y="0" width="300" height="200" /></clipPath>
                      <clipPath id="ppsRoadMobileClip4"><rect x="900" y="0" width="300" height="200" /></clipPath>
                    </defs>
                    <g fill="none" strokeWidth="20" strokeLinecap="butt" opacity="0.4">
                      <use href="#ppsRoadMobile" stroke="hsl(var(--primary))" clipPath="url(#ppsRoadMobileClip1)" />
                      <use href="#ppsRoadMobile" stroke="hsl(var(--raspberry))" clipPath="url(#ppsRoadMobileClip2)" />
                      <use href="#ppsRoadMobile" stroke="hsl(var(--gold))" clipPath="url(#ppsRoadMobileClip3)" />
                      <use href="#ppsRoadMobile" stroke="hsl(var(--lime))" clipPath="url(#ppsRoadMobileClip4)" />
                    </g>
                    <use
                      href="#ppsRoadMobile"
                      fill="none"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeDasharray="6 6"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                  </svg>

                  {/* Desktop/tablet: full winding curve, single smooth path split into 4 colored segments */}
                  <svg
                    viewBox="0 0 1200 200"
                    className="hidden sm:block absolute top-[42%] -translate-y-1/2 inset-x-0 w-full h-[140%] pointer-events-none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <defs>
                      <path
                        id="ppsRoadDesktop"
                        d="M 0 100 C 100 100, 200 50, 300 100 S 500 150, 600 100 S 800 50, 900 100 S 1100 150, 1200 100"
                      />
                      <clipPath id="ppsRoadDesktopClip1"><rect x="0" y="0" width="300" height="200" /></clipPath>
                      <clipPath id="ppsRoadDesktopClip2"><rect x="300" y="0" width="300" height="200" /></clipPath>
                      <clipPath id="ppsRoadDesktopClip3"><rect x="600" y="0" width="300" height="200" /></clipPath>
                      <clipPath id="ppsRoadDesktopClip4"><rect x="900" y="0" width="300" height="200" /></clipPath>
                    </defs>
                    <g fill="none" strokeWidth="28" strokeLinecap="butt" opacity="0.6">
                      <use href="#ppsRoadDesktop" stroke="hsl(var(--primary))" clipPath="url(#ppsRoadDesktopClip1)" />
                      <use href="#ppsRoadDesktop" stroke="hsl(var(--raspberry))" clipPath="url(#ppsRoadDesktopClip2)" />
                      <use href="#ppsRoadDesktop" stroke="hsl(var(--gold))" clipPath="url(#ppsRoadDesktopClip3)" />
                      <use href="#ppsRoadDesktop" stroke="hsl(var(--lime))" clipPath="url(#ppsRoadDesktopClip4)" />
                    </g>
                    <use
                      href="#ppsRoadDesktop"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeDasharray="8 8"
                      strokeLinecap="round"
                      opacity="0.7"
                    />
                  </svg>

                  <ol
                    className="relative grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3"
                    aria-labelledby="path-heading"
                  >
                    {[
                      { letter: "P", word: "Prepare", slug: "prepare", border: "border-primary", text: "text-primary", bg: "bg-primary", dot: "bg-primary" },
                      { letter: "A", word: "Align", slug: "align", border: "border-raspberry", text: "text-raspberry", bg: "bg-raspberry", dot: "bg-raspberry" },
                      { letter: "T", word: "Take Off", slug: "take-off", border: "border-gold", text: "text-gold", bg: "bg-gold", dot: "bg-gold" },
                      { letter: "H", word: "Habits", slug: "habits", border: "border-lime", text: "text-lime", bg: "bg-lime", dot: "bg-lime" },
                    ].map((step, idx, arr) => (
                      <li
                        key={step.letter}
                        id={`path-${step.slug}`}
                        className={`relative flex flex-col items-center justify-center py-4 rounded-xl border-2 bg-white shadow-sm scroll-mt-24 ${step.border}`}
                        aria-label={`Step ${idx + 1} of ${arr.length}: ${step.letter}, ${step.word}`}
                      >
                        {/* Connector line + dot above the box (into the road) */}
                        <span
                          aria-hidden="true"
                          className={`absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3 ${step.bg} opacity-60`}
                        />
                        <span
                          aria-hidden="true"
                          className={`absolute -top-[14px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ring-2 ring-white ${step.dot}`}
                        />

                        <span className={`font-poppins font-bold text-2xl ${step.text}`} aria-hidden="true">
                          {step.letter}
                        </span>
                        <span className={`text-[10px] md:text-xs font-poppins font-semibold uppercase tracking-widest mt-1 ${step.text}`} aria-hidden="true">
                          {step.word}
                        </span>

                        {/* Connector line + dot below the box (into the road) */}
                        <span
                          aria-hidden="true"
                          className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-0.5 h-3 ${step.bg} opacity-60`}
                        />
                        <span
                          aria-hidden="true"
                          className={`absolute -bottom-[14px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ring-2 ring-white ${step.dot}`}
                        />
                      </li>
                    ))}
                  </ol>
                </div>
              </section>

              {/* LAYER 2: The Three Pillars */}
              <div>
                <div className="text-center mb-6">
                  <p className="text-xs font-poppins font-semibold uppercase tracking-[0.2em] text-gold">
                    The Load-Bearing Structures
                  </p>
                  <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mt-1">
                    Painted Porch Pillars
                  </h3>
                  <p className="text-foreground/80 text-sm md:text-base mt-3 max-w-2xl mx-auto leading-relaxed">
                    Three dimensions that influence and impact what your
                    organization is built to carry.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                  {pillars.map((pillar, i) => (
                    <div
                      key={i}
                      className={`${pillar.bgColor} p-6 rounded-xl border-t-4 ${
                        i === 0
                          ? "border-navy"
                          : i === 1
                          ? "border-strategic"
                          : "border-gold"
                      } transition-all hover:shadow-lg hover:-translate-y-1`}
                    >
                      <pillar.icon className={`w-10 h-10 ${pillar.color} mb-4`} />
                      <h4 className="text-base md:text-lg font-poppins font-semibold text-navy mb-1">
                        {pillar.title}
                      </h4>
                      <p className={`text-sm font-medium ${pillar.color} mb-3`}>
                        {pillar.subtitle}
                      </p>
                      <p className="text-foreground text-sm leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connector: Pillars → Bedrock (mini pillars) */}
              {(() => {
                const MiniPillar = () => (
                  <div className="flex flex-col items-center" aria-hidden="true">
                    {/* Capital (top) */}
                    <div className="w-4 h-1.5 rounded-sm bg-navy/30" />
                    {/* Shaft */}
                    <div className="w-2 h-8 bg-gradient-to-b from-navy/25 to-navy/15" />
                    {/* Base */}
                    <div className="w-5 h-1.5 rounded-sm bg-navy/30" />
                  </div>
                );
                return (
                  <>
                    <div className="flex justify-center md:hidden my-6" aria-hidden="true">
                      <MiniPillar />
                    </div>
                    <div className="hidden md:flex justify-around px-16 my-6" aria-hidden="true">
                      <MiniPillar />
                      <MiniPillar />
                      <MiniPillar />
                    </div>
                  </>
                );
              })()}

              {/* LAYER 3: Essential Elements */}
              <div className="bg-muted/50 border border-navy/5 rounded-2xl p-6 md:p-8">
                <div className="text-center mb-5">
                  <p className="text-xs font-poppins font-semibold uppercase tracking-[0.2em] text-gold">
                    The Behavioral Bedrock
                  </p>
                  <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mt-1">
                    Essential Elements
                  </h3>
                  <p className="text-foreground/80 text-sm md:text-base mt-3 max-w-2xl mx-auto leading-relaxed">
                    The everyday human behaviors and conditions that influence
                    whether change actually sticks.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    "Communication",
                    "Collaboration",
                    "Clarity",
                    "Resilience",
                    "Alignment",
                    "Organizational Health",
                  ].map((el) => (
                    <span
                      key={el}
                      className="bg-white text-navy font-poppins font-medium text-sm px-4 py-2 rounded-full border border-navy/10"
                    >
                      {el}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* LAYER 4: The Fortified Porch (the resulting structure) */}
            <div>
              <div className="bg-gradient-to-br from-navy to-navy/90 text-white rounded-2xl p-8 md:p-12 text-center shadow-xl border-b-4 border-gold">
                <p className="text-xs font-poppins font-semibold uppercase tracking-[0.2em] text-gold mb-3">
                  The Result
                </p>
                <h3 className="text-xl md:text-2xl font-poppins font-bold text-white mb-4">
                  The Fortified Porch
                </h3>
                <p className="text-base md:text-lg text-white/90 leading-relaxed max-w-2xl mx-auto">
                  When P.A.T.H. guides the journey, the Pillars stand
                  load-bearing, and the Elements show up every day, your
                  organization becomes capable of{" "}
                  <strong className="text-gold">
                    authoring change and continually evolving
                  </strong>
                  , rather than constantly absorbing fragmentation and fixing
                  disruption.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Painted Porch Partnership (with Promise callout)              */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="badge-gold mb-4 inline-block">Strategic Advisory</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
              We Partner for the Moments that Matter
            </h2>
            <div className="text-lg text-foreground leading-relaxed text-left">
              <p>
                There are moments when the decisions in front of your
                organization begin carrying broader consequences:{" "}
                <span className="italic">
                  for people, systems, leadership, culture, capacity,
                  operations, and the future direction of the organization
                  itself.
                </span>
              </p>
              <p className="mt-6 mb-3">Especially during periods of:</p>
              <ul className="list-disc pl-10 md:pl-12 space-y-2 marker:text-foreground pr-2">
                <li>growth that feels increasingly complex</li>
                <li>moments of strategic inflection</li>
                <li>organizational stretching</li>
                <li>leadership alignment challenges</li>
                <li>AI-era transformation pressure</li>
                <li>questioning about what sustainable evolution actually looks like</li>
              </ul>
              <p className="mt-8">
                At that level, clarity becomes more than a leadership
                preference and isn&rsquo;t solved by another quick-win
                workshop, framework, or implementation sprint.
              </p>
              <p className="mt-6">
                It becomes part of what determines whether your change
                strengthens alignment or creates operational drift you later
                have to untangle.
              </p>
              <p className="mt-6">
                We work alongside organizations during these kinds of moments:{" "}
                <span className="italic">
                  inside the clarity, alignment, structure, and deeper design
                  conversations that shape what shIFt happens next.
                </span>
              </p>
            </div>
          </div>

          {/* Promise callout */}
          <div className="bg-gradient-to-br from-navy/10 to-navy/5 text-navy rounded-2xl p-8 md:p-12 shadow-xl border border-navy/20">
            <div className="text-center mb-10">
              <span className="inline-block bg-gold text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
                Our Painted Porch Promise
              </span>
              <h3 className="text-xl md:text-2xl font-bold mb-6 text-navy">
                We aren&rsquo;t here to tell you yes.
              </h3>
              <div className="space-y-4 text-base md:text-lg text-navy/80 max-w-2xl mx-auto leading-relaxed">
                <p>
                  Most transformation initiatives are structured to build
                  momentum first, beginning with the question of what to do.
                  Finding the yes, framing the yes, scoping the yes, even when
                  the real answer is something else.
                </p>
                <p>
                  We&rsquo;re here to tell you what will actually work, and
                  what it will take to make it happen. The question we begin
                  with is whether what&rsquo;s being considered is the right
                  thing to do right now. We ask it before strategy, before
                  scope, before signing.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border-l-4" style={{ borderLeftColor: "#8FB94A" }}>
                <p className="font-poppins font-bold mb-2" style={{ color: "#8FB94A" }}>If yes</p>
                <p className="text-navy/80 text-sm leading-relaxed">
                  We get to work with you on what it takes to author and shape
                  your next shift.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border-l-4 border-gold">
                <p className="font-poppins font-bold text-gold mb-2">If not yet</p>
                <p className="text-navy/80 text-sm leading-relaxed">
                  We tell you, and we provide a pathway to action.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border-l-4 border-raspberry">
                <p className="font-poppins font-bold text-raspberry mb-2">If not us</p>
                <p className="text-navy/80 text-sm leading-relaxed">
                  We tell you that, too, and connect you with the right
                  partner for your stage and needs.
                </p>
              </div>
            </div>

            <p className="text-center text-navy/80 text-base mt-10 max-w-2xl mx-auto">
              <strong className="text-navy">That&rsquo;s the Painted Porch promise:</strong>{" "}
              full transparency about what will work, and the truth about what
              it takes to make it happen.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Trust strip                                                   */}
      {/* ============================================================ */}
      <ClientLogoMarquee />

      {/* ============================================================ */}
      {/* Insights                                                      */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-10 max-w-3xl mx-auto">
            <span className="badge-gold mb-3 inline-block">Thoughts from the Porch</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
              Our Research, Insights &amp; Resources
            </h2>
          </div>

          <div className="space-y-4 text-lg text-foreground leading-relaxed text-left max-w-3xl mx-auto mb-10">
            <p>Some conversations stay with us long after they end.</p>
            <p>
              A question someone asked in a workshop.
              <br />
              A tension pattern that keeps resurfacing across organizations.
              <br />
              An &lsquo;ah ha&rsquo; we couldn&rsquo;t stop thinking about on a long
              drive, in the shower, or in conversation on our porch.
            </p>
            <p>
              Painted Porch explores the realities many organizations and
              leaders are navigating through:
            </p>
            <ul className="list-disc pl-10 md:pl-12 space-y-2 marker:text-foreground pr-2">
              <li>essays and reflections</li>
              <li>strategic conversations</li>
              <li>practical tools and resources</li>
              <li>speaking engagements and media appearances</li>
              <li>long-form discussions</li>
              <li>observations from inside the work itself</li>
            </ul>
            <p>
              So that we have a shared language for what we&rsquo;ve all been
              sensing and seeking to solve, together.
            </p>
          </div>

          {/* Three callouts */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                to: "/resources/insights",
                title: "Insights & Articles",
                desc: "Essays and reflections from the Porch.",
                Icon: FileText,
                accent: "#8FB94A",
                tw: "text-lime",
              },
              {
                to: "/resources/free",
                title: "Resources & Tools",
                desc: "Practical tools you can put to work today.",
                Icon: Wrench,
                accent: "hsl(var(--gold))",
                tw: "text-gold",
              },
              {
                to: "/media",
                title: "Conversations & Media",
                desc: "Speaking, interviews, and long-form discussions.",
                Icon: Mic,
                accent: "hsl(var(--raspberry))",
                tw: "text-raspberry",
              },
            ].map(({ to, title, desc, Icon, accent, tw }) => (
              <Link
                key={to}
                to={to}
                className="group bg-white rounded-xl p-6 border-l-4 border border-navy/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                style={{ borderLeftColor: accent }}
              >
                <Icon className={`w-7 h-7 mb-3 ${tw}`} />
                <h3 className={`text-xl md:text-2xl font-poppins font-bold mb-1 ${tw}`}>
                  {title}
                </h3>
                <p className="text-navy/80 text-sm leading-relaxed mb-3">
                  {desc}
                </p>
                <span className={`inline-flex items-center text-sm font-semibold ${tw}`}>
                  Explore
                  <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>

        </div>
      </section>


      {/* ============================================================ */}
      {/* Final CTA                                                     */}
      {/* ============================================================ */}
      <ParallaxCTA
        backgroundImage={homeHero}
        eyebrow="The porch is Open"
        headline={
          <>
            Step onto the porch. Begin the <span className="text-raspberry font-bold">IF</span>.
          </>
        }
        description={
          <span className="block space-y-4 text-left md:text-center">
            <span className="block">The question isn&rsquo;t simply what's needed next.</span>
            <span className="block">
              It's who your organization is becoming, and IF what
              you&rsquo;re about to commit to is the work will actually
              make that shIFt happen.
            </span>
            <span className="block">
              Because organizations rarely struggle from a lack of effort, but
              from fragmented priorities, unfinished work, and momentum
              committed before clarity and identify are fully formed.
            </span>
            <span className="block">
              The future will keep asking your organization to evolve.
            </span>
            <span className="block">
              The answer is whether you&rsquo;ll ignite, amplify, and embody
              what it takes to make it not just happen, but last.
            </span>
          </span>
        }
        actions={[
          { label: "Open the Blue Door", to: "/blue-door", variant: "bluedoor" },
          { label: "Discover Your P.A.T.H.way", to: "/start-here", variant: "secondary" },
        ]}
      />
    </div>
  );
}
