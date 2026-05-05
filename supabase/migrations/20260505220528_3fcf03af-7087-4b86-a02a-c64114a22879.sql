
-- Deduplicated email log + stats + suppression list, admin-only

CREATE OR REPLACE FUNCTION public.admin_email_stats(_since timestamptz DEFAULT now() - interval '7 days')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  WITH latest AS (
    SELECT DISTINCT ON (message_id) message_id, status, template_name, created_at
    FROM public.email_send_log
    WHERE message_id IS NOT NULL
    ORDER BY message_id, created_at DESC
  ),
  windowed AS (
    SELECT * FROM latest WHERE created_at >= _since
  )
  SELECT jsonb_build_object(
    'since', _since,
    'total', (SELECT count(*) FROM windowed),
    'sent', (SELECT count(*) FROM windowed WHERE status = 'sent'),
    'pending', (SELECT count(*) FROM windowed WHERE status = 'pending'),
    'failed', (SELECT count(*) FROM windowed WHERE status IN ('failed','dlq')),
    'bounced', (SELECT count(*) FROM windowed WHERE status = 'bounced'),
    'complained', (SELECT count(*) FROM windowed WHERE status = 'complained'),
    'suppressed', (SELECT count(*) FROM windowed WHERE status = 'suppressed'),
    'by_template', (
      SELECT COALESCE(jsonb_object_agg(template_name, c), '{}'::jsonb)
      FROM (SELECT template_name, count(*) AS c FROM windowed GROUP BY template_name) t
    ),
    'suppression_total', (SELECT count(*) FROM public.suppressed_emails),
    'checked_at', now()
  ) INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_email_log(
  _since timestamptz DEFAULT now() - interval '7 days',
  _template text DEFAULT NULL,
  _status text DEFAULT NULL,
  _search text DEFAULT NULL,
  _limit int DEFAULT 100,
  _offset int DEFAULT 0
)
RETURNS TABLE(
  message_id text,
  template_name text,
  recipient_email text,
  status text,
  error_message text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  SELECT * FROM latest
  WHERE created_at >= _since
    AND (_template IS NULL OR template_name = _template)
    AND (_status IS NULL OR
         (_status = 'failed' AND status IN ('failed','dlq')) OR
         status = _status)
    AND (_search IS NULL OR recipient_email ILIKE '%' || _search || '%')
  ORDER BY created_at DESC
  LIMIT GREATEST(LEAST(_limit, 500), 1)
  OFFSET GREATEST(_offset, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_email_suppressions(_limit int DEFAULT 200)
RETURNS TABLE(email text, reason text, created_at timestamptz, metadata jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT s.email, s.reason, s.created_at, s.metadata
  FROM public.suppressed_emails s
  ORDER BY s.created_at DESC
  LIMIT GREATEST(LEAST(_limit, 1000), 1);
END;
$$;
