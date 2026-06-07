
ALTER TABLE public.course_launch_status
  ADD COLUMN IF NOT EXISTS signup_confirmation_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS admin_alert_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS program_type text NOT NULL DEFAULT 'course';

ALTER TABLE public.course_launch_status DROP CONSTRAINT IF EXISTS course_launch_status_program_type_check;
ALTER TABLE public.course_launch_status
  ADD CONSTRAINT course_launch_status_program_type_check
  CHECK (program_type IN ('course','masterclass','assessment','lab'));

-- Categorize existing rows
UPDATE public.course_launch_status SET program_type = 'masterclass' WHERE slug LIKE 'mc-%';
UPDATE public.course_launch_status SET program_type = 'assessment' WHERE slug IN ('performance-dna','shift-architect');

-- Seed Leadership Lab rows
INSERT INTO public.course_launch_status (slug, course_name, status, course_path, program_type, signup_confirmation_enabled, admin_alert_enabled)
VALUES
  ('lab-stractical-leadership',  'Stractical Leadership Lab',          'live',        '/stracticalleader',         'lab', true, true),
  ('lab-leading-change',         'Leading Change Lab',                 'coming_soon', '/partner/amplify/labs',     'lab', true, true),
  ('lab-dysfunction-to-dynamic', 'From Dysfunction to Dynamic Lab',    'coming_soon', '/partner/amplify/labs',     'lab', true, true),
  ('lab-goldilocks-leadership',  'Goldilocks Leadership Lab',          'coming_soon', '/partner/amplify/labs',     'lab', true, true),
  ('lab-mission-unstoppable',    'Mission: Unstoppable Lab',           'coming_soon', '/partner/amplify/labs',     'lab', true, true),
  ('lab-operations-on-purpose',  'Operations on Purpose Lab',          'coming_soon', '/partner/amplify/labs',     'lab', true, true)
ON CONFLICT (slug) DO NOTHING;
