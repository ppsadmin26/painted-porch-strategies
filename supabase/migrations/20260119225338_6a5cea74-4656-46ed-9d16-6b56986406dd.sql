-- SECURITY FIX: Remove public SELECT policy on test_invoice_numbers
-- This table contains all valid test invoice numbers, which allows enumeration attacks
-- Edge functions use service_role key and don't need public RLS access

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Allow public to check invoices" ON public.test_invoice_numbers;

-- Add a comment explaining the security decision
COMMENT ON TABLE public.test_invoice_numbers IS 'Test invoice numbers for development/QA. Public SELECT access removed for security - use edge functions with service_role key for invoice validation.';