ALTER TABLE public.email_send_state
  ADD COLUMN IF NOT EXISTS max_attempts integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS retry_backoff_base_ms integer NOT NULL DEFAULT 30000,
  ADD COLUMN IF NOT EXISTS retry_backoff_max_ms integer NOT NULL DEFAULT 600000;

ALTER TABLE public.email_send_log
  ADD COLUMN IF NOT EXISTS attempt integer;

CREATE INDEX IF NOT EXISTS email_send_log_message_id_status_idx
  ON public.email_send_log (message_id, status);

CREATE OR REPLACE FUNCTION public.set_email_vt(queue_name text, message_id bigint, vt_seconds integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM pgmq.set_vt(queue_name, message_id, vt_seconds);
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;

REVOKE ALL ON FUNCTION public.set_email_vt(text, bigint, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_email_vt(text, bigint, integer) TO service_role;