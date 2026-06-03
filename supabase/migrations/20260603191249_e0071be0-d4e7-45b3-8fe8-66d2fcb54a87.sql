CREATE TABLE public.policy_update_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT NOT NULL,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'email_unsubscribe_tokens',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.policy_update_notifications TO authenticated;
GRANT ALL ON public.policy_update_notifications TO service_role;

ALTER TABLE public.policy_update_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view policy notifications"
  ON public.policy_update_notifications FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert policy notifications"
  ON public.policy_update_notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
