ALTER TABLE public.path_finder_offerings
  ADD COLUMN IF NOT EXISTS blue_door_required boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.path_finder_offerings.blue_door_required IS
  'Canonical mirror from PPS Op Platform. When true, the offering cannot be recommended as a parallel/activate-now workshop in the P.A.T.H.finder quiz — it will only surface in the "Once the Blue Door work is complete" group. Managed via the Resync panel in /admin/offerings; do not edit by hand.';