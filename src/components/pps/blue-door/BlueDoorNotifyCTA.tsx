import { useState } from "react";
import { Bell } from "lucide-react";
import { CourseLaunchListDialog } from "@/components/pps/CourseLaunchListDialog";
import { BLUE_DOOR_COPY } from "@/config/blueDoor";

export const BLUE_DOOR_LAUNCH_SLUG = "blue-door";
export const BLUE_DOOR_LAUNCH_NAME = "The Blue Door Organizational Appraisal";

interface BlueDoorNotifyCTAProps {
  /** Tailwind classes for the trigger button (defaults suit light backgrounds). */
  className?: string;
  /** Trigger label. */
  label?: string;
}

/**
 * "Notify me when it launches" trigger for the Blue Door pre-launch surfaces.
 * Signups are tagged in GHL and stored against the `blue-door` launch row, so
 * flipping the launch status on /admin/course-launches emails everyone who asked.
 */
export function BlueDoorNotifyCTA({
  className = "",
  label = BLUE_DOOR_COPY.notifyLabel,
}: BlueDoorNotifyCTAProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 font-poppins font-semibold text-sm underline underline-offset-4 hover:no-underline transition-colors ${className}`}
      >
        <Bell className="w-4 h-4" />
        {label}
      </button>
      <CourseLaunchListDialog
        open={open}
        onOpenChange={setOpen}
        courseName={BLUE_DOOR_LAUNCH_NAME}
        courseSlug={BLUE_DOOR_LAUNCH_SLUG}
        title="Notify Me When It Launches"
        submitLabel="NOTIFY ME AT LAUNCH"
        description={
          <>
            Not ready to reserve yet? Add your email and we'll let you know the
            moment <strong>The Blue Door™</strong> opens, including any change to
            the launch timing.
          </>
        }
        successMessage={
          <>
            We'll email you as soon as <strong>The Blue Door™</strong> is open,
            and any time the launch timing changes.
          </>
        }
      />
    </>
  );
}
