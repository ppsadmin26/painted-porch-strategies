
CREATE TABLE public.path_finder_offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offering_key text NOT NULL UNIQUE,
  name text NOT NULL,
  facilitator text,
  tier text NOT NULL,
  blurb text NOT NULL,
  current_url text NOT NULL,
  dedicated_url text,
  anchor_id text,
  is_live boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.path_finder_offerings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.path_finder_offerings TO authenticated;
GRANT ALL ON public.path_finder_offerings TO service_role;

ALTER TABLE public.path_finder_offerings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view offerings"
  ON public.path_finder_offerings FOR SELECT
  USING (true);

CREATE POLICY "Admins and editors can insert offerings"
  ON public.path_finder_offerings FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins and editors can update offerings"
  ON public.path_finder_offerings FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins and editors can delete offerings"
  ON public.path_finder_offerings FOR DELETE TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

CREATE TRIGGER set_path_finder_offerings_updated_at
  BEFORE UPDATE ON public.path_finder_offerings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- Seed all current offerings
INSERT INTO public.path_finder_offerings
  (offering_key, name, facilitator, tier, blurb, current_url, dedicated_url, is_live, sort_order)
VALUES
  ('radicalMindfulness', 'Radical Mindfulness', 'Sierra', 'IGNITE', '8-week self-paced program building conscious awareness, emotional regulation, and reflective capacity.', '/partner/ignite/courses', '/radical-mindfulness', true, 10),
  ('radicalMindfulnessMini', 'Radical Mindfulness Mini Course', 'Sierra', 'IGNITE', 'Condensed entry point before the full 8-week commitment.', '/partner/ignite/courses', '/radical-mindfulness', true, 11),
  ('passengerToPilot', 'Passenger to Pilot (Masterclass)', 'Sierra', 'IGNITE', 'Shift from reactive to proactive leadership.', '/partner/ignite/masterclasses', NULL, false, 12),
  ('masterYourMessage', 'Master Your Message', 'Rob', 'IGNITE', '6-week self-paced program: authentic communication and influence without authority.', '/partner/ignite/courses', '/master-your-message', true, 20),
  ('masterYourMessageMini', 'Master Your Message Mini Course', 'Rob', 'IGNITE', 'Core framework condensed.', '/partner/ignite/courses', '/master-your-message', true, 21),
  ('talkingToStrangers', 'Talking to Strangers (Masterclass)', 'Rob', 'IGNITE', 'Authentic connection in unfamiliar contexts.', '/partner/ignite/masterclasses', '/talking-to-strangers', true, 22),
  ('createExtraordinaryTeams', 'Create Extraordinary Teams', 'Painted Porch Team', 'IGNITE', 'Deep, comprehensive program on team dynamics that work.', '/partner/ignite/courses', '/extraordinary-teams', true, 30),
  ('elementsOfATeam', 'Elements of a Team (Masterclass)', 'Amy', 'IGNITE', 'Core components of team health. Strong as precursor or standalone.', '/partner/ignite/masterclasses', NULL, false, 31),
  ('leadingChangeMini', 'Leading Change Mini Course', 'Amy', 'IGNITE', 'Change leadership fundamentals: how change works, where resistance comes from.', '/partner/ignite/courses', NULL, false, 32),
  ('conflictToConnectionLab', 'From Conflict to Connection Lab', 'Amy', 'AMPLIFY', 'Peer cohort tackling team friction at the relational and structural root.', '/partner/amplify/labs', NULL, false, 40),
  ('goldilocksLab', 'Goldilocks Leadership Lab', 'Amy', 'AMPLIFY', 'Calibrated, context-sensitive EQ that makes team leadership feel like design.', '/partner/amplify/labs', NULL, false, 41),
  ('leadingChangeLab', 'Leading Change / P.A.T.H. Lab', 'Amy', 'AMPLIFY', 'Cohort lab applying the full P.A.T.H. framework to real change challenges.', '/partner/amplify/labs', NULL, false, 42),
  ('stracticalLeaderLab', 'Stractical Leader Lab', 'Amy', 'AMPLIFY', 'Strategic vision and tactical execution integration at the leadership-team level.', '/partner/amplify/stractical-leader', '/partner/amplify/stractical-leader', true, 43),
  ('stoicismLab', 'Stoicism in the Workplace Lab', 'Amy', 'AMPLIFY', 'Philosophical grounding made permanent.', '/partner/amplify/labs', NULL, false, 44),
  ('aiEiOhLab', 'AI, EI, Oh! Lab', 'Amy', 'AMPLIFY', 'Leading AI adoption with human wisdom.', '/partner/amplify/labs', NULL, false, 45),
  ('fromConflictToConnection', 'From Conflict to Connection', 'Amy', 'Pathway B', 'Addresses team friction at the relational and structural root, not the symptom.', '/partner/amplify/workshops', NULL, false, 50),
  ('fromDysfunctionToDynamic', 'From Dysfunction to Dynamic', 'Amy', 'Pathway B', 'Structural redesign of team patterns: decision rights, accountability, interaction design.', '/partner/amplify/workshops', NULL, false, 51),
  ('geniusAtWork', 'Genius at Work', 'Amy', 'Pathway B', 'Working Genius assessment-based session surfacing how your team contributes.', '/partner/amplify/workshops', NULL, false, 52),
  ('heroesAssemble', 'Heroes Assemble', 'Amy', 'Pathway B', 'Activating individual strengths in service of collective performance.', '/partner/amplify/workshops', NULL, false, 53),
  ('pathToLastingChange', 'The P.A.T.H. to Lasting Change', 'Amy', 'Pathway B', 'Full P.A.T.H. framework applied to sustained organizational transformation.', '/partner/amplify/workshops', NULL, false, 54),
  ('leadAtSpeed', 'Lead at the Speed of Change', 'Amy', 'Pathway B', 'Leadership capacity to drive change at organizational velocity without sacrificing trust.', '/partner/amplify/workshops', NULL, false, 55),
  ('drivingChange3Shifts', 'Driving Change: The 3 Shifts', 'Amy', 'Pathway B', 'Three leadership shifts that separate transformations that hold from those that evaporate.', '/partner/amplify/workshops', NULL, false, 56),
  ('changeForGood', 'Change for Good: Immunity to Change', 'Amy', 'Pathway B', 'Surfacing the hidden competing commitments quietly defeating your change efforts.', '/partner/amplify/workshops', NULL, false, 57),
  ('cultivatingChangeResilience', 'Cultivating Change Resilience', 'Amy', 'Pathway B', 'Resilience as organizational infrastructure: distributed across systems and culture.', '/partner/amplify/workshops', NULL, false, 58),
  ('kickTheHabit', 'Kick the Habit', 'Amy', 'Pathway B', 'Addressing the behavioral patterns and mental models that make change fail to stick.', '/resources/kick-the-habit', '/resources/kick-the-habit', true, 59),
  ('aiEiOh', 'AI, EI, Oh', 'Amy', 'Pathway B', 'Leading AI integration with the EI and organizational wisdom it requires.', '/partner/amplify/workshops', NULL, false, 60),
  ('architectureOfAdaptability', 'The Architecture of Adaptability', 'Amy', 'Pathway B', 'Building organizational systems designed to navigate uncertainty rather than react to it.', '/partner/amplify/workshops', NULL, false, 61),
  ('goldilocks', 'Goldilocks Leadership', 'Amy', 'Pathway B', 'Calibrated, context-sensitive EQ in leadership.', '/partner/amplify/workshops', NULL, false, 62),
  ('pillarsOfLastingChange', 'The Pillars of Lasting Change & Continuous Innovation', 'Painted Porch Team', 'Pathway B', 'Culture, operations, and human capacity as one living system.', '/partner/amplify/workshops', NULL, false, 63),
  ('stracticalLeader', 'The Stractical Leader', 'Amy', 'Pathway B', 'Integrating strategic vision with tactical execution for leadership teams.', '/partner/amplify/stractical-leader', '/partner/amplify/stractical-leader', true, 64),
  ('leadershipOM', 'Leadership OM', 'Amy', 'Pathway B', 'Redesigning the leadership operating model to distribute decisions and accountability.', '/partner/amplify/workshops', NULL, false, 65),
  ('communicateWithStyle', 'Communicate with Style', 'Rob', 'Pathway B', 'Style awareness and adaptation across different team members and contexts.', '/partner/amplify/workshops', NULL, false, 70),
  ('powerOfStory', 'The Power of Story', 'Rob', 'Pathway B', 'Using narrative to create shared understanding and team cohesion.', '/partner/amplify/workshops', NULL, false, 71),
  ('eightByEight', '8:8', 'Rob', 'Pathway B', 'The eight things leaders need to know before they communicate and the eight ways to make it land.', '/partner/amplify/workshops', NULL, false, 72),
  ('masterYourMessageB2B', 'Master Your Message (B2B)', 'Rob', 'Pathway B', 'Communication architecture that makes leadership messaging land across the organization.', '/partner/amplify/workshops', NULL, false, 73),
  ('highFidelityCommunication', 'High-Fidelity Communication', 'Rob', 'Pathway B', 'Ensuring message and meaning arrive intact.', '/partner/amplify/workshops', NULL, false, 74),
  ('getClearBeHeard', 'Get C.L.E.A.R., Be Heard', 'Rob', 'Pathway B', 'Practical communication frameworks for leaders navigating complex change.', '/partner/amplify/workshops', NULL, false, 75),
  ('reignitingResilience', 'Reigniting Resilience', 'Sierra', 'Pathway B', 'Rebuilding genuine resilience capacity in depleted teams and leaders.', '/partner/amplify/workshops', NULL, false, 80),
  ('findingJoyAtWork', 'Finding Joy at Work', 'Sierra', 'Pathway B', 'Designing conditions that make sustainable engagement possible.', '/partner/amplify/workshops', NULL, false, 81),
  ('fromPassengerToPilot', 'From Passenger to Pilot', 'Sierra', 'Pathway B', 'Reclaiming individual agency within team and organizational systems.', '/partner/amplify/workshops', NULL, false, 82),
  ('radicalMindfulnessB2B', 'Radical Mindfulness (B2B)', 'Sierra', 'Pathway B', 'Mindfulness as a leadership practice for organizational wellbeing.', '/partner/amplify/workshops', '/radical-mindfulness', true, 83),
  ('eqi', 'EQ-i 2.0 Assessment', NULL, 'Assessment', 'Emotional intelligence baseline. Data on where reflective and relational capacity sits.', '/eq', '/eq', true, 90),
  ('eq360', 'EQ360 Assessment', NULL, 'Assessment', 'Multi-perspective EQ feedback.', '/eq', '/eq', true, 91),
  ('workingGenius', 'Working Genius Assessment', NULL, 'Assessment', 'Natural contribution style surfaces gaps you may not have named yet.', '/partner/ignite/assessments/working-genius', '/partner/ignite/assessments/working-genius', true, 92),
  ('performanceDNA', 'Performance DNA Assessment', NULL, 'Assessment', 'Behavioral architecture at the elevation level.', '/partner/ignite/assessments', NULL, false, 93),
  ('fiftyTwoStoicism', '52 Weeks of Stoicism', NULL, 'Free', 'Weekly Stoic principles for leadership. Free.', '/resources/free', NULL, false, 100),
  ('burnoutResources', 'Burnout Resources', NULL, 'Free', 'If exhaustion is part of your reality, start here. Free.', '/resources/burnout', '/resources/burnout', true, 101),
  ('strategicChangeCanvas', 'Strategic Change Canvas', NULL, 'Free', 'Visual planning tool for mapping change before you launch it. Free.', '/change-canvas', '/change-canvas', true, 102),
  ('communicatingChangeWorkbook', 'Communicating Change Workbook', NULL, 'Free', 'Templates for the conversations that make or break transformation. Free.', '/change-comms', '/change-comms', true, 103),
  ('stracticalMini', 'Stractical Leader Mini Workbook', NULL, 'Free', 'Taste of the strategic-tactical integration work. Free.', '/resources/stractical-mini', '/resources/stractical-mini', true, 104),
  ('blueDoor', 'The Blue Door Organizational Appraisal', NULL, 'Blue Door', 'About 20 minutes. Produces the P.A.T.H. Compass: architecture, capacity signal, Move Now Map, Reinforce First priorities. No prerequisites.', '/blue-door', '/blue-door', true, 110);
