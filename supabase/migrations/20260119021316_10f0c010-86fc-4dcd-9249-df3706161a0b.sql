-- Add B4 validation column to scoring_results table
ALTER TABLE public.scoring_results
ADD COLUMN b4_validation JSONB DEFAULT NULL;