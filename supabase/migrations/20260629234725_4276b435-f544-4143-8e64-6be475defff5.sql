-- Lock down the sensitive columns flagged by the security scanner.
-- These statements are idempotent: REVOKE is a no-op if the privilege isn't held.

-- 1) page_status.note must be admin-only. Public/authenticated callers read
--    page_status via the safe columns; admin notes are exposed via the
--    public.admin_list_page_status_notes() SECURITY DEFINER RPC.
REVOKE SELECT (note) ON public.page_status FROM anon;
REVOKE SELECT (note) ON public.page_status FROM authenticated;

-- 2) course_launch_status operational/notify columns must not leak publicly.
--    Public callers only need slug, course_name, status, checkout_url,
--    course_path, program_type. Admin tooling reads the full row via
--    the new SECURITY DEFINER RPC defined below.
REVOKE SELECT (admin_alert_enabled, signup_confirmation_enabled,
               last_notify_error, notified_count, notified_at)
  ON public.course_launch_status FROM anon;
REVOKE SELECT (admin_alert_enabled, signup_confirmation_enabled,
               last_notify_error, notified_count, notified_at)
  ON public.course_launch_status FROM authenticated;

-- 3) Admin-only RPC so the Course Launch Manager can still read every column
--    via SECURITY DEFINER, bypassing the column-level REVOKE above.
CREATE OR REPLACE FUNCTION public.admin_list_course_launches()
RETURNS SETOF public.course_launch_status
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_or_editor(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY SELECT * FROM public.course_launch_status ORDER BY course_name;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_course_launches() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_course_launches() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_course_launches() TO service_role;