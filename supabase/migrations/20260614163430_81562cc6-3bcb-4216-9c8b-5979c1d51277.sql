ALTER TABLE public.path_finder_offerings ADD COLUMN description TEXT NULL;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Ensure the trigger exists for path_finder_offerings (it likely already does)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'update_path_finder_offerings_updated_at'
        AND tgrelid = 'public.path_finder_offerings'::regclass
    ) THEN
        CREATE TRIGGER update_path_finder_offerings_updated_at
        BEFORE UPDATE ON public.path_finder_offerings
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END
$$;