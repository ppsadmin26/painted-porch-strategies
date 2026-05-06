CREATE OR REPLACE FUNCTION public.admin_email_queue_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pgmq'
AS $$
DECLARE
  result jsonb := '[]'::jsonb;
  q text;
  dlq text;
  pending_count bigint;
  dlq_count bigint;
  oldest_pending timestamptz;
  oldest_dlq timestamptz;
  last_err record;
  queue_obj jsonb;
  auth_templates text[] := ARRAY[
    'auth_emails','invite','recovery','magic_link','signup',
    'email_change','email_change_current','email_change_new','reauthentication'
  ];
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  FOR q IN SELECT unnest(ARRAY['auth_emails', 'transactional_emails'])
  LOOP
    dlq := q || '_dlq';
    pending_count := 0;
    dlq_count := 0;
    oldest_pending := NULL;
    oldest_dlq := NULL;

    BEGIN
      EXECUTE format('SELECT count(*), min(enqueued_at) FROM pgmq.q_%I', q)
        INTO pending_count, oldest_pending;
    EXCEPTION WHEN undefined_table THEN
      pending_count := 0;
    END;

    BEGIN
      EXECUTE format('SELECT count(*), min(enqueued_at) FROM pgmq.q_%I', dlq)
        INTO dlq_count, oldest_dlq;
    EXCEPTION WHEN undefined_table THEN
      dlq_count := 0;
    END;

    SELECT l.recipient_email, l.template_name, l.error_message, l.status, l.created_at
      INTO last_err
      FROM public.email_send_log l
      WHERE l.status IN ('failed', 'dlq', 'bounced')
        AND (
          (q = 'auth_emails' AND l.template_name = ANY(auth_templates))
          OR (q = 'transactional_emails' AND NOT (l.template_name = ANY(auth_templates)))
        )
      ORDER BY l.created_at DESC
      LIMIT 1;

    queue_obj := jsonb_build_object(
      'queue', q,
      'pending', pending_count,
      'dlq', dlq_count,
      'oldest_pending', oldest_pending,
      'oldest_dlq', oldest_dlq,
      'last_error', CASE
        WHEN last_err.error_message IS NOT NULL THEN jsonb_build_object(
          'recipient', last_err.recipient_email,
          'template', last_err.template_name,
          'status', last_err.status,
          'error', last_err.error_message,
          'at', last_err.created_at
        )
        ELSE NULL
      END
    );

    result := result || queue_obj;
  END LOOP;

  RETURN jsonb_build_object('queues', result, 'checked_at', now());
END;
$$;