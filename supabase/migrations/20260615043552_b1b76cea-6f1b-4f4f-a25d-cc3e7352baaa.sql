ALTER TABLE public.path_finder_offerings
  ADD COLUMN IF NOT EXISTS is_featured_in_quiz boolean NOT NULL DEFAULT false;

-- Backfill: any offering that already has an anchor on a public page is
-- treated as "featured" so the narrowed quiz pool isn't empty on day one.
UPDATE public.path_finder_offerings
   SET is_featured_in_quiz = true
 WHERE anchor_id IS NOT NULL
   AND is_featured_in_quiz = false;