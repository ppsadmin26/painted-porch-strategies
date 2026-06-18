GRANT SELECT ON public.page_status TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_status TO authenticated;
GRANT ALL ON public.page_status TO service_role;