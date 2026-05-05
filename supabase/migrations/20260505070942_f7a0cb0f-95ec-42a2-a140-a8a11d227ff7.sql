CREATE OR REPLACE FUNCTION public.admin_check_email_infra()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb := '{}'::jsonb;
  has_pgmq boolean := false;
  has_pg_cron boolean := false;
  has_pg_net boolean := false;
  q_auth boolean := false;
  q_trans boolean := false;
  q_auth_dlq boolean := false;
  q_trans_dlq boolean := false;
  t_send_log boolean := false;
  t_send_state boolean := false;
  t_suppressed boolean := false;
  t_unsub boolean := false;
  fn_enqueue boolean := false;
  fn_read boolean := false;
  fn_delete boolean := false;
  fn_dlq boolean := false;
  cron_exists boolean := false;
  cron_active boolean := false;
  cron_schedule text := NULL;
  state_row jsonb := NULL;
  send_count_24h integer := 0;
  pending_count integer := 0;
  failed_count integer := 0;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  -- Extensions
  SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname='pgmq') INTO has_pgmq;
  SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname='pg_cron') INTO has_pg_cron;
  SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname='pg_net') INTO has_pg_net;

  -- pgmq queues (tables live in pgmq schema as q_<name> and q_<name>_archive)
  IF has_pgmq THEN
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='pgmq' AND table_name='q_auth_emails') INTO q_auth;
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='pgmq' AND table_name='q_transactional_emails') INTO q_trans;
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='pgmq' AND table_name='q_auth_emails_dlq') INTO q_auth_dlq;
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='pgmq' AND table_name='q_transactional_emails_dlq') INTO q_trans_dlq;
  END IF;

  -- Tables
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='email_send_log') INTO t_send_log;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='email_send_state') INTO t_send_state;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='suppressed_emails') INTO t_suppressed;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='email_unsubscribe_tokens') INTO t_unsub;

  -- RPC wrappers
  SELECT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='enqueue_email') INTO fn_enqueue;
  SELECT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='read_email_batch') INTO fn_read;
  SELECT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='delete_email') INTO fn_delete;
  SELECT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='move_to_dlq') INTO fn_dlq;

  -- Cron job
  IF has_pg_cron THEN
    SELECT TRUE, j.active, j.schedule::text
      INTO cron_exists, cron_active, cron_schedule
      FROM cron.job j
      WHERE j.jobname = 'process-email-queue'
      LIMIT 1;
  END IF;

  -- send_state row
  IF t_send_state THEN
    SELECT to_jsonb(s) - 'updated_at' INTO state_row
    FROM (SELECT batch_size, send_delay_ms, auth_email_ttl_minutes, transactional_email_ttl_minutes, retry_after_until FROM public.email_send_state WHERE id=1) s;
  END IF;

  -- Send activity (last 24h)
  IF t_send_log THEN
    SELECT count(*) INTO send_count_24h FROM public.email_send_log WHERE created_at > now() - interval '24 hours';
    SELECT count(*) INTO pending_count FROM public.email_send_log WHERE status='pending' AND created_at > now() - interval '24 hours';
    SELECT count(*) INTO failed_count FROM public.email_send_log WHERE status IN ('dlq','failed','bounced') AND created_at > now() - interval '24 hours';
  END IF;

  result := jsonb_build_object(
    'ok', has_pgmq AND has_pg_cron AND q_auth AND q_trans AND t_send_log AND t_send_state AND t_suppressed AND t_unsub
          AND fn_enqueue AND fn_read AND fn_delete AND cron_exists AND COALESCE(cron_active, false),
    'extensions', jsonb_build_object('pgmq', has_pgmq, 'pg_cron', has_pg_cron, 'pg_net', has_pg_net),
    'queues', jsonb_build_object(
      'auth_emails', q_auth, 'transactional_emails', q_trans,
      'auth_emails_dlq', q_auth_dlq, 'transactional_emails_dlq', q_trans_dlq
    ),
    'tables', jsonb_build_object(
      'email_send_log', t_send_log, 'email_send_state', t_send_state,
      'suppressed_emails', t_suppressed, 'email_unsubscribe_tokens', t_unsub
    ),
    'rpc', jsonb_build_object(
      'enqueue_email', fn_enqueue, 'read_email_batch', fn_read,
      'delete_email', fn_delete, 'move_to_dlq', fn_dlq
    ),
    'cron', jsonb_build_object('exists', cron_exists, 'active', COALESCE(cron_active, false), 'schedule', cron_schedule),
    'send_state', state_row,
    'activity_24h', jsonb_build_object('total', send_count_24h, 'pending', pending_count, 'failed', failed_count),
    'checked_at', now()
  );

  RETURN result;
END;
$function$;