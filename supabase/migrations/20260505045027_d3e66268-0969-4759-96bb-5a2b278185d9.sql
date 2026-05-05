REVOKE EXECUTE ON FUNCTION public.admin_dump_schema() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_apply_sql(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_schema_object_counts() FROM PUBLIC, anon;