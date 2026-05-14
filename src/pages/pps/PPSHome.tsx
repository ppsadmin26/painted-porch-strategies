import { Link } from "react-router-dom";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { useScrollAnimation, getAnimationClasses } from "@/hooks/useScrollAnimation";
import { useFeaturedPosts } from "@/hooks/useFeaturedPosts";
import ParallaxCTA from "@/components/pps/ParallaxCTA";
import ClientLogoMarquee from "@/components/pps/ClientLogoMarquee";
import homeHero from "@/assets/heroes/home-hero.jpg";
import { ArrowRight } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Reusable fade-in section wrapper                                          */
/* -------------------------------------------------------------------------- */
function FadeIn({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, isVisible, reducedMotion } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.15,
  });
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${getAnimationClasses(
        isVisible,
        reducedMotion,
      )} ${className}`}
    >
      {children}
    </div>
  );
}

/* Helper for "shIFt" with raspberry IF */
const ShIFt = () => (
  <>
    Sh<span className="text-raspberry">IF</span>t
  </>
);

/* -------------------------------------------------------------------------- */
/*  1. Hero — cinematic full-bleed with opaque image overlay                  */
/* -------------------------------------------------------------------------- */
function HeroSection() {
  return (
    <section
      aria-label="Phase Zero — the work before the work"
      className="relative min-h-[90vh] flex items-center overflow-hidden bg-navy"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${homeHero})` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/85 to-navy/75"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-transparent"
      />
      <div aria-hidden="true" className="absolute top-0 right-0 w-24 h-1 bg-gold" />
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 h-1 w-1/3 bg-gradient-to-r from-lime to-primary"
      />

      <div className="relative container max-w-5xl mx-auto px-6 py-24 md:py-32 text-white animate-fade-in">
        <p className="text-gold font-poppins font-semibold uppercase tracking-[0.2em] text-xs md:text-sm mb-2">
          Phase Zero<sup className="text-[0.55em] align-super">™</sup>
        </p>
        <p className="text-white/80 font-montserrat italic text-sm md:text-base tracking-wide mb-8">
          The Work Before the Work
        </p>
        <h1 className="font-poppins font-bold text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight mb-6 drop-shadow-lg">
          It&rsquo;s Time to Do
          <br />
          Epic <ShIFt />.
        </h1>
        <p className="font-poppins text-xl md:text-2xl text-gold/95 mb-10 italic">
          Before momentum outruns alignment.
        </p>
        <div className="space-y-5 max-w-2xl text-base md:text-lg text-white/90 leading-relaxed mb-10 font-light">
          <p>You aren&rsquo;t short on vision.</p>
          <p>Or resolve. Or experience. Or methodologies, frameworks, and advisors.</p>
          <p>You&rsquo;ve adopted and outgrown more than one.</p>
          <p>
            What&rsquo;s harder to find is clarity &mdash; the kind that comes
            before strategy hardens the direction, the announcement activates
            the initiative, and resources commit to what comes next.
          </p>
          <p>
            Because the question usually isn&rsquo;t whether your organization
            can execute. It&rsquo;s whether what you&rsquo;re building is
            aligned with what your organization is trying to become.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/blue-door"
            className="inline-flex items-center font-poppins font-semibold text-base px-8 py-4 rounded-full bg-bluedoor text-white hover:bg-bluedoor/90 transition-colors shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            Open the Blue Door
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
          <Link
            to="/start-here"
            className="inline-flex items-center font-poppins font-semibold text-base px-8 py-4 rounded-full bg-gold text-navy hover:bg-gold/90 transition-colors shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            Discover Your P.A.T.H.way
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  2. There's A Lot of ShIFt Happening Right Now                             */
/* -------------------------------------------------------------------------- */
function ShiftSection() {
  return (
    <section className="relative py-24 md:py-36 bg-muted overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full bg-raspberry/10 blur-3xl"
      />
      <FadeIn className="relative container max-w-3xl mx-auto px-6">
        <h2 className="font-poppins font-bold text-3xl md:text-5xl text-navy leading-tight mb-12 text-center">
          There&rsquo;s A Lot of <ShIFt /> Happening Right Now
          <span className="block text-2xl md:text-3xl text-charcoal/70 italic font-normal mt-3">
            (It&rsquo;s Not Just You&hellip;)
          </span>
        </h2>

        <div className="space-y-6 text-lg md:text-xl text-charcoal/85 leading-relaxed">
          <p>Sometimes it feels like every important conversation is happening at the same time.</p>
          <ul className="space-y-2 text-charcoal/80 pl-1">
            <li>The strategy conversation.</li>
            <li>The technology and AI conversation.</li>
            <li>The operational conversation.</li>
            <li>The leadership conversation.</li>
            <li>The culture conversation.</li>
          </ul>
          <p>And meanwhile, your organization is still trying to:</p>
          <ul className="space-y-2 text-charcoal/80 pl-1">
            <li>deliver results</li>
            <li>support people</li>
            <li>sustain growth</li>
            <li>maintain alignment</li>
            <li>adapt in real time</li>
          </ul>
          <p>
            Even successful organizations can start feeling stretched when
            priorities, expectations, systems, and pace are all evolving
            simultaneously.
          </p>
          <p>
            Which is why so many leaders find themselves asking (while lying
            awake at 3AM):
          </p>
        </div>

        <div className="mt-10 space-y-6">
          <blockquote className="font-poppins italic text-xl md:text-2xl text-navy border-l-4 border-raspberry pl-6">
            &ldquo;Are we solving the right problem&hellip;or just reacting to
            the loudest pressure?&rdquo;
          </blockquote>
          <blockquote className="font-poppins italic text-xl md:text-2xl text-navy border-l-4 border-raspberry pl-6">
            &ldquo;Are we aligned enough for this to actually work?&rdquo;
          </blockquote>
          <blockquote className="font-poppins italic text-xl md:text-2xl text-navy border-l-4 border-raspberry pl-6">
            &ldquo;Can our organization realistically sustain what comes
            next?&rdquo;
          </blockquote>
        </div>

        <div className="mt-10 space-y-6 text-lg md:text-xl text-charcoal/85 leading-relaxed">
          <p>Because often the issue isn&rsquo;t effort.</p>
          <p>
            It&rsquo;s that your organization has outgrown the structures,
            assumptions, or operating rhythms that once worked well enough to
            get here.
          </p>
          <p>
            And pushing harder in the wrong direction doesn&rsquo;t change the
            direction. It simply compounds the cost of getting there.
          </p>
        </div>
      </FadeIn>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  3. Phase Zero™                                                            */
/* -------------------------------------------------------------------------- */
function PhaseZeroSection() {
  return (
    <section className="relative py-24 md:py-36 bg-white overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-gold/10 blur-3xl"
      />
      <FadeIn className="relative container max-w-3xl mx-auto px-6">
        <p className="text-gold font-poppins font-semibold uppercase tracking-[0.2em] text-xs mb-4 text-center">
          The Clarity That Accelerates Your Next Big <ShIFt />
        </p>
        <h2 className="font-poppins font-bold text-4xl md:text-6xl text-navy leading-tight mb-12 text-center">
          Phase Zero
        </h2>

        <div className="space-y-3 text-lg md:text-xl text-charcoal/85 leading-relaxed mb-8">
          <p>Before another initiative is announced.</p>
          <p>Before another restructuring conversation kicks off.</p>
          <p>Before scaling something that already feels stretched or scattered.</p>
          <p>Before delivery is designed around assumptions that were never fully aligned.</p>
        </div>

        <p className="text-lg md:text-xl text-charcoal/85 leading-relaxed mb-6">
          Phase Zero exists to create clarity before your next major decision
          hardens into execution.
        </p>
        <p className="text-lg md:text-xl text-charcoal/85 leading-relaxed mb-10">
          It&rsquo;s the threshold work that helps your organization see itself
          clearly before determining what comes next.
        </p>

        <div className="space-y-6 mb-10">
          <div>
            <p className="font-poppins font-semibold text-navy text-base mb-1">Not just:</p>
            <p className="font-poppins italic text-2xl md:text-3xl text-charcoal/85">
              &ldquo;What should we do next?&rdquo;
            </p>
          </div>
          <div>
            <p className="font-poppins font-semibold text-navy text-base mb-1">But:</p>
            <p className="font-poppins italic text-2xl md:text-3xl text-charcoal/85">
              &ldquo;What is this organization actually trying to become?&rdquo;
            </p>
          </div>
          <div>
            <p className="font-poppins font-semibold text-navy text-base mb-1">And:</p>
            <p className="font-poppins italic text-2xl md:text-3xl text-charcoal/85">
              &ldquo;What would it take to make that future sustainable?&rdquo;
            </p>
          </div>
        </div>

        <div className="space-y-5 text-lg md:text-xl text-charcoal/85 leading-relaxed mb-10">
          <p>
            Because not every opportunity strengthens the organization
            pursuing it, and not every change creates the conditions needed to
            sustain what comes after it.
          </p>
          <p>
            Some organizations become exhausted not from lack of effort, but
            from the accumulated weight of unfinished work, competing
            priorities, fragmented initiatives, and directions that never
            fully aligned in the first place.
          </p>
        </div>

        <Link
          to="/phase-zero"
          className="inline-flex items-center font-poppins font-semibold text-base text-primary hover:text-primary/80 group"
        >
          Explore Phase Zero
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </FadeIn>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  4. The Blue Door Organizational Appraisal                                 */
/* -------------------------------------------------------------------------- */
function BlueDoorSection() {
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
  return (
    <section className="relative py-24 md:py-36 bg-navy text-white overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full bg-bluedoor/30 blur-3xl"
      />
      <FadeIn className="relative container max-w-4xl mx-auto px-6">
        <p className="text-gold font-poppins font-semibold uppercase tracking-[0.2em] text-xs mb-4 text-center">
          A Different Kind of Strategic Conversation
        </p>
        <h2 className="font-poppins font-bold text-4xl md:text-6xl leading-tight mb-12 text-center">
          The Blue Door <span className="block text-2xl md:text-3xl text-white/70 font-normal mt-3 italic">Organizational Appraisal</span>
        </h2>

        <div className="space-y-5 text-lg md:text-xl text-white/85 leading-relaxed mb-10">
          <p>
            The Blue Door was designed for organizations seeking clarity
            before committing to what comes next.
          </p>
          <p>Not because something has already failed.</p>
          <p>Or because your leadership lacks capability.</p>
          <p>And certainly not because your organization isn&rsquo;t working hard enough.</p>
          <p>
            Most organizations already have talented people, strong
            intentions, and teams pushing hard toward meaningful goals.
          </p>
          <p>But effort alone doesn&rsquo;t always create coherence.</p>
          <p>The Blue Door gives clarity around:</p>
          <ul className="space-y-2 pl-1 text-white/80">
            <li>which shifts your organization is realistically positioned to carry</li>
            <li>where tension, strain, or fragmentation may already be surfacing</li>
            <li>what conditions need strengthening before momentum compounds complexity</li>
            <li>where sustainability matters more than speed</li>
            <li>which directions are aligned with what your organization is actually becoming</li>
          </ul>
          <p>This isn&rsquo;t an organizational health assessment or a readiness score.</p>
          <p>
            It&rsquo;s a structured reflection process designed to clarify
            what kind of change your organization can confidently execute
            before major pivots become active pursuit.
          </p>
        </div>

        <h3 className="font-poppins font-bold text-2xl md:text-3xl text-gold mb-8 mt-16">
          What You&rsquo;ll Discover
        </h3>
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {discover.map((d) => (
            <div key={d.title} className="border-l-2 border-bluedoor/60 pl-5">
              <p className="font-poppins font-semibold text-lg text-white mb-2 leading-snug">
                {d.title}
              </p>
              <p className="text-white/75 leading-relaxed">{d.copy}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/blue-door"
            className="inline-flex items-center font-poppins font-semibold text-base px-8 py-4 rounded-full bg-bluedoor text-white hover:bg-bluedoor/90 transition-colors shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            Open the Blue Door
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  5. Discover Your P.A.T.H.way                                              */
/* -------------------------------------------------------------------------- */
function PathwaysSection() {
  return (
    <section className="relative py-24 md:py-36 bg-white">
      <FadeIn className="container max-w-5xl mx-auto px-6">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <h2 className="font-poppins font-bold text-4xl md:text-6xl text-navy leading-tight mb-8">
            Discover Your P.A.T.H.way
          </h2>
          <div className="space-y-5 text-lg md:text-xl text-charcoal/85 leading-relaxed text-left">
            <p>
              Not everyone arrives at the Painted Porch navigating the same
              kind of challenge or asking the same kinds of questions.
            </p>
            <p>
              You may be exploring how to communicate, lead, collaborate, and
              navigate change more intentionally in the work you&rsquo;re
              already doing.
            </p>
            <p>
              Or you&rsquo;re trying to answer larger organizational questions
              around growth, alignment, leadership capacity, technology
              integration, and what your organization is realistically ready
              to take on next.
            </p>
            <p>
              Discover Your P.A.T.H.way is designed as your compass for where
              to begin.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Link
            to="/start-here"
            className="group block p-10 border-l-4 border-gold bg-muted/40 hover:bg-muted/70 transition-colors"
          >
            <p className="text-gold font-poppins font-semibold uppercase tracking-[0.15em] text-xs mb-4">
              For Yourself
            </p>
            <h3 className="font-poppins font-bold text-2xl text-navy mb-4 leading-snug">
              Exploring for Yourself?
            </h3>
            <p className="text-charcoal/80 leading-relaxed mb-6">
              Courses, assessments, masterclasses, and self-guided tools
              through IGNITE.
            </p>
            <span className="inline-flex items-center text-sm font-semibold text-navy group-hover:text-gold transition-colors">
              Discover Your P.A.T.H.way
              <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/blue-door"
            className="group block p-10 border-l-4 border-primary bg-muted/40 hover:bg-muted/70 transition-colors"
          >
            <p className="text-primary font-poppins font-semibold uppercase tracking-[0.15em] text-xs mb-4">
              For Your Team
            </p>
            <h3 className="font-poppins font-bold text-2xl text-navy mb-4 leading-snug">
              Exploring for Your Team or Organization?
            </h3>
            <p className="text-charcoal/80 leading-relaxed mb-6">
              Organizational clarity, strategic alignment, and the Blue Door
              experience.
            </p>
            <span className="inline-flex items-center text-sm font-semibold text-navy group-hover:text-primary transition-colors">
              Open the Blue Door
              <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  6. Foundation — Our Painted Porch                                         */
/* -------------------------------------------------------------------------- */
function FoundationSection() {
  const pillars = [
    {
      label: "Cultural Cornerstone",
      copy: "Your leadership, culture, values, and the relational architecture that shape how your organization leads, decides, and evolves.",
      color: "border-l-primary",
    },
    {
      label: "Operational Frame",
      copy: "Your systems, workflows, structures, and decision pathways that move strategy from intention into reality.",
      color: "border-l-lime",
    },
    {
      label: "Living Ecosystem",
      copy: "Your individual and collective capacity, judgment, communication, resilience, and mindset needed to sustain meaningful shIFt.",
      color: "border-l-raspberry",
    },
  ];
  return (
    <section className="relative py-24 md:py-36 bg-muted/60 overflow-hidden">
      <FadeIn className="relative container max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-primary font-poppins font-semibold uppercase tracking-[0.2em] text-xs mb-4">
            The Foundation Beneath the Movement
          </p>
          <h2 className="font-poppins font-bold text-4xl md:text-5xl text-navy leading-tight">
            Our Painted Porch
          </h2>
        </div>

        <div className="space-y-5 text-lg md:text-xl text-charcoal/85 leading-relaxed mb-12">
          <p>Over time, we&rsquo;ve noticed a simple, complex pattern:</p>
          <p className="font-poppins italic text-2xl text-navy">
            Change is easier to start than it is to sustain &mdash;
            especially when people, systems, leadership, and expectations are
            all trying to evolve at the same time.
          </p>
          <p>
            Most organizations already know how to launch initiatives.
          </p>
          <p>
            What&rsquo;s harder is building the clarity, alignment, and
            organizational architecture required to sustain what comes after
            the launch.
          </p>
          <p>
            Everything at Painted Porch Strategies is designed around one
            central idea:
          </p>
          <p className="font-poppins italic text-2xl text-navy">
            Sustainable movement requires more than momentum.
          </p>
          <p>
            Clarity is the catalyst for what gets decided, what moves forward,
            and what happens next.
          </p>
        </div>

        <div className="mb-12">
          <p className="font-poppins font-bold text-2xl text-navy mb-3">P.A.T.H.</p>
          <p className="text-lg text-charcoal/85 leading-relaxed">
            A way of thinking about and navigating intentional, sustainable
            progress:{" "}
            <em className="not-italic font-semibold text-navy">
              Prepare &rarr; Align &rarr; Take Off &rarr; Habits
            </em>
          </p>
        </div>

        <div className="mb-12">
          <p className="font-poppins font-bold text-2xl text-navy mb-3">
            Painted Porch Pillars
          </p>
          <p className="text-lg text-charcoal/85 leading-relaxed mb-8">
            Three dimensions that influence and impact what your organization
            is built to carry.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((p) => (
              <div
                key={p.label}
                className={`bg-white p-6 border-l-4 ${p.color} shadow-sm`}
              >
                <p className="font-poppins font-bold text-lg text-navy mb-3">
                  {p.label}
                </p>
                <p className="text-charcoal/80 leading-relaxed text-sm">
                  {p.copy}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <p className="font-poppins font-bold text-2xl text-navy mb-3">
            Essential Elements
          </p>
          <p className="text-lg text-charcoal/85 leading-relaxed">
            The everyday human behaviors and conditions that influence whether
            change actually sticks: communication, collaboration, clarity,
            resilience, alignment, and organizational health.
          </p>
        </div>

        <div>
          <p className="font-poppins font-bold text-2xl text-navy mb-3">
            The Fortified Porch
          </p>
          <p className="text-lg text-charcoal/85 leading-relaxed">
            When all three Pillars are load-bearing, and all elements are
            executing, your organization becomes capable of authoring change
            and continually evolving, rather than constantly absorbing
            fragmentation and fixing disruption.
          </p>
        </div>
      </FadeIn>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  7. Painted Porch Partnership + Promise                                    */
/* -------------------------------------------------------------------------- */
function PartnershipSection() {
  return (
    <section className="relative py-24 md:py-36 bg-white overflow-hidden">
      <FadeIn className="container max-w-3xl mx-auto px-6">
        <h2 className="font-poppins font-bold text-4xl md:text-6xl text-navy leading-tight mb-12 text-center">
          Painted Porch Partnership
        </h2>

        <div className="space-y-5 text-lg md:text-xl text-charcoal/85 leading-relaxed mb-10">
          <p>
            There are moments when the decisions in front of your
            organization begin carrying broader consequences: for people,
            systems, leadership, culture, capacity, operations, and the
            future direction of the organization itself.
          </p>
          <p>Especially during periods of:</p>
          <ul className="space-y-2 pl-1 text-charcoal/80">
            <li>growth that feels increasingly complex</li>
            <li>moments of strategic inflection</li>
            <li>organizational stretching</li>
            <li>leadership alignment challenges</li>
            <li>AI-era transformation pressure</li>
            <li>questions about what sustainable evolution actually looks like from here</li>
          </ul>
          <p>
            At that level, clarity becomes more than a leadership preference
            and isn&rsquo;t solved by another quick-win workshop, framework,
            or implementation sprint.
          </p>
          <p>
            It becomes part of what determines whether your change strengthens
            alignment or creates operational drift you later have to untangle.
          </p>
          <p>
            We work alongside organizations during these kinds of moments:
            inside the clarity, alignment, structure, and deeper design
            conversations that shape what <ShIFt /> happens next.
          </p>
        </div>

        <h3 className="font-poppins font-bold text-2xl md:text-3xl text-navy mb-6">
          Our Partnership Promise
        </h3>
        <div className="space-y-5 text-lg md:text-xl text-charcoal/85 leading-relaxed">
          <p>
            Most transformation initiatives are structured to build momentum
            first, beginning with the question of what to do &mdash; finding
            the yes, framing the yes, scoping the yes &mdash; even when the
            honest answer is something else.
          </p>
          <p>
            Painted Porch Strategies isn&rsquo;t built that way. We
            aren&rsquo;t here to tell you yes. We&rsquo;re here to tell you
            what will actually work, and what it will take to make it happen.
            The question we begin with is whether what&rsquo;s being
            considered is the right thing to do right now. We ask it before
            strategy, before scope, before signing.
          </p>
          <div className="space-y-4 pl-6 border-l-2 border-gold/60">
            <p>
              <strong className="text-navy">If the answer is yes</strong>,
              we get to work with you on what it takes to author and shape
              your next shift.
            </p>
            <p>
              <strong className="text-navy">If the answer is not yet</strong>,
              we tell you and provide a pathway to action.
            </p>
            <p>
              <strong className="text-navy">If the answer is not us</strong>,
              we tell you that, too, and connect you with the right partner
              for your stage and needs.
            </p>
          </div>
          <p>
            <strong className="text-navy">That&rsquo;s the Painted Porch promise:</strong>{" "}
            full transparency about what will work, and the truth about what
            it takes to make it happen.
          </p>
        </div>
      </FadeIn>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  8. Insights, Resources & Conversations                                    */
/* -------------------------------------------------------------------------- */
function InsightsSection() {
  const { data: posts } = useFeaturedPosts(3);

  return (
    <section className="py-24 md:py-32 bg-muted/40">
      <FadeIn className="container max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mb-14">
          <p className="text-primary font-poppins font-semibold uppercase tracking-[0.2em] text-xs mb-4">
            Insights, Resources &amp; Conversations
          </p>
          <h2 className="font-poppins font-bold text-3xl md:text-5xl text-navy leading-tight mb-8">
            Some conversations stay with us long after they end.
          </h2>
          <div className="space-y-5 text-lg text-charcoal/85 leading-relaxed">
            <p>
              A question someone asked in a workshop. A tension pattern that
              keeps resurfacing across organizations. An &lsquo;ah ha&rsquo;
              we couldn&rsquo;t stop thinking about on a long drive, in the
              shower, or in conversation on our porch.
            </p>
            <p>
              Painted Porch explores the realities many organizations and
              leaders are navigating &mdash; through essays, strategic
              conversations, practical tools, speaking engagements, long-form
              YouTube discussions, and observations from inside the work
              itself.
            </p>
          </div>
        </div>

        {posts && posts.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/resources/insights/${post.slug}`}
                className="group block"
              >
                {post.cover_image_url ? (
                  <div className="aspect-[16/10] overflow-hidden mb-4 bg-muted">
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/10] mb-4 bg-muted" />
                )}
                {post.categories?.[0] && (
                  <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-2">
                    {post.categories[0].title}
                  </p>
                )}
                <h3 className="font-poppins font-semibold text-xl text-navy group-hover:text-primary transition-colors leading-snug mb-2">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-charcoal/70 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}

        <Link
          to="/resources"
          className="inline-flex items-center font-poppins font-semibold text-base text-primary hover:text-primary/80 group"
        >
          Explore Insights
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </FadeIn>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  9. Final reflective section (precedes ParallaxCTA)                        */
/* -------------------------------------------------------------------------- */
function FinalReflectionSection() {
  return (
    <section className="relative py-28 md:py-40 bg-white overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gold/8 blur-3xl"
      />
      <FadeIn className="relative container max-w-3xl mx-auto px-6 text-center">
        <div className="space-y-8 text-xl md:text-2xl text-charcoal/85 leading-relaxed font-light">
          <p>The question is not simply what comes next.</p>
          <p className="font-poppins italic text-2xl md:text-3xl text-navy">
            The question is what your organization is becoming &mdash; and
            whether what you&rsquo;re about to commit to is the work that will
            actually make that future possible.
          </p>
          <p>Because organizations rarely struggle from a lack of effort.</p>
          <p>
            More often, they struggle from fragmented priorities, unfinished
            work, and momentum committed before clarity is fully formed.
          </p>
          <p>The future will keep asking your organization to evolve.</p>
          <p className="font-poppins italic text-2xl md:text-3xl text-navy">
            The question is whether you&rsquo;ll do it in ways you can
            actually sustain together.
          </p>
        </div>
      </FadeIn>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */
export default function PPSHome() {
  useDocumentSeo({
    title: "Painted Porch Strategies | It's Time to Do Epic ShIFt",
    description:
      "Phase Zero is the work before the work. Clarity, alignment, and sustainable movement before momentum outruns alignment.",
  });

  return (
    <div className="bg-white">
      <HeroSection />
      <ShiftSection />
      <PhaseZeroSection />
      <BlueDoorSection />
      <PathwaysSection />
      <FoundationSection />
      <PartnershipSection />
      <InsightsSection />
      <ClientLogoMarquee />
      <FinalReflectionSection />
      <ParallaxCTA
        backgroundImage={homeHero}
        eyebrow="Phase Zero™"
        headline={
          <>
            Step onto the porch. Begin the <span className="text-raspberry">IF</span>.
          </>
        }
        description="Open the Blue Door — a structured reflection process to clarify what your organization is realistically positioned to lead next."
        actions={[
          { label: "Open the Blue Door", to: "/blue-door", variant: "primary" },
          { label: "Discover Your P.A.T.H.way", to: "/start-here", variant: "secondary" },
        ]}
      />
    </div>
  );
}
