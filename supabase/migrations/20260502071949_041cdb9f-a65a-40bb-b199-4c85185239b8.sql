CREATE OR REPLACE FUNCTION public.admin_list_backup_schedules()
 RETURNS TABLE(jobid bigint, jobname text, schedule text, active boolean, next_run timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    (
      SELECT min(d.start_time)
        FROM cron.job_run_details d
       WHERE d.jobid = j.jobid
         AND d.status = 'starting'
         AND d.start_time > now()
         AND d.start_time < now() + interval '40 days'
    )::timestamptz AS next_run
  FROM cron.job j
  WHERE j.jobname IN ('auto-backup-weekly', 'auto-backup-monthly')
  ORDER BY j.jobname;
END;
$function$;