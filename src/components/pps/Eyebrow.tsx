import { cn } from "@/lib/utils";
import type { ReactNode, HTMLAttributes } from "react";

/**
 * Eyebrow label — the small uppercase label above a heading.
 *
 * Two-tier rule (see mem://style/eyebrow-usage):
 *  - variant="pill"  → MAJOR section headers (one per <section>, top of page region).
 *  - variant="plain" → SUB-labels inside a section (card tags, secondary headings,
 *                       eyebrows nested inside reusable components).
 *
 * Never hand-roll `inline-block ... rounded-full ... uppercase` for a section
 * label — use this component so the linter (`npm run brand:eyebrows`) can
 * enforce the two-tier hierarchy.
 */

export type EyebrowTone =
  | "gold"
  | "teal"
  | "cobalt"
  | "raspberry"
  | "purple"
  | "navy"
  | "lime"
  | "white"
  | "muted"
  | "primary"
  | "foreground";

export type EyebrowVariant = "pill" | "plain";

interface EyebrowProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  children: ReactNode;
  variant?: EyebrowVariant;
  tone?: EyebrowTone;
  as?: "span" | "p" | "div";
}

const PILL_TONE: Record<EyebrowTone, string> = {
  gold: "bg-gold/90 text-navy",
  teal: "bg-teal/15 text-teal",
  cobalt: "bg-bluedoor text-white",
  raspberry: "bg-raspberry/15 text-raspberry",
  purple: "bg-purple/15 text-purple",
  navy: "bg-navy text-white",
  lime: "bg-lime/90 text-navy",
  white: "bg-white/15 text-white",
  muted: "bg-muted text-muted-foreground",
  primary: "bg-primary/15 text-primary",
  foreground: "bg-foreground/10 text-foreground",
};

const PLAIN_TONE: Record<EyebrowTone, string> = {
  gold: "text-gold",
  teal: "text-teal",
  cobalt: "text-bluedoor",
  raspberry: "text-raspberry",
  purple: "text-purple",
  navy: "text-navy",
  lime: "text-lime",
  white: "text-white",
  muted: "text-muted-foreground",
  primary: "text-primary",
  foreground: "text-foreground",
};

const PILL_BASE =
  "inline-block font-poppins font-semibold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider mb-6";
const PLAIN_BASE =
  "inline-block font-poppins font-semibold text-caption uppercase tracking-[0.2em] mb-3";

export function Eyebrow({
  children,
  variant = "plain",
  tone = "gold",
  as: Tag = "span",
  className,
  ...rest
}: EyebrowProps) {
  const base = variant === "pill" ? PILL_BASE : PLAIN_BASE;
  const toneClass = variant === "pill" ? PILL_TONE[tone] : PLAIN_TONE[tone];
  return (
    <Tag className={cn(base, toneClass, className)} {...rest}>
      {children}
    </Tag>
  );
}

export default Eyebrow;
