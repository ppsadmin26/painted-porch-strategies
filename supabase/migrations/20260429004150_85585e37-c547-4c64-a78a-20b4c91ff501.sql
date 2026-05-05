-- Reusable timestamp trigger function (idempotent)
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Public bucket for swappable site videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('site-videos', 'site-videos', true, 524288000, ARRAY['video/mp4','video/webm','video/quicktime'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY['video/mp4','video/webm','video/quicktime'];

DROP POLICY IF EXISTS "Site videos are publicly readable" ON storage.objects;
CREATE POLICY "Site videos are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-videos');

DROP POLICY IF EXISTS "Authenticated can upload site videos" ON storage.objects;
CREATE POLICY "Authenticated can upload site videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-videos');

DROP POLICY IF EXISTS "Authenticated can update site videos" ON storage.objects;
CREATE POLICY "Authenticated can update site videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'site-videos');

DROP POLICY IF EXISTS "Authenticated can delete site videos" ON storage.objects;
CREATE POLICY "Authenticated can delete site videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'site-videos');

CREATE TABLE IF NOT EXISTS public.site_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_key TEXT NOT NULL UNIQUE,
  video_url TEXT NOT NULL,
  poster_url TEXT,
  storage_path TEXT,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site videos publicly readable" ON public.site_videos;
CREATE POLICY "Site videos publicly readable"
ON public.site_videos FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated can insert site videos" ON public.site_videos;
CREATE POLICY "Authenticated can insert site videos"
ON public.site_videos FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update site videos" ON public.site_videos;
CREATE POLICY "Authenticated can update site videos"
ON public.site_videos FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated can delete site videos" ON public.site_videos;
CREATE POLICY "Authenticated can delete site videos"
ON public.site_videos FOR DELETE
TO authenticated
USING (true);

DROP TRIGGER IF EXISTS update_site_videos_updated_at ON public.site_videos;
CREATE TRIGGER update_site_videos_updated_at
BEFORE UPDATE ON public.site_videos
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_timestamp();

INSERT INTO public.site_videos (slot_key, video_url, storage_path)
VALUES ('pilot-training-preview', '/videos/pilot-preview.mp4', null)
ON CONFLICT (slot_key) DO NOTHING;