
-- Phase C: split offering publish state from page live state.
ALTER TABLE public.path_finder_offerings
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS include_in_quiz BOOLEAN NOT NULL DEFAULT true;

-- One-time backfill: existing is_live state seeds is_published.
UPDATE public.path_finder_offerings
SET is_published = COALESCE(is_live, false)
WHERE is_published IS DISTINCT FROM COALESCE(is_live, false);

-- Bidirectional sync trigger keeps is_live (deprecated) and is_published
-- aligned during the transition until the Op Platform sync owns is_published
-- exclusively. Safe to drop in a follow-up cleanup migration.
CREATE OR REPLACE FUNCTION public.sync_offering_publish_flags()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_published IS DISTINCT FROM NEW.is_live THEN
      -- Prefer explicit is_published when both differ on insert.
      NEW.is_live := NEW.is_published;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.is_published IS DISTINCT FROM OLD.is_published
       AND NEW.is_live IS NOT DISTINCT FROM OLD.is_live THEN
      NEW.is_live := NEW.is_published;
    ELSIF NEW.is_live IS DISTINCT FROM OLD.is_live
       AND NEW.is_published IS NOT DISTINCT FROM OLD.is_published THEN
      NEW.is_published := NEW.is_live;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_offering_publish_flags_trg ON public.path_finder_offerings;
CREATE TRIGGER sync_offering_publish_flags_trg
BEFORE INSERT OR UPDATE ON public.path_finder_offerings
FOR EACH ROW EXECUTE FUNCTION public.sync_offering_publish_flags();
