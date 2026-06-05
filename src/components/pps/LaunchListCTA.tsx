import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { CourseLaunchListDialog } from "@/components/pps/CourseLaunchListDialog";
import { useCourseLaunchStatus } from "@/hooks/useCourseLaunchStatus";

interface LaunchListCTAProps {
  /** Slug in course_launch_status. Required to gate Live/Coming Soon + tag GHL leads. */
  slug: string;
  /** Display name used in the dialog and confirmation email. */
  courseName: string;
  /** Label shown when the program is Live. Defaults to "Enroll". */
  liveLabel?: string;
  /** Tailwind classes for the live/coming-soon Button. */
  buttonClasses?: string;
  /** Tailwind text-color class for the "Join the Launch List" link. */
  textColorClass?: string;
  /** Layout: full-width (default) or right-aligned with stacked waitlist link beneath. */
  layout?: "stacked" | "inline";
  /** Optional override for the disabled "Coming Soon" label. */
  comingSoonLabel?: string;
  /** Hide the launch-list link entirely (still respects Live status). */
  hideWaitlistLink?: boolean;
  size?: "default" | "sm" | "lg";
}

/**
 * Unified "Join the Launch List" CTA for any program/course/assessment/masterclass
 * card. Reads course_launch_status by slug — when admin flips Live and adds a
 * checkout URL on /admin/course-launches, this auto-swaps to an enroll button.
 */
export function LaunchListCTA({
  slug,
  courseName,
  liveLabel = "Enroll",
  buttonClasses = "",
  textColorClass = "text-primary",
  layout = "stacked",
  comingSoonLabel = "Coming Soon",
  hideWaitlistLink = false,
  size = "sm",
}: LaunchListCTAProps) {
  const [open, setOpen] = useState(false);
  const { isLive, data } = useCourseLaunchStatus(slug);

  if (isLive && data?.checkout_url) {
    const url = data.checkout_url;
    const isExternal = /^https?:\/\//i.test(url);
    if (isExternal) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size={size} className={buttonClasses}>
            {liveLabel} <ExternalLink className="ml-2 w-3 h-3" />
          </Button>
        </a>
      );
    }
    return (
      <Link to={url}>
        <Button variant="outline" size={size} className={buttonClasses}>
          {liveLabel}
        </Button>
      </Link>
    );
  }

  const waitlistLink = !hideWaitlistLink && (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={`text-xs ${textColorClass} hover:underline mt-1`}
    >
      Join the Launch List →
    </button>
  );

  return (
    <>
      <div className={layout === "inline" ? "flex items-center gap-3" : "flex flex-col items-end gap-1"}>
        <Button
          variant="outline"
          size={size}
          disabled
          className={`${buttonClasses} opacity-60 cursor-not-allowed`}
        >
          {comingSoonLabel}
        </Button>
        {waitlistLink}
      </div>
      <CourseLaunchListDialog
        open={open}
        onOpenChange={setOpen}
        courseName={courseName}
        courseSlug={slug}
      />
    </>
  );
}
