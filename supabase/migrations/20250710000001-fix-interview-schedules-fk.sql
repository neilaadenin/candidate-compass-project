-- Fix foreign key constraints to allow company deletion
-- Update interview_schedules table to use CASCADE on company_uuid

-- First, drop the existing foreign key constraint
ALTER TABLE public.interview_schedules 
DROP CONSTRAINT IF EXISTS fk_company;

-- Recreate the foreign key constraint with CASCADE
ALTER TABLE public.interview_schedules 
ADD CONSTRAINT fk_company 
FOREIGN KEY (company_uuid) 
REFERENCES public.companies(company_uuid) 
ON DELETE CASCADE;

-- Also update the vacancies table foreign key if it exists
-- Drop existing constraint
ALTER TABLE public.vacancies 
DROP CONSTRAINT IF EXISTS fk_company_uuid;

-- Recreate with CASCADE
ALTER TABLE public.vacancies 
ADD CONSTRAINT fk_company_uuid 
FOREIGN KEY (company_uuid) 
REFERENCES public.companies(company_uuid) 
ON DELETE CASCADE;

-- Verify the constraints are properly set
-- This will show the current foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('interview_schedules', 'vacancies')
  AND ccu.table_name = 'companies'; 