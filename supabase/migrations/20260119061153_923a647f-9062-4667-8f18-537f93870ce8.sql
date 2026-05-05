-- Delete related data for old incomplete test assessments
DELETE FROM diagnostic_responses WHERE assessment_id IN (
  'b4167df4-4e3c-459c-b4db-7c76a96b7a01',
  'f7da0070-0b76-4f7f-9258-0bc4326cb910',
  'd8585d20-cdae-4fbc-91ce-9f7c9e36af89',
  '58883d0c-7dda-4745-b79a-be560e2153c8'
);

DELETE FROM scoring_results WHERE assessment_id IN (
  'b4167df4-4e3c-459c-b4db-7c76a96b7a01',
  'f7da0070-0b76-4f7f-9258-0bc4326cb910',
  'd8585d20-cdae-4fbc-91ce-9f7c9e36af89',
  '58883d0c-7dda-4745-b79a-be560e2153c8'
);

DELETE FROM ai_analysis WHERE assessment_id IN (
  'b4167df4-4e3c-459c-b4db-7c76a96b7a01',
  'f7da0070-0b76-4f7f-9258-0bc4326cb910',
  'd8585d20-cdae-4fbc-91ce-9f7c9e36af89',
  '58883d0c-7dda-4745-b79a-be560e2153c8'
);

DELETE FROM pillar_assessments WHERE assessment_id IN (
  'b4167df4-4e3c-459c-b4db-7c76a96b7a01',
  'f7da0070-0b76-4f7f-9258-0bc4326cb910',
  'd8585d20-cdae-4fbc-91ce-9f7c9e36af89',
  '58883d0c-7dda-4745-b79a-be560e2153c8'
);

DELETE FROM failed_analyses WHERE assessment_id IN (
  'b4167df4-4e3c-459c-b4db-7c76a96b7a01',
  'f7da0070-0b76-4f7f-9258-0bc4326cb910',
  'd8585d20-cdae-4fbc-91ce-9f7c9e36af89',
  '58883d0c-7dda-4745-b79a-be560e2153c8'
);

DELETE FROM admin_notifications WHERE assessment_id IN (
  'b4167df4-4e3c-459c-b4db-7c76a96b7a01',
  'f7da0070-0b76-4f7f-9258-0bc4326cb910',
  'd8585d20-cdae-4fbc-91ce-9f7c9e36af89',
  '58883d0c-7dda-4745-b79a-be560e2153c8'
);

DELETE FROM amy_review WHERE assessment_id IN (
  'b4167df4-4e3c-459c-b4db-7c76a96b7a01',
  'f7da0070-0b76-4f7f-9258-0bc4326cb910',
  'd8585d20-cdae-4fbc-91ce-9f7c9e36af89',
  '58883d0c-7dda-4745-b79a-be560e2153c8'
);

DELETE FROM admin_audit_log WHERE assessment_id IN (
  'b4167df4-4e3c-459c-b4db-7c76a96b7a01',
  'f7da0070-0b76-4f7f-9258-0bc4326cb910',
  'd8585d20-cdae-4fbc-91ce-9f7c9e36af89',
  '58883d0c-7dda-4745-b79a-be560e2153c8'
);

DELETE FROM scoring_audit_log WHERE assessment_id IN (
  'b4167df4-4e3c-459c-b4db-7c76a96b7a01',
  'f7da0070-0b76-4f7f-9258-0bc4326cb910',
  'd8585d20-cdae-4fbc-91ce-9f7c9e36af89',
  '58883d0c-7dda-4745-b79a-be560e2153c8'
);

-- Delete the old incomplete assessments
DELETE FROM assessments WHERE id IN (
  'b4167df4-4e3c-459c-b4db-7c76a96b7a01',
  'f7da0070-0b76-4f7f-9258-0bc4326cb910',
  'd8585d20-cdae-4fbc-91ce-9f7c9e36af89',
  '58883d0c-7dda-4745-b79a-be560e2153c8'
);

-- Delete related data for old TEST- assessments (they lack new validation data)
DELETE FROM diagnostic_responses WHERE assessment_id IN (
  '730decb3-7cee-4a65-b5dd-6bcac07f85a7',
  '9dfe3b23-ac2e-4624-890a-002d8285954a',
  'f98c9e60-591c-46d8-869d-3f3d0c430f17'
);

DELETE FROM scoring_results WHERE assessment_id IN (
  '730decb3-7cee-4a65-b5dd-6bcac07f85a7',
  '9dfe3b23-ac2e-4624-890a-002d8285954a',
  'f98c9e60-591c-46d8-869d-3f3d0c430f17'
);

DELETE FROM ai_analysis WHERE assessment_id IN (
  '730decb3-7cee-4a65-b5dd-6bcac07f85a7',
  '9dfe3b23-ac2e-4624-890a-002d8285954a',
  'f98c9e60-591c-46d8-869d-3f3d0c430f17'
);

DELETE FROM pillar_assessments WHERE assessment_id IN (
  '730decb3-7cee-4a65-b5dd-6bcac07f85a7',
  '9dfe3b23-ac2e-4624-890a-002d8285954a',
  'f98c9e60-591c-46d8-869d-3f3d0c430f17'
);

DELETE FROM failed_analyses WHERE assessment_id IN (
  '730decb3-7cee-4a65-b5dd-6bcac07f85a7',
  '9dfe3b23-ac2e-4624-890a-002d8285954a',
  'f98c9e60-591c-46d8-869d-3f3d0c430f17'
);

DELETE FROM admin_notifications WHERE assessment_id IN (
  '730decb3-7cee-4a65-b5dd-6bcac07f85a7',
  '9dfe3b23-ac2e-4624-890a-002d8285954a',
  'f98c9e60-591c-46d8-869d-3f3d0c430f17'
);

DELETE FROM amy_review WHERE assessment_id IN (
  '730decb3-7cee-4a65-b5dd-6bcac07f85a7',
  '9dfe3b23-ac2e-4624-890a-002d8285954a',
  'f98c9e60-591c-46d8-869d-3f3d0c430f17'
);

DELETE FROM admin_audit_log WHERE assessment_id IN (
  '730decb3-7cee-4a65-b5dd-6bcac07f85a7',
  '9dfe3b23-ac2e-4624-890a-002d8285954a',
  'f98c9e60-591c-46d8-869d-3f3d0c430f17'
);

DELETE FROM scoring_audit_log WHERE assessment_id IN (
  '730decb3-7cee-4a65-b5dd-6bcac07f85a7',
  '9dfe3b23-ac2e-4624-890a-002d8285954a',
  'f98c9e60-591c-46d8-869d-3f3d0c430f17'
);

-- Delete the old TEST- assessments
DELETE FROM assessments WHERE id IN (
  '730decb3-7cee-4a65-b5dd-6bcac07f85a7',
  '9dfe3b23-ac2e-4624-890a-002d8285954a',
  'f98c9e60-591c-46d8-869d-3f3d0c430f17'
);