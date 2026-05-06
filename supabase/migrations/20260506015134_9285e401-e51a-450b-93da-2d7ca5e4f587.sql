-- Requeue a DLQ message back to its active queue with fresh read_ct
CREATE OR REPLACE FUNCTION public.admin_email_requeue_dlq(_queue text, _msg_id bigint)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pgmq'
AS $$
DECLARE
  payload jsonb;
  dlq text;
  new_id bigint;
BEGIN
  IF NOT public.is_admin_or_editor(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF _queue NOT IN ('auth_emails', 'transactional_emails') THEN
    RAISE EXCEPTION 'Invalid queue';
  END IF;
  dlq := _queue || '_dlq';

  EXECUTE format('SELECT message FROM pgmq.q_%I WHERE msg_id = $1', dlq)
    INTO payload USING _msg_id;

  IF payload IS NULL THEN
    RAISE EXCEPTION 'Message not found in DLQ';
  END IF;

  -- Reset retry tracking on the payload so dispatcher treats it fresh
  payload := payload || jsonb_build_object('requeued_at', now());

  SELECT pgmq.send(_queue, payload) INTO new_id;
  PERFORM pgmq.delete(dlq, _msg_id);

  RETURN jsonb_build_object('ok', true, 'new_msg_id', new_id);
END;
$$;

-- Delete a single message from active or DLQ
CREATE OR REPLACE FUNCTION public.admin_email_delete_message(_queue text, _kind text, _msg_id bigint)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pgmq'
AS $$
DECLARE
  qname text;
  ok boolean;
BEGIN
  IF NOT public.is_admin_or_editor(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF _queue NOT IN ('auth_emails', 'transactional_emails') THEN
    RAISE EXCEPTION 'Invalid queue';
  END IF;
  IF _kind NOT IN ('active', 'dlq') THEN
    RAISE EXCEPTION 'Invalid kind';
  END IF;

  qname := CASE WHEN _kind = 'dlq' THEN _queue || '_dlq' ELSE _queue END;
  SELECT pgmq.delete(qname, _msg_id) INTO ok;
  RETURN jsonb_build_object('ok', COALESCE(ok, false));
END;
$$;

-- Purge entire DLQ for a queue
CREATE OR REPLACE FUNCTION public.admin_email_purge_dlq(_queue text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pgmq'
AS $$
DECLARE
  dlq text;
  removed integer := 0;
BEGIN
  IF NOT public.is_admin_or_editor(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF _queue NOT IN ('auth_emails', 'transactional_emails') THEN
    RAISE EXCEPTION 'Invalid queue';
  END IF;
  dlq := _queue || '_dlq';

  EXECUTE format('SELECT count(*) FROM pgmq.q_%I', dlq) INTO removed;
  EXECUTE format('SELECT pgmq.purge_queue(%L)', dlq);

  RETURN jsonb_build_object('ok', true, 'removed', removed);
END;
$$;

-- Reset visibility timeout on a stuck active message so it's processed now,
-- or force-move it to DLQ if it's beyond saving.
CREATE OR REPLACE FUNCTION public.admin_email_reset_stuck(
  _queue text,
  _msg_id bigint,
  _action text DEFAULT 'release' -- 'release' | 'move_to_dlq'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pgmq'
AS $$
DECLARE
  payload jsonb;
  new_id bigint;
BEGIN
  IF NOT public.is_admin_or_editor(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF _queue NOT IN ('auth_emails', 'transactional_emails') THEN
    RAISE EXCEPTION 'Invalid queue';
  END IF;

  IF _action = 'release' THEN
    PERFORM pgmq.set_vt(_queue, _msg_id, 0);
    RETURN jsonb_build_object('ok', true, 'action', 'released');
  ELSIF _action = 'move_to_dlq' THEN
    EXECUTE format('SELECT message FROM pgmq.q_%I WHERE msg_id = $1', _queue)
      INTO payload USING _msg_id;
    IF payload IS NULL THEN
      RAISE EXCEPTION 'Message not found';
    END IF;
    SELECT pgmq.send(_queue || '_dlq', payload || jsonb_build_object('manually_dlq_at', now())) INTO new_id;
    PERFORM pgmq.delete(_queue, _msg_id);
    RETURN jsonb_build_object('ok', true, 'action', 'moved_to_dlq', 'dlq_msg_id', new_id);
  ELSE
    RAISE EXCEPTION 'Invalid action';
  END IF;
END;
$$;