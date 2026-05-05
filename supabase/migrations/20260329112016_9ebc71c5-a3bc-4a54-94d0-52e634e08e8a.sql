
-- Create media type enum
CREATE TYPE public.media_type AS ENUM ('podcast', 'interview', 'article', 'webinar', 'video', 'panel');

-- Create media_appearances table
CREATE TABLE public.media_appearances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_type media_type NOT NULL DEFAULT 'podcast',
  show_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  external_url TEXT,
  appearance_date DATE,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for media appearance categories (reusing blog_categories)
CREATE TABLE public.media_appearance_categories (
  appearance_id UUID NOT NULL REFERENCES public.media_appearances(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (appearance_id, category_id)
);

-- Enable RLS
ALTER TABLE public.media_appearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_appearance_categories ENABLE ROW LEVEL SECURITY;

-- Public can read all appearances
CREATE POLICY "Public can read appearances" ON public.media_appearances FOR SELECT TO public USING (true);
CREATE POLICY "Public can read appearance categories" ON public.media_appearance_categories FOR SELECT TO public USING (true);

-- Authenticated users can manage
CREATE POLICY "Auth users can insert appearances" ON public.media_appearances FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update appearances" ON public.media_appearances FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete appearances" ON public.media_appearances FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth users can insert appearance categories" ON public.media_appearance_categories FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete appearance categories" ON public.media_appearance_categories FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- Seed existing hardcoded data
INSERT INTO public.media_appearances (media_type, show_name, title, description) VALUES
  ('podcast', 'The Change Management Show', 'Building Change-Ready Organizations', 'Amy discusses the principles behind organizational change readiness and why most initiatives fail.'),
  ('podcast', 'Leadership Unfiltered', 'Stoic Principles for Modern Leaders', 'Exploring how ancient philosophy can guide today''s business decisions.'),
  ('interview', 'Healthcare Staffing Summit', 'Transformation in Healthcare Staffing', 'Keynote interview on the unique challenges of change in the healthcare staffing industry.'),
  ('article', 'HR Executive Magazine', 'The Case for Change Readiness', 'Featured article on why organizations should invest in readiness before transformation.'),
  ('podcast', 'The Mindful Leader', 'Mindfulness in Business', 'Sierra shares practical mindfulness techniques for busy executives.'),
  ('podcast', 'Communication Mastery', 'The Art of Strategic Messaging', 'Rob discusses the architecture of messages that drive behavior change.');
