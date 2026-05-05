-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles table (only admins can view/modify)
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop existing overly permissive policies on all tables
DROP POLICY IF EXISTS "Admin can view all analysis" ON public.ai_analysis;
DROP POLICY IF EXISTS "Admin can insert analysis" ON public.ai_analysis;
DROP POLICY IF EXISTS "Admin can update analysis" ON public.ai_analysis;
DROP POLICY IF EXISTS "Admin can delete analysis" ON public.ai_analysis;

DROP POLICY IF EXISTS "Admin can view all reviews" ON public.amy_review;
DROP POLICY IF EXISTS "Admin can insert reviews" ON public.amy_review;
DROP POLICY IF EXISTS "Admin can update reviews" ON public.amy_review;
DROP POLICY IF EXISTS "Admin can delete reviews" ON public.amy_review;

DROP POLICY IF EXISTS "Admin can view all assessments" ON public.assessments;
DROP POLICY IF EXISTS "Admin can update all assessments" ON public.assessments;
DROP POLICY IF EXISTS "Admin can insert assessments" ON public.assessments;
DROP POLICY IF EXISTS "Admin can delete assessments" ON public.assessments;

DROP POLICY IF EXISTS "Admin can view all responses" ON public.diagnostic_responses;
DROP POLICY IF EXISTS "Admin can insert responses" ON public.diagnostic_responses;
DROP POLICY IF EXISTS "Admin can update responses" ON public.diagnostic_responses;
DROP POLICY IF EXISTS "Admin can delete responses" ON public.diagnostic_responses;

DROP POLICY IF EXISTS "Admin can view all pillars" ON public.pillar_assessments;
DROP POLICY IF EXISTS "Admin can insert pillars" ON public.pillar_assessments;
DROP POLICY IF EXISTS "Admin can update pillars" ON public.pillar_assessments;
DROP POLICY IF EXISTS "Admin can delete pillars" ON public.pillar_assessments;

DROP POLICY IF EXISTS "Admin can view all scoring" ON public.scoring_results;
DROP POLICY IF EXISTS "Admin can insert scoring" ON public.scoring_results;
DROP POLICY IF EXISTS "Admin can update scoring" ON public.scoring_results;
DROP POLICY IF EXISTS "Admin can delete scoring" ON public.scoring_results;

-- Create proper admin-only policies for ai_analysis
CREATE POLICY "Admins can view all analysis"
ON public.ai_analysis FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert analysis"
ON public.ai_analysis FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update analysis"
ON public.ai_analysis FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete analysis"
ON public.ai_analysis FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create proper admin-only policies for amy_review
CREATE POLICY "Admins can view all reviews"
ON public.amy_review FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert reviews"
ON public.amy_review FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reviews"
ON public.amy_review FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete reviews"
ON public.amy_review FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create proper admin-only policies for assessments
CREATE POLICY "Admins can view all assessments"
ON public.assessments FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert assessments"
ON public.assessments FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update assessments"
ON public.assessments FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete assessments"
ON public.assessments FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create proper admin-only policies for diagnostic_responses
CREATE POLICY "Admins can view all responses"
ON public.diagnostic_responses FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert responses"
ON public.diagnostic_responses FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update responses"
ON public.diagnostic_responses FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete responses"
ON public.diagnostic_responses FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create proper admin-only policies for pillar_assessments
CREATE POLICY "Admins can view all pillars"
ON public.pillar_assessments FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert pillars"
ON public.pillar_assessments FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update pillars"
ON public.pillar_assessments FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete pillars"
ON public.pillar_assessments FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create proper admin-only policies for scoring_results
CREATE POLICY "Admins can view all scoring"
ON public.scoring_results FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert scoring"
ON public.scoring_results FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update scoring"
ON public.scoring_results FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete scoring"
ON public.scoring_results FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));