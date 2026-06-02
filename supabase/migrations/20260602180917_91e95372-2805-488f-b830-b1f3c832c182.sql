
-- 1. Fix SECURITY DEFINER view by enabling security_invoker
ALTER VIEW public.public_authors SET (security_invoker = true);

-- 2. Restrict github_sync_status / github_sync_events SELECT policies to authenticated role only
DROP POLICY IF EXISTS "Admins read sync status" ON public.github_sync_status;
CREATE POLICY "Admins read sync status"
  ON public.github_sync_status
  FOR SELECT
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

DROP POLICY IF EXISTS "Admins read sync events" ON public.github_sync_events;
CREATE POLICY "Admins read sync events"
  ON public.github_sync_events
  FOR SELECT
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

-- 3. Add explicit public SELECT policy for blog-images bucket (defense in depth)
CREATE POLICY "Blog images are publicly readable"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'blog-images');
