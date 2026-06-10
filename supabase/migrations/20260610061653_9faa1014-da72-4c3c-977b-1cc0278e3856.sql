-- Make refund_requests INSERT policy explicit. Submissions flow through the
-- submit-refund-request edge function using the service role; this policy
-- documents that intent and blocks anon/authenticated client inserts.
CREATE POLICY "Service role inserts refund requests"
  ON public.refund_requests FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Lock down the private site-images storage bucket with explicit policies so
-- accidental role/policy changes can never expose its contents. Admins and
-- editors can read/write; nobody else can touch it.
CREATE POLICY "Admins and editors can read site-images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'site-images'
    AND public.is_admin_or_editor(auth.uid())
  );

CREATE POLICY "Admins and editors can upload site-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'site-images'
    AND public.is_admin_or_editor(auth.uid())
  );

CREATE POLICY "Admins and editors can update site-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'site-images'
    AND public.is_admin_or_editor(auth.uid())
  )
  WITH CHECK (
    bucket_id = 'site-images'
    AND public.is_admin_or_editor(auth.uid())
  );

CREATE POLICY "Admins and editors can delete site-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'site-images'
    AND public.is_admin_or_editor(auth.uid())
  );
