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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  /** Retained for backwards compatibility — no longer needed with Popover. */
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
}: SourcedTooltipProps) {
  const label = year ? `${source} (${year})` : source;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Source: ${label}`}
          className={cn(
            "inline-flex shrink-0 items-center justify-center align-middle rounded-full p-1.5 -m-1 transition-colors focus:outline-none touch-manipulation cursor-pointer",
            iconClassName,
            focusRingClassName,
          )}
        >
          <Info className={sizeMap[size]} aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        className="max-w-xs w-auto text-xs p-3"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
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
      </PopoverContent>
    </Popover>
  );
}

