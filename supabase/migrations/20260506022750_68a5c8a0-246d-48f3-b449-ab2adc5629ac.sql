
-- Track GitHub sync health
CREATE TABLE IF NOT EXISTS public.github_sync_status (
  id INT PRIMARY KEY DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'healthy', -- healthy | warning | error
  last_success_at TIMESTAMPTZ,
  last_check_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  last_error_message TEXT,
  last_alert_sent_at TIMESTAMPTZ,
  details JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);

INSERT INTO public.github_sync_status (id, status) VALUES (1, 'healthy')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.github_sync_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL, -- 'webhook' | 'cron' | 'manual'
  event_type TEXT NOT NULL, -- 'push' | 'workflow_run' | 'commit_freshness' | 'check'
  status TEXT NOT NULL, -- 'success' | 'failure' | 'info'
  message TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_github_sync_events_created_at ON public.github_sync_events(created_at DESC);

ALTER TABLE public.github_sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_sync_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read sync status" ON public.github_sync_status
  FOR SELECT USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins read sync events" ON public.github_sync_events
  FOR SELECT USING (public.is_admin_or_editor(auth.uid()));

-- Manual trigger RPC for admins
CREATE OR REPLACE FUNCTION public.admin_get_github_sync_status()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r jsonb;
BEGIN
  IF NOT public.is_admin_or_editor(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  SELECT to_jsonb(s) INTO r FROM public.github_sync_status s WHERE id = 1;
  RETURN r;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_github_sync_status() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_github_sync_status() TO authenticated;
