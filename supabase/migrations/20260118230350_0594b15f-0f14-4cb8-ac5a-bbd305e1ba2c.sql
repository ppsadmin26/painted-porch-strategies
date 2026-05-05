-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage on cron schema to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create the cron job to check for stuck analyses every 5 minutes
SELECT cron.schedule(
  'check-stuck-analyses-every-5-min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ycwitjvuhtkvtnbfvuhl.supabase.co/functions/v1/check-stuck-analyses',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljd2l0anZ1aHRrdnRuYmZ2dWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2ODM3NDMsImV4cCI6MjA4NDI1OTc0M30.zfXwToNUgc1TRL4SuWMgbJcmNf70W36fe1CclV0D1p0"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);