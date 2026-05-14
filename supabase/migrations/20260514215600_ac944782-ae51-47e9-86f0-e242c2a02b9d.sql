INSERT INTO public.page_status (path, status, note) VALUES
  ('/phase-zero', 'draft', 'New manifesto page — draft'),
  ('/home-archive', 'draft', 'Old home page archive')
ON CONFLICT (path) DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note;

DELETE FROM public.page_status WHERE path IN ('/for-leaders','/for-teams','/services','/business-programs','/programs');