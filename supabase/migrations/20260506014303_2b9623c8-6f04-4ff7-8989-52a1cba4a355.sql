CREATE OR REPLACE FUNCTION public.admin_email_dlq_list(_limit integer DEFAULT 50)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pgmq'
AS $$
DECLARE
  result jsonb := '[]'::jsonb;
  q text;
  dlq text;
  rows jsonb;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  FOR q IN SELECT unnest(ARRAY['auth_emails', 'transactional_emails'])
  LOOP
    dlq := q || '_dlq';
    rows := '[]'::jsonb;

    BEGIN
      EXECUTE format(
        $f$
          SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'msg_id', msg_id,
            'enqueued_at', enqueued_at,
            'read_ct', read_ct,
            'recipient', message->>'to',
            'template', COALESCE(message->>'template', message->>'template_name'),
            'subject', message->>'subject',
            'message', message
          ) ORDER BY enqueued_at DESC), '[]'::jsonb)
          FROM (
            SELECT * FROM pgmq.q_%I ORDER BY enqueued_at DESC LIMIT %s
          ) sub
        $f$,
        dlq, GREATEST(LEAST(_limit, 200), 1)
      ) INTO rows;
    EXCEPTION WHEN undefined_table THEN
      rows := '[]'::jsonb;
    END;

    result := result || jsonb_build_object('queue', q, 'dlq', dlq, 'messages', rows);
  END LOOP;

  RETURN jsonb_build_object('queues', result, 'checked_at', now());
END;
$$;