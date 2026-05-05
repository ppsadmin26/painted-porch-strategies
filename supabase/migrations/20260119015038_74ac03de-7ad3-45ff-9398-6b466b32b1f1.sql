-- Add a2_validation column to scoring_results table
ALTER TABLE public.scoring_results
ADD COLUMN a2_validation JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.scoring_results.a2_validation IS 'A2 question validation results including base score, modifiers, flags, and audit trail';