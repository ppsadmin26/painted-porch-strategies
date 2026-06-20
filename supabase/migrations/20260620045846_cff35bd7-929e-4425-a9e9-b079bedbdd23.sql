INSERT INTO public.path_finder_offerings (offering_key, name, facilitator, tier, topic, blurb, description, current_url, anchor_id, is_live, include_in_workshops)
VALUES (
  'workshopCreateExtraordinaryTeams',
  'Create Extraordinary Teams',
  'Amy',
  'AMPLIFY',
  'Teams',
  'Why most team-building fails, and what high-performing teams actually do differently.',
  'Why most team-building fails, and what high-performing teams actually do differently. Move beyond trust falls to build teams that collaborate, challenge, and create together.',
  '/partner/amplify/workshops',
  'createExtraordinaryTeams',
  true,
  true
)
ON CONFLICT (offering_key) DO UPDATE SET
  current_url = EXCLUDED.current_url,
  anchor_id = EXCLUDED.anchor_id,
  topic = EXCLUDED.topic,
  description = EXCLUDED.description,
  blurb = EXCLUDED.blurb,
  is_live = true,
  include_in_workshops = true;