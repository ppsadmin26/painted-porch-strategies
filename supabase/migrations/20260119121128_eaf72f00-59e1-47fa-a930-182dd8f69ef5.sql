-- Add b1_validation column to scoring_results table for B1 validator data
-- B1 validates execution capability with context-dependent "haven't committed" logic
ALTER TABLE public.scoring_results
ADD COLUMN IF NOT EXISTS b1_validation jsonb DEFAULT NULL;