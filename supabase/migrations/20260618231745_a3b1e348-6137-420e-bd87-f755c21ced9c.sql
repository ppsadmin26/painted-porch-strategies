-- page_status: hide admin-only "note" column
REVOKE SELECT (note) ON public.page_status FROM anon;
REVOKE SELECT (note) ON public.page_status FROM authenticated;

-- course_launch_status: hide internal operational fields
REVOKE SELECT (notified_count, notified_at) ON public.course_launch_status FROM anon;
REVOKE SELECT (notified_count, notified_at) ON public.course_launch_status FROM authenticated;

-- path_finder_offerings: ensure admin-only "notes" column stays hidden
REVOKE SELECT (notes) ON public.path_finder_offerings FROM anon;
REVOKE SELECT (notes) ON public.path_finder_offerings FROM authenticated;