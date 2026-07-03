-- 1. Backfill topic_slug on 8 legacy duplicate rows so their anchors match the canonical topics
UPDATE public.path_finder_offerings SET topic_slug = 'eight-by-eight'
  WHERE offering_key = '8-8-capture-keep-attention-in-an-8-second-world';
UPDATE public.path_finder_offerings SET topic_slug = 'architect-change'
  WHERE offering_key = 'architect-change-phase-zero-strategic-design';
UPDATE public.path_finder_offerings SET topic_slug = 'heroes-assemble'
  WHERE offering_key = 'heroes-assemble-discover-the-hidden-superpowers-for-team-success';
UPDATE public.path_finder_offerings SET topic_slug = 'lead-at-speed-of-change'
  WHERE offering_key = 'lead-at-the-speed-of-change-leading-change';
UPDATE public.path_finder_offerings SET topic_slug = 'shift-happens'
  WHERE offering_key = 'shift-happens-be-ready';
UPDATE public.path_finder_offerings SET topic_slug = 'path-to-lasting-change'
  WHERE offering_key = 'the-p-a-t-h-to-navigating-change';
UPDATE public.path_finder_offerings SET topic_slug = 'working-genius'
  WHERE offering_key = 'working-genius';
UPDATE public.path_finder_offerings SET topic_slug = 'driving-change-3-shifts'
  WHERE offering_key = 'driving-change-the-3-shifts-for-acceleration-evolution';

-- 2. Redirect every workshop/keynote/speaking offering that is NOT featured on the
--    workshops page and NOT featured on a speaker page to /speaking/topics
UPDATE public.path_finder_offerings
   SET current_url = '/speaking/topics',
       anchor_id = COALESCE(topic_slug, anchor_id, offering_key)
 WHERE delivery_format IN ('keynote','speaking','workshop')
   AND COALESCE(include_in_workshops, false) = false
   AND COALESCE(include_on_speaker_page, false) = false;