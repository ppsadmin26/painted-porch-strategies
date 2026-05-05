
-- Add author-related columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_author boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_guest_author boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS author_bio text;

-- Allow public (anonymous) to read author profiles for blog post display
CREATE POLICY "Public can read author profiles"
  ON public.profiles
  FOR SELECT
  TO public
  USING (is_author = true);

-- Allow contributors to read/update their own posts
-- (existing policies already handle author_id = auth.uid() for blog_posts)

-- Allow admins to insert profiles (for author-only entries without auth users)
CREATE POLICY "Admins can insert profiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Allow admins to delete profiles (for removing author-only entries)
CREATE POLICY "Admins can delete profiles"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));
