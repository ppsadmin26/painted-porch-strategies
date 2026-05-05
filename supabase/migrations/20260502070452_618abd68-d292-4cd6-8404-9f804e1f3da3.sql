
REVOKE EXECUTE ON FUNCTION public.admin_list_backup_schedules() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_backup_schedule_active(text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_backup_schedules() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_backup_schedule_active(text, boolean) TO authenticated;
