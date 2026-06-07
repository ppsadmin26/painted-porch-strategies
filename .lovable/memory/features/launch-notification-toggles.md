---
name: Launch List Notification Toggles
description: Per-program switches in /admin/course-launches that control confirmation + admin-alert emails when someone joins a launch list. Used by courses, masterclasses, assessments, and leadership labs via LaunchListCTA + notify-launch-signup edge fn.
type: feature
---

`course_launch_status` rows carry three notification controls per program:
- `signup_confirmation_enabled` — sends `course-launch-list` confirmation to the person who joins. Default ON.
- `admin_alert_enabled` — sends `launch-list-signup-admin` to `ADMIN_NOTIFICATION_EMAIL` on every signup. Default ON.
- `program_type` — `course | masterclass | assessment | lab`. Display-only grouping.

When a user joins a launch list via `CourseLaunchListDialog` (triggered by `<LaunchListCTA>`), the dialog calls the public edge function `notify-launch-signup` with `{ slug, firstName, lastName, email, newsletter }`. That function reads the row's flags via service role and conditionally sends each email. Do not put the conditional logic in the client.

Admin UI: `/admin/course-launches` (CourseLaunchManager) renders two Switch toggles per card that write back to the row immediately (optimistic). Toggles work for both Coming Soon and Live programs.

Leadership Labs (lab-stractical-leadership, lab-leading-change, lab-dysfunction-to-dynamic, lab-goldilocks-leadership, lab-mission-unstoppable, lab-operations-on-purpose) live in this table too — `AmplifyLabs.tsx` uses `<LaunchListCTA>` for the coming-soon ones so flipping them Live on /admin/course-launches automatically swaps the card CTA and fires the launch announcement.
