ALTER TABLE public.backup_settings
  ADD COLUMN IF NOT EXISTS retention_days_weekly integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS retention_days_monthly integer NOT NULL DEFAULT 60;

UPDATE public.backup_settings
   SET retention_days_weekly = 30,
       retention_days_monthly = 60,
       updated_at = now()
 WHERE id = true;