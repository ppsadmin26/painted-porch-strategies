INSERT INTO public.site_video_slots (slot_key, label, description)
VALUES ('eq-hero', 'EQ Assessment hero', 'Background hero video on /eq (EQ-i 2.0 Assessment page).')
ON CONFLICT (slot_key) DO NOTHING;

INSERT INTO public.site_videos (slot_key, video_url)
VALUES ('eq-hero', '/__l5e/assets-v1/d48eb8a0-e710-4553-887a-37b92758dafa/eq-hero.mp4')
ON CONFLICT (slot_key) DO UPDATE SET video_url = EXCLUDED.video_url;