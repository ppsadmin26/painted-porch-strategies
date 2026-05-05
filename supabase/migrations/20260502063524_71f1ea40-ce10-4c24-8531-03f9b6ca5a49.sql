-- Slots registry: each row defines a video slot a page can reference.
-- Editors and admins can manage these so new pages don't need code changes.
CREATE TABLE IF NOT EXISTS public.site_video_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_key text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE INDEX IF NOT EXISTS idx_site_video_slots_sort ON public.site_video_slots (sort_order, slot_key);

ALTER TABLE public.site_video_slots ENABLE ROW LEVEL SECURITY;

-- Public read so the same hook can resolve slot metadata if needed
CREATE POLICY "Site video slots publicly readable"
  ON public.site_video_slots FOR SELECT
  USING (true);

CREATE POLICY "Admins or editors can insert slots"
  ON public.site_video_slots FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins or editors can update slots"
  ON public.site_video_slots FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins or editors can delete slots"
  ON public.site_video_slots FOR DELETE
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

CREATE TRIGGER trg_site_video_slots_updated_at
  BEFORE UPDATE ON public.site_video_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

-- Seed the existing hardcoded slots so nothing disappears from the admin UI
INSERT INTO public.site_video_slots (slot_key, label, description, sort_order) VALUES
  ('pilot-training-preview', 'Pilot Training Preview', 'Preview video shown on the /pilot-training opt-in page.', 10),
  ('kick-the-habit-preview', 'Kick the Habit Preview', 'Preview video shown on the /resources/kick-the-habit opt-in page.', 20),
  ('talking-to-strangers-preview', 'Talking to Strangers Preview', 'Preview video shown on the /resources/master-your-message (Talking to Strangers) page.', 30),
  ('journaling-challenge-teaser', 'Journaling Challenge Teaser', 'Teaser video shown on the /resources/journaling-challenge masterclass page.', 40),
  ('superpowers-of-a-team-hero', 'Superpowers of a Team Hero', 'Hero video shown on the Superpowers of a Team / Team Challenge page.', 50),
  ('ignite-hero', 'IGNITE Hero', 'Background hero video on /partner/ignite.', 60),
  ('amplify-hero', 'AMPLIFY Hero', 'Background hero video on /partner/amplify.', 70),
  ('embody-hero', 'EMBODY Hero', 'Background hero video on /partner/embody.', 80),
  ('partner-hub-hero', 'Partner Hub Hero', 'Background hero video on the /partner hub page.', 90),
  ('faq-hero', 'FAQ Hero', 'Background hero video on /resources/faq.', 100),
  ('impact-hero', 'Our Impact Hero', 'Background hero video on /about/impact (uses dual-video crossfade for seamless looping).', 110)
ON CONFLICT (slot_key) DO NOTHING;