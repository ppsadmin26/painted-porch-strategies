REVOKE SELECT ON TABLE public.page_status FROM anon;
GRANT SELECT (id, path, status, created_at, updated_at) ON TABLE public.page_status TO anon;

REVOKE SELECT ON TABLE public.path_finder_offerings FROM anon, authenticated;
GRANT SELECT (id, offering_key, name, facilitator, tier, blurb, current_url, dedicated_url, anchor_id, is_live, sort_order, created_at, updated_at, topic, description, include_in_workshops, is_featured_in_quiz, launch_slug, b2c_rt_pools, b2b_rt_pools) ON TABLE public.path_finder_offerings TO anon, authenticated;