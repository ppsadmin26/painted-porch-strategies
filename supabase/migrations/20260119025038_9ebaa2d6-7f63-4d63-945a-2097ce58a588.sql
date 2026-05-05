-- Create error_logs table for storing application errors
CREATE TABLE public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  component_stack TEXT,
  error_type TEXT NOT NULL DEFAULT 'runtime',
  severity TEXT NOT NULL DEFAULT 'error',
  page_url TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by TEXT
);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (errors can happen before auth)
CREATE POLICY "Anyone can insert error logs"
ON public.error_logs
FOR INSERT
WITH CHECK (true);

-- Only admins can view error logs
CREATE POLICY "Admins can view error logs"
ON public.error_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Only admins can update error logs (to mark as resolved)
CREATE POLICY "Admins can update error logs"
ON public.error_logs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Create index for faster queries
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_resolved ON public.error_logs(resolved);
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);