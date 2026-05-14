import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { useScrollAnimation, getAnimationClasses } from "@/hooks/useScrollAnimation";
import ParallaxCTA from "@/components/pps/ParallaxCTA";
import homeHero from "@/assets/heroes/home-hero.jpg";

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

export default function PhaseZero() {
  useDocumentSeo({
    title: "Phase Zero™ | The Work Before the Work | Painted Porch Strategies",
    description:
      "Phase Zero™ is the strategic authorship phase. Before tools, before kickoff, before implementation — this is where leaders decide what change to lead.",
  });

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-navy text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${homeHero})` }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-navy/95 via-navy/90 to-navy/80"
        />
        <div className="relative container max-w-4xl mx-auto px-6 py-24 animate-fade-in">
          <p className="text-gold font-poppins font-semibold uppercase tracking-[0.2em] text-xs md:text-sm mb-6">
            The Manifesto
          </p>
          <h1 className="font-poppins font-bold text-5xl md:text-7xl leading-[1.05] mb-8">
            Phase Zero<sup className="text-[0.4em] align-super">™</sup>
          </h1>
          <p className="text-xl md:text-2xl text-white/85 max-w-2xl leading-relaxed font-light">
            The work before the work. The phase most consultants skip &mdash;
            and the one that decides whether your transformation lasts.
          </p>
        </div>
      </section>

      {/* Section 1 */}
      <section className="py-24 md:py-32 bg-cream">
        <FadeIn className="container max-w-3xl mx-auto px-6">
          <p className="text-primary font-poppins font-semibold uppercase tracking-[0.2em] text-xs mb-6">
            One
          </p>
          <h2 className="font-poppins font-bold text-3xl md:text-5xl text-navy leading-tight mb-6">
            Most change initiatives don&rsquo;t fail at execution.
          </h2>
          <p className="text-lg md:text-xl text-charcoal/85 leading-relaxed mb-6">
            They fail at alignment. They fail because the strategic authorship
            phase &mdash; the moment when leaders sit with the question of
            <em className="not-italic text-navy font-semibold"> what change to lead </em>
            &mdash; gets skipped in favor of momentum.
          </p>
          <p className="text-lg md:text-xl text-charcoal/85 leading-relaxed">
            Tools get launched. Workflows get redesigned. Trainings get rolled
            out. And six months later, the org is exhausted and nothing has
            actually shifted.
          </p>
        </FadeIn>
      </section>

      {/* Section 2 */}
      <section className="py-24 md:py-32 bg-white">
        <FadeIn className="container max-w-3xl mx-auto px-6">
          <p className="text-raspberry font-poppins font-semibold uppercase tracking-[0.2em] text-xs mb-6">
            Two
          </p>
          <h2 className="font-poppins font-bold text-3xl md:text-5xl text-navy leading-tight mb-6">
            Phase Zero is strategic authorship.
          </h2>
          <p className="text-lg md:text-xl text-charcoal/85 leading-relaxed mb-6">
            It&rsquo;s the phase where you decide what change you could
            credibly lead in your market. Not respond to. Not implement
            because a competitor moved first. <em className="not-italic font-semibold text-navy">Author</em>.
          </p>
          <blockquote className="text-2xl md:text-3xl font-poppins italic text-navy mt-12 border-l-4 border-gold pl-6">
            &ldquo;Are we designing our next move &mdash; or reacting to theirs?&rdquo;
          </blockquote>
        </FadeIn>
      </section>

      {/* Section 3 */}
      <section className="py-24 md:py-32 bg-sand">
        <FadeIn className="container max-w-3xl mx-auto px-6">
          <p className="text-gold font-poppins font-semibold uppercase tracking-[0.2em] text-xs mb-6">
            Three
          </p>
          <h2 className="font-poppins font-bold text-3xl md:text-5xl text-navy leading-tight mb-6">
            The architecture comes before the build.
          </h2>
          <p className="text-lg md:text-xl text-charcoal/85 leading-relaxed">
            Phase Zero is where we assess whether your organization is
            structurally capable of leading the position you want to occupy
            &mdash; and where we design the architecture required to sustain
            it. Foundational Architecture. Operational Intelligence. Human
            Capacity. The three pillars of every fortified habitat.
          </p>
        </FadeIn>
      </section>

      <ParallaxCTA
        backgroundImage={homeHero}
        eyebrow="Begin"
        headline="The Blue Door is Phase Zero in motion."
        description="A 90-minute strategic diagnostic to surface what your organization is actually positioned to lead."
        actions={[
          { label: "Open the Blue Door", to: "/blue-door", variant: "primary" },
          { label: "Discover Your P.A.T.H.way", to: "/start-here", variant: "secondary" },
        ]}
      />
    </div>
  );
}
