-- 1) Drop the public read policy that exposed all columns
DROP POLICY IF EXISTS "Anyone can read course launch status" ON public.course_launch_status;

-- 2) Add an admin-only SELECT policy on the underlying table
CREATE POLICY "Admins can read all course launch status"
  ON public.course_launch_status
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 3) Create a public-safe view that omits internal/operational fields
DROP VIEW IF EXISTS public.course_launch_status_public;
CREATE VIEW public.course_launch_status_public
WITH (security_invoker = off) AS
SELECT
  slug,
  course_name,
  course_path,
  program_type,
  status,
  checkout_url,
  notified_at,
  notified_count
FROM public.course_launch_status;

-- 4) Grants so PostgREST can serve the view to anon/authenticated
GRANT SELECT ON public.course_launch_status_public TO anon;
GRANT SELECT ON public.course_launch_status_public TO authenticated;
GRANT SELECT ON public.course_launch_status_public TO service_role;