-- Drop and recreate the public read policy to include scheduled posts with past publish_date
DROP POLICY IF EXISTS "Public can read published posts" ON public.blog_posts;

CREATE POLICY "Public can read published posts"
ON public.blog_posts
FOR SELECT
TO public
USING (
  status = 'published'::blog_post_status
  OR (
    status = 'scheduled'::blog_post_status
    AND publish_date IS NOT NULL
    AND publish_date <= now()
  )
);