import { RESEARCH_STATS } from "@/data/research-stats";
import { cn } from "@/lib/utils";
import SourcedTooltip from "@/components/pps/SourcedTooltip";

type Variant = "bold" | "editorial";

interface StatCardProps {
  statId: keyof typeof RESEARCH_STATS;
  variant?: Variant;
  /** Tailwind text color class for the big number (e.g. "text-raspberry") */
  accentClass?: string;
  /** Optional PPS framing line under the stat */
  framing?: React.ReactNode;
  /**
   * @deprecated Footnote numbering is being phased out in favor of inline
   * info-icon tooltips. Leave unset — sources now render via SourcedTooltip.
   */
  footnoteNumber?: number;
  /** Show the inline source tooltip (default true). */
  showSourceTooltip?: boolean;
  className?: string;
}

/**
 * Reusable stat card used across home, /partner, and EMBODY.
 * - "bold": large stat tile for high-impact moments (EMBODY)
 * - "editorial": text-led pull-stat used inside flowing copy
 *
 * Sources render inline as a hover/focus info-icon tooltip (site standard).
 */
export default function StatCard({
  statId,
  variant = "bold",
  accentClass = "text-raspberry",
  framing,
  showSourceTooltip = true,
  className,
}: StatCardProps) {
  const s = RESEARCH_STATS[statId];
  if (!s) return null;

  const tooltip = showSourceTooltip ? (
    <SourcedTooltip
      source={s.source}
      sourceUrl={s.sourceUrl}
      year={s.year}
      size="xs"
      iconClassName="text-muted-foreground hover:text-foreground ml-1 align-middle"
    />
  ) : null;

  if (variant === "editorial") {
    return (
      <div className={cn("border-l-4 border-gold pl-5 py-2", className)}>
        <p className={cn("text-2xl md:text-3xl font-poppins font-bold leading-tight", accentClass)}>
          {s.figure}
          <span className="text-navy"> {s.label.replace(/\.$/, "")}.</span>
          {tooltip}
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
      </p>
      <p className="mt-4 text-body md:text-lg text-navy font-montserrat leading-snug">
        {s.label.replace(/\.$/, "")}.
        {tooltip}
      </p>
      {framing && (
        <p className="mt-4 text-body-sm text-foreground/80 italic leading-relaxed">{framing}</p>
      )}
      <p className="mt-auto pt-4 text-[0.7rem] uppercase tracking-wider text-muted-foreground">
        {s.source}{s.year ? ` · ${s.year}` : ""}
      </p>
    </div>
  );
}

/**
 * @deprecated Use inline `SourcedTooltip` (info-icon) on each stat instead of
 * a separate citations list. Kept for backward compatibility with archived pages.
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
