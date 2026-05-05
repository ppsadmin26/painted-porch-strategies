ALTER TABLE public.backup_settings ALTER COLUMN retention_days SET DEFAULT 30;
UPDATE public.backup_settings SET retention_days = 30, updated_at = now() WHERE retention_days = 90;