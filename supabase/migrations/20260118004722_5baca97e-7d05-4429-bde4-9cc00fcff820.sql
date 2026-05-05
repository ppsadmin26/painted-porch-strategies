-- Drop the overly permissive public policies
DROP POLICY IF EXISTS "Public can check invoice numbers" ON public.assessments;
DROP POLICY IF EXISTS "Public can create assessments" ON public.assessments;
DROP POLICY IF EXISTS "Public can update assessments by invoice" ON public.assessments;
DROP POLICY IF EXISTS "Public can view responses" ON public.diagnostic_responses;
DROP POLICY IF EXISTS "Public can create responses" ON public.diagnostic_responses;
DROP POLICY IF EXISTS "Public can update responses" ON public.diagnostic_responses;

-- Create secure function to validate invoice access
-- This will be called by edge functions using service role
CREATE OR REPLACE FUNCTION public.validate_invoice_access(p_invoice_number text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_assessment_id uuid;
BEGIN
  SELECT id INTO v_assessment_id
  FROM public.assessments
  WHERE invoice_number = p_invoice_number;
  
  RETURN v_assessment_id;
END;
$$;