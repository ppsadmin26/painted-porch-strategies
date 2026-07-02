-- 1. Enums
CREATE TYPE public.engagement_tier_t AS ENUM ('IGNITE','AMPLIFY','EMBODY','NONE');
CREATE TYPE public.delivery_format_t AS ENUM ('keynote','speaking','workshop','lab','course','assessment','free_resource','blue_door');

-- 2. New nullable columns
ALTER TABLE public.path_finder_offerings
  ADD COLUMN engagement_tier public.engagement_tier_t,
  ADD COLUMN delivery_format public.delivery_format_t;

-- 3. Backfill engagement_tier from current tier
UPDATE public.path_finder_offerings SET engagement_tier = CASE
  WHEN tier = 'IGNITE'     THEN 'IGNITE'::public.engagement_tier_t
  WHEN tier = 'AMPLIFY'    THEN 'AMPLIFY'::public.engagement_tier_t
  WHEN tier = 'EMBODY'     THEN 'EMBODY'::public.engagement_tier_t
  WHEN tier = 'Workshop'   THEN 'AMPLIFY'::public.engagement_tier_t
  WHEN tier = 'Assessment' THEN 'IGNITE'::public.engagement_tier_t
  ELSE 'NONE'::public.engagement_tier_t   -- Free, Speaking, Blue Door
END;

-- 4. Backfill delivery_format from tier + flags (keynote wins over workshop)
UPDATE public.path_finder_offerings SET delivery_format = CASE
  WHEN tier = 'Blue Door'  THEN 'blue_door'::public.delivery_format_t
  WHEN tier = 'Free'       THEN 'free_resource'::public.delivery_format_t
  WHEN tier = 'Assessment' THEN 'assessment'::public.delivery_format_t
  WHEN tier = 'Speaking'   THEN CASE WHEN is_keynote THEN 'keynote' ELSE 'speaking' END::public.delivery_format_t
  WHEN tier = 'IGNITE' THEN
    CASE
      WHEN name ILIKE '%assessment%' OR name ILIKE '%appraisal%' OR name ILIKE '%analysis%' OR name ILIKE '%EQ-i%' OR name ILIKE '%EQ360%' OR name ILIKE '%Performance DNA%'
        THEN 'assessment'
      WHEN is_keynote THEN 'keynote'
      ELSE 'course'
    END::public.delivery_format_t
  WHEN tier = 'AMPLIFY' THEN
    CASE WHEN include_in_workshops THEN 'workshop' ELSE 'lab' END::public.delivery_format_t
  WHEN tier = 'EMBODY' THEN 'workshop'::public.delivery_format_t
  WHEN tier = 'Workshop' THEN
    CASE WHEN is_keynote THEN 'keynote' ELSE 'workshop' END::public.delivery_format_t
  ELSE 'workshop'::public.delivery_format_t
END;

-- 5. Lock down
ALTER TABLE public.path_finder_offerings
  ALTER COLUMN engagement_tier SET NOT NULL,
  ALTER COLUMN delivery_format SET NOT NULL;

-- 6. Drop legacy tier
ALTER TABLE public.path_finder_offerings DROP COLUMN tier;

-- 7. Indexes
CREATE INDEX path_finder_offerings_engagement_tier_idx ON public.path_finder_offerings (engagement_tier);
CREATE INDEX path_finder_offerings_delivery_format_idx ON public.path_finder_offerings (delivery_format);