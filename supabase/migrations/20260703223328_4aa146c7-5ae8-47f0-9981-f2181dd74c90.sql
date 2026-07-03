ALTER TABLE public.path_finder_offerings
  ADD COLUMN IF NOT EXISTS workshop_card_challenge text,
  ADD COLUMN IF NOT EXISTS workshop_card_description text,
  ADD COLUMN IF NOT EXISTS workshop_card_format text,
  ADD COLUMN IF NOT EXISTS workshop_card_investment text,
  ADD COLUMN IF NOT EXISTS workshop_card_bullets text[];

COMMENT ON COLUMN public.path_finder_offerings.workshop_card_challenge IS
  'Red "The Challenge:" text shown on Phase Zero workshop cards.';
COMMENT ON COLUMN public.path_finder_offerings.workshop_card_description IS
  'Plain description paragraph shown on Team Development workshop cards (used when no challenge box).';
COMMENT ON COLUMN public.path_finder_offerings.workshop_card_format IS
  'Duration/format label, e.g. "Half-day to full-day" or "Full-day workshop".';
COMMENT ON COLUMN public.path_finder_offerings.workshop_card_investment IS
  'Price label, e.g. "Starting at $7,500".';
COMMENT ON COLUMN public.path_finder_offerings.workshop_card_bullets IS
  '"What You''ll Walk Away With" bullet list.';

-- Phase Zero (Blue Door Required)
UPDATE public.path_finder_offerings SET
  blue_door_required = true,
  workshop_card_format = 'Full to multi-day workshop',
  workshop_card_investment = 'Starting at $36,000',
  workshop_card_challenge = 'Your team jumps straight to execution without designing what you''re building. Projects launch before strategic foundations exist.',
  workshop_card_bullets = ARRAY[
    'What Phase Zero is and why most teams skip it',
    'How to architect transformation before building it',
    'The cost of skipping strategic preparation',
    'Decision framework for Phase Zero investment',
    'Team alignment on what requires architecture vs. execution'
  ]
WHERE offering_key = 'architectChange';

UPDATE public.path_finder_offerings SET
  blue_door_required = true,
  workshop_card_format = 'Full to multi-day workshop',
  workshop_card_investment = 'Starting at $36,000',
  workshop_card_challenge = 'You''re not sure if your organization is built to carry the transformation you''re considering. You need a clear-eyed assessment of capacity and an architecture designed to navigate uncertainty rather than react to it.',
  workshop_card_bullets = ARRAY[
    'The three Painted Porch Pillars (Cultural Cornerstone, Operational Frame, Living Ecosystem) and how they reveal organizational readiness',
    'Gap analysis: where you''re strong, where you''re vulnerable',
    'How to design systems that navigate uncertainty instead of reacting to it',
    'Roadmap for strengthening vulnerable pillars before transformation begins',
    'Clear decision on whether to proceed, pause, or redesign your initiative'
  ]
WHERE offering_key = 'architectureOfOrganizationalShift';

UPDATE public.path_finder_offerings SET
  blue_door_required = true,
  workshop_card_format = 'Full-day workshop',
  workshop_card_investment = 'Starting at $36,000',
  workshop_card_challenge = 'Your team doesn''t have a shared framework for navigating transformation. Everyone approaches change differently.',
  workshop_card_bullets = ARRAY[
    'The P.A.T.H. framework (Prepare → Align → Take Off → Habits)',
    'Where your team is in the P.A.T.H. right now',
    'Common mistakes at each stage and how to avoid them',
    'Team protocols for using P.A.T.H. going forward',
    'Roadmap for completing Phase Zero preparation'
  ]
WHERE offering_key = 'pathToLastingChange';

UPDATE public.path_finder_offerings SET
  blue_door_required = true,
  workshop_card_format = 'Half to full-day workshop',
  workshop_card_investment = 'Starting at $15,000',
  workshop_card_challenge = 'Your team treats pushback as an obstacle rather than valuable feedback. You''re not building organizational capacity to navigate and learn from what people are telling you.',
  workshop_card_bullets = ARRAY[
    'Why people don''t resist change, they resist being changed',
    'How to distinguish between legitimate feedback and fear of the unknown',
    'Navigation strategies for building resilience through feedback',
    'How Phase Zero addresses pushback before it starts',
    'A navigation playbook for building organizational resilience'
  ]
WHERE offering_key = 'cultivatingChangeResilience';

UPDATE public.path_finder_offerings SET
  blue_door_required = true,
  workshop_card_format = 'Full-day workshop',
  workshop_card_investment = '$25,000',
  workshop_card_challenge = 'Your leadership team doesn''t have clear decision-making protocols, communication rhythms, or accountability structures for transformation.',
  workshop_card_bullets = ARRAY[
    'How decisions get made (and by whom)',
    'Communication cadences, channels, and escalation protocols',
    'Accountability structures that create follow-through',
    'Exploring each leader''s Working Genius and its impact on team dynamics',
    'A documented Leadership OM your team commits to'
  ]
WHERE offering_key = 'leadershipOM';

-- Team Development (No Blue Door)
UPDATE public.path_finder_offerings SET
  blue_door_required = false,
  workshop_card_format = 'Half-day to full-day',
  workshop_card_investment = 'Starting at $7,500',
  workshop_card_description = 'Why most team-building fails, and what high-performing teams actually do differently. Move beyond trust falls to build teams that collaborate, challenge, and create together.',
  workshop_card_bullets = ARRAY[
    'Identify team dynamics that accelerate (or block) performance',
    'Build shared language for healthy conflict and collaboration',
    'Create team operating agreements with accountability',
    'Strengthen trust through vulnerability and shared purpose'
  ]
WHERE offering_key = 'workshopCreateExtraordinaryTeams';

UPDATE public.path_finder_offerings SET
  blue_door_required = false,
  workshop_card_format = 'Half-day to full-day',
  workshop_card_investment = 'Starting at $7,500',
  workshop_card_description = 'Practical mindfulness techniques for executives who don''t have time for mindfulness. Build the awareness, focus, and emotional regulation that transform how leaders show up.',
  workshop_card_bullets = ARRAY[
    'Develop a personal mindfulness practice that fits your schedule',
    'Strengthen emotional regulation under pressure',
    'Improve focus and decision-making clarity',
    'Create team rituals that build collective presence'
  ]
WHERE offering_key = 'radicalMindfulnessB2B';

UPDATE public.path_finder_offerings SET
  blue_door_required = false,
  workshop_card_format = 'Half-day to full-day',
  workshop_card_investment = 'Starting at $7,500',
  workshop_card_description = 'Beyond the announcement email: How to design communication that actually drives behavior change. Build the messaging infrastructure that makes change stick.',
  workshop_card_bullets = ARRAY[
    'Design communication cadences that build momentum',
    'Craft messages that address the ''why'' people actually need',
    'Build feedback loops that surface real concerns early',
    'Create a communication playbook for your next initiative'
  ]
WHERE offering_key = 'masterYourMessageB2B';

UPDATE public.path_finder_offerings SET
  blue_door_required = false,
  workshop_card_format = 'Half-day to full-day',
  workshop_card_investment = 'Starting at $7,500',
  workshop_card_description = 'Ancient philosophy meets contemporary challenges. How reason, logic, purpose, and virtue create resilient leaders who navigate complexity with clarity and conviction.',
  workshop_card_bullets = ARRAY[
    'Apply Stoic principles to everyday leadership decisions',
    'Build resilience through strategic preparation (Premeditatio Malorum)',
    'Develop the capacity to lead through uncertainty and ambiguity',
    'Create a personal leadership philosophy grounded in virtue and purpose'
  ]
WHERE offering_key = 'stoicismB2B';