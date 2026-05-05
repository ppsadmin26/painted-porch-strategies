-- Create scoring_audit_log table to persist scoring decisions and audit trails
CREATE TABLE public.scoring_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    
    -- Scoring inputs
    tier1_score numeric NOT NULL,
    tier2_score numeric NOT NULL,
    combined_score numeric NOT NULL,
    
    -- Qualification results
    base_qualification text NOT NULL,
    final_qualification text NOT NULL,
    
    -- Override details
    total_drops_attempted integer NOT NULL DEFAULT 0,
    total_drops_applied integer NOT NULL DEFAULT 0,
    was_capped boolean NOT NULL DEFAULT false,
    applied_overrides jsonb NOT NULL DEFAULT '[]'::jsonb,
    ceiling_applied boolean NOT NULL DEFAULT false,
    ceiling_reason text,
    
    -- Validation results
    validation_passed boolean NOT NULL DEFAULT true,
    validation_errors jsonb NOT NULL DEFAULT '[]'::jsonb,
    validation_warnings jsonb NOT NULL DEFAULT '[]'::jsonb,
    
    -- Consistency results
    consistency_passed boolean NOT NULL DEFAULT true,
    consistency_issues jsonb NOT NULL DEFAULT '[]'::jsonb,
    has_auto_override_condition boolean NOT NULL DEFAULT false,
    
    -- Context flags (Tier 3)
    context_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
    
    -- Full audit trail
    audit_trail jsonb NOT NULL DEFAULT '[]'::jsonb,
    
    -- Metadata
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by text DEFAULT 'system'
);

-- Create index for faster lookups by assessment
CREATE INDEX idx_scoring_audit_assessment ON public.scoring_audit_log(assessment_id);

-- Create index for finding failed validations
CREATE INDEX idx_scoring_audit_validation ON public.scoring_audit_log(validation_passed);

-- Create index for finding consistency issues
CREATE INDEX idx_scoring_audit_consistency ON public.scoring_audit_log(consistency_passed);

-- Enable Row Level Security
ALTER TABLE public.scoring_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admin-only access
CREATE POLICY "Admins can view all scoring audits"
ON public.scoring_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert scoring audits"
ON public.scoring_audit_log
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update scoring audits"
ON public.scoring_audit_log
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete scoring audits"
ON public.scoring_audit_log
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to log scoring audits (callable from edge functions)
CREATE OR REPLACE FUNCTION public.log_scoring_audit(
    p_assessment_id uuid,
    p_tier1_score numeric,
    p_tier2_score numeric,
    p_combined_score numeric,
    p_base_qualification text,
    p_final_qualification text,
    p_total_drops_attempted integer,
    p_total_drops_applied integer,
    p_was_capped boolean,
    p_applied_overrides jsonb,
    p_ceiling_applied boolean,
    p_ceiling_reason text,
    p_validation_passed boolean,
    p_validation_errors jsonb,
    p_validation_warnings jsonb,
    p_consistency_passed boolean,
    p_consistency_issues jsonb,
    p_has_auto_override_condition boolean,
    p_context_flags jsonb,
    p_audit_trail jsonb,
    p_created_by text DEFAULT 'system'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_audit_id uuid;
BEGIN
    INSERT INTO public.scoring_audit_log (
        assessment_id,
        tier1_score,
        tier2_score,
        combined_score,
        base_qualification,
        final_qualification,
        total_drops_attempted,
        total_drops_applied,
        was_capped,
        applied_overrides,
        ceiling_applied,
        ceiling_reason,
        validation_passed,
        validation_errors,
        validation_warnings,
        consistency_passed,
        consistency_issues,
        has_auto_override_condition,
        context_flags,
        audit_trail,
        created_by
    ) VALUES (
        p_assessment_id,
        p_tier1_score,
        p_tier2_score,
        p_combined_score,
        p_base_qualification,
        p_final_qualification,
        p_total_drops_attempted,
        p_total_drops_applied,
        p_was_capped,
        p_applied_overrides,
        p_ceiling_applied,
        p_ceiling_reason,
        p_validation_passed,
        p_validation_errors,
        p_validation_warnings,
        p_consistency_passed,
        p_consistency_issues,
        p_has_auto_override_condition,
        p_context_flags,
        p_audit_trail,
        p_created_by
    )
    RETURNING id INTO v_audit_id;
    
    RETURN v_audit_id;
END;
$$;