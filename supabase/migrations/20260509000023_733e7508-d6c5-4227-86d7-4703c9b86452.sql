CREATE OR REPLACE FUNCTION public.sync_blog_excerpt_from_seo()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.seo_description IS NOT NULL AND length(trim(NEW.seo_description)) > 0 THEN
    NEW.excerpt := NEW.seo_description;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_blog_excerpt_from_seo ON public.blog_posts;
CREATE TRIGGER trg_sync_blog_excerpt_from_seo
BEFORE INSERT OR UPDATE OF seo_description, excerpt ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.sync_blog_excerpt_from_seo();