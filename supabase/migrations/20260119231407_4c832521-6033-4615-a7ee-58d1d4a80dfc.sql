-- SECURITY FIX: Update scoring_audit_log policies to require authentication
-- The existing policies use has_role() checks but TO public instead of TO authenticated

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all scoring audits" ON public.scoring_audit_log;
DROP POLICY IF EXISTS "Admins can insert scoring audits" ON public.scoring_audit_log;
DROP POLICY IF EXISTS "Admins can update scoring audits" ON public.scoring_audit_log;
DROP POLICY IF EXISTS "Admins can delete scoring audits" ON public.scoring_audit_log;

-- Recreate with proper TO authenticated clause
CREATE POLICY "Admins can view all scoring audits"
ON public.scoring_audit_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert scoring audits"
ON public.scoring_audit_log
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update scoring audits"
ON public.scoring_audit_log
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete scoring audits"
ON public.scoring_audit_log
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add service role policy for edge functions
CREATE POLICY "Service role full access to scoring_audit_log"
ON public.scoring_audit_log
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');