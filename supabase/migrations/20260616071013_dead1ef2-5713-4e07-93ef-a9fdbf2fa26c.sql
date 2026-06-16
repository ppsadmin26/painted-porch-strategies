
-- 1) page_status: replace broad authenticated read with admin-only read
DROP POLICY IF EXISTS "Authenticated can read all page status" ON public.page_status;

CREATE POLICY "Admins can read all page status"
  ON public.page_status
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 2) Hide page_status.note from anon and authenticated at the column level
REVOKE SELECT (note) ON public.page_status FROM anon, authenticated;

-- 3) Hide path_finder_offerings.notes from anon and authenticated at the column level
REVOKE SELECT (notes) ON public.path_finder_offerings FROM anon, authenticated;

-- 4) Admin RPCs to fetch the hidden note columns (caller must be admin / admin-or-editor)
CREATE OR REPLACE FUNCTION public.admin_list_page_status_notes()
  RETURNS TABLE(id uuid, path text, note text)
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY SELECT ps.id, ps.path, ps.note FROM public.page_status ps;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_page_status_notes() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_page_status_notes() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_offering_notes()
  RETURNS TABLE(id uuid, offering_key text, notes text)
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_or_editor(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY SELECT o.id, o.offering_key, o.notes FROM public.path_finder_offerings o;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_offering_notes() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_offering_notes() TO authenticated;
