import { RESEARCH_STATS, type ResearchStat } from "@/data/research-stats";

interface StatMarqueeProps {
  statIds: Array<keyof typeof RESEARCH_STATS>;
  /** Optional eyebrow label above the marquee */
  eyebrow?: string;
  /** Background color class */
  bgClass?: string;
}

/**
 * Slim horizontal stat scroller. Auto-pauses on hover and respects prefers-reduced-motion.
 * Used on the home page as a pattern-interrupt strip beneath the hero/welcome.
 */
export default function StatMarquee({
  statIds,
  eyebrow = "The reality leaders are facing",
  bgClass = "bg-navy",
}: StatMarqueeProps) {
  const stats: ResearchStat[] = statIds
    .map((id) => RESEARCH_STATS[id])
    .filter(Boolean);
  // Duplicate the list so the loop seam is invisible.
  const doubled = [...stats, ...stats];

  return (
    <section className={`${bgClass} py-6 md:py-7 overflow-hidden`} aria-label="Research stats">
      <div className="container max-w-7xl mx-auto px-6 mb-3">
        <p className="text-center text-[0.7rem] font-poppins font-semibold uppercase tracking-[0.25em] text-gold/90">
          {eyebrow}
        </p>
      </div>
      <div className="group relative overflow-hidden">
        {/* Edge fade masks */}
        <div className={`pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 z-10 bg-gradient-to-r from-navy to-transparent`} />
        <div className={`pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 z-10 bg-gradient-to-l from-navy to-transparent`} />

        <div
          className="flex gap-12 md:gap-16 whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:justify-center motion-reduce:flex-wrap"
          style={{ width: "max-content" }}
        >
          {doubled.map((s, i) => (
            <div
              key={`${s.id}-${i}`}
              className="flex items-baseline gap-3 md:gap-4 text-white"
            >
              <span className="text-2xl md:text-3xl font-poppins font-bold text-gold tabular-nums">
                {s.figure}
              </span>
              <span className="text-sm md:text-base font-montserrat text-white/90">
                {s.label}
              </span>
              <span className="text-[0.65rem] md:text-xs uppercase tracking-wider text-white/80 ml-1">
                {s.source.split(",")[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
