-- SECURITY FIX: Replace sequential test invoice numbers with cryptographically random UUIDs
-- This prevents prediction attacks on test invoices

-- Update existing test invoice numbers with random UUIDs
-- Format: BD-{UUID} to maintain "BD-" prefix for visual identification while being unpredictable

UPDATE public.test_invoice_numbers
SET invoice_number = 'BD-' || gen_random_uuid()::text
WHERE invoice_number LIKE 'BD-2026-%';

-- Add a comment explaining the security decision
COMMENT ON COLUMN public.test_invoice_numbers.invoice_number IS 'Cryptographically random invoice numbers using UUID format (BD-{UUID}). Sequential patterns removed for security.';