import { Link } from "react-router-dom";
import PartnershipPromise from "@/components/pps/PartnershipPromise";
import { Building2, Compass, Brain, ArrowRight, CheckCircle, XCircle, DoorOpen, Route, Users } from "lucide-react";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { useScrollAnimation, getAnimationClasses } from "@/hooks/useScrollAnimation";
import ParallaxCTA from "@/components/pps/ParallaxCTA";
import CostCalculatorDialog from "@/components/pps/blue-door/CostCalculatorDialog";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import HandwrittenUnderline from "@/components/pps/HandwrittenUnderline";
import blueDoorHero from "@/assets/blue-door-hero.jpg";
import phaseZeroHero from "@/assets/heroes/phase-zero-hero.jpg";
import { Eyebrow } from "@/components/pps/Eyebrow";

function FadeIn({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible, reducedMotion } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${getAnimationClasses(isVisible, reducedMotion)} ${className}`}
    >
      {children}
    </div>
  );
}

const ShIFt = ({ lowercase = false }: { lowercase?: boolean }) => (
  <>
    {lowercase ? "sh" : "Sh"}<span className="text-raspberry font-bold">IF</span>t
  </>
);

const isIsNot = {
  is: [
    "A clear look at what your organization is realistically equipped to undertake right now.",
    "Deep questions about leadership, systems, and people before money or momentum gets locked in.",
    "The design phase that decides whether your next big move strengthens you or stretches you thin.",
    "The point where organizational identity becomes strategic direction.",
  ],
  isNot: [
    "A readiness score or a health check.",
    "A template, a deck, or a one-size playbook.",
    "Training, coaching, or a workshop.",
  ],
};

const pillars = [
  {
    icon: Building2,
    title: "Cultural Cornerstone",
    subtitle: "Leadership & Culture",
    border: "border-l-navy",
    bg: "bg-[hsl(220,60%,95%)]",
    iconBg: "bg-[hsl(220,50%,90%)]",
    accent: "text-navy",
    definition:
      "Your leaders, your culture, your values, and the way people work together. This is the pillar of progress that decides how your organization leads, decides, and grows.",
    questions: [
      "Can our leaders shape direction, or are they only reacting to pressure?",
      "Will our culture support this change, or quietly (or loudly) push against it?",
      "Do we have a clear way leaders make decisions together?",
    ],
    outcomes: [
      "Leaders who design change on purpose, not by accident.",
      "A culture that helps change stick instead of pulling it apart.",
      "Strategic muscle at the top of the organization.",
    ],
  },
  {
    icon: Compass,
    title: "Operational Frame",
    subtitle: "Workflows & Systems",
    border: "border-l-strategic",
    bg: "bg-strategic/10",
    iconBg: "bg-strategic/15",
    accent: "text-strategic",
    definition:
      "Your systems, workflows, and decision pathways. This pillar of process is how strategy actually moves through the building and turns into real work.",
    questions: [
      "Do our workflows support the position we want to lead in our market?",
      "Are our systems built for value, or just for speed?",
      "Can our operations carry a real change, or will they crack under it?",
    ],
    outcomes: [
      "Operations that move strategy forward instead of slowing it down.",
      "Workflows designed for value, not just activity.",
      "Systems that can support real transformation.",
    ],
  },
  {
    icon: Brain,
    title: "Living Ecosystem",
    subtitle: "Human Capacity",
    border: "border-l-gold",
    bg: "bg-gold/10",
    iconBg: "bg-gold/15",
    accent: "text-gold",
    definition:
      "The judgment, communication, resilience, and mindset your people bring to the work. This is the pillar of people that decides whether change holds up over time.",
    questions: [
      "Can our people navigate the unknown, or only follow set steps?",
      "Is good judgment spread through the organization, or stuck at the top?",
      "Do we have the human capacity to adapt, not just to execute?",
    ],
    outcomes: [
      "People who can move through ambiguity with confidence.",
      "Judgment shared at the right levels across the organization.",
      "Real adaptive capacity in moments of uncertainty or when circumstances change.",
    ],
  },
];

const essentialElements: { label: string; href: string }[] = [
  { label: "Communication", href: "/communication" },
  { label: "Collaboration", href: "/extraordinary-teams" },
  { label: "Clarity", href: "/blue-door" },
  { label: "Resilience", href: "/radical-mindfulness" },
  { label: "Alignment", href: "/working-genius" },
  { label: "Organizational Health", href: "/eq" },
];

const wherePhaseZeroLeads = [
  {
    icon: DoorOpen,
    title: "The Blue Door",
    body: "A structured organizational appraisal that reveals how your organization is performing across the three Pillars before additional resources are committed in the wrong direction.",
    to: "/blue-door",
    cta: "Open the Blue Door",
    accent: "text-bluedoor",
    border: "border-bluedoor",
  },
  {
    icon: Route,
    title: "Your P.A.T.H.way",
    body: "A short quiz that points you to the right starting place on your P.A.T.H. to authoring, leading, and creating lasting shift in life, at work, and anywhere in between.",
    to: "/start-here",
    cta: "Find Your P.A.T.H.way",
    accent: "text-primary",
    border: "border-primary",
  },
  {
    icon: Users,
    title: "Strategic Partnership",
    body: (
      <>
        Ongoing partnership to strengthen the organizational capability and capacity required to design and deliver epic <ShIFt lowercase />.
      </>
    ),
    to: "/partner",
    cta: "Explore Partnership",
    accent: "text-gold",
    border: "border-gold",
  },
];

export default function PhaseZero() {
  useDocumentSeo({
    title: "Phase Zero™ | The Work Before the Work | Painted Porch Strategies",
    description:
      "Phase Zero is the work before the work. It is where leaders get clear about people, systems, and culture before the next big shift begins.",
  });

  return (
    <div className="bg-white">
      {/* Hero */}
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            The Work Before the Work
          </span>
        }
        headline={
          <>
            Phase Zero<sup className="text-[0.4em] align-super">™</sup>
          </>
        }
        description={
          <>
            <p className="text-lead mb-4">
              Before the kickoff. Before the rollout. Before the next big sh<span className="text-raspberry font-bold">IF</span>t.
            </p>
            <p className="text-lead text-white/85">
              Phase Zero is the first act of becoming. It’s the threshold work that
              reveals what your organization actually has the architecture to lead
              - before you commit the resources, time, and credibility to design
              toward making it happen.
            </p>
          </>
        }
        ctas={[
          { label: "Open the Blue Door", href: "/blue-door", buttonClassName: "bg-bluedoor border-2 border-bluedoor text-white hover:bg-white hover:text-bluedoor" },
          { label: "See Where You'd Start", href: "/start-here" },
        ]}
        background={{ type: "image", src: phaseZeroHero }}
        overlayClass="bg-navy/55"
        minHeightClass="min-h-[60vh]"
      />

      {/* Why Phase Zero Exists */}
      <section className="py-16 md:py-24 bg-muted/40">

        <FadeIn className="container max-w-3xl mx-auto px-6">
          <Eyebrow variant="plain" tone="raspberry" as="p">Why Phase Zero Exists</Eyebrow>
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy leading-tight mb-6">
            Not every opportunity strengthens the organization chasing it.
          </h2>
          <div className="space-y-5 text-lg md:text-xl text-charcoal/85 leading-relaxed">
            <p className="text-body">And not every change fortifies the future it's intended to create.</p>
            <p className="text-body">
              The friction you're feeling isn't a lack of effort. It’s what happens when you ask an organization to carry a new future on an old foundation. Pushing harder in the wrong direction doesn't accelerate transformation; it just compounds the cost of getting there.
            </p>
            <p className="text-body">
              Phase Zero is the pause that prevents that cost. A deliberate stop, before
              the next big <ShIFt lowercase />&nbsp;hardens into execution, to examine what deserves pursuit, where strain already exists, and what direction makes the most sense from where you are today...and who and what you want to become tomorrow.
            </p>
          </div>
          <p className="text-pullquote mt-10 not-italic font-poppins font-semibold text-navy leading-relaxed" data-body-allow>
            The frustration that surfaces in moments like this is rarely random. <span className="text-raspberry">It's a signal.</span>
          </p>
        </FadeIn>
      </section>

      {/* P.A.T.H. context strip */}
      <section className="py-8 md:py-10 bg-primary/5 border-y border-primary/10">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 text-center md:text-left">
            <div className="flex-1">
              <Eyebrow variant="plain" tone="primary" as="p">Where Phase Zero Fits</Eyebrow>
              <p className="text-body text-foreground">
                Phase Zero is the <span className="font-semibold text-primary">Prepare</span> stage of our P.A.T.H. methodology, the clarity work that comes before Align, Take Off, and Habits.
              </p>
            </div>
            <Link
              to="/about/approach#path"
              className="flex-shrink-0 inline-flex items-center gap-2 text-primary font-poppins font-semibold hover:underline"
            >
              See the full P.A.T.H. <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>


      {/* The work before the work */}
      <section className="py-16 md:py-24 bg-white">
        <FadeIn className="container max-w-3xl mx-auto px-6">
          <Eyebrow variant="plain" tone="gold" as="p">The Work Before the Work</Eyebrow>
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy leading-tight mb-6">
            Phase Zero is where the real choices get made.
          </h2>
          <p className="text-body text-charcoal/85 mb-5">
            It's the phase where you determine what's worth committing your
            time, energy, resources, and credibility toward.&nbsp;Not what to
            copy or catch up to, but what to{" "}
            <strong className="font-bold">author</strong>.
          </p>
          <p className="text-body text-charcoal/85">
            That sounds simple; it's not. Teams often skip it because the
            pressure to move feels heavier than the cost of moving in the
            wrong direction.
          </p>
          <p className="text-body font-poppins text-navy mt-10 border-l-4 border-gold pl-6">
            <em>"Are we designing our next move, or reacting to someone else's?"</em>
          </p>
        </FadeIn>
      </section>

      {/* What Phase Zero is not */}
      <section className="py-16 md:py-24 bg-muted/60">
        <FadeIn className="container max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <Eyebrow variant="plain" tone="raspberry" as="p">Clear About the Work</Eyebrow>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy leading-tight">
              What Phase Zero{" "}
              <HandwrittenUnderline color="hsl(var(--lime))" delay={300} duration={800}>
                is
              </HandwrittenUnderline>
              , and what it is{" "}
              <HandwrittenUnderline color="hsl(var(--raspberry))" delay={1200} duration={900}>
                not
              </HandwrittenUnderline>
              .
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-7 border-t-4 border-lime shadow-sm">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-lime mb-4">
                Phase Zero is:
              </h3>
              <ul className="space-y-3">
                {isIsNot.is.map((s) => (
                  <li key={s} className="text-body flex items-start gap-3 text-foreground leading-relaxed">
                    <CheckCircle className="w-5 h-5 text-lime flex-shrink-0 mt-1" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl p-7 border-t-4 border-raspberry shadow-sm">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-raspberry mb-4">
                Phase Zero is not:
              </h3>
              <ul className="space-y-3">
                {isIsNot.isNot.map((s) => (
                  <li key={s} className="text-body flex items-start gap-3 text-foreground leading-relaxed">
                    <XCircle className="w-5 h-5 text-raspberry flex-shrink-0 mt-1" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>
        <FadeIn className="container max-w-3xl mx-auto px-6 mt-16">
          <div className="rounded-2xl border border-raspberry/20 bg-white p-6 md:p-8 shadow-sm">
            <p className="text-body font-poppins font-semibold uppercase tracking-[0.18em] text-raspberry mb-2">
              See the cost in your own numbers
            </p>
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-3 leading-tight">
              The hidden cost of misalignment and building before clarity
            </h3>
            <p className="text-body text-charcoal/85 mb-5">
              Plug in your team size and initiative budget to see the industry-benchmarked
              cost of misaligned change, and what's recoverable when you start with Phase Zero.
            </p>
            <CostCalculatorDialog
              triggerLabel="Calculate the cost of skipping Phase Zero"
              triggerVariant="default"
              triggerClassName="bg-raspberry text-white hover:bg-raspberry/90"
            />
          </div>
        </FadeIn>
      </section>

      {/* Foundations Phase Zero Examines */}
      <section id="pillars" className="py-20 md:py-28 bg-white scroll-mt-24">
        <div className="container max-w-7xl mx-auto px-6">
          <FadeIn className="text-center max-w-3xl mx-auto mb-12">
            <Eyebrow variant="plain" tone="gold" as="p">
              PAINTED PORCH PILLARS: WHAT PHASE ZERO FORTIFIES
            </Eyebrow>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy leading-tight mb-6">
              The Foundations Beneath Every ShIFt
            </h2>
            <p className="text-body text-foreground">
              Every organization relies on three foundational structures. When
              one is weak, progress becomes harder to maintain. When all three are
              strong, change has something solid to build upon. Phase Zero
              examines and fortifies each one.
            </p>
          </FadeIn>

          {/* Pillar Cards */}
          <div className="grid lg:grid-cols-3 lg:grid-rows-[auto_auto_1fr_auto] gap-6 mb-16">
            {pillars.map((p) => (
              <FadeIn
                key={p.title}
                className={`${p.bg} p-6 rounded-xl border-l-4 ${p.border} h-full flex flex-col gap-y-5 lg:grid lg:grid-rows-subgrid lg:row-span-4`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${p.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <p.icon className={`w-6 h-6 ${p.accent}`} />
                  </div>
                  <div>
                    <h3 className={`text-xl md:text-2xl font-poppins font-semibold ${p.accent} leading-tight`}>
                      {p.title}
                    </h3>
                    <p className="text-body -sm text-muted-foreground">{p.subtitle}</p>
                  </div>
                </div>

                <p className="text-body -sm text-foreground">
                  {p.definition}
                </p>

                <div>
                  <h4 className="text-base md:text-lg font-semibold text-navy mb-2">The Questions:</h4>
                  <ul className="space-y-1.5">
                    {p.questions.map((q, i) => (
                      <li key={i} className="text-body -sm text-foreground flex items-start gap-2 italic">
                        <span className={`${p.accent} mt-1 not-italic`}>•</span>
                        <span>&ldquo;{q}&rdquo;</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-base md:text-lg font-semibold text-navy mb-2">Strong Foundation Looks Like:</h4>
                  <ul className="space-y-1.5">
                    {p.outcomes.map((o, i) => (
                      <li key={i} className="text-body -sm text-foreground flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-lime flex-shrink-0 mt-0.5" />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Essential Elements */}
          <FadeIn className="bg-muted/50 border border-navy/5 rounded-2xl p-6 md:p-10 mb-10">
            <div className="text-center mb-6">
              <Eyebrow variant="plain" tone="gold" as="p">The Behavioral Bedrock</Eyebrow>
              <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-3">
                Essential Elements
              </h3>
              <p className="text-body text-foreground/80 max-w-2xl mx-auto">
                Under all three Pillars sit the behaviors that determine whether organizations simply react to the future or are capable of authoring it.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {essentialElements.map((el) => (
                <Link
                  key={el.label}
                  to={el.href}
                  className="bg-white text-navy font-poppins font-medium text-sm px-4 py-2 rounded-full border border-navy/10 hover:border-primary hover:text-primary hover:shadow-sm transition-all"
                >
                  {el.label}
                </Link>
              ))}
            </div>
          </FadeIn>

          {/* The Fortified Porch */}
          <FadeIn>
            <div className="bg-gradient-to-br from-navy to-navy/90 text-white rounded-2xl p-8 md:p-12 text-center shadow-xl border-b-4 border-gold">
              <Eyebrow variant="plain" tone="gold" as="p">The Result</Eyebrow>
              <h3 className="text-xl md:text-2xl font-poppins font-bold text-white mb-4">
                The Fortified Porch
              </h3>
              <p className="text-body text-white/90 max-w-2xl mx-auto">
                When the three Pillars stand strong and the Essential
                Elements show up every day, organizations gain the <strong className="text-gold">capability, capacity, and confidence to author whatever comes next.</strong>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Where Phase Zero leads */}
      <section className="py-20 md:py-24 bg-muted">
        <div className="container max-w-7xl mx-auto px-6">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <Eyebrow variant="plain" tone="primary" as="p">Where Phase Zero Leads</Eyebrow>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy leading-tight">
              Three clear ways to begin.
            </h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {wherePhaseZeroLeads.map((w) => (
              <FadeIn
                key={w.title}
                className={`bg-white rounded-xl p-7 border-t-4 ${w.border} shadow-sm flex flex-col`}
              >
                <w.icon className={`w-9 h-9 ${w.accent} mb-4`} />
                <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-3">
                  {w.title}
                </h3>
                <p className="text-body text-foreground leading-relaxed mb-5 flex-grow">
                  {w.body}
                </p>
                <Link
                  to={w.to}
                  className={`inline-flex items-center gap-1.5 font-poppins font-semibold text-sm ${w.accent} hover:underline`}
                >
                  {w.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <ParallaxCTA
        backgroundImage={blueDoorHero}
        overlayClass="bg-gradient-to-b from-navy/75 via-navy/60 to-navy/45"
        eyebrow="GET CLARITY STARTING AT PHASE ZERO™"
        headline="Every future begins with a clearer understanding of who you're becoming."
        description="A structured organizational appraisal that shows where you stand across the three Pillars before you spend another dollar on shIFt you're not (yet) built to make happen."
        actions={[
          { label: "Open the Blue Door", to: "/blue-door", variant: "bluedoor" },
          { label: "Find Your P.A.T.H.way", to: "/start-here", variant: "secondary" },
        ]}
      />
      <PartnershipPromise />
    </div>
  );
}
