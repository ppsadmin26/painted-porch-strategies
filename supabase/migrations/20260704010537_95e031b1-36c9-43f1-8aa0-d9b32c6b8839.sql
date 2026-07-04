
DROP POLICY IF EXISTS "Anyone can read post categories" ON public.blog_post_categories;

CREATE POLICY "Public can read categories for visible posts"
ON public.blog_post_categories
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.blog_posts bp
    WHERE bp.id = blog_post_categories.post_id
      AND bp.status IN ('published'::blog_post_status, 'scheduled'::blog_post_status)
  )
  OR public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.blog_posts bp
    WHERE bp.id = blog_post_categories.post_id
      AND bp.author_id = auth.uid()
  )
);
