-- Fix: admin_status should be NULL by default, not 'pending_analysis'
-- This prevents incomplete assessments from triggering stuck analysis alerts

-- 1. Change the default value to NULL
ALTER TABLE public.assessments 
ALTER COLUMN admin_status DROP DEFAULT;

-- 2. Clear admin_status for any incomplete assessments (not yet submitted)
UPDATE public.assessments 
SET admin_status = NULL 
WHERE status != 'completed' 
  AND completion_timestamp IS NULL;