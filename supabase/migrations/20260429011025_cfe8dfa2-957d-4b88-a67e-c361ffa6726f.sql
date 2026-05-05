-- Table for storing one-click magic-link access tokens for gated content
CREATE TABLE public.access_tokens (
  token UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  slot_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 year')
);

-- Useful lookups
CREATE INDEX idx_access_tokens_email_slot ON public.access_tokens (email, slot_key);
CREATE INDEX idx_access_tokens_expires ON public.access_tokens (expires_at);

-- Enable RLS — no public access. All reads/writes happen via service-role edge functions.
ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;