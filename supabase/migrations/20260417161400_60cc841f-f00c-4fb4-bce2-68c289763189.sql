-- Enable required extensions for cron + http
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove existing job if it exists (idempotent)
DO $$
BEGIN
  PERFORM cron.unschedule('daily-scan-linkedin-articles');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Schedule daily scan at 9:00 AM UTC (4am ET / 1am PT)
SELECT cron.schedule(
  'daily-scan-linkedin-articles',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://kzbcudiorvnsqqgyzusl.supabase.co/functions/v1/scan-linkedin-articles',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YmN1ZGlvcnZuc3FxZ3l6dXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNTkwMzIsImV4cCI6MjA4NjgzNTAzMn0.6H2JHvJzttQt1D4ai2_BwLqWgnMGdtsEm5zxJmtcs1U"}'::jsonb,
    body := '{"trigger": "cron"}'::jsonb
  ) AS request_id;
  $$
);