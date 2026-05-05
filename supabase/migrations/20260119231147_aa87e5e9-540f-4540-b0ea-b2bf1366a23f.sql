-- SECURITY FIX: Update admin_audit_log policies to require authentication
-- The existing policies use has_role() checks which work, but should also use TO authenticated

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Allow service role full access to admin_audit_log" ON public.admin_audit_log;

-- Recreate with proper TO authenticated clause
CREATE POLICY "Admins can view all audit logs"
ON public.admin_audit_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert audit logs"
ON public.admin_audit_log
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Service role policy needs to allow edge functions to insert audit logs
-- Using TO service_role would be ideal but Supabase doesn't support it directly
-- Instead, use a policy that checks for service_role
CREATE POLICY "Service role full access to admin_audit_log"
ON public.admin_audit_log
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Verify assessments table policies are correct (already TO authenticated based on query)
-- No changes needed for assessments - it already has proper TO authenticated