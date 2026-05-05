
-- Create a helper function to check if user is admin or editor
CREATE OR REPLACE FUNCTION public.is_admin_or_editor(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role IN ('admin', 'editor')
  )
$$;

-- Drop and recreate update/delete policies
DROP POLICY IF EXISTS "Authors or admins can update posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors or admins can delete posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON public.blog_posts;

CREATE POLICY "Authors or admins/editors can update posts"
  ON public.blog_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id OR is_admin_or_editor(auth.uid()));

CREATE POLICY "Authors or admins/editors can delete posts"
  ON public.blog_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id OR is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins/editors can insert any post, others own only"
  ON public.blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id OR is_admin_or_editor(auth.uid()));
