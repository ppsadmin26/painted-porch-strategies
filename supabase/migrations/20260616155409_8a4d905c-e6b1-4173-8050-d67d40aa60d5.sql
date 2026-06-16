
UPDATE public.path_finder_offerings
SET is_live = true, updated_at = now()
WHERE offering_key = 'fiftyTwoStoicism';

INSERT INTO public.course_launch_status (slug, course_name, course_path, status, program_type)
VALUES (
  'lab-conflict-to-connection',
  'From Conflict to Connection Lab',
  '/partner/amplify/labs#lab-conflict-to-connection',
  'coming_soon',
  'lab'
)
ON CONFLICT (slug) DO UPDATE SET status = EXCLUDED.status;

UPDATE public.path_finder_offerings
SET launch_slug = 'lab-conflict-to-connection', updated_at = now()
WHERE offering_key = 'conflictToConnectionLab';
