
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'editor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Blog categories
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#007697',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage categories" ON public.blog_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Blog posts
CREATE TYPE public.blog_post_status AS ENUM ('draft', 'pending', 'approved', 'published');

CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Untitled Post',
  slug TEXT UNIQUE,
  excerpt TEXT DEFAULT '',
  body_json JSONB DEFAULT '{}',
  cover_image_url TEXT,
  status blog_post_status NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT false,
  author_id UUID REFERENCES public.profiles(id),
  publish_date TIMESTAMPTZ,
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  seo_keywords TEXT[] DEFAULT '{}',
  geo_tags TEXT[] DEFAULT '{}',
  aeo_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can CRUD posts" ON public.blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can read published posts" ON public.blog_posts FOR SELECT USING (status = 'published');

-- Blog post categories junction
CREATE TABLE public.blog_post_categories (
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);
ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read post categories" ON public.blog_post_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage post categories" ON public.blog_post_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

CREATE POLICY "Authenticated users can upload blog images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-images');
CREATE POLICY "Anyone can view blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Authenticated users can delete blog images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blog-images');

-- Seed default categories matching existing Sanity categories
INSERT INTO public.blog_categories (title, slug, color) VALUES
  ('Stoicism & Philosophy', 'stoicism-philosophy', '#523387'),
  ('Leadership', 'leadership', '#007697'),
  ('Change & Transformation', 'change-transformation', '#FF8000'),
  ('Teams & Culture', 'teams-culture', '#70A300'),
  ('Mindset & Growth', 'mindset-growth', '#E8A231'),
  ('Resilience & Wellbeing', 'resilience-wellbeing', '#DB0043'),
  ('Communication', 'communication', '#007697'),
  ('Workplace & Operations', 'workplace-operations', '#545454'),
  ('Productivity & Focus', 'productivity-focus', '#70A300'),
  ('Resources', 'resources', '#523387'),
  ('As Seen On', 'as-seen-on', '#E8A231');
