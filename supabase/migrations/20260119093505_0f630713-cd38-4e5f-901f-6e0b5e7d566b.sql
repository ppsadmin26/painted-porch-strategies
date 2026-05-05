-- Add b6_validation column to scoring_results table
ALTER TABLE public.scoring_results
ADD COLUMN IF NOT EXISTS b6_validation jsonb DEFAULT NULL;