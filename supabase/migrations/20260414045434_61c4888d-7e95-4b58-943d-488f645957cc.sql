
-- Drop existing restrictive update/delete policies
DROP POLICY IF EXISTS "Authenticated users can update posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users can delete posts" ON public.blog_posts;

-- Recreate with admin override
CREATE POLICY "Authors or admins can update posts"
  ON public.blog_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id OR is_admin(auth.uid()));

CREATE POLICY "Authors or admins can delete posts"
  ON public.blog_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id OR is_admin(auth.uid()));
