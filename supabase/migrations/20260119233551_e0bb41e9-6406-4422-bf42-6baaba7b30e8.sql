-- Add notes field to test_invoice_numbers table
ALTER TABLE public.test_invoice_numbers 
ADD COLUMN notes text;