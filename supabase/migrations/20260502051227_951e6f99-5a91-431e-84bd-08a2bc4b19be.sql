
-- Create private 'backups' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('backups', 'backups', false)
ON CONFLICT (id) DO NOTHING;

-- RLS on storage.objects: admins-only access to 'backups' bucket
CREATE POLICY "Admins can read backups"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'backups' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert backups"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'backups' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete backups"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'backups' AND public.is_admin(auth.uid()));

-- Tracking table for backup runs
CREATE TABLE public.backup_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL,
  kind text NOT NULL DEFAULT 'weekly', -- 'weekly' | 'monthly' | 'manual'
  size_bytes bigint,
  table_row_counts jsonb,
  storage_object_count integer,
  status text NOT NULL DEFAULT 'success', -- 'success' | 'failed'
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.backup_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read backup runs"
ON public.backup_runs FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Service role can insert backup runs"
ON public.backup_runs FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update backup runs"
ON public.backup_runs FOR UPDATE
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins can delete backup runs"
ON public.backup_runs FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE INDEX idx_backup_runs_created_at ON public.backup_runs (created_at DESC);
CREATE INDEX idx_backup_runs_kind ON public.backup_runs (kind);
