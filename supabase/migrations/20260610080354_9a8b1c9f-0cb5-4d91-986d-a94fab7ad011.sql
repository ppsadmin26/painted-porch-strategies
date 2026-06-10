-- Remove the view-based approach
DROP VIEW IF EXISTS public.course_launch_status_public;

-- Restore a public SELECT policy on the table (column-level grants below limit
-- which columns anon/authenticated may actually read).
DROP POLICY IF EXISTS "Admins can read all course launch status" ON public.course_launch_status;
CREATE POLICY "Anyone can read course launch status"
  ON public.course_launch_status
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Revoke broad table-level SELECT, then grant SELECT only on the website-safe columns
REVOKE SELECT ON public.course_launch_status FROM anon, authenticated;
GRANT SELECT (
  slug,
  course_name,
  course_path,
  program_type,
  status,
  checkout_url,
  notified_at,
  notified_count
) ON public.course_launch_status TO anon, authenticated;

-- Service role keeps full access for edge functions / admin tooling
GRANT ALL ON public.course_launch_status TO service_role;