-- Fix search_path for validate_invoice_access function
CREATE OR REPLACE FUNCTION public.validate_invoice_access(p_invoice_number text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_assessment_id uuid;
BEGIN
  SELECT id INTO v_assessment_id
  FROM public.assessments
  WHERE invoice_number = p_invoice_number;
  
  RETURN v_assessment_id;
END;
$function$;