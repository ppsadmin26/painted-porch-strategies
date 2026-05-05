
-- 1. Prevent role self-escalation with a trigger (most reliable approach)
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If the user is changing their own profile and trying to change role, block it
  IF NEW.id = auth.uid() AND NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'You cannot change your own role';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_self_role_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_change();

-- 2. Restrict blog-images INSERT to admin/editor
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;

CREATE POLICY "Admins and editors can upload blog images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images' AND public.is_admin_or_editor(auth.uid()));

-- 3. Add UPDATE policy for blog-images
CREATE POLICY "Admins and editors can update blog images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images' AND public.is_admin_or_editor(auth.uid()));

-- 4. Add policies for email-assets bucket (service_role only writes, public reads)
CREATE POLICY "Service role can manage email assets"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'email-assets')
WITH CHECK (bucket_id = 'email-assets');
