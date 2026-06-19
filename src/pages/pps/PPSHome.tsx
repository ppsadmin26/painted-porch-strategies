import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/pps/Eyebrow";
import {
  ArrowRight,
  Compass,
  Building2,
  Brain,
  DoorOpen,
  Map,
  Users,
  Lightbulb,
  MessageCircle,
  KeyRound,
  Handshake,
} from "lucide-react";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import ParallaxCTA from "@/components/pps/ParallaxCTA";
import ClientLogoMarquee from "@/components/pps/ClientLogoMarquee";
import StatMarquee from "@/components/pps/StatMarquee";
import StatCard from "@/components/pps/StatCard";
import { RESEARCH_STATS } from "@/data/research-stats";
import { useFeaturedPosts } from "@/hooks/useFeaturedPosts";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import homeHero from "@/assets/heroes/home-hero.jpg";
import phaseZeroClarityBg from "@/assets/phase-zero-clarity-bg.jpg";

/* "shIFt" with raspberry IF */
const ShIFt = () => (
  <>
    Sh<span className="text-raspberry font-bold">IF</span>t
  </>
);

const threeAmQuestions = [
  "Are we solving the right problem, or just reacting to the loudest pressure?",
  "Are we aligned enough for this to actually work?",
  "Can our organization realistically sustain the future we’re trying to create?",
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
    borderColor: "border-navy",
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
    borderColor: "border-strategic",
  },
  {
    icon: Brain,
    title: "Living Ecosystem",
    subtitle: "Capacity & Judgment",
    description:
      "Your individual and collective capacity, judgment, communication, resilience, and mindset needed to sustain meaningful shIFt.",
    color: "text-gold",
    bgColor: "bg-gold/10",
    iconBg: "bg-gold/15",
    borderColor: "border-gold",
  },
];

const discover = [
  "Which shifts your organization actually has the architecture to carry",
  "Where tension or misalignment is already surfacing",
  "What conditions need strengthening before you accelerate",
  "The concrete pathways available to move forward",
];

export default function PPSHome() {
  useDocumentSeo({
    title: "Painted Porch Strategies | It's Time to Do Epic ShIFt",
    description:
      "Phase Zero is the work before the work. Find clarity before momentum outruns alignment.",
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
            Phase Zero<sup className="text-[0.55em] align-super">™</sup> &middot; The Work Before the Work
          </span>
        }
        headline={
          <>
            It&rsquo;s Time to Do Epic <ShIFt />.
          </>
        }
        subheadline=""
        description={
          <>
            You have the vision. You have the resolve. What's harder to find is the clarity - the kind that comes <em>before</em> strategy hardens, <em>before</em> the announcement activates, <em>before</em> momentum exceeds what your organization is able to realistically execute.
            <br /><br />
            That's the work we do.
            <br /><br />
            And it starts with one question: <strong>What is your organization actually built to lead next?</strong>
          </>
        }

        ctas={[
          {
            label: "Open the Blue Door",
            href: "/blue-door",
            buttonClassName: "bg-bluedoor border-2 border-bluedoor text-white hover:bg-white hover:text-bluedoor",
            icon: <ArrowRight className="ml-2 w-5 h-5" />,
          },
          {
            label: "Discover Your P.A.T.H.way",
            href: "/start-here",
            icon: <ArrowRight className="ml-2 w-5 h-5" />,
          },
        ]}
        background={{ type: "video", src: homeHero, poster: homeHero, slotKey: "home-hero" }}
        overlayClass="bg-navy/30"
      />

      {/* 3AM Questions + Research stats moved further down the page */}

      {/* ============================================================ */}
      {/* There's a lot of ShIFt happening                              */}
      {/* ============================================================ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <span className="badge-gold mb-4 inline-block">It&rsquo;s Not Just You</span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
            There&rsquo;s a lot of sh<span className="text-raspberry font-bold">IF</span>t happening right now.
          </h2>
          <p className="text-body text-foreground mb-4 whitespace-pre-line">
            You're navigating strategy, AI, operations, and culture - all while trying to deliver results and support your people in real time.
          </p>
          <p className="text-body text-foreground mb-4 whitespace-pre-line">
            The friction you're feeling isn't a lack of effort. It’s what happens when you ask an organization to carry a new future on an old foundation. Pushing harder in the wrong direction doesn't accelerate transformation; it just <span className="text-raspberry font-bold">compounds the cost of getting there</span>.
          </p>
          <p className="text-body text-foreground mb-8">
            Your organization is becoming something. The only question is whether you're the author of it or the audience.
          </p>

          {/* Editorial pull stat, the human cost */}
          <div className="mt-10 text-left">
            <StatCard
              statId="gallup_cost"
              variant="editorial"
              accentClass="text-raspberry"
              framing={
                <>
                  And it&rsquo;s the cost of asking people to adapt to change
                  without strengthening the foundations required to sustain it.
                </>
              }
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Research stats, static grid                                  */}
      {/* ============================================================ */}
      <section className="py-8 md:py-10 bg-navy" aria-label="Research stats">
        <div className="container max-w-7xl mx-auto px-6">
          <p className="text-body text-center font-poppins font-semibold uppercase tracking-[0.25em] text-gold/90 mb-6 md:mb-7">
            The reality leaders are facing
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 md:gap-6">
            {[
              "mck_ai_readiness",
              "mck_complexity",
              "gartner_adoption",
              "gallup_engagement",
            ].map((id) => {
              const s = RESEARCH_STATS[id as keyof typeof RESEARCH_STATS];
              return (
                <div key={id} className="text-center px-2">
                  <div className="text-3xl md:text-4xl font-poppins font-bold tabular-nums leading-none text-gold">
                    {s.figure}
                  </div>
                  <p className="text-body mt-2 -sm text-white/90 font-montserrat !leading-snug">
                    {s.label.replace(/\.$/, "")}
                  </p>
                  <p className="text-body mt-2 text-[0.6rem] md:text-[0.65rem] uppercase tracking-wider text-white/80">
                    {s.source}{s.year && !s.source.includes(s.year) ? ` · ${s.year}` : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ============================================================ */}
      {/* How we meet you, editorial 2-col                             */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left: manifesto */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <span className="badge-gold mb-4 inline-block">How We Meet You On The Porch</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6 leading-tight">
                We enter at &ldquo;What <span className="text-raspberry font-bold">IF</span>&rdquo;.
              </h2>
              <p className="text-body text-foreground mb-4">
                We don&rsquo;t arrive with predetermined answers, packaged solutions, or implementation plans waiting for your approval.
                <br /><br />
                <strong>We enter earlier.</strong>
                <br /><br />
                We partner with you at the strategic authorship moment, when you are still determining what direction is worth pursuing, who your organization is becoming, and what architecture needs to exist before momentum accelerates.
              </p>
              <p className="text-body text-foreground mb-2">
                Most leaders find us at one of three moments:
              </p>
              <ul className="text-body text-foreground list-disc pl-5 space-y-1 mb-2">
                <li><strong>The Breaking Point:</strong> When you know there&rsquo;s extraordinary potential in your team, but your current structures keep holding it back.</li>
                <li><strong>The Catalyst Event:</strong> When a market shift, AI mandate, or leadership transition forces evolution, and you refuse to sacrifice your people in the process.</li>
                <li><strong>The Vision Validation:</strong> When you&rsquo;re ready to build a legacy that outlives your tenure, and you need the architecture to make it real.</li>
              </ul>
              <p className="text-body text-foreground">
                <br />
                <strong>Wherever you enter, clarity comes before commitment.</strong>
              </p>
            </div>

            {/* Right: 3 stacked engagement rows */}
            <div className="lg:col-span-7 space-y-5">
              <Link
                to="/start-here"
                className="group block bg-white rounded-xl p-6 md:p-7 border-l-4 border-primary hover:shadow-lg transition-all"
              >
                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-body font-poppins font-semibold uppercase tracking-wider text-primary mb-1">
                      01 &middot; Find Your P.A.T.H.
                    </p>
                    <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-2 group-hover:text-primary transition-colors">
                      Explore where you are
                    </h3>
                    <p className="text-body text-foreground leading-relaxed mb-3">
                      From free resources, masterclasses, courses, assessments,
                      and more. For leaders sensing something needs to sh<strong>IF</strong>t,
                      but not sure where to get started.
                    </p>
                    <span className="text-sm font-semibold text-primary inline-flex items-center">
                      Discover Your P.A.T.H.way
                      <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>

              <Link
                to="/blue-door"
                className="group block bg-white rounded-xl p-6 md:p-7 border-l-4 border-bluedoor hover:shadow-lg transition-all"
              >
                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-bluedoor/10 flex items-center justify-center">
                    <KeyRound className="w-6 h-6 text-bluedoor" />
                  </div>
                  <div className="flex-1">
                    <p className="text-body font-poppins font-semibold uppercase tracking-wider text-bluedoor mb-1">
                      02 &middot; Open the Blue Door
                    </p>
                    <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-2 group-hover:text-bluedoor transition-colors">
                      Get clarity before you commit
                    </h3>
                    <p className="text-body text-foreground leading-relaxed mb-3">
                      A structured organizational appraisal that reveals what
                      your organization is realistically positioned to pursue before your next initiative begins.
                    </p>
                    <span className="text-sm font-semibold text-bluedoor inline-flex items-center">
                      Open the Blue Door
                      <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>

              <Link
                to="/partner"
                className="group block bg-white rounded-xl p-6 md:p-7 border-l-4 border-pps-purple hover:shadow-lg transition-all"
              >
                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-pps-purple/10 flex items-center justify-center">
                    <Handshake className="w-6 h-6 text-pps-purple" />
                  </div>
                  <div className="flex-1">
                    <p className="text-body font-poppins font-semibold uppercase tracking-wider text-pps-purple mb-1">
                      03 &middot; Build what&rsquo;s next, together
                    </p>
                    <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-2 group-hover:text-pps-purple transition-colors">
                      Partner through your next sh<span className="text-raspberry font-bold">IF</span>t
                    </h3>
                    <p className="text-body text-foreground leading-relaxed mb-3">
                      Once the Blue Door reveals what&rsquo;s real, we partner
                      with you to architect, align, and sustain the change.
                      Three engagement styles, shaped to how you want to engage, what you need, and when.
                    </p>
                    <span className="text-sm font-semibold text-pps-purple inline-flex items-center">
                      Explore P.A.T.H.way Partnership
                      <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Phase Zero gradient CTA                                       */}
      {/* ============================================================ */}
      <section className="relative py-16 md:py-24 text-white overflow-hidden">
        <img
          src={phaseZeroClarityBg}
          alt=""
          aria-hidden="true"
          loading="lazy"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-strategic opacity-75" aria-hidden="true" />
        <div className="absolute inset-0 bg-navy/20" aria-hidden="true" />
        <div className="relative z-10 container max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Phase Zero is where we begin
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Get the clarity that accelerates vs. exhausts your next big sh<span className="text-raspberry font-bold">IF</span>t.
          </h2>
          <p className="text-body text-white/90 mb-4 max-w-2xl mx-auto">
            Before another initiative is announced. Before another restructuring
            kicks off. Before you begin scaling something that already feels stretched.
          </p>
          <p className="text-body text-white/90 mb-8 max-w-2xl mx-auto">
            Phase Zero is the first act of becoming. It’s the threshold work before your next major decision hardens into execution that helps your organization see itself clearly - its strengths, its constraints, its true capacity - to decide what deserves your commitment and investment.
          </p>
          <Link to="/phase-zero">
            <Button className="bg-gold border-2 border-gold text-navy hover:bg-white hover:border-white text-lg py-5 px-8 transition-colors">
              Explore Phase Zero
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3AM Questions strip, lead-in to The Blue Door                */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block bg-gold text-navy font-poppins font-bold text-xs uppercase tracking-[0.3em] px-5 py-2 rounded-full mb-6">
              The Questions
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy tracking-tight leading-tight">
              What leaders are weighing at <span className="text-raspberry">3AM</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {threeAmQuestions.map((q, i) => (
              <div key={i} className="bg-muted/50 rounded-xl p-6 md:p-8 text-center">
                <div className="text-3xl md:text-4xl font-poppins font-bold text-raspberry mb-4">
                  0{i + 1}
                </div>
                <p className="text-lg md:text-xl text-foreground italic font-medium leading-relaxed">
                  &ldquo;{q}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}

      {/* The Blue Door                                                 */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-bluedoor/10 text-bluedoor font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
                <DoorOpen className="w-4 h-4" />
                A Different Kind of Strategic Conversation
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
                The Blue Door Organizational Appraisal.
              </h2>
              <p className="text-body text-foreground mb-4">
                The questions that keep you up at 3AM deserve more than a pep
                talk or another planning deck. They deserve reality.
              </p>
              <p className="text-body text-foreground mb-4">
                The Blue Door™ is a structured organizational appraisal. It isn't
                a readiness score; it's a clear-eyed look at what future your
                organization is realistically positioned to pursue right now. It
                reveals where your momentum will build, and where it will
                collapse.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <p className="text-body font-poppins font-semibold uppercase tracking-wider text-bluedoor mb-5">
                What You&rsquo;ll Discover
              </p>
              <ul className="space-y-4">
                {discover.map((d, i) => (
                  <li key={i} className="text-body flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-bluedoor/10 text-bluedoor font-poppins font-bold text-xs flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-body text-foreground leading-relaxed">{d}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link to="/blue-door">
              <Button className="bg-bluedoor border-2 border-bluedoor text-white hover:bg-white hover:text-bluedoor text-lg py-5 px-8 transition-colors">
                Open the Blue Door
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* The Painted Porch Pillars                                     */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="badge-gold mb-4 inline-block">Our Painted Porch Pillars</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              The foundation beneath the movement.
            </h2>
            <p className="text-body text-foreground max-w-2xl mx-auto">
              Three dimensions that shape what your organization can realistically pursue and sustain. When all three are structurally sound and aligned, you&rsquo;re better positioned to design and build your next epic shIFt.
              <br /><br />
              Together, these dimensions influence not only what your organization can pursue, but what it can realistically sustain.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((pillar, i) => (
              <div
                key={i}
                className={`${pillar.bgColor} border-l-4 ${pillar.borderColor} p-6 rounded-xl transition-all hover:shadow-lg`}
              >
                <div className={`w-14 h-14 rounded-lg ${pillar.iconBg} flex items-center justify-center mb-4`}>
                  <pillar.icon className={`w-7 h-7 ${pillar.color}`} />
                </div>
                <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-1">
                  {pillar.title}
                </h3>
                <p className={`text-body-sm font-medium ${pillar.color} mb-3`}>
                  {pillar.subtitle}
                </p>
                <p className="text-body -sm text-foreground">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* The Way Forward — P.A.T.H.                                    */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-7xl mx-auto px-6">
          <section
            id="the-way-forward"
            aria-labelledby="path-heading"
            className="scroll-mt-24 scroll-smooth max-w-5xl mx-auto"
          >

            <div className="text-center mb-10">
              <Eyebrow variant="plain" tone="gold" as="p">The Way Forward</Eyebrow>
              <h3 id="path-heading" className="text-xl md:text-2xl font-poppins font-bold text-navy mt-1 mb-4">
                Your P.A.T.H. to Sustainable Change
              </h3>
              <p className="text-body text-foreground max-w-2xl mx-auto">
                A way of thinking about and navigating intentional progress.
                <br /><br />
                A practical framework for building the capability, capacity, and habits required to sustain meaningful progress.
              </p>
            </div>

            {/* Steps with winding road behind. */}
            <div className="relative pb-10 md:pb-14 mb-2 px-6 sm:px-8 md:px-12">
              {/* Mobile road */}
              <svg
                viewBox="0 0 1200 200"
                className="sm:hidden absolute top-[42%] -translate-y-1/2 inset-x-0 w-full h-[120%] pointer-events-none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <path id="ppsHomeRoadMobile" d="M 0 100 C 100 100, 200 70, 300 100 S 500 130, 600 100 S 800 70, 900 100 S 1100 130, 1200 100" />
                  <clipPath id="ppsHomeRoadMobileClip1"><rect x="0" y="0" width="300" height="200" /></clipPath>
                  <clipPath id="ppsHomeRoadMobileClip2"><rect x="300" y="0" width="300" height="200" /></clipPath>
                  <clipPath id="ppsHomeRoadMobileClip3"><rect x="600" y="0" width="300" height="200" /></clipPath>
                  <clipPath id="ppsHomeRoadMobileClip4"><rect x="900" y="0" width="300" height="200" /></clipPath>
                </defs>
                <g fill="none" strokeWidth="20" strokeLinecap="butt" opacity="0.4">
                  <use href="#ppsHomeRoadMobile" stroke="hsl(var(--primary))" clipPath="url(#ppsHomeRoadMobileClip1)" />
                  <use href="#ppsHomeRoadMobile" stroke="hsl(var(--raspberry))" clipPath="url(#ppsHomeRoadMobileClip2)" />
                  <use href="#ppsHomeRoadMobile" stroke="hsl(var(--gold))" clipPath="url(#ppsHomeRoadMobileClip3)" />
                  <use href="#ppsHomeRoadMobile" stroke="hsl(var(--lime))" clipPath="url(#ppsHomeRoadMobileClip4)" />
                </g>
                <use href="#ppsHomeRoadMobile" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="6 6" strokeLinecap="round" opacity="0.6" />
              </svg>

              {/* Desktop road */}
              <svg
                viewBox="0 0 1200 200"
                className="hidden sm:block absolute top-[42%] -translate-y-1/2 inset-x-0 w-full h-[140%] pointer-events-none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <path id="ppsHomeRoadDesktop" d="M 0 100 C 100 100, 200 50, 300 100 S 500 150, 600 100 S 800 50, 900 100 S 1100 150, 1200 100" />
                  <clipPath id="ppsHomeRoadDesktopClip1"><rect x="0" y="0" width="300" height="200" /></clipPath>
                  <clipPath id="ppsHomeRoadDesktopClip2"><rect x="300" y="0" width="300" height="200" /></clipPath>
                  <clipPath id="ppsHomeRoadDesktopClip3"><rect x="600" y="0" width="300" height="200" /></clipPath>
                  <clipPath id="ppsHomeRoadDesktopClip4"><rect x="900" y="0" width="300" height="200" /></clipPath>
                </defs>
                <g fill="none" strokeWidth="28" strokeLinecap="butt" opacity="0.6">
                  <use href="#ppsHomeRoadDesktop" stroke="hsl(var(--primary))" clipPath="url(#ppsHomeRoadDesktopClip1)" />
                  <use href="#ppsHomeRoadDesktop" stroke="hsl(var(--raspberry))" clipPath="url(#ppsHomeRoadDesktopClip2)" />
                  <use href="#ppsHomeRoadDesktop" stroke="hsl(var(--gold))" clipPath="url(#ppsHomeRoadDesktopClip3)" />
                  <use href="#ppsHomeRoadDesktop" stroke="hsl(var(--lime))" clipPath="url(#ppsHomeRoadDesktopClip4)" />
                </g>
                <use href="#ppsHomeRoadDesktop" fill="none" stroke="white" strokeWidth="2" strokeDasharray="8 8" strokeLinecap="round" opacity="0.7" />
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
                    className={`text-body relative flex flex-col items-center justify-center py-4 rounded-xl border-2 bg-white shadow-sm scroll-mt-24 ${step.border}`}
                    aria-label={`Step ${idx + 1} of ${arr.length}: ${step.letter}, ${step.word}`}
                  >
                    <span aria-hidden="true" className={`absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3 ${step.bg} opacity-60`} />
                    <span aria-hidden="true" className={`absolute -top-[14px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ring-2 ring-white ${step.dot}`} />
                    <span className={`font-poppins font-bold text-2xl ${step.text}`} aria-hidden="true">{step.letter}</span>
                    <span className={`text-[10px] md:text-xs font-poppins font-semibold uppercase tracking-widest mt-1 ${step.text}`} aria-hidden="true">{step.word}</span>
                    <span aria-hidden="true" className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-0.5 h-3 ${step.bg} opacity-60`} />
                    <span aria-hidden="true" className={`absolute -bottom-[14px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ring-2 ring-white ${step.dot}`} />
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Discover Your P.A.T.H.way                                     */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="badge-gold mb-4 inline-block">Discover Your P.A.T.H.way</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Your compass for where to begin.
            </h2>
            <p className="text-body text-foreground max-w-2xl mx-auto">
              Not everyone arrives at the Painted Porch asking the same kinds of
              questions. Choose where your journey starts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            <div className="bg-muted p-8 rounded-xl flex flex-col h-full">
              <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mb-4">
                <Compass className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-3">
                Exploring for Yourself?
              </h3>
              <p className="text-body text-foreground mb-4 leading-relaxed flex-1">
                Courses, assessments, masterclasses, and self-guided tools to
                help you communicate, lead, and navigate change more
                intentionally in the work you&rsquo;re already doing.
              </p>
              <div className="mt-auto pt-2 min-h-[2.5rem] flex items-center">
                <Link
                  to="/start-here"
                  data-testid="discover-card-self-link"
                  className="text-primary font-semibold hover:underline inline-flex items-center"
                >
                  Discover Your P.A.T.H.way
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-muted p-8 rounded-xl flex flex-col h-full">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-3">
                Exploring for Your Team or Organization?
              </h3>
              <p className="text-body text-foreground mb-4 leading-relaxed flex-1">
                Organizational clarity, strategic alignment, and the Blue Door
                experience for leaders navigating questions of growth,
                capability, and strategic direction.
              </p>
              <div className="mt-auto pt-2 min-h-[2.5rem] flex items-center">
                <Link
                  to="/blue-door"
                  data-testid="discover-card-org-link"
                  className="text-bluedoor font-semibold hover:underline inline-flex items-center"
                >
                  Open the Blue Door
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Partnership Promise                                           */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-navy to-navy/90 text-white">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
              The Painted Porch Promise
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              We aren&rsquo;t here to tell you yes.
            </h2>
            <p className="text-body text-white/85 max-w-2xl mx-auto">
              We&rsquo;re here to tell you what will actually work, and what it
              will take to make it happen. The question we begin with is whether
              what&rsquo;s being considered is the right thing to do right now.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-lime/25 backdrop-blur-sm rounded-xl p-6 border-l-4 border-lime">
              <p className="text-body font-poppins font-bold text-lime mb-2">If yes</p>
              <p className="text-body -sm text-white/90">
                We get to work with you on what it takes to author and shape
                your next shift.
              </p>
            </div>
            <div className="bg-gold/25 backdrop-blur-sm rounded-xl p-6 border-l-4 border-gold">
              <p className="text-body font-poppins font-bold text-gold mb-2">If not yet</p>
              <p className="text-body -sm text-white/90">
                We tell you, and we provide a pathway to action.
              </p>
            </div>
            <div className="bg-raspberry/25 backdrop-blur-sm rounded-xl p-6 border-l-4 border-raspberry">
              <p className="text-body font-poppins font-bold text-raspberry mb-2">If not us</p>
              <p className="text-body -sm text-white/90">
                We tell you that, too, and connect you with the right partner
                for your stage and needs.
              </p>
            </div>
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
      {posts && posts.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div>
                <span className="badge-gold mb-3 inline-block">Insights, Resources &amp; Conversations</span>
                <h2 className="text-3xl md:text-4xl font-bold text-navy">
                  Thoughts from the porch.
                </h2>
              </div>
              <Link
                to="/resources"
                className="text-primary font-semibold hover:underline inline-flex items-center"
              >
                Explore Insights
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/resources/insights/${post.slug}`}
                  className="group block"
                >
                  {post.cover_image_url ? (
                    <div className="aspect-[16/10] overflow-hidden rounded-xl mb-4 bg-muted">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] mb-4 bg-muted rounded-xl flex items-center justify-center">
                      <Lightbulb className="w-10 h-10 text-primary/40" />
                    </div>
                  )}
                  {post.categories?.[0] && (
                    <p className="text-body text-primary font-semibold uppercase tracking-wide mb-2">
                      {post.categories[0].title}
                    </p>
                  )}
                  <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy group-hover:text-primary transition-colors leading-snug mb-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-body -sm text-foreground/80 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* Final CTA                                                     */}
      {/* ============================================================ */}
      <ParallaxCTA
        backgroundImage={homeHero}
        eyebrow="GET CLARITY STARTING AT PHASE ZERO™"
        headline={
          <>
            Step onto the porch.&nbsp;Begin with&nbsp;
            <br />
            What <span className="text-raspberry font-bold">IF</span>.
          </>
        }
        description={
          <>
            The future isn't something organizations enter. It's something they author.
            <br />
            <br />
            The question is whether your organization is building the clarity,
            capability, and capacity required to pursue the future sh<span className="text-raspberry font-bold">IF</span>t you want to create next.
          </>
        }
        actions={[
          { label: "Open the Blue Door", to: "/blue-door", variant: "bluedoor" },
          { label: "Discover Your P.A.T.H.way", to: "/start-here", variant: "secondary" },
        ]}
      />
    </div>
  );
}
