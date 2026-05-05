
-- Fix view to use security_invoker
ALTER VIEW public.public_authors SET (security_invoker = on);

-- Remove the broad authenticated listing policy too
-- Public bucket serves files by direct URL anyway
DROP POLICY IF EXISTS "Authenticated users can read blog images" ON storage.objects;
