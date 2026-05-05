CREATE TABLE IF NOT EXISTS public.backup_settings (
  id boolean PRIMARY KEY DEFAULT true,
  retention_days integer NOT NULL DEFAULT 90 CHECK (retention_days >= 1 AND retention_days <= 3650),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT backup_settings_singleton CHECK (id = true)
);

INSERT INTO public.backup_settings (id, retention_days)
VALUES (true, 90)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.backup_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read backup settings"
  ON public.backup_settings FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update backup settings"
  ON public.backup_settings FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Service role can read backup settings"
  ON public.backup_settings FOR SELECT TO public
  USING (auth.role() = 'service_role');