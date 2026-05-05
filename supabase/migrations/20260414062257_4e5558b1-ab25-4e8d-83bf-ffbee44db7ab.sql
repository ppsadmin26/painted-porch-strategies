
-- Recreate public_authors as a security_barrier view (NOT security_invoker)
-- so anonymous/public readers can see author bios on blog posts
DROP VIEW IF EXISTS public.public_authors;

CREATE VIEW public.public_authors
WITH (security_barrier = true) AS
SELECT id, full_name, author_bio, avatar_url, is_author, is_guest_author
FROM public.profiles
WHERE is_author = true;

-- Grant read access to both anonymous and authenticated users
GRANT SELECT ON public.public_authors TO anon, authenticated;
