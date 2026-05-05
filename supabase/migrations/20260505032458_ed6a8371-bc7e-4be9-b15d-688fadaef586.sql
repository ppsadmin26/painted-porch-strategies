
ALTER TABLE public.backup_runs
  ADD COLUMN IF NOT EXISTS logs jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS finished_at timestamptz,
  ADD COLUMN IF NOT EXISTS duration_ms integer,
  ADD COLUMN IF NOT EXISTS failed_steps jsonb,
  ADD COLUMN IF NOT EXISTS parent_run_id uuid REFERENCES public.backup_runs(id) ON DELETE SET NULL;

-- Allow 'partial' and 'running' status values (no enum, just text)
COMMENT ON COLUMN public.backup_runs.status IS 'running | success | partial | failed';
COMMENT ON COLUMN public.backup_runs.logs IS 'Array of {ts, level, message, ms?} entries captured during the run';
COMMENT ON COLUMN public.backup_runs.failed_steps IS '{tables: string[], storage: {bucket,path}[]} - used by the retry action';
