ALTER TABLE public.path_finder_offerings
  ADD COLUMN IF NOT EXISTS launch_slug text;

CREATE INDEX IF NOT EXISTS path_finder_offerings_launch_slug_idx
  ON public.path_finder_offerings (launch_slug);

-- Backfill: anchor_id often matches launch slug exactly.
UPDATE public.path_finder_offerings o
   SET launch_slug = o.anchor_id
  FROM public.course_launch_status l
 WHERE o.launch_slug IS NULL
   AND o.anchor_id IS NOT NULL
   AND o.anchor_id = l.slug;

-- Manual mappings for offerings whose anchor doesn't match the launch slug.
UPDATE public.path_finder_offerings SET launch_slug = 'lab-goldilocks-leadership'
 WHERE offering_key = 'goldilocksLab' AND launch_slug IS NULL;
UPDATE public.path_finder_offerings SET launch_slug = 'lab-stractical-leadership'
 WHERE offering_key = 'stracticalLeaderLab' AND launch_slug IS NULL;
UPDATE public.path_finder_offerings SET launch_slug = 'lab-leading-change'
 WHERE offering_key = 'leadingChangeLab' AND launch_slug IS NULL;
UPDATE public.path_finder_offerings SET launch_slug = 'lab-dysfunction-to-dynamic'
 WHERE offering_key = 'fromDysfunctionToDynamic' AND launch_slug IS NULL;
UPDATE public.path_finder_offerings SET launch_slug = 'lab-mission-unstoppable'
 WHERE offering_key IN ('heroesAssemble') AND launch_slug IS NULL;
UPDATE public.path_finder_offerings SET launch_slug = 'lab-operations-on-purpose'
 WHERE offering_key = 'leadershipOM' AND launch_slug IS NULL;
UPDATE public.path_finder_offerings SET launch_slug = 'leading-change-course'
 WHERE offering_key = 'pathToLastingChange' AND launch_slug IS NULL;