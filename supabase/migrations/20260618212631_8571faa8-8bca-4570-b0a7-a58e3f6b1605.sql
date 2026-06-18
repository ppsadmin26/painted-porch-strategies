
ALTER TABLE public.page_status
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'public';

ALTER TABLE public.page_status
  DROP CONSTRAINT IF EXISTS page_status_category_check;

ALTER TABLE public.page_status
  ADD CONSTRAINT page_status_category_check
  CHECK (category IN ('public', 'internal', 'archived'));

-- Backfill existing rows from path patterns.
UPDATE public.page_status
SET category = 'internal'
WHERE path = '/admin' OR path LIKE '/admin/%' OR path = '/reset-password';

UPDATE public.page_status
SET category = 'archived'
WHERE path LIKE '%archive%' OR path LIKE '%verbatim%';

CREATE INDEX IF NOT EXISTS idx_page_status_category ON public.page_status(category);
