-- Delete related data for old PILLARTEST, AITEST, and TEST123 assessments
DELETE FROM diagnostic_responses WHERE assessment_id IN (
  '94c252a1-f1c6-4130-8279-fec4c6b5a7b9',
  '186db221-5857-4743-9dbf-20329fdf82fe',
  '131079cb-785b-43e7-83f6-37e4479d28f3',
  '650f2e23-5862-4c60-b12e-8fe54617b6cf',
  '7677e086-7b56-46c6-b809-9ba6992875ae',
  '1576fa06-a1b7-444b-877d-d31b8f0b58bf',
  'eb9830ac-9df4-45ea-bde3-f703d4091c7c'
);

DELETE FROM scoring_results WHERE assessment_id IN (
  '94c252a1-f1c6-4130-8279-fec4c6b5a7b9',
  '186db221-5857-4743-9dbf-20329fdf82fe',
  '131079cb-785b-43e7-83f6-37e4479d28f3',
  '650f2e23-5862-4c60-b12e-8fe54617b6cf',
  '7677e086-7b56-46c6-b809-9ba6992875ae',
  '1576fa06-a1b7-444b-877d-d31b8f0b58bf',
  'eb9830ac-9df4-45ea-bde3-f703d4091c7c'
);

DELETE FROM ai_analysis WHERE assessment_id IN (
  '94c252a1-f1c6-4130-8279-fec4c6b5a7b9',
  '186db221-5857-4743-9dbf-20329fdf82fe',
  '131079cb-785b-43e7-83f6-37e4479d28f3',
  '650f2e23-5862-4c60-b12e-8fe54617b6cf',
  '7677e086-7b56-46c6-b809-9ba6992875ae',
  '1576fa06-a1b7-444b-877d-d31b8f0b58bf',
  'eb9830ac-9df4-45ea-bde3-f703d4091c7c'
);

DELETE FROM pillar_assessments WHERE assessment_id IN (
  '94c252a1-f1c6-4130-8279-fec4c6b5a7b9',
  '186db221-5857-4743-9dbf-20329fdf82fe',
  '131079cb-785b-43e7-83f6-37e4479d28f3',
  '650f2e23-5862-4c60-b12e-8fe54617b6cf',
  '7677e086-7b56-46c6-b809-9ba6992875ae',
  '1576fa06-a1b7-444b-877d-d31b8f0b58bf',
  'eb9830ac-9df4-45ea-bde3-f703d4091c7c'
);

DELETE FROM failed_analyses WHERE assessment_id IN (
  '94c252a1-f1c6-4130-8279-fec4c6b5a7b9',
  '186db221-5857-4743-9dbf-20329fdf82fe',
  '131079cb-785b-43e7-83f6-37e4479d28f3',
  '650f2e23-5862-4c60-b12e-8fe54617b6cf',
  '7677e086-7b56-46c6-b809-9ba6992875ae',
  '1576fa06-a1b7-444b-877d-d31b8f0b58bf',
  'eb9830ac-9df4-45ea-bde3-f703d4091c7c'
);

DELETE FROM admin_notifications WHERE assessment_id IN (
  '94c252a1-f1c6-4130-8279-fec4c6b5a7b9',
  '186db221-5857-4743-9dbf-20329fdf82fe',
  '131079cb-785b-43e7-83f6-37e4479d28f3',
  '650f2e23-5862-4c60-b12e-8fe54617b6cf',
  '7677e086-7b56-46c6-b809-9ba6992875ae',
  '1576fa06-a1b7-444b-877d-d31b8f0b58bf',
  'eb9830ac-9df4-45ea-bde3-f703d4091c7c'
);

DELETE FROM amy_review WHERE assessment_id IN (
  '94c252a1-f1c6-4130-8279-fec4c6b5a7b9',
  '186db221-5857-4743-9dbf-20329fdf82fe',
  '131079cb-785b-43e7-83f6-37e4479d28f3',
  '650f2e23-5862-4c60-b12e-8fe54617b6cf',
  '7677e086-7b56-46c6-b809-9ba6992875ae',
  '1576fa06-a1b7-444b-877d-d31b8f0b58bf',
  'eb9830ac-9df4-45ea-bde3-f703d4091c7c'
);

DELETE FROM admin_audit_log WHERE assessment_id IN (
  '94c252a1-f1c6-4130-8279-fec4c6b5a7b9',
  '186db221-5857-4743-9dbf-20329fdf82fe',
  '131079cb-785b-43e7-83f6-37e4479d28f3',
  '650f2e23-5862-4c60-b12e-8fe54617b6cf',
  '7677e086-7b56-46c6-b809-9ba6992875ae',
  '1576fa06-a1b7-444b-877d-d31b8f0b58bf',
  'eb9830ac-9df4-45ea-bde3-f703d4091c7c'
);

DELETE FROM scoring_audit_log WHERE assessment_id IN (
  '94c252a1-f1c6-4130-8279-fec4c6b5a7b9',
  '186db221-5857-4743-9dbf-20329fdf82fe',
  '131079cb-785b-43e7-83f6-37e4479d28f3',
  '650f2e23-5862-4c60-b12e-8fe54617b6cf',
  '7677e086-7b56-46c6-b809-9ba6992875ae',
  '1576fa06-a1b7-444b-877d-d31b8f0b58bf',
  'eb9830ac-9df4-45ea-bde3-f703d4091c7c'
);

-- Delete the assessments
DELETE FROM assessments WHERE id IN (
  '94c252a1-f1c6-4130-8279-fec4c6b5a7b9',
  '186db221-5857-4743-9dbf-20329fdf82fe',
  '131079cb-785b-43e7-83f6-37e4479d28f3',
  '650f2e23-5862-4c60-b12e-8fe54617b6cf',
  '7677e086-7b56-46c6-b809-9ba6992875ae',
  '1576fa06-a1b7-444b-877d-d31b8f0b58bf',
  'eb9830ac-9df4-45ea-bde3-f703d4091c7c'
);