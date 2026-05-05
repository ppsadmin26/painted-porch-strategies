-- Create test invoice numbers table for external assessment testing
CREATE TABLE IF NOT EXISTS public.test_invoice_numbers (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number text NOT NULL UNIQUE,
    used boolean NOT NULL DEFAULT false,
    used_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.test_invoice_numbers ENABLE ROW LEVEL SECURITY;

-- Admins can view all test invoices
CREATE POLICY "Admins can view test invoices"
    ON public.test_invoice_numbers
    FOR SELECT
    USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow service role and public to validate invoices (needed for intake form)
CREATE POLICY "Allow public to check invoices"
    ON public.test_invoice_numbers
    FOR SELECT
    USING (true);

-- Admins can manage test invoices
CREATE POLICY "Admins can insert test invoices"
    ON public.test_invoice_numbers
    FOR INSERT
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update test invoices"
    ON public.test_invoice_numbers
    FOR UPDATE
    USING (has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete test invoices"
    ON public.test_invoice_numbers
    FOR DELETE
    USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert 10 test invoice numbers
INSERT INTO public.test_invoice_numbers (invoice_number) VALUES
    ('BD-2026-001'),
    ('BD-2026-002'),
    ('BD-2026-003'),
    ('BD-2026-004'),
    ('BD-2026-005'),
    ('BD-2026-006'),
    ('BD-2026-007'),
    ('BD-2026-008'),
    ('BD-2026-009'),
    ('BD-2026-010');