CREATE TABLE public.page_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL UNIQUE,
  title text,
  description text,
  og_title text,
  og_description text,
  og_image text,
  canonical text,
  keywords text[],
  robots text,
  jsonld jsonb,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_seo_path ON public.page_seo(path);

GRANT SELECT ON public.page_seo TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.page_seo TO authenticated;
GRANT ALL ON public.page_seo TO service_role;

ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page seo"
  ON public.page_seo FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins and editors can insert page seo"
  ON public.page_seo FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins and editors can update page seo"
  ON public.page_seo FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can delete page seo"
  ON public.page_seo FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER page_seo_updated_at
  BEFORE UPDATE ON public.page_seo
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();