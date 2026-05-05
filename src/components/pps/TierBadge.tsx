import { cn } from "@/lib/utils";
import { TIERS, type TierConfig } from "@/config/tiers";

interface TierBadgeProps {
  tier: TierConfig;
  label?: string;
  className?: string;
}

/**
 * Reusable badge component for tier identification in hero sections.
 * Uses centralized tier config for consistent branding.
 */
export function TierBadge({ tier, label, className }: TierBadgeProps) {
  const Icon = tier.icon;
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-poppins font-semibold text-sm px-4 py-1.5 rounded-full",
        tier.name === "IGNITE" && "bg-gold/90 text-white",
        tier.name === "AMPLIFY" && "bg-strategic/90 text-white",
        tier.name === "EMBODY" && "bg-navy/90 text-white",
        className
      )}
    >
      <Icon className="w-4 h-4" />
      {label ?? <>{tier.name} ShIFt</>}
    </span>
  );
}

export { TIERS };
