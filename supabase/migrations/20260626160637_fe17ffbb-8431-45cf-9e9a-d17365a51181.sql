
-- 1. Add topic_slug column
ALTER TABLE public.path_finder_offerings
  ADD COLUMN IF NOT EXISTS topic_slug text;

-- 2. Backfill known keynote+workshop+lab groups
WITH groups(offering_key, slug) AS (
  VALUES
    -- Amy
    ('aiEiOh','ai-ei-oh'), ('speakingAiEiOh','ai-ei-oh'), ('aiEiOhLab','ai-ei-oh'),
    ('dontPanic','dont-panic'), ('speakingDontPanic','dont-panic'),
    ('fromDysfunctionToDynamic','dysfunction-to-dynamic'), ('speakingFromDysfunction','dysfunction-to-dynamic'),
    ('goldilocks','goldilocks-leadership'), ('speakingGoldilocks','goldilocks-leadership'), ('goldilocksLab','goldilocks-leadership'),
    ('heroesAssemble','heroes-assemble'), ('speakingHeroesAssemble','heroes-assemble'),
    ('leadAtSpeed','lead-at-speed-of-change'), ('speakingLeadAtSpeed','lead-at-speed-of-change'),
    ('shiftHappensBeReady','shift-happens'), ('speakingShIFtHappens','shift-happens'),
    ('speakingStoicism','stoicism-workplace'), ('stoicismB2B','stoicism-workplace'), ('stoicismLab','stoicism-workplace'),
    ('aliceprinciples','alice-principles'), ('speakingAlicePrinciples','alice-principles'),
    ('fromConflictToConnection','conflict-to-connection'), ('conflictToConnectionLab','conflict-to-connection'),
    ('changeForGood','change-for-good'),
    ('drivingChange3Shifts','driving-change-3-shifts'),
    ('geniusAtWork','genius-at-work'),
    ('leadershipOM','leadership-om'),
    ('pathToLastingChange','path-to-lasting-change'),
    ('architectureOfOrganizationalShift','architecture-of-organizational-shift'),
    ('stracticalLeader','stractical-leader'), ('stracticalLeaderLab','stractical-leader'),
    ('cultivatingChangeResilience','cultivating-change-resilience'),
    ('workshopCreateExtraordinaryTeams','create-extraordinary-teams-workshop'),
    -- Kick the Habit: B2B workshop vs B2C masterclass kept separate
    ('kickTheHabit','kick-the-habit-b2b'),
    ('kickTheHabitB2C','kick-the-habit-b2c'),
    -- Rob
    ('eightByEight','eight-by-eight'), ('speaking88','eight-by-eight'),
    ('borderlessCommunication','borderless-communication'), ('speakingBorderlessKeynote','borderless-communication'),
    ('getClearBeHeard','get-clear-be-heard'), ('speakingGetClear','get-clear-be-heard'),
    ('highFidelityCommunication','high-fidelity-communication'), ('speakingHighFidelity','high-fidelity-communication'),
    ('onAirReadyConfidence','on-air-ready-confidence'), ('speakingOnAir','on-air-ready-confidence'),
    ('communicateWithStyle','communicator-styles'), ('speakingCommStyle','communicator-styles'),
    -- Master Your Message: B2C course/mini vs B2B workshop kept separate
    ('masterYourMessage','master-your-message-b2c'),
    ('masterYourMessageMini','master-your-message-b2c'),
    ('masterYourMessageB2B','master-your-message-b2b')
)
UPDATE public.path_finder_offerings o
SET topic_slug = g.slug
FROM groups g
WHERE o.offering_key = g.offering_key;

-- 3. Singletons: derive slug from offering_key for any row still null
UPDATE public.path_finder_offerings
SET topic_slug = regexp_replace(lower(offering_key), '([a-z])([A-Z])', '\1-\2', 'g')
WHERE topic_slug IS NULL;
-- (no-op since previous expression operates on already-lowered text; safe fallback)
UPDATE public.path_finder_offerings
SET topic_slug = lower(regexp_replace(offering_key, '([a-z0-9])([A-Z])', '\1-\2', 'g'))
WHERE topic_slug IS NULL OR topic_slug = lower(offering_key);

CREATE INDEX IF NOT EXISTS path_finder_offerings_topic_slug_idx
  ON public.path_finder_offerings(topic_slug);

-- 4. Sync blurb / description / image_url within each topic_slug group:
--    pick the longest non-empty value as canonical, copy to all siblings.
WITH canonical AS (
  SELECT DISTINCT ON (topic_slug)
    topic_slug,
    first_value(NULLIF(trim(blurb), '')) OVER w AS canonical_blurb,
    first_value(NULLIF(trim(description), '')) OVER w AS canonical_description,
    first_value(image_url) OVER (
      PARTITION BY topic_slug
      ORDER BY (image_url IS NOT NULL) DESC, length(coalesce(image_url,'')) DESC
    ) AS canonical_image
  FROM public.path_finder_offerings
  WHERE topic_slug IS NOT NULL
  WINDOW w AS (
    PARTITION BY topic_slug
    ORDER BY length(coalesce(NULLIF(trim(description),''),'')) DESC,
             length(coalesce(NULLIF(trim(blurb),''),'')) DESC
  )
)
UPDATE public.path_finder_offerings o
SET
  blurb = COALESCE(c.canonical_blurb, o.blurb),
  description = COALESCE(c.canonical_description, o.description),
  image_url = COALESCE(c.canonical_image, o.image_url)
FROM canonical c
WHERE o.topic_slug = c.topic_slug;

-- 5. Trigger to keep sibling rows in sync going forward
CREATE OR REPLACE FUNCTION public.sync_topic_slug_siblings()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.topic_slug IS NULL THEN
    RETURN NEW;
  END IF;
  -- Only propagate when one of the shared fields actually changed
  IF TG_OP = 'UPDATE' AND
     NEW.blurb IS NOT DISTINCT FROM OLD.blurb AND
     NEW.description IS NOT DISTINCT FROM OLD.description AND
     NEW.image_url IS NOT DISTINCT FROM OLD.image_url AND
     NEW.topic_slug IS NOT DISTINCT FROM OLD.topic_slug THEN
    RETURN NEW;
  END IF;

  UPDATE public.path_finder_offerings
  SET blurb = NEW.blurb,
      description = NEW.description,
      image_url = NEW.image_url
  WHERE topic_slug = NEW.topic_slug
    AND id <> NEW.id
    AND (
      blurb IS DISTINCT FROM NEW.blurb OR
      description IS DISTINCT FROM NEW.description OR
      image_url IS DISTINCT FROM NEW.image_url
    );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_topic_slug_siblings_trg ON public.path_finder_offerings;
CREATE TRIGGER sync_topic_slug_siblings_trg
AFTER INSERT OR UPDATE OF blurb, description, image_url, topic_slug
ON public.path_finder_offerings
FOR EACH ROW EXECUTE FUNCTION public.sync_topic_slug_siblings();
