ALTER TABLE public.path_finder_offerings
  ALTER COLUMN engagement_tier SET DEFAULT 'NONE'::public.engagement_tier_t,
  ALTER COLUMN delivery_format SET DEFAULT 'free_resource'::public.delivery_format_t;