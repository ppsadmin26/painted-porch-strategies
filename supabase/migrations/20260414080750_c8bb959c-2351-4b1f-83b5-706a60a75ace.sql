
-- Create content type enum
CREATE TYPE public.youtube_content_type AS ENUM ('original', 'appearance');

-- Create youtube_videos table
CREATE TABLE public.youtube_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL,
  thumbnail_url TEXT,
  duration TEXT,
  published_date DATE,
  playlist TEXT,
  content_type public.youtube_content_type NOT NULL DEFAULT 'original',
  channel_title TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can view youtube videos"
  ON public.youtube_videos FOR SELECT
  USING (true);

-- Admin/editor write
CREATE POLICY "Admins and editors can insert youtube videos"
  ON public.youtube_videos FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins and editors can update youtube videos"
  ON public.youtube_videos FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins and editors can delete youtube videos"
  ON public.youtube_videos FOR DELETE
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

-- Category junction table
CREATE TABLE public.youtube_video_categories (
  video_id UUID NOT NULL REFERENCES public.youtube_videos(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (video_id, category_id)
);

ALTER TABLE public.youtube_video_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view youtube video categories"
  ON public.youtube_video_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins and editors can manage youtube video categories"
  ON public.youtube_video_categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins and editors can update youtube video categories"
  ON public.youtube_video_categories FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins and editors can delete youtube video categories"
  ON public.youtube_video_categories FOR DELETE
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

-- Index for common queries
CREATE INDEX idx_youtube_videos_published_date ON public.youtube_videos(published_date DESC);
CREATE INDEX idx_youtube_videos_playlist ON public.youtube_videos(playlist);
CREATE INDEX idx_youtube_videos_content_type ON public.youtube_videos(content_type);
CREATE INDEX idx_youtube_videos_youtube_video_id ON public.youtube_videos(youtube_video_id) ;
