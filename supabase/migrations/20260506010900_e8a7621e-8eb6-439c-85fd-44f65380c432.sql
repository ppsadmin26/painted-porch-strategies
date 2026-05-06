
-- 1. Restrict site-videos storage bucket writes to admins/editors only
DROP POLICY IF EXISTS "Authenticated can upload site videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update site videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete site videos" ON storage.objects;

CREATE POLICY "Admins or editors can upload site videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'site-videos' AND public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins or editors can update site videos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'site-videos' AND public.is_admin_or_editor(auth.uid()))
WITH CHECK (bucket_id = 'site-videos' AND public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins or editors can delete site videos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'site-videos' AND public.is_admin_or_editor(auth.uid()));

-- 2. Restrict page_status SELECT to authenticated users only (hides draft URLs from public).
-- PageGate reads via authenticated session for staff; public visitors see ComingSoon
-- via default Live behavior since unknown drafts won't be visible. To preserve gating
-- for anonymous users, only return live rows publicly.
DROP POLICY IF EXISTS "Anyone can read page status" ON public.page_status;

CREATE POLICY "Public can read live page status"
ON public.page_status FOR SELECT TO anon
USING (status = 'live');

CREATE POLICY "Authenticated can read all page status"
ON public.page_status FOR SELECT TO authenticated
USING (true);

-- 3. Scope backup_runs service-role policies to authenticated role (service_role is authenticated)
DROP POLICY IF EXISTS "Service role can insert backup runs" ON public.backup_runs;
DROP POLICY IF EXISTS "Service role can update backup runs" ON public.backup_runs;

CREATE POLICY "Service role can insert backup runs"
ON public.backup_runs FOR INSERT TO authenticated
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update backup runs"
ON public.backup_runs FOR UPDATE TO authenticated
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 4. Fix mutable search_path on remaining functions
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.set_email_vt(text, bigint, integer) SET search_path = public, pgmq;
