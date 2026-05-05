CREATE TABLE public.page_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('live', 'draft')),
  note text,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_status_path ON public.page_status(path);

ALTER TABLE public.page_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page status"
  ON public.page_status FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert page status"
  ON public.page_status FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update page status"
  ON public.page_status FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete page status"
  ON public.page_status FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER set_page_status_updated_at
  BEFORE UPDATE ON public.page_status
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();