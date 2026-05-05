-- SECURITY FIX: Update remaining tables to use TO authenticated instead of TO public

-- Fix error_logs - keep INSERT as public (intentional) but fix SELECT/UPDATE
DROP POLICY IF EXISTS "Admins can view error logs" ON public.error_logs;
DROP POLICY IF EXISTS "Admins can update error logs" ON public.error_logs;

CREATE POLICY "Admins can view error logs"
ON public.error_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update error logs"
ON public.error_logs
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix test_invoice_numbers
DROP POLICY IF EXISTS "Admins can view test invoices" ON public.test_invoice_numbers;
DROP POLICY IF EXISTS "Admins can insert test invoices" ON public.test_invoice_numbers;
DROP POLICY IF EXISTS "Admins can update test invoices" ON public.test_invoice_numbers;
DROP POLICY IF EXISTS "Admins can delete test invoices" ON public.test_invoice_numbers;

CREATE POLICY "Admins can view test invoices"
ON public.test_invoice_numbers
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert test invoices"
ON public.test_invoice_numbers
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update test invoices"
ON public.test_invoice_numbers
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete test invoices"
ON public.test_invoice_numbers
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role policy for edge functions (validate-invoice uses service_role)
CREATE POLICY "Service role full access to test_invoice_numbers"
ON public.test_invoice_numbers
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');