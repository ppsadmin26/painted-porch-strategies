
-- Helper: list backup cron jobs with next run time (admin-only)
CREATE OR REPLACE FUNCTION public.admin_list_backup_schedules()
RETURNS TABLE(jobid bigint, jobname text, schedule text, active boolean, next_run timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT
    j.jobid,
    j.jobname::text,
    j.schedule::text,
    j.active,
    -- Best-effort next run from pg_cron details if available
    (SELECT min(d.start_time)
       FROM cron.job_run_details d
      WHERE d.jobid = j.jobid
        AND d.status = 'starting'
        AND d.start_time > now())::timestamptz AS next_run
  FROM cron.job j
  WHERE j.jobname IN ('auto-backup-weekly', 'auto-backup-monthly')
  ORDER BY j.jobname;
END;
$$;

-- Helper: toggle a backup cron job on/off (admin-only)
CREATE OR REPLACE FUNCTION public.admin_set_backup_schedule_active(_jobname text, _active boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _jobid bigint;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF _jobname NOT IN ('auto-backup-weekly', 'auto-backup-monthly') THEN
    RAISE EXCEPTION 'Unknown job %', _jobname;
  END IF;

  SELECT jobid INTO _jobid FROM cron.job WHERE jobname = _jobname;
  IF _jobid IS NULL THEN
    RAISE EXCEPTION 'Job % not found', _jobname;
  END IF;

  PERFORM cron.alter_job(job_id := _jobid, active := _active);
  RETURN true;
END;
$$;
