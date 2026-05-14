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

/* -------------------------------------------------------------------------- */
/*  1. Hero — cinematic full-bleed with opaque image overlay                  */
/* -------------------------------------------------------------------------- */
function HeroSection() {
  return (
    <section
      aria-label="Phase Zero — the work before the work"
      className="relative min-h-[85vh] flex items-center overflow-hidden bg-navy"
    >
      {/* Image */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${homeHero})` }}
      />
      {/* Heavy navy overlay (left → right gradient, dense for editorial mood) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/85 to-navy/75"
      />
      {/* Warm cream wash from bottom (porch-light glow) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-cream/20 via-transparent to-transparent"
      />
      {/* Gold hairline accent (top right) */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 w-24 h-1 bg-gold"
      />
      {/* Bottom accent strip — lime → teal */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 h-1 w-1/3 bg-gradient-to-r from-lime to-primary"
      />

      <div className="relative container max-w-5xl mx-auto px-6 py-24 md:py-32 text-white animate-fade-in">
        <p className="text-gold font-poppins font-semibold uppercase tracking-[0.2em] text-xs md:text-sm mb-6 drop-shadow">
          Phase Zero<sup className="text-[0.55em] align-super">™</sup> &nbsp;:&nbsp; The Work Before the Work
        </p>
        <h1 className="font-poppins font-bold text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight mb-8 drop-shadow-lg">
          It&rsquo;s Time to Do
          <br />
          Epic Sh<span className="text-raspberry">IF</span>t.
        </h1>
        <p className="text-lg md:text-2xl text-white/90 max-w-2xl leading-relaxed font-light mb-10 drop-shadow">
          Most change initiatives don&rsquo;t fail at execution. They fail at
          alignment. We partner with leaders to architect the conditions for
          change <em className="not-italic font-medium text-gold">before</em> a
          single tool gets launched.
        </p>
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
/*  2. The Shift Happening                                                    */
/* -------------------------------------------------------------------------- */
function ShiftSection() {
  return (
    <section className="relative py-24 md:py-32 bg-muted overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full bg-raspberry/10 blur-3xl"
      />
      <FadeIn className="relative container max-w-3xl mx-auto px-6 text-center">
        <p className="text-primary font-poppins font-semibold uppercase tracking-[0.2em] text-xs mb-6">
          The Shift Happening
        </p>
        <h2 className="font-poppins font-bold text-4xl md:text-6xl text-navy leading-tight mb-8">
          Momentum is not the same as alignment.
        </h2>
        <p className="text-lg md:text-xl text-charcoal/80 leading-relaxed mb-6">
          Your team is busy. Your roadmap is full. The tools are launching on
          time. And still, something feels off &mdash; like the engine is loud
          but the wheels aren&rsquo;t pointed in the same direction.
        </p>
        <blockquote className="text-2xl md:text-3xl font-poppins italic text-navy mt-12 border-l-4 border-raspberry pl-6 text-left">
          &ldquo;People don&rsquo;t resist change. They resist being changed.&rdquo;
        </blockquote>
      </FadeIn>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  3. Phase Zero (the only ™ on this page besides the hero)                 */
/* -------------------------------------------------------------------------- */
function PhaseZeroSection() {
  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-gold/10 blur-3xl"
      />
      <FadeIn className="relative container max-w-4xl mx-auto px-6">
        <div className="grid md:grid-cols-[auto_1fr] gap-10 items-start">
          <div className="md:border-r-2 md:border-gold md:pr-10">
            <p className="text-gold font-poppins font-semibold uppercase tracking-[0.2em] text-xs mb-3">
              The Work Before
            </p>
            <h2 className="font-poppins font-bold text-4xl md:text-5xl text-navy leading-tight">
              Phase&nbsp;Zero
            </h2>
          </div>
          <div>
            <p className="text-lg md:text-xl text-charcoal/85 leading-relaxed mb-6">
              Most consulting starts at the project kickoff. We start before
              that &mdash; in the strategic authorship moment, when leaders
              decide what change they could credibly lead.
            </p>
            <p className="text-lg md:text-xl text-charcoal/85 leading-relaxed">
              Phase Zero is the readiness work that makes implementation
              possible: alignment, architecture, and the courage to design
              before you build.
            </p>
            <Link
              to="/phase-zero"
              className="inline-flex items-center mt-8 font-poppins font-semibold text-base text-primary hover:text-primary/80 group"
            >
              Read the manifesto
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  4. The Blue Door                                                          */
/* -------------------------------------------------------------------------- */
function BlueDoorSection() {
  return (
    <section className="relative py-24 md:py-32 bg-muted/60 overflow-hidden">
      <FadeIn className="container max-w-4xl mx-auto px-6 text-center">
        <p className="text-bluedoor font-poppins font-semibold uppercase tracking-[0.2em] text-xs mb-6">
          Begin Here
        </p>
        <h2 className="font-poppins font-bold text-4xl md:text-6xl text-navy leading-tight mb-8">
          The Blue Door
        </h2>
        <p className="text-lg md:text-xl text-charcoal/80 leading-relaxed max-w-2xl mx-auto mb-10">
          A 90-minute strategic diagnostic that surfaces the alignment gap
          between where your organization stands and the position it&rsquo;s
          structurally capable of leading. The mandatory first step for every
          partnership.
        </p>
        <Link
          to="/blue-door"
          className="inline-flex items-center font-poppins font-semibold text-base px-8 py-4 rounded-full bg-bluedoor text-white hover:bg-bluedoor/90 transition-colors shadow-lg"
        >
          Open the Blue Door
          <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </FadeIn>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  5. P.A.T.H.ways                                                           */
/* -------------------------------------------------------------------------- */
function PathwaysSection() {
  const tiers = [
    {
      tier: "Ignite",
      tagline: "Light the fire. Prove transformation works here.",
      color: "border-l-lime",
      label: "text-lime",
      to: "/partner/ignite",
    },
    {
      tier: "Amplify",
      tagline: "Shape excellence. Build compound momentum.",
      color: "border-l-primary",
      label: "text-primary",
      to: "/partner/amplify",
    },
    {
      tier: "Embody",
      tagline: "Make it permanent. Build unshakeable foundations.",
      color: "border-l-raspberry",
      label: "text-raspberry",
      to: "/partner/embody",
    },
  ];
  return (
    <section className="relative py-24 md:py-32 bg-white">
      <FadeIn className="container max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-primary font-poppins font-semibold uppercase tracking-[0.2em] text-xs mb-4">
            Three P.A.T.H.ways
          </p>
          <h2 className="font-poppins font-bold text-4xl md:text-6xl text-navy leading-tight">
            Choose your altitude.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((t) => (
            <Link
              key={t.tier}
              to={t.to}
              className={`group block bg-muted/40 hover:bg-muted/70 transition-colors p-8 border-l-4 ${t.color}`}
            >
              <p
                className={`${t.label} font-poppins font-semibold uppercase tracking-[0.15em] text-xs mb-3`}
              >
                {t.tier}
              </p>
              <p className="font-poppins text-xl text-navy leading-snug mb-6">
                {t.tagline}
              </p>
              <span className="inline-flex items-center text-sm font-semibold text-navy group-hover:text-primary transition-colors">
                Explore
                <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  6. Foundation — The Painted Porch Pillars                                 */
/* -------------------------------------------------------------------------- */
function FoundationSection() {
  const pillars = [
    {
      label: "Foundational Architecture",
      sub: "Leadership & Culture",
      copy: "Who authors the change.",
      color: "border-l-primary",
    },
    {
      label: "Operational Intelligence",
      sub: "Workflows & Systems",
      copy: "How work flows when you lead the market.",
      color: "border-l-lime",
    },
    {
      label: "Human Capacity",
      sub: "Judgment & Navigation",
      copy: "Who decides &mdash; and how.",
      color: "border-l-raspberry",
    },
  ];
  return (
    <section className="relative py-24 md:py-32 bg-navy text-white overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/15 blur-3xl"
      />
      <FadeIn className="relative container max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-gold font-poppins font-semibold uppercase tracking-[0.2em] text-xs mb-4">
            The Foundation
          </p>
          <h2 className="font-poppins font-bold text-4xl md:text-6xl leading-tight mb-6">
            The Painted Porch Pillars.
          </h2>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Three load-bearing structures that hold up every organization
            ready to lead its market.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((p) => (
            <div
              key={p.label}
              className={`bg-white/5 backdrop-blur-sm p-8 border-l-4 ${p.color}`}
            >
              <p className="font-poppins font-bold text-xl mb-2">{p.label}</p>
              <p className="text-gold/90 text-sm font-semibold uppercase tracking-wide mb-4">
                {p.sub}
              </p>
              <p
                className="text-white/85 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: p.copy }}
              />
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  7. Partnership                                                            */
/* -------------------------------------------------------------------------- */
function PartnershipSection() {
  return (
    <section className="relative py-24 md:py-32 bg-muted overflow-hidden">
      <FadeIn className="container max-w-3xl mx-auto px-6 text-center">
        <p className="text-raspberry font-poppins font-semibold uppercase tracking-[0.2em] text-xs mb-6">
          The Partnership
        </p>
        <h2 className="font-poppins font-bold text-4xl md:text-6xl text-navy leading-tight mb-8">
          More than consulting.
        </h2>
        <p className="text-lg md:text-xl text-charcoal/80 leading-relaxed mb-6">
          We don&rsquo;t arrive after the decisions are made. We sit with you
          at the strategic authorship moment &mdash; the moment leaders ask,
          <em className="not-italic text-navy font-semibold">
            {" "}
            what change could we credibly lead?
          </em>
        </p>
        <p className="text-lg md:text-xl text-charcoal/80 leading-relaxed">
          Then we co-design the architecture that sustains it.
        </p>
      </FadeIn>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  8. Insights — featured posts                                              */
/* -------------------------------------------------------------------------- */
function InsightsSection() {
  const { data: posts } = useFeaturedPosts(3);
  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-24 md:py-32 bg-white">
      <FadeIn className="container max-w-6xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="text-primary font-poppins font-semibold uppercase tracking-[0.2em] text-xs mb-3">
              Thoughts from the Porch
            </p>
            <h2 className="font-poppins font-bold text-3xl md:text-5xl text-navy leading-tight">
              Insights.
            </h2>
          </div>
          <Link
            to="/resources/insights"
            className="text-primary font-semibold text-sm hover:underline"
          >
            All insights &rarr;
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
      </FadeIn>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */
export default function PPSHome() {
  useDocumentSeo({
    title: "Painted Porch Strategies | Architect Extraordinary Outcomes",
    description:
      "Phase Zero is the work before the work. We partner with leaders to architect the conditions for change before a single tool gets launched.",
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
      <ParallaxCTA
        backgroundImage={homeHero}
        eyebrow="Phase Zero™"
        headline={
          <>
            Ready to do epic sh<span className="text-raspberry">IF</span>t?
          </>
        }
        description="The Blue Door is where it begins. A 90-minute strategic diagnostic to surface the gap between where you stand and where you could lead."
        actions={[
          { label: "Open the Blue Door", to: "/blue-door", variant: "primary" },
          { label: "Discover Your P.A.T.H.way", to: "/start-here", variant: "secondary" },
        ]}
      />
    </div>
  );
}
