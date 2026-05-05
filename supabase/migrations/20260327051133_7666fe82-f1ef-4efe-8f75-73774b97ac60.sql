
-- Tighten blog_posts policy to only allow author or any authenticated user
DROP POLICY "Authenticated users can CRUD posts" ON public.blog_posts;
CREATE POLICY "Authenticated users can insert posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authenticated users can update posts" ON public.blog_posts FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Authenticated users can delete posts" ON public.blog_posts FOR DELETE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Authenticated users can read all posts" ON public.blog_posts FOR SELECT TO authenticated USING (true);

-- Tighten categories - only authenticated can insert/update/delete
DROP POLICY "Authenticated users can manage categories" ON public.blog_categories;
CREATE POLICY "Authenticated users can insert categories" ON public.blog_categories FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update categories" ON public.blog_categories FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete categories" ON public.blog_categories FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- Tighten post categories junction
DROP POLICY "Authenticated users can manage post categories" ON public.blog_post_categories;
CREATE POLICY "Authenticated users can insert post categories" ON public.blog_post_categories FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete post categories" ON public.blog_post_categories FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
