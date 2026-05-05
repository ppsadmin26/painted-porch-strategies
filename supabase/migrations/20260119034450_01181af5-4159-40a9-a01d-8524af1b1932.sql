-- Add A3 validation and C3 validation columns to scoring_results table
-- A3 tracks priority gap analysis and sacrifice test coherence
-- C3 tracks capacity reality validation (added to Tier 2 as of v1.0 - Jan 18, 2026)

ALTER TABLE public.scoring_results 
ADD COLUMN IF NOT EXISTS a3_validation jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS c3_validation jsonb DEFAULT NULL;