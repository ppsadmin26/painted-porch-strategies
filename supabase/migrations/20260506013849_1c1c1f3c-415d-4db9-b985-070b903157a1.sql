CREATE OR REPLACE FUNCTION public.admin_email_log(
  _since timestamp with time zone DEFAULT (now() - '7 days'::interval),
  _template text DEFAULT NULL::text,
  _status text DEFAULT NULL::text,
  _search text DEFAULT NULL::text,
  _limit integer DEFAULT 100,
  _offset integer DEFAULT 0
)
RETURNS TABLE(message_id text, template_name text, recipient_email text, status text, error_message text, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  WITH latest AS (
    SELECT DISTINCT ON (l.message_id)
      l.message_id, l.template_name, l.recipient_email, l.status, l.error_message, l.created_at
    FROM public.email_send_log l
    WHERE l.message_id IS NOT NULL
    ORDER BY l.message_id, l.created_at DESC
  )
  SELECT lt.message_id, lt.template_name, lt.recipient_email, lt.status, lt.error_message, lt.created_at
  FROM latest lt
  WHERE lt.created_at >= _since
    AND (_template IS NULL OR lt.template_name = _template)
    AND (_status IS NULL OR
         (_status = 'failed' AND lt.status IN ('failed','dlq')) OR
         lt.status = _status)
    AND (_search IS NULL OR lt.recipient_email ILIKE '%' || _search || '%')
  ORDER BY lt.created_at DESC
  LIMIT GREATEST(LEAST(_limit, 500), 1)
  OFFSET GREATEST(_offset, 0);
END;
$function$;