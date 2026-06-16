INSERT INTO public.path_finder_offerings (offering_key, name, facilitator, tier, blurb, current_url, dedicated_url, is_live, sort_order, topic, include_in_workshops, is_featured_in_quiz)
VALUES (
  'stoicLeaderFieldGuide',
  'The Stoic Leader Field Guide',
  'Amy',
  'Free',
  'Stoic principles translated into daily leadership practice. Free download.',
  '/stoic-field-guide',
  '/stoic-field-guide',
  true,
  920,
  'Philosophy',
  false,
  false
)
ON CONFLICT (offering_key) DO UPDATE SET
  name = EXCLUDED.name,
  facilitator = EXCLUDED.facilitator,
  tier = EXCLUDED.tier,
  blurb = EXCLUDED.blurb,
  current_url = EXCLUDED.current_url,
  dedicated_url = EXCLUDED.dedicated_url,
  is_live = true,
  topic = EXCLUDED.topic;