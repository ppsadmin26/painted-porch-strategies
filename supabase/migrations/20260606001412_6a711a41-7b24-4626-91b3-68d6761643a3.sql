ALTER TABLE public.page_seo
  ADD COLUMN IF NOT EXISTS aeo_summary text,
  ADD COLUMN IF NOT EXISTS aeo_faqs jsonb;

COMMENT ON COLUMN public.page_seo.aeo_summary IS 'Plain-language TL;DR answer used by AI engines (ChatGPT, Perplexity, Google AI Overviews).';
COMMENT ON COLUMN public.page_seo.aeo_faqs IS 'Array of {question, answer} pairs. Rendered as FAQPage JSON-LD for AEO.';