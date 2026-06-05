---
name: Course Launch Flag
description: DB-backed course launch toggle that swaps Coming Soon for live Purchase CTA and auto-fires launch-list emails
type: feature
---

The 3 course pages (`/communication`, `/mindfulness`, `/teams`) read `course_launch_status` (slug PK) via `useCourseLaunchStatus(slug)`.

Slugs MUST match the GHL launch-list tag suffix: `master-your-message`, `radical-mindfulness`, `extraordinary-teams`. The GHL tag is `course-launch-${slug}`.

When `status='live'` AND `checkout_url` is set: pricing tier buttons render as live Purchase links to `checkout_url` (`target="_blank"`); the "Join the Launch List" call-out is hidden.

Admin page `/admin/course-launches` (admin-only). The "Go Live & Notify Launch List" button flips `status` to `live` AND immediately calls the `notify-course-launch` edge function in the same action, so the live CTA can never be enabled without the launch-list notification firing. `notified_at` is stamped to prevent re-sends; admins can manually "Re-notify Launch List" (uses `force: true`) or "Revert to Coming Soon".

Edge function `notify-course-launch` is admin-gated (verifies caller via `is_admin`), pages through GHL `/contacts/search` by tag, sends the `course-launch-available` template via `send-transactional-email` with idempotency key `course-launch-available-${slug}-${ghlContactId}`, and writes `notified_at` / `notified_count` / `last_notify_error` back to the row.
