
-- Enable RLS on all three tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "admin full access" ON public.companies;
DROP POLICY IF EXISTS "admin full access" ON public.vacancies;
DROP POLICY IF EXISTS "read only for authenticated" ON public.candidates;

-- Create policies for companies table (full CRUD access for authenticated users)
CREATE POLICY "admin full access"
ON public.companies
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for vacancies table (full CRUD access for authenticated users)
CREATE POLICY "admin full access"
ON public.vacancies
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for candidates table (read-only access for authenticated users)
CREATE POLICY "read only for authenticated"
ON public.candidates
FOR SELECT
TO authenticated
USING (true);
