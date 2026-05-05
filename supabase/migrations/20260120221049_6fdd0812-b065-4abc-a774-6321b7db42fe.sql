-- Add c1_validation and c2_validation JSONB columns to scoring_results
-- These columns persist Identity Clarity (C1) and Emotional Capacity (C2) validation results

ALTER TABLE public.scoring_results 
ADD COLUMN IF NOT EXISTS c1_validation jsonb DEFAULT NULL;

ALTER TABLE public.scoring_results 
ADD COLUMN IF NOT EXISTS c2_validation jsonb DEFAULT NULL;

COMMENT ON COLUMN public.scoring_results.c1_validation IS 'Persists C1 Identity Clarity validation results including clarity tier, text quality, coherence analysis, and session design notes';
COMMENT ON COLUMN public.scoring_results.c2_validation IS 'Persists C2 Emotional Capacity validation results including concern categorization, follow-up analysis, and coaching approach recommendations';