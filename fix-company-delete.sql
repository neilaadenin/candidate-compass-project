-- Simple fix for company delete - run this in Supabase SQL Editor

-- Drop the foreign key constraint that's blocking deletion
ALTER TABLE interview_schedules DROP CONSTRAINT IF EXISTS interview_schedules_company_uuid_fkey;

-- Recreate it with CASCADE
ALTER TABLE interview_schedules
ADD CONSTRAINT interview_schedules_company_uuid_fkey
FOREIGN KEY (company_uuid)
REFERENCES companies(company_uuid)
ON DELETE CASCADE;

-- Also fix vacancies table if it has company_uuid
ALTER TABLE vacancies DROP CONSTRAINT IF EXISTS vacancies_company_uuid_fkey;

ALTER TABLE vacancies
ADD CONSTRAINT vacancies_company_uuid_fkey
FOREIGN KEY (company_uuid)
REFERENCES companies(company_uuid)
ON DELETE CASCADE; 