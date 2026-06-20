ALTER TABLE public.path_finder_offerings
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS is_keynote boolean NOT NULL DEFAULT false;