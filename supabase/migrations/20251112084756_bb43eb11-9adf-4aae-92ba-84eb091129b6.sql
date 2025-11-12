-- ============================================
-- PHASE 1: Create Role System Infrastructure
-- ============================================

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'recruiter', 'viewer');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- PHASE 2: Enable RLS on Tables Without It
-- ============================================

-- Enable RLS on leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Enable RLS on applicants table
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;

-- Enable RLS on templates table
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PHASE 3: Drop Insecure Policies
-- ============================================

-- Drop all overly permissive policies from candidates
DROP POLICY IF EXISTS "Allow all delete" ON public.candidates;
DROP POLICY IF EXISTS "Allow all insert" ON public.candidates;
DROP POLICY IF EXISTS "Allow all select" ON public.candidates;
DROP POLICY IF EXISTS "Allow all update" ON public.candidates;

-- Drop all overly permissive policies from companies
DROP POLICY IF EXISTS "Allow DELETE for anyone" ON public.companies;
DROP POLICY IF EXISTS "Allow INSERT for anyone" ON public.companies;
DROP POLICY IF EXISTS "Allow SELECT for anyone" ON public.companies;
DROP POLICY IF EXISTS "Allow UPDATE for anyone" ON public.companies;

-- Drop all overly permissive policies from vacancies
DROP POLICY IF EXISTS "Allow all delete" ON public.vacancies;
DROP POLICY IF EXISTS "Allow all insert" ON public.vacancies;
DROP POLICY IF EXISTS "Allow all select" ON public.vacancies;
DROP POLICY IF EXISTS "Allow all update" ON public.vacancies;

-- Drop all overly permissive policies from interview_schedules
DROP POLICY IF EXISTS "Allow public delete" ON public.interview_schedules;
DROP POLICY IF EXISTS "Allow public insert" ON public.interview_schedules;
DROP POLICY IF EXISTS "Allow public read" ON public.interview_schedules;
DROP POLICY IF EXISTS "Allow public update" ON public.interview_schedules;

-- ============================================
-- PHASE 4: Create Secure RLS Policies
-- ============================================

-- LEADS TABLE POLICIES
CREATE POLICY "Authenticated users can view leads"
ON public.leads FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and recruiters can insert leads"
ON public.leads FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'recruiter')
);

CREATE POLICY "Admins and recruiters can update leads"
ON public.leads FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'recruiter')
);

CREATE POLICY "Only admins can delete leads"
ON public.leads FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- APPLICANTS TABLE POLICIES
CREATE POLICY "Authenticated users can view applicants"
ON public.applicants FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and recruiters can insert applicants"
ON public.applicants FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'recruiter')
);

CREATE POLICY "Admins and recruiters can update applicants"
ON public.applicants FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'recruiter')
);

CREATE POLICY "Only admins can delete applicants"
ON public.applicants FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- TEMPLATES TABLE POLICIES
CREATE POLICY "Authenticated users can view templates"
ON public.templates FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and recruiters can insert templates"
ON public.templates FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'recruiter')
);

CREATE POLICY "Admins and recruiters can update templates"
ON public.templates FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'recruiter')
);

CREATE POLICY "Only admins can delete templates"
ON public.templates FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- CANDIDATES TABLE POLICIES
CREATE POLICY "Authenticated users can view candidates"
ON public.candidates FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and recruiters can insert candidates"
ON public.candidates FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'recruiter')
);

CREATE POLICY "Admins and recruiters can update candidates"
ON public.candidates FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'recruiter')
);

CREATE POLICY "Only admins can delete candidates"
ON public.candidates FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- COMPANIES TABLE POLICIES
CREATE POLICY "Authenticated users can view companies"
ON public.companies FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and recruiters can insert companies"
ON public.companies FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'recruiter')
);

CREATE POLICY "Admins and recruiters can update companies"
ON public.companies FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'recruiter')
);

CREATE POLICY "Only admins can delete companies"
ON public.companies FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- VACANCIES TABLE POLICIES
CREATE POLICY "Authenticated users can view vacancies"
ON public.vacancies FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and recruiters can insert vacancies"
ON public.vacancies FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'recruiter')
);

CREATE POLICY "Admins and recruiters can update vacancies"
ON public.vacancies FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'recruiter')
);

CREATE POLICY "Only admins can delete vacancies"
ON public.vacancies FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- INTERVIEW_SCHEDULES TABLE POLICIES
CREATE POLICY "Authenticated users can view interview schedules"
ON public.interview_schedules FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and recruiters can insert interview schedules"
ON public.interview_schedules FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'recruiter')
);

CREATE POLICY "Admins and recruiters can update interview schedules"
ON public.interview_schedules FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'recruiter')
);

CREATE POLICY "Only admins can delete interview schedules"
ON public.interview_schedules FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- PHASE 5: Fix Database Function Security
-- ============================================

-- Fix the update_updated_at_column function to have fixed search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;