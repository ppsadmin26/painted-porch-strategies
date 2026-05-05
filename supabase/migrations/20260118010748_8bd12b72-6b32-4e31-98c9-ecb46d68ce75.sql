-- Add unique constraint for diagnostic_responses upsert
ALTER TABLE public.diagnostic_responses 
ADD CONSTRAINT diagnostic_responses_assessment_question_unique 
UNIQUE (assessment_id, question_id);