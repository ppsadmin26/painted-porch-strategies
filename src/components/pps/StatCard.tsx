import { RESEARCH_STATS } from "@/data/research-stats";
import { cn } from "@/lib/utils";

type Variant = "bold" | "editorial";

interface StatCardProps {
  statId: keyof typeof RESEARCH_STATS;
  variant?: Variant;
  /** Tailwind text color class for the big number (e.g. "text-raspberry") */
  accentClass?: string;
  /** Optional PPS framing line under the stat */
  framing?: React.ReactNode;
  /** Footnote number to display as a superscript next to the figure */
  footnoteNumber?: number;
  className?: string;
}

/**
 * Reusable stat card used across home, /partner, and EMBODY.
 * - "bold": large stat tile for high-impact moments (EMBODY)
 * - "editorial": text-led pull-stat used inside flowing copy
 */
export default function StatCard({
  statId,
  variant = "bold",
  accentClass = "text-raspberry",
  framing,
  footnoteNumber,
  className,
}: StatCardProps) {
  const s = RESEARCH_STATS[statId];
  if (!s) return null;

  if (variant === "editorial") {
    return (
      <div className={cn("border-l-4 border-gold pl-5 py-2", className)}>
        <p className={cn("text-2xl md:text-3xl font-poppins font-bold leading-tight", accentClass)}>
          {s.figure}
          {footnoteNumber !== undefined && (
            <sup className="text-xs ml-1 text-muted-foreground font-normal">{footnoteNumber}</sup>
          )}
          <span className="text-navy"> {s.label.replace(/\.$/, "")}.</span>
        </p>
        {framing && <p className="mt-2 text-foreground/80 italic">{framing}</p>}
      </div>
    );
  }

  // bold
  return (
    <div
      className={cn(
        "bg-white p-6 md:p-8 rounded-2xl border border-border/60 shadow-sm flex flex-col h-full",
        className
      )}
    >
      <p className={cn("text-5xl md:text-6xl font-poppins font-bold tabular-nums leading-none", accentClass)}>
        {s.figure}
        {footnoteNumber !== undefined && (
          <sup className="text-base ml-1 text-muted-foreground font-normal align-super">
            {footnoteNumber}
          </sup>
        )}
      </p>
      <p className="mt-4 text-base md:text-lg text-navy font-montserrat leading-snug">
        {s.label.replace(/\.$/, "")}.
      </p>
      {framing && (
        <p className="mt-4 text-sm text-foreground/80 italic leading-relaxed">{framing}</p>
      )}
      <p className="mt-auto pt-4 text-[0.7rem] uppercase tracking-wider text-muted-foreground">
        {s.source}{s.year ? ` · ${s.year}` : ""}
      </p>
    </div>
  );
}

/**
 * Compact citations list, pair with `footnoteNumber` props on StatCard.
 */
export function StatSources({
  statIds,
  className,
}: {
  statIds: Array<keyof typeof RESEARCH_STATS>;
  className?: string;
}) {
  return (
    <ol className={cn("text-xs text-muted-foreground space-y-1 list-decimal list-inside", className)}>
      {statIds.map((id) => {
        const s = RESEARCH_STATS[id];
        if (!s) return null;
        return (
          <li key={id}>
            {s.sourceUrl ? (
              <a
                href={s.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                {s.source}
              </a>
            ) : (
              s.source
            )}
            {s.year ? ` (${s.year})` : ""}
          </li>
        );
      })}
    </ol>
  );
}
