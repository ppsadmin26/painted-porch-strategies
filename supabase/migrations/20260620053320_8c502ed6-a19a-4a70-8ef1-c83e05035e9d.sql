-- Prevent anonymous listing/enumeration of files in public buckets.
-- Public URLs (CDN endpoint) continue to work because they bypass RLS for public buckets.
-- Only the storage API .list() / .download() calls are affected, which is the intended lockdown.

DROP POLICY IF EXISTS "Blog images are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Site videos are publicly readable" ON storage.objects;