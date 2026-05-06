-- Harden EXECUTE privileges on SECURITY DEFINER functions in public.
-- Defense in depth: function bodies already check is_admin/is_admin_or_editor,
-- but we also tighten GRANTs so anon cannot invoke them at all.

-- 1. Revoke broad PUBLIC + anon execute on every public function.
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- 2. Service-role-only functions: also revoke from authenticated.
--    Service role bypasses GRANT checks, so edge functions still work.
DO $$
DECLARE
  fn text;
  service_only text[] := ARRAY[
    'enqueue_email(text, jsonb)',
    'read_email_batch(text, integer, integer)',
    'delete_email(text, bigint)',
    'move_to_dlq(text, text, bigint, jsonb)',
    'set_email_vt(text, bigint, integer)',
    'admin_dump_schema()',
    'admin_dump_config()',
    'admin_apply_sql(text)',
    'handle_new_user()',
    'prevent_role_change()',
    'set_updated_at_timestamp()'
  ];
BEGIN
  FOREACH fn IN ARRAY service_only LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM authenticated', fn);
    EXCEPTION WHEN undefined_function THEN
      RAISE NOTICE 'Skipping missing function: %', fn;
    END;
  END LOOP;
END$$;

-- 3. Admin RPC functions: grant to authenticated only.
--    Internal is_admin / is_admin_or_editor checks remain the real gate.
DO $$
DECLARE
  fn text;
  admin_fns text[] := ARRAY[
    'admin_check_email_infra()',
    'admin_email_stats(timestamptz)',
    'admin_email_log(timestamptz, text, text, text, integer, integer)',
    'admin_email_suppressions(integer)',
    'admin_email_queue_health()',
    'admin_email_queue_messages(text, text, integer)',
    'admin_email_dlq_list(integer)',
    'admin_email_purge_dlq(text)',
    'admin_email_requeue_dlq(text, bigint)',
    'admin_email_delete_message(text, text, bigint)',
    'admin_email_reset_stuck(text, bigint, text)',
    'admin_schema_object_counts()',
    'admin_list_backup_schedules()',
    'admin_set_backup_schedule_active(text, boolean)'
  ];
BEGIN
  FOREACH fn IN ARRAY admin_fns LOOP
    BEGIN
      EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', fn);
    EXCEPTION WHEN undefined_function THEN
      RAISE NOTICE 'Skipping missing function: %', fn;
    END;
  END LOOP;
END$$;

-- 4. Role-check helpers used inside RLS policies must be executable to
--    authenticated so policy evaluation works for logged-in users.
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_editor(uuid) TO authenticated;

-- 5. Lock down default privileges on FUTURE functions in public so we
--    don't accidentally re-introduce anon-callable definers later.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon;
