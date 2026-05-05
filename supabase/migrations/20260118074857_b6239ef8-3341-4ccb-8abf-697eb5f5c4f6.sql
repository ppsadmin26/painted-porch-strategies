-- Add columns for detailed internal qualification report
-- These store the comprehensive analysis structure from the AI

-- Add conversation_guidance column to ai_analysis table
ALTER TABLE public.ai_analysis 
ADD COLUMN IF NOT EXISTS conversation_guidance jsonb DEFAULT '{}';

-- Add red_flags column to ai_analysis table  
ALTER TABLE public.ai_analysis 
ADD COLUMN IF NOT EXISTS red_flags jsonb DEFAULT '{}';

-- Add session_design column for qualified candidates
ALTER TABLE public.ai_analysis 
ADD COLUMN IF NOT EXISTS session_design jsonb DEFAULT '{}';

-- Add pathway_guidance column for conditional/soft no candidates
ALTER TABLE public.ai_analysis 
ADD COLUMN IF NOT EXISTS pathway_guidance jsonb DEFAULT '{}';

-- Add detailed_scoring column with response quotes and rationale
ALTER TABLE public.ai_analysis 
ADD COLUMN IF NOT EXISTS detailed_scoring jsonb DEFAULT '{}';

-- Add quick_assessment summary
ALTER TABLE public.ai_analysis 
ADD COLUMN IF NOT EXISTS quick_assessment text;

-- Add confidence_level
ALTER TABLE public.ai_analysis 
ADD COLUMN IF NOT EXISTS confidence_level text;

-- Add pillar_details for strengths/gaps breakdown
ALTER TABLE public.pillar_assessments
ADD COLUMN IF NOT EXISTS fa_strengths jsonb DEFAULT '[]';

ALTER TABLE public.pillar_assessments
ADD COLUMN IF NOT EXISTS fa_gaps jsonb DEFAULT '[]';

ALTER TABLE public.pillar_assessments
ADD COLUMN IF NOT EXISTS hc_strengths jsonb DEFAULT '[]';

ALTER TABLE public.pillar_assessments
ADD COLUMN IF NOT EXISTS hc_gaps jsonb DEFAULT '[]';

ALTER TABLE public.pillar_assessments
ADD COLUMN IF NOT EXISTS oi_strengths jsonb DEFAULT '[]';

ALTER TABLE public.pillar_assessments
ADD COLUMN IF NOT EXISTS oi_gaps jsonb DEFAULT '[]';