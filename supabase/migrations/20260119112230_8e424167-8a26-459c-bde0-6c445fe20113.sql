-- Add c4_validation column to scoring_results table
ALTER TABLE public.scoring_results 
ADD COLUMN IF NOT EXISTS c4_validation jsonb NULL;