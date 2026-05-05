-- Create test assessment for Sarah Chen / TechFlow Solutions
INSERT INTO public.assessments (
  invoice_number,
  client_name,
  client_email,
  company_name,
  job_title,
  number_of_employees,
  status
) VALUES (
  'TECHFLOW001',
  'Sarah Chen',
  'sarah.chen@techflow.example.com',
  'TechFlow Solutions',
  'CEO & Co-Founder',
  '50-100',
  'in_progress'
);

-- Insert all diagnostic responses with proper JSONB structure
-- Get the assessment ID and insert responses
DO $$
DECLARE
  v_assessment_id uuid;
BEGIN
  SELECT id INTO v_assessment_id FROM public.assessments WHERE invoice_number = 'TECHFLOW001';
  
  -- A1A: Market Signals (multiple choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'A1A', 'What are you sensing in your market, industry, or organization that suggests a need for strategic shift?', 'multiple_choice', 
    '{"selected": ["competitive_dynamics", "technology_enabling", "customer_expectations"]}'::jsonb);
  
  -- A1B: Signal Description (text)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'A1B', 'Describe the most significant signal you''re picking up', 'text',
    '{"text": "We''re seeing three major shifts converging. First, our competitors are moving from project-based to platform-based models, and we''re losing deals because clients want ongoing partnerships rather than one-time engagements. Second, AI is enabling us to deliver insights that were previously impossible, but our current architecture wasn''t built for this. Third, our enterprise clients are increasingly asking for real-time collaboration features that our batch-processing system can''t support. These three signals together suggest we need to fundamentally rethink what we are, not just what we offer."}'::jsonb);
  
  -- A2A: Decision Description (text)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'A2A', 'What was the decision?', 'text',
    '{"text": "We decided six months ago to rebuild our core analytics engine from batch to real-time streaming architecture. This was a major technical shift that affected every part of our product."}'::jsonb);
  
  -- A2B: Decision Timeline (single_choice instead of dropdown)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'A2B', 'How long did the decision take?', 'single_choice',
    '{"selected": "3-6_months"}'::jsonb);
  
  -- A2C: Decision Pattern (single choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'A2C', 'What pattern emerged in how the decision got made?', 'single_choice',
    '{"selected": "productive_debate"}'::jsonb);
  
  -- A2D: Decision Driver (single choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'A2D', 'Looking at this pattern, what was your decision-making driver?', 'single_choice',
    '{"selected": "authoring"}'::jsonb);
  
  -- A2E: Market Positioning (single choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'A2E', 'How does this decision pattern reflect your organization''s typical market positioning?', 'single_choice',
    '{"selected": "occasionally_leading"}'::jsonb);
  
  -- A3A: Current Priorities (multiple choice - describing current state)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'A3A', 'How would you describe your current strategic priorities?', 'multiple_choice',
    '{"selected": ["clear_documented", "too_many"]}'::jsonb);
  
  -- A3B: Most Important Priority (text)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'A3B', 'What is your organization''s single most important priority right now?', 'text',
    '{"text": "Completing the real-time architecture rebuild while maintaining client satisfaction and revenue growth during the transition."}'::jsonb);
  
  -- A3C: Sacrifice Test (ranking)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'A3C', 'Rank these strategic focus areas in order of current importance', 'ranking',
    '{"rankings": [{"item": "innovation", "rank": 1}, {"item": "growth", "rank": 2}, {"item": "culture", "rank": 3}, {"item": "efficiency", "rank": 4}, {"item": "sustainability", "rank": 5}]}'::jsonb);
  
  -- A4: External Change Context (multiple choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'A4', 'External Change Context', 'multiple_choice',
    '{"selected": ["technology", "competition", "customer"]}'::jsonb);
  
  -- B1A: Leadership Operating Model (single choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'B1A', 'Which best describes your leadership team''s current operating model?', 'single_choice',
    '{"selected": "evolved"}'::jsonb);
  
  -- B2A: Culture Description (text)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'B2A', 'In 2-3 sentences, how would you describe your organization''s culture?', 'text',
    '{"text": "We lose momentum because our leadership team (myself included) operates in two modes: ''launch mode'' where we''re all-in and energized, and ''operational mode'' where strategic work takes a back seat to daily demands. We''ve created a culture where strategic initiatives are exciting at launch but then get treated as ''extra'' work once regular operations kick back in. The organization has learned to wait out our strategic enthusiasm because they''ve seen it fade before."}'::jsonb);
  
  -- B2B: Culture Alignment (single choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'B2B', 'How aligned is your stated culture with your actual culture?', 'single_choice',
    '{"selected": "partially_aligned"}'::jsonb);
  
  -- B3A: Conflict Pattern (single choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'B3A', 'How does your organization typically handle strategic disagreements?', 'single_choice',
    '{"selected": "productive"}'::jsonb);
  
  -- B3B: Alignment Speed (single choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'B3B', 'How quickly can your organization align on a new direction?', 'single_choice',
    '{"selected": "moderate"}'::jsonb);
  
  -- B3C: Execution Follow-through (single choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'B3C', 'Once alignment is reached, how well does the organization follow through?', 'single_choice',
    '{"selected": "good"}'::jsonb);
  
  -- B4A: Resource Allocation (single choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'B4A', 'How are resources allocated to strategic priorities?', 'single_choice',
    '{"selected": "strategically"}'::jsonb);
  
  -- B4B: Resource Reallocation (single choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'B4B', 'How easily can resources be reallocated when priorities change?', 'single_choice',
    '{"selected": "somewhat_easy"}'::jsonb);
  
  -- B5A: Obstacle Description (text)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'B5A', 'Describe a recent obstacle or setback', 'text',
    '{"text": "Our biggest obstacle is that our product and engineering teams operate with different cadences and priorities. Product plans quarterly based on market feedback and sales input, while engineering plans in two-week sprints focused on technical debt and architecture. This creates constant tension where product commits to clients before engineering has capacity, or engineering solves technical problems that aren''t customer priorities. We''re always negotiating rather than aligned, which slows everything down."}'::jsonb);
  
  -- B5B: Obstacle Approach (single choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'B5B', 'In general, how does your organization respond to unexpected challenges?', 'single_choice',
    '{"selected": "adaptively"}'::jsonb);
  
  -- B6A: Judgment Distribution (single choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'B6A', 'Where does strategic judgment primarily reside in your organization?', 'single_choice',
    '{"selected": "distributed_leadership"}'::jsonb);
  
  -- B6B: Decision Empowerment (single choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'B6B', 'How do people throughout the organization feel about their ability to make decisions?', 'single_choice',
    '{"selected": "somewhat_empowered"}'::jsonb);
  
  -- C1A: Identity Clarity (single choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'C1A', 'How clear is your organization about who you are and what you stand for?', 'single_choice',
    '{"selected": "evolving"}'::jsonb);
  
  -- C2: Fear Assessment (single choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'C2', 'Primary concern about strategic shift', 'single_choice',
    '{"selected": "Personal uncertainty — My own clarity or capability to lead this type of transformation"}'::jsonb);
  
  -- C2_followup: Path Forward (text)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'C2_followup', 'Path forward for the concern', 'text',
    '{"text": "I''ve led product evolution before, but this feels like organizational transformation, which is new territory for me. My path forward involves three things: First, I''m joining a CEO peer group of people who''ve led similar shifts from product-centric to partnership-centric. Second, I''m reading everything I can about this type of transformation. Third, I''m being honest with my team that I''m learning as we go and creating space for us to figure this out together rather than pretending I have all the answers. The concern is real, but I''m committed to developing the capability while leading."}'::jsonb);
  
  -- C3A: Capacity Percentage (single choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'C3A', 'Available capacity for strategic priorities', 'single_choice',
    '{"selected": "40-60% available"}'::jsonb);
  
  -- C3B: Capacity Reallocation Willingness (single choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'C3B', 'Willingness to reallocate executive time', 'single_choice',
    '{"selected": "Possible but would require difficult trade-offs"}'::jsonb);
  
  -- C4A: Ownership Structure (single choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'C4A', 'Ownership structure for strategic change', 'single_choice',
    '{"selected": "I would own it personally"}'::jsonb);
  
  -- C4B: Ownership Track Record (single choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'C4B', 'Track record with similar initiatives', 'single_choice',
    '{"selected": "Partially — some types succeeded, others struggled"}'::jsonb);
  
  -- C4C: Initiative History (single choice)
  INSERT INTO public.diagnostic_responses (assessment_id, question_id, question_text, response_type, response_value)
  VALUES (v_assessment_id, 'C4C', 'History of delivering strategic change', 'single_choice',
    '{"selected": "Mixed — some initiatives succeed fully, others partially, some stall"}'::jsonb);

END $$;