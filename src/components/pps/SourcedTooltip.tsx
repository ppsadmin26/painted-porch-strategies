/**
 * SourcedTooltip — site-wide standard for citations.
 *
 * Replaces the legacy footnote (¹²³) + bottom "Sources" list pattern.
 * Renders a small info icon; hover/focus reveals source name + clickable URL.
 *
 * Usage:
 *   <SourcedTooltip source="McKinsey, 2024" sourceUrl="https://..." />
 */
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SourcedTooltipProps {
  source: string;
  sourceUrl?: string;
  year?: string | number;
  /** Visual size of the info icon */
  size?: "xs" | "sm" | "md";
  /** Tailwind text color class for the trigger icon (default muted) */
  iconClassName?: string;
  /** Focus ring color class */
  focusRingClassName?: string;
  /** Wrap with TooltipProvider (true) or rely on an ancestor (false). Default true. */
  withProvider?: boolean;
}

const sizeMap = {
  xs: "w-3 h-3",
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
};

export default function SourcedTooltip({
  source,
  sourceUrl,
  year,
  size = "sm",
  iconClassName = "text-muted-foreground hover:text-foreground",
  focusRingClassName = "focus-visible:ring-2 focus-visible:ring-primary",
  withProvider = true,
}: SourcedTooltipProps) {
  const label = year ? `${source} (${year})` : source;

  const trigger = (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`Source: ${label}`}
          className={cn(
            "inline-flex shrink-0 align-middle rounded-full transition-colors focus:outline-none",
            iconClassName,
            focusRingClassName,
          )}
        >
          <Info className={sizeMap[size]} aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        <p className="font-semibold mb-1">Source</p>
        <p className="mb-1">{label}</p>
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-strategic underline break-all"
          >
            View source →
          </a>
        )}
      </TooltipContent>
    </Tooltip>
  );

  if (!withProvider) return trigger;

  return <TooltipProvider delayDuration={150}>{trigger}</TooltipProvider>;
}
