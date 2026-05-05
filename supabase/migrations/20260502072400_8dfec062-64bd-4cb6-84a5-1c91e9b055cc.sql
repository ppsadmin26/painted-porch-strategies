
-- 1. Fix Security Definer View: recreate public_authors as SECURITY INVOKER
DROP VIEW IF EXISTS public.public_authors;
CREATE VIEW public.public_authors
WITH (security_invoker=true) AS
SELECT id, full_name, author_bio, avatar_url, is_author, is_guest_author
FROM public.profiles
WHERE is_author = true;

-- 2. access_tokens has RLS enabled but no policies. It is service-role only
-- (used by edge functions for token validation). Add explicit deny policy
-- so RLS purpose is documented; service_role bypasses RLS automatically.
CREATE POLICY "No direct client access to access_tokens"
ON public.access_tokens
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- 3. Tighten site_videos write policies (was permissive `true` for all authenticated)
DROP POLICY IF EXISTS "Authenticated can insert site videos" ON public.site_videos;
DROP POLICY IF EXISTS "Authenticated can update site videos" ON public.site_videos;
DROP POLICY IF EXISTS "Authenticated can delete site videos" ON public.site_videos;

CREATE POLICY "Admins/editors can insert site videos"
ON public.site_videos FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins/editors can update site videos"
ON public.site_videos FOR UPDATE TO authenticated
USING (public.is_admin_or_editor(auth.uid()))
WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins/editors can delete site videos"
ON public.site_videos FOR DELETE TO authenticated
USING (public.is_admin_or_editor(auth.uid()));

-- 4. Lock down SECURITY DEFINER functions that should never be called via PostgREST.
-- Internal helpers (triggers, queue plumbing) — revoke from anon + authenticated.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_role_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

-- Admin RPCs: keep callable by authenticated (they self-check is_admin), revoke from anon.
REVOKE EXECUTE ON FUNCTION public.admin_list_backup_schedules() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_backup_schedule_active(text, boolean) FROM PUBLIC, anon;

-- Role-check helpers: revoke from anon (no use case for anon), keep authenticated (used in RLS & UI).
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_editor(uuid) FROM PUBLIC, anon;
