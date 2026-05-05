-- Add B3 validation column to scoring_results table
ALTER TABLE public.scoring_results
ADD COLUMN IF NOT EXISTS b3_validation jsonb DEFAULT NULL;