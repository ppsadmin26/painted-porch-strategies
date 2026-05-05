
-- Fix 1: Change view to SECURITY INVOKER (drop and recreate)
DROP VIEW IF EXISTS public.public_authors;

CREATE VIEW public.public_authors AS
SELECT id, full_name, author_bio, avatar_url, is_author, is_guest_author
FROM public.profiles
WHERE is_author = true;

-- Grant access
GRANT SELECT ON public.public_authors TO anon, authenticated;

-- Fix 2: Remove broad anon SELECT policy on storage - public bucket already serves files by URL
DROP POLICY IF EXISTS "Public can read blog images by name" ON storage.objects;
