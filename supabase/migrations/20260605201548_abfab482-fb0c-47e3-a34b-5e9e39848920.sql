
ALTER TABLE public.refund_requests DROP CONSTRAINT IF EXISTS refund_requests_status_check;

UPDATE public.refund_requests SET status = CASE status
  WHEN 'pending' THEN 'new'
  WHEN 'processing' THEN 'in_review'
  WHEN 'completed' THEN 'approved'
  WHEN 'denied' THEN 'rejected'
  ELSE status
END;

ALTER TABLE public.refund_requests ALTER COLUMN status SET DEFAULT 'new';

ALTER TABLE public.refund_requests
  ADD CONSTRAINT refund_requests_status_check
  CHECK (status IN ('new', 'in_review', 'approved', 'rejected'));
