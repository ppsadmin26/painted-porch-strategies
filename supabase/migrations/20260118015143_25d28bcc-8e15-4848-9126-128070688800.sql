-- Insert a new test assessment for flow testing
INSERT INTO public.assessments (
  invoice_number,
  client_name,
  client_email,
  company_name,
  job_title,
  number_of_employees,
  status
) VALUES (
  'TESTFLOW001',
  'Test User',
  'test@example.com',
  'Test Company Inc.',
  'CEO',
  '51-200',
  'in_progress'
);