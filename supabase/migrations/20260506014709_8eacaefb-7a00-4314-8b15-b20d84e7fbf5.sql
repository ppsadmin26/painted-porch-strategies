CREATE OR REPLACE FUNCTION public.admin_email_queue_messages(
  _queue text DEFAULT NULL,
  _kind text DEFAULT 'all',
  _limit integer DEFAULT 100
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pgmq'
AS $$
DECLARE
  result jsonb := '[]'::jsonb;
  q text;
  queues text[];
  kinds text[];
  k text;
  tbl text;
  rows jsonb;
  state_row record;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT auth_email_ttl_minutes, transactional_email_ttl_minutes, max_attempts
    INTO state_row FROM public.email_send_state WHERE id = 1;

  IF _queue IS NULL OR _queue = 'all' THEN
    queues := ARRAY['auth_emails', 'transactional_emails'];
  ELSE
    queues := ARRAY[_queue];
  END IF;

  IF _kind = 'active' THEN
    kinds := ARRAY['active'];
  ELSIF _kind = 'dlq' THEN
    kinds := ARRAY['dlq'];
  ELSE
    kinds := ARRAY['active', 'dlq'];
  END IF;

  FOREACH q IN ARRAY queues LOOP
    FOREACH k IN ARRAY kinds LOOP
      IF k = 'active' THEN
        tbl := 'q_' || q;
      ELSE
        tbl := 'q_' || q || '_dlq';
      END IF;
      rows := '[]'::jsonb;
      BEGIN
        EXECUTE format(
          $f$
            SELECT COALESCE(jsonb_agg(jsonb_build_object(
              'msg_id', msg_id,
              'enqueued_at', enqueued_at,
              'vt', vt,
              'read_ct', read_ct,
              'recipient', message->>'to',
              'template', COALESCE(message->>'template', message->>'template_name'),
              'subject', message->>'subject',
              'message', message
            ) ORDER BY enqueued_at DESC), '[]'::jsonb)
            FROM (SELECT * FROM pgmq.%I ORDER BY enqueued_at DESC LIMIT %s) sub
          $f$,
          tbl, GREATEST(LEAST(_limit, 500), 1)
        ) INTO rows;
      EXCEPTION WHEN undefined_table THEN
        rows := '[]'::jsonb;
      END;
      result := result || jsonb_build_array(jsonb_build_object(
        'queue', q, 'kind', k, 'table', tbl, 'messages', rows
      ));
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object(
    'queues', result,
    'auth_email_ttl_minutes', state_row.auth_email_ttl_minutes,
    'transactional_email_ttl_minutes', state_row.transactional_email_ttl_minutes,
    'max_attempts', state_row.max_attempts,
    'checked_at', now()
  );
END;
$$;