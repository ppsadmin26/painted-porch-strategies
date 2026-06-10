
CREATE OR REPLACE FUNCTION public.admin_email_requeue_dlq_batch(_queue text, _msg_ids bigint[])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pgmq'
AS $function$
DECLARE
  msg_id bigint;
  payload jsonb;
  new_id bigint;
  requeued_count integer := 0;
  not_found_count integer := 0;
  dlq text;
BEGIN
  IF NOT public.is_admin_or_editor(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF _queue NOT IN ('auth_emails', 'transactional_emails') THEN
    RAISE EXCEPTION 'Invalid queue';
  END IF;
  IF _msg_ids IS NULL OR array_length(_msg_ids, 1) IS NULL THEN
    RETURN jsonb_build_object('ok', true, 'requeued', 0, 'not_found', 0);
  END IF;

  dlq := _queue || '_dlq';

  FOREACH msg_id IN ARRAY _msg_ids
  LOOP
    EXECUTE format('SELECT message FROM pgmq.q_%I WHERE msg_id = $1', dlq)
      INTO payload USING msg_id;

    IF payload IS NULL THEN
      not_found_count := not_found_count + 1;
      CONTINUE;
    END IF;

    payload := payload || jsonb_build_object('requeued_at', now());
    SELECT pgmq.send(_queue, payload) INTO new_id;
    PERFORM pgmq.delete(dlq, msg_id);
    requeued_count := requeued_count + 1;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'requeued', requeued_count, 'not_found', not_found_count);
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_email_delete_message_batch(_queue text, _kind text, _msg_ids bigint[])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pgmq'
AS $function$
DECLARE
  msg_id bigint;
  qname text;
  ok boolean;
  deleted_count integer := 0;
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
  IF _msg_ids IS NULL OR array_length(_msg_ids, 1) IS NULL THEN
    RETURN jsonb_build_object('ok', true, 'deleted', 0);
  END IF;

  qname := CASE WHEN _kind = 'dlq' THEN _queue || '_dlq' ELSE _queue END;

  FOREACH msg_id IN ARRAY _msg_ids
  LOOP
    SELECT pgmq.delete(qname, msg_id) INTO ok;
    IF COALESCE(ok, false) THEN
      deleted_count := deleted_count + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'deleted', deleted_count);
END;
$function$;
