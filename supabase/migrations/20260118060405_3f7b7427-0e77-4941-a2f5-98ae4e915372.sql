-- Create table to store failed analysis attempts for debugging
CREATE TABLE IF NOT EXISTS public.failed_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  raw_response TEXT,
  error_message TEXT,
  error_stack TEXT,
  failed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  retry_count INTEGER DEFAULT 0,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by TEXT
);

-- Add indexes for quick lookups
CREATE INDEX idx_failed_analyses_assessment_id ON public.failed_analyses(assessment_id);
CREATE INDEX idx_failed_analyses_failed_at ON public.failed_analyses(failed_at DESC);
CREATE INDEX idx_failed_analyses_resolved ON public.failed_analyses(resolved);

-- Enable RLS
ALTER TABLE public.failed_analyses ENABLE ROW LEVEL SECURITY;

-- RLS policies - admin only
CREATE POLICY "Admins can view all failed analyses"
ON public.failed_analyses FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert failed analyses"
ON public.failed_analyses FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update failed analyses"
ON public.failed_analyses FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete failed analyses"
ON public.failed_analyses FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create table for admin notifications
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'analysis_failure', 'api_timeout', etc.
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
  error_message TEXT,
  error_stack TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by TEXT
);

-- Add indexes
CREATE INDEX idx_admin_notifications_type ON public.admin_notifications(type);
CREATE INDEX idx_admin_notifications_created_at ON public.admin_notifications(created_at DESC);
CREATE INDEX idx_admin_notifications_acknowledged ON public.admin_notifications(acknowledged);
CREATE INDEX idx_admin_notifications_assessment_id ON public.admin_notifications(assessment_id);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies - admin only
CREATE POLICY "Admins can view all notifications"
ON public.admin_notifications FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert notifications"
ON public.admin_notifications FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update notifications"
ON public.admin_notifications FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete notifications"
ON public.admin_notifications FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));