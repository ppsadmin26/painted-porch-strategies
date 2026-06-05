CREATE TABLE public.course_launch_status (
  slug TEXT PRIMARY KEY,
  course_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'coming_soon' CHECK (status IN ('coming_soon','live')),
  checkout_url TEXT,
  course_path TEXT NOT NULL,
  notified_at TIMESTAMPTZ,
  notified_count INTEGER NOT NULL DEFAULT 0,
  last_notify_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.course_launch_status TO anon;
GRANT SELECT ON public.course_launch_status TO authenticated;
GRANT ALL ON public.course_launch_status TO service_role;

ALTER TABLE public.course_launch_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read course launch status"
  ON public.course_launch_status FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can update course launch status"
  ON public.course_launch_status FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert course launch status"
  ON public.course_launch_status FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_course_launch_status_updated
  BEFORE UPDATE ON public.course_launch_status
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

INSERT INTO public.course_launch_status (slug, course_name, course_path, status) VALUES
  ('master-your-message', 'Master Your Message', '/communication', 'coming_soon'),
  ('radical-mindfulness', 'Radical Mindfulness', '/mindfulness', 'coming_soon'),
  ('create-extraordinary-teams', 'Create Extraordinary Teams', '/teams', 'coming_soon')
ON CONFLICT (slug) DO NOTHING;