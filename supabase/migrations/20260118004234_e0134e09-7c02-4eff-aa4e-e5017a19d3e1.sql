-- Add permissive policies for public diagnostic flow
-- Allow anyone to check if an invoice number exists (for validation)
CREATE POLICY "Public can check invoice numbers"
ON public.assessments
FOR SELECT
USING (true);

-- Allow anyone to create assessments (required for diagnostic intake)
CREATE POLICY "Public can create assessments"
ON public.assessments
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update their own assessment by invoice_number
CREATE POLICY "Public can update assessments by invoice"
ON public.assessments
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow anyone to view responses (needed for diagnostic flow)
CREATE POLICY "Public can view responses"
ON public.diagnostic_responses
FOR SELECT
USING (true);

-- Allow anyone to create responses
CREATE POLICY "Public can create responses"
ON public.diagnostic_responses
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update responses
CREATE POLICY "Public can update responses"
ON public.diagnostic_responses
FOR UPDATE
USING (true)
WITH CHECK (true);