-- Add missing b5_validation column to scoring_results table
ALTER TABLE public.scoring_results 
ADD COLUMN IF NOT EXISTS b5_validation JSONB DEFAULT NULL;