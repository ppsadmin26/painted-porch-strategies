-- Add RT-pool mapping columns so admins can change which offerings appear in
-- which P.A.T.H. Finder result types (B2C RT1-6, B2B RT-A..E) without code.
-- Pool values per RT: "free", "speaking" (B2B only). "primary" reserved for future use.
ALTER TABLE public.path_finder_offerings
  ADD COLUMN IF NOT EXISTS b2c_rt_pools jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS b2b_rt_pools jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Backfill B2B FREE_RESOURCES_BY_RT and SPEAKING_BY_RT from the TS source of truth.
-- RT-A free
UPDATE public.path_finder_offerings SET b2b_rt_pools = b2b_rt_pools || jsonb_build_object('RT-A', to_jsonb(ARRAY['free']))
  WHERE offering_key IN ('communicatingChangeWorkbook','stoicLeaderFieldGuide','fiftyTwoStoicism','burnoutResources');
-- RT-B free
UPDATE public.path_finder_offerings SET b2b_rt_pools = b2b_rt_pools || jsonb_build_object('RT-B', to_jsonb(ARRAY['free']))
  WHERE offering_key IN ('strategicChangeCanvas','communicatingChangeWorkbook','fiftyTwoStoicism');
-- RT-C free
UPDATE public.path_finder_offerings SET b2b_rt_pools = b2b_rt_pools || jsonb_build_object('RT-C', to_jsonb(ARRAY['free']))
  WHERE offering_key IN ('stoicLeaderFieldGuide','stracticalMini','fiftyTwoStoicism','communicatingChangeWorkbook');
-- RT-D free
UPDATE public.path_finder_offerings SET b2b_rt_pools = b2b_rt_pools || jsonb_build_object('RT-D', to_jsonb(ARRAY['free']))
  WHERE offering_key IN ('strategicChangeCanvas','stoicLeaderFieldGuide','communicatingChangeWorkbook','stracticalMini');
-- RT-E free
UPDATE public.path_finder_offerings SET b2b_rt_pools = b2b_rt_pools || jsonb_build_object('RT-E', to_jsonb(ARRAY['free']))
  WHERE offering_key IN ('strategicChangeCanvas','stoicLeaderFieldGuide','burnoutResources','fiftyTwoStoicism');

-- Speaking (merge with existing free pool if same offering already had RT-X)
-- Helper: append 'speaking' to existing array if key already exists, else set new.
DO $$
DECLARE
  rec record;
  rt text;
  keys text[];
  k text;
  existing jsonb;
  arr jsonb;
BEGIN
  FOR rt, keys IN
    SELECT * FROM (VALUES
      ('RT-A', ARRAY['speakingHeroesAssemble','speakingFromDysfunction','speakingPowerOfStory','speakingFindingJoy','speakingReignitingResilience']),
      ('RT-B', ARRAY['speakingShIFtHappens','speakingLeadAtSpeed','speakingAiEiOh','speakingAlicePrinciples','speakingDontPanic','speakingFromPassengerToPilot']),
      ('RT-C', ARRAY['speakingGoldilocks','speakingStoicism','speakingGetClear','speaking88','speakingCommStyle','speakingRadicallyMindful']),
      ('RT-D', ARRAY['speakingShIFtHappens','speakingAlicePrinciples','speakingStoicism']),
      ('RT-E', ARRAY['speakingHeroesAssemble','speakingShIFtHappens','speakingGoldilocks'])
    ) AS t(rt, keys)
  LOOP
    FOREACH k IN ARRAY keys LOOP
      SELECT b2b_rt_pools->rt INTO existing FROM public.path_finder_offerings WHERE offering_key = k;
      IF existing IS NULL THEN
        arr := to_jsonb(ARRAY['speaking']);
      ELSE
        IF NOT (existing ? 'speaking') THEN
          arr := existing || to_jsonb(ARRAY['speaking']);
        ELSE
          arr := existing;
        END IF;
      END IF;
      UPDATE public.path_finder_offerings
        SET b2b_rt_pools = b2b_rt_pools || jsonb_build_object(rt, arr)
        WHERE offering_key = k;
    END LOOP;
  END LOOP;
END $$;

-- Backfill B2C free pools from the inline groups inside b2cResult().
-- RT1 Free Starting Points
UPDATE public.path_finder_offerings SET b2c_rt_pools = b2c_rt_pools || jsonb_build_object('RT1', to_jsonb(ARRAY['free']))
  WHERE offering_key IN ('stoicLeaderFieldGuide','fiftyTwoStoicism','burnoutResources');
-- RT3 Free Starting Points
UPDATE public.path_finder_offerings SET b2c_rt_pools = b2c_rt_pools || jsonb_build_object('RT3', to_jsonb(ARRAY['free']))
  WHERE offering_key IN ('stoicLeaderFieldGuide');
-- RT4 Free Tools
UPDATE public.path_finder_offerings SET b2c_rt_pools = b2c_rt_pools || jsonb_build_object('RT4', to_jsonb(ARRAY['free']))
  WHERE offering_key IN ('strategicChangeCanvas','communicatingChangeWorkbook','stoicLeaderFieldGuide');
-- RT5 Free Starting Points
UPDATE public.path_finder_offerings SET b2c_rt_pools = b2c_rt_pools || jsonb_build_object('RT5', to_jsonb(ARRAY['free']))
  WHERE offering_key IN ('stoicLeaderFieldGuide');
-- RT6 Free Starting Points
UPDATE public.path_finder_offerings SET b2c_rt_pools = b2c_rt_pools || jsonb_build_object('RT6', to_jsonb(ARRAY['free']))
  WHERE offering_key IN ('stoicLeaderFieldGuide','fiftyTwoStoicism','burnoutResources','stracticalMini');
