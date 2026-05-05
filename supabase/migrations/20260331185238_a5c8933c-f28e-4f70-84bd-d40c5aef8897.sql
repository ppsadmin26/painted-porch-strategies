
-- =============================================
-- FIX 1: Prevent privilege escalation on profiles
-- Replace self-update policy with one that blocks role changes
-- =============================================
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

-- =============================================
-- FIX 2: Restrict CMS write access to admins only
-- =============================================

-- media_appearances: replace write policies with admin-only
DROP POLICY IF EXISTS "Auth users can delete appearances" ON public.media_appearances;
DROP POLICY IF EXISTS "Auth users can insert appearances" ON public.media_appearances;
DROP POLICY IF EXISTS "Auth users can update appearances" ON public.media_appearances;

CREATE POLICY "Admins can insert appearances"
  ON public.media_appearances FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update appearances"
  ON public.media_appearances FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete appearances"
  ON public.media_appearances FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- media_appearance_categories: replace write policies with admin-only
DROP POLICY IF EXISTS "Auth users can delete appearance categories" ON public.media_appearance_categories;
DROP POLICY IF EXISTS "Auth users can insert appearance categories" ON public.media_appearance_categories;

CREATE POLICY "Admins can insert appearance categories"
  ON public.media_appearance_categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete appearance categories"
  ON public.media_appearance_categories FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- blog_categories: replace write policies with admin-only
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.blog_categories;

CREATE POLICY "Admins can insert categories"
  ON public.blog_categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update categories"
  ON public.blog_categories FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete categories"
  ON public.blog_categories FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- blog_post_categories: replace write policies with author or admin
DROP POLICY IF EXISTS "Authenticated users can delete post categories" ON public.blog_post_categories;
DROP POLICY IF EXISTS "Authenticated users can insert post categories" ON public.blog_post_categories;

CREATE POLICY "Authors or admins can insert post categories"
  ON public.blog_post_categories FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.blog_posts bp WHERE bp.id = post_id AND bp.author_id = auth.uid()
    )
  );

CREATE POLICY "Authors or admins can delete post categories"
  ON public.blog_post_categories FOR DELETE
  TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.blog_posts bp WHERE bp.id = post_id AND bp.author_id = auth.uid()
    )
  );

-- =============================================
-- FIX 3: Restrict draft post visibility to authors/admins
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can read all posts" ON public.blog_posts;

CREATE POLICY "Authenticated users can read own or published posts"
  ON public.blog_posts
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = author_id
    OR status = 'published'::blog_post_status
    OR public.is_admin(auth.uid())
  );
