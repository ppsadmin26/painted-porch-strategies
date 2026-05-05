-- Add b2_validation column to scoring_results table
ALTER TABLE public.scoring_results
ADD COLUMN b2_validation JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.scoring_results.b2_validation IS 'B2 question validation results including base score, coherence modifiers, overconfidence detection, consistency flags, and audit trail';