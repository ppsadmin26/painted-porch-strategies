-- Add plain tier column, maintained by trigger
ALTER TABLE public.path_finder_offerings ADD COLUMN tier text;

CREATE OR REPLACE FUNCTION public.sync_offering_tier()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.tier := CASE
    WHEN NEW.delivery_format = 'blue_door'     THEN 'Blue Door'
    WHEN NEW.delivery_format = 'free_resource' THEN 'Free'
    WHEN NEW.delivery_format = 'assessment'    THEN 'Assessment'
    WHEN NEW.delivery_format IN ('speaking','keynote') AND NEW.engagement_tier = 'NONE' THEN 'Speaking'
    WHEN NEW.delivery_format = 'workshop'      THEN 'Workshop'
    WHEN NEW.delivery_format = 'lab'           THEN 'AMPLIFY'
    WHEN NEW.delivery_format = 'course'        THEN 'IGNITE'
    WHEN NEW.delivery_format = 'keynote'       THEN 'Speaking'
    ELSE NEW.engagement_tier::text
  END;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_offering_tier_trg
  BEFORE INSERT OR UPDATE OF engagement_tier, delivery_format, tier
  ON public.path_finder_offerings
  FOR EACH ROW EXECUTE FUNCTION public.sync_offering_tier();

-- Backfill existing rows
UPDATE public.path_finder_offerings SET engagement_tier = engagement_tier;

ALTER TABLE public.path_finder_offerings ALTER COLUMN tier SET NOT NULL;
CREATE INDEX path_finder_offerings_tier_idx ON public.path_finder_offerings (tier);
COMMENT ON COLUMN public.path_finder_offerings.tier IS 'Auto-derived from (engagement_tier, delivery_format) via trigger. Do not write directly — write to the split columns.';