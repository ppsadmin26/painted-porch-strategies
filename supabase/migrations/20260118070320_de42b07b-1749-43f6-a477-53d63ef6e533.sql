-- Phase 6: Admin Dashboard Schema Updates
-- Add admin-related fields to ai_analysis table
ALTER TABLE ai_analysis 
  ADD COLUMN IF NOT EXISTS approved_by_amy BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS final_qualification VARCHAR(50),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS last_edited_by VARCHAR(255),
  ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS edit_history JSONB DEFAULT '[]'::jsonb;

-- Add admin review status to assessments table
ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS admin_status VARCHAR(50) DEFAULT 'pending_analysis';

-- Create admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email VARCHAR(255) NOT NULL,
  assessment_id UUID REFERENCES assessments(id),
  action VARCHAR(100) NOT NULL, -- 'viewed', 'edited', 'approved', 'rejected'
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_admin_status ON assessments(admin_status);
CREATE INDEX IF NOT EXISTS idx_approved_by_amy ON ai_analysis(approved_by_amy);
CREATE INDEX IF NOT EXISTS idx_audit_log_assessment ON admin_audit_log(assessment_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log(created_at DESC);

-- Enable RLS on admin_audit_log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_audit_log
CREATE POLICY "Admins can view all audit logs"
ON admin_audit_log FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert audit logs"
ON admin_audit_log FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Allow service role full access to admin_audit_log"
ON admin_audit_log FOR ALL
USING (auth.role() = 'service_role');

-- Function to log admin actions (callable from edge functions)
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_email VARCHAR,
  p_assessment_id UUID,
  p_action VARCHAR,
  p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO admin_audit_log (admin_email, assessment_id, action, details)
  VALUES (p_admin_email, p_assessment_id, p_action, p_details)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Comment on the new columns
COMMENT ON COLUMN ai_analysis.approved_by_amy IS 'Whether Amy has approved this analysis';
COMMENT ON COLUMN ai_analysis.final_qualification IS 'Final qualification tier after Amy review';
COMMENT ON COLUMN ai_analysis.approved_at IS 'Timestamp when Amy approved';
COMMENT ON COLUMN assessments.admin_status IS 'Admin workflow status: pending_analysis, analyzed, pending_review, approved, sent';