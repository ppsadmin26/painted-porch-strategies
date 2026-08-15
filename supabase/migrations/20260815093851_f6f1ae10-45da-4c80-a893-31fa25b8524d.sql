DROP POLICY IF EXISTS "Service role can insert backup runs" ON public.backup_runs;
DROP POLICY IF EXISTS "Service role can update backup runs" ON public.backup_runs;

CREATE POLICY "Service role can insert backup runs"
ON public.backup_runs FOR INSERT TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update backup runs"
ON public.backup_runs FOR UPDATE TO service_role
USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Nobody may change their own role
    IF NEW.id = auth.uid() THEN
      RAISE EXCEPTION 'You cannot change your own role';
    END IF;
    -- Only admins may change anyone else's role (service_role bypasses triggers-free paths intentionally)
    IF auth.uid() IS NOT NULL AND NOT public.is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Only administrators can change roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_self_role_change ON public.profiles;
CREATE TRIGGER prevent_self_role_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_role_change();