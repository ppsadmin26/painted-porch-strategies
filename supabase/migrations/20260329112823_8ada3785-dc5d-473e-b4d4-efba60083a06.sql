
-- Clear seeded placeholder data
DELETE FROM media_appearance_categories;
DELETE FROM media_appearances;

-- Insert actual items from the old site
INSERT INTO public.media_appearances (media_type, show_name, title, description, thumbnail_url, external_url) VALUES
  ('video', 'Porch Perspectives', 'Porch Perspectives: Why Communication is Key', 'Join the Painted Porch Team for a live, interactive discussion on why Communication is one of, if not THE, most critical skills to your success.', 'https://mediumseagreen-snake-750651.hostingersite.com/wp-content/uploads/2025/11/1tDQeRgqQXK3B3je3CNb_file-1024x576.jpg', 'https://youtu.be/xmja3NjSL8A'),
  ('video', 'Porch Perspectives', 'Porch Perspectives: Why Mindfulness Matters', 'Watch the team''s recent discussion on why mindfulness is important and is critical in today''s ever-changing (and uncertain) world of life and work.', 'https://mediumseagreen-snake-750651.hostingersite.com/wp-content/uploads/2025/11/VJ6O5El4QkMnX6tqcmPA_file.jpg', 'https://www.youtube.com/watch?v=90c8PcdTjZc'),
  ('webinar', 'Free Training', 'From Pilot to Passenger', 'Get instant access to our recent training led by our Chief Joy Officer, Sierra Ramm Cantrell, on how to take control and own your path with purpose and presence.', 'https://mediumseagreen-snake-750651.hostingersite.com/wp-content/uploads/2025/11/TshqAfdTRHedDNVTNP3k_file.jpg', NULL),
  ('video', 'Porch Perspectives', 'Porch Perspectives: On Feedback', 'Watch the replay of our recent live (and lively) discussion around how to prepare for, give, and receive transparent and compassionate feedback.', 'https://mediumseagreen-snake-750651.hostingersite.com/wp-content/uploads/2025/11/oXF54RTYSyuWvaDYf0wZ_file.jpg', 'https://www.youtube.com/watch?v=c-j50L6g4gE'),
  ('webinar', 'Free Training', 'Kick the Habit: Develop a Change-Ready Mindset', 'Get instant access to our training led by our Founder and Chief Evolution Officer, Amy Yackowski, on how to discover and create meaningful change that sticks.', 'https://mediumseagreen-snake-750651.hostingersite.com/wp-content/uploads/2025/11/1Oc3WgeTfyeGxyPTMwtO_file.jpg', '/kick-the-habit'),
  ('interview', 'Great Recruiter', 'Cultivating Change for Success', 'Catch a replay of our Founder and Chief Evolution Officer, Amy Yackowski''s conversation with Great Recruiter''s CXO, Adam Conrad.', 'https://mediumseagreen-snake-750651.hostingersite.com/wp-content/uploads/2025/11/RNWcTqy2QVyuHYFikITE_1655301570519.jpeg', NULL);
