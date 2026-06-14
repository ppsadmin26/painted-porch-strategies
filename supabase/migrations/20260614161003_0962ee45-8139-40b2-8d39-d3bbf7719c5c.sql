-- Backfill anchor_id for workshop offerings so P.A.T.H.finder quiz links land on a real spot
UPDATE public.path_finder_offerings
SET anchor_id = offering_key
WHERE (anchor_id IS NULL OR anchor_id = '')
  AND current_url = '/partner/amplify/workshops';