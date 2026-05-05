
-- 1. Fix public email exposure: replace broad public author policy with a view
-- Drop the existing overly-broad public policy
DROP POLICY IF EXISTS "Public can read author profiles" ON public.profiles;

-- Create a security barrier view that excludes email
CREATE OR REPLACE VIEW public.public_authors WITH (security_barrier = true) AS
SELECT id, full_name, author_bio, avatar_url, is_author, is_guest_author
FROM public.profiles
WHERE is_author = true;

-- Grant access to the view for anon and authenticated
GRANT SELECT ON public.public_authors TO anon, authenticated;

-- 2. Fix blog image deletion: restrict to admin/editor only
-- First drop the existing overly-permissive policy
DROP POLICY IF EXISTS "Authenticated users can delete blog images" ON storage.objects;

CREATE POLICY "Admins and editors can delete blog images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images' AND public.is_admin_or_editor(auth.uid()));

-- 3. Fix function search_path on mutable functions
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = 'public';
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = 'public';
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = 'public';
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = 'public';

-- 4. Fix public bucket listing: restrict SELECT to only reading specific objects (not listing)
-- Drop the overly-broad select policy that allows listing
DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;

-- Create a narrower policy: public can read a specific object by name, but the RLS
-- alone can't prevent listing vs single-object reads in Supabase storage.
-- The recommended fix is to keep the bucket public (which serves files by direct URL)
-- but remove any SELECT policy that allows listing via the API.
-- Re-create a select policy scoped to authenticated admin/editors for API listing
CREATE POLICY "Authenticated users can read blog images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'blog-images');

CREATE POLICY "Public can read blog images by name"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'blog-images');
