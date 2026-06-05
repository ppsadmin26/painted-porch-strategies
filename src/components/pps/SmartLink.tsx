import { ReactNode } from "react";
import { Link, LinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsPageLive } from "@/hooks/useIsPageLive";

type Variant = "link" | "button" | "card";

interface SmartLinkProps extends Omit<LinkProps, "to"> {
  to: string;
  variant?: Variant;
  comingSoonLabel?: string;
  children: ReactNode;
  /** Extra classes applied only when the page is Live. */
  liveClassName?: string;
  /** Extra classes applied only when the page is Draft. */
  draftClassName?: string;
}

/**
 * Renders a normal <Link> when the target route is Live.
 * When Draft (for non-admins), renders a non-interactive element styled
 * to indicate the page is not yet published.
 *
 * Admins/editors always see the live link so they can preview.
 */
export function SmartLink({
  to,
  variant = "link",
  comingSoonLabel = "Coming Soon",
  children,
  className,
  liveClassName,
  draftClassName,
  ...rest
}: SmartLinkProps) {
  const { isLive, canPreview } = useIsPageLive(to);

  if (isLive) {
    return (
      <Link to={to} className={cn(className, liveClassName)} {...rest}>
        {children}
        {canPreview && (
          <DraftPreviewBadge to={to} />
        )}
      </Link>
    );
  }

  // Draft for visitor
  if (variant === "card") {
    return (
      <div
        aria-disabled="true"
        title="This page isn't published yet."
        className={cn(
          "relative cursor-not-allowed opacity-70",
          className,
          draftClassName,
        )}
      >
        <ComingSoonRibbon label={comingSoonLabel} />
        <div className="pointer-events-none">{children}</div>
      </div>
    );
  }

  if (variant === "button") {
    return (
      <span
        aria-disabled="true"
        title="This page isn't published yet."
        className={cn(
          "inline-flex items-center justify-center cursor-not-allowed opacity-60",
          className,
          draftClassName,
        )}
      >
        {comingSoonLabel}
      </span>
    );
  }

  return (
    <span
      aria-disabled="true"
      title="This page isn't published yet."
      className={cn(
        "inline-flex items-center gap-2 cursor-not-allowed text-muted-foreground",
        className,
        draftClassName,
      )}
    >
      {children}
      <ComingSoonBadge label={comingSoonLabel} />
    </span>
  );
}

function DraftPreviewBadge({ to }: { to: string }) {
  // Only render when caller is admin/editor AND target is actually draft
  // (cheap re-check avoids prop drilling).
  const { isDraft, canPreview } = useIsPageLive(to);
  if (!canPreview) return null;
  // canPreview forces isLive=true above, so we need the raw draft check:
  // useIsPageLive returns isDraft=false for previewers; instead read raw map.
  // For simplicity, omit the inline badge here, nav handles preview badge.
  void isDraft;
  return null;
}

export function ComingSoonBadge({ label = "Coming Soon" }: { label?: string }) {
  return (
    <span className="inline-block text-[10px] font-poppins font-semibold uppercase tracking-wide bg-gold/20 text-navy px-2 py-0.5 rounded">
      {label}
    </span>
  );
}

export function ComingSoonRibbon({ label = "Coming Soon" }: { label?: string }) {
  return (
    <span className="absolute top-3 right-3 z-10 text-[11px] font-poppins font-semibold uppercase tracking-wide bg-gold text-navy px-3 py-1 rounded-full shadow-md">
      {label}
    </span>
  );
}

export default SmartLink;
