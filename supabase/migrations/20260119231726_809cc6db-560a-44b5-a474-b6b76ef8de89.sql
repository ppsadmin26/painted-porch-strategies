-- SECURITY FIX: Update admin_notifications and failed_analyses policies to require authentication

-- Fix admin_notifications
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON public.admin_notifications;

CREATE POLICY "Admins can view all notifications"
ON public.admin_notifications
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert notifications"
ON public.admin_notifications
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update notifications"
ON public.admin_notifications
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete notifications"
ON public.admin_notifications
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role policy for edge functions
CREATE POLICY "Service role full access to admin_notifications"
ON public.admin_notifications
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Fix failed_analyses
DROP POLICY IF EXISTS "Admins can view all failed analyses" ON public.failed_analyses;
DROP POLICY IF EXISTS "Admins can insert failed analyses" ON public.failed_analyses;
DROP POLICY IF EXISTS "Admins can update failed analyses" ON public.failed_analyses;
DROP POLICY IF EXISTS "Admins can delete failed analyses" ON public.failed_analyses;

CREATE POLICY "Admins can view all failed analyses"
ON public.failed_analyses
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert failed analyses"
ON public.failed_analyses
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update failed analyses"
ON public.failed_analyses
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete failed analyses"
ON public.failed_analyses
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role policy for edge functions
CREATE POLICY "Service role full access to failed_analyses"
ON public.failed_analyses
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');