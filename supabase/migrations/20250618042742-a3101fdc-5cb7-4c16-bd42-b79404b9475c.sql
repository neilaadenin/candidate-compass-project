
-- Drop the existing clients table and its foreign key constraints
ALTER TABLE public.candidates DROP CONSTRAINT IF EXISTS candidates_client_id_fkey;
ALTER TABLE public.candidates DROP COLUMN IF EXISTS client_id;
DROP TABLE IF EXISTS public.clients;

-- Create companies table
CREATE TABLE public.companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vacancies table
CREATE TABLE public.vacancies (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  company_id INTEGER NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update candidates table structure
ALTER TABLE public.candidates 
DROP COLUMN IF EXISTS company,
DROP COLUMN IF EXISTS current_position,
DROP COLUMN IF EXISTS location,
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS linkedin_url,
DROP COLUMN IF EXISTS experience_years,
DROP COLUMN IF EXISTS skills;

-- Add new columns to candidates table
ALTER TABLE public.candidates 
ADD COLUMN name TEXT,
ADD COLUMN profile_url TEXT,
ADD COLUMN note_sent TEXT,
ADD COLUMN connection_status TEXT,
ADD COLUMN apply_date DATE,
ADD COLUMN vacancy_id INTEGER REFERENCES public.vacancies(id) ON DELETE CASCADE;

-- Update existing candidates with new structure (set name from full_name if exists)
UPDATE public.candidates SET name = full_name WHERE full_name IS NOT NULL;

-- Drop old column
ALTER TABLE public.candidates DROP COLUMN IF EXISTS full_name;

-- Make required columns NOT NULL
ALTER TABLE public.candidates 
ALTER COLUMN name SET NOT NULL;

-- Insert sample data
INSERT INTO public.companies (name) VALUES
('PT Bank Perkreditan Rakyat'),
('PT Bumi Amartha Teknologi Mandiri'),
('PT Digital Kreasi Indonesia');

INSERT INTO public.vacancies (title, company_id, description) VALUES
('Credit Marketing', 1, 'Posisi Credit Marketing untuk menangani pemasaran produk kredit'),
('Sales Manager', 2, 'Mengelola tim sales dan mengembangkan strategi penjualan'),
('Software Engineer', 3, 'Pengembangan aplikasi web dan mobile');
