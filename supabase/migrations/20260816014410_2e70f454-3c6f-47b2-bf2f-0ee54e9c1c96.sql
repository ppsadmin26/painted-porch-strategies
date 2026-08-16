-- Restrict public/authenticated reads on course_launch_status to the
-- customer-facing columns only. Internal automation fields
-- (last_notify_error, admin_alert_enabled, signup_confirmation_enabled)
-- stay readable only by service_role / admin RPC paths.
REVOKE SELECT ON public.course_launch_status FROM anon, authenticated;

GRANT SELECT (slug, course_name, status, checkout_url, course_path, program_type, notified_at, notified_count, created_at, updated_at)
  ON public.course_launch_status TO anon, authenticated;

GRANT ALL ON public.course_launch_status TO service_role;