-- Add a1_validation column to scoring_results for Tier 3 Context data
ALTER TABLE public.scoring_results 
ADD COLUMN IF NOT EXISTS a1_validation jsonb DEFAULT NULL;