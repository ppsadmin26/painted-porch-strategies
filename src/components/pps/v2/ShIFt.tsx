/**
 * Branded "shIFt" wordmark for the v2 (Epic ShIFt) draft pages.
 *
 * Site rule: the "IF" carries the page's brand color, or raspberry when the
 * phrase frames a problem, cost, or pain. Pass `tone` to match the surface.
 */
export type ShIFtTone =
  | "raspberry"
  | "gold"
  | "cobalt"
  | "purple"
  | "navy"
  | "teal"
  | "white";

const TONE_CLASS: Record<ShIFtTone, string> = {
  raspberry: "text-raspberry",
  gold: "text-gold",
  cobalt: "text-bluedoor",
  purple: "text-strategic",
  navy: "text-navy",
  teal: "text-primary",
  white: "text-white",
};

export function ShIFt({
  lowercase = false,
  tone = "raspberry",
}: {
  lowercase?: boolean;
  tone?: ShIFtTone;
}) {
  return (
    <>
      {lowercase ? "sh" : "Sh"}
      <span className={`${TONE_CLASS[tone]} font-bold`}>IF</span>t
    </>
  );
}

export default ShIFt;
