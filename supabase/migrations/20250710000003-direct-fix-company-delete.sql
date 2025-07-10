-- Direct fix for Company DELETE functionality
-- This migration specifically addresses the foreign key constraint issue

-- Drop the existing foreign key constraint (using the exact name from the error)
ALTER TABLE interview_schedules DROP CONSTRAINT IF EXISTS interview_schedules_company_uuid_fkey;

-- Recreate the constraint with CASCADE
ALTER TABLE interview_schedules
ADD CONSTRAINT interview_schedules_company_uuid_fkey
FOREIGN KEY (company_uuid)
REFERENCES companies(company_uuid)
ON DELETE CASCADE;

-- Also fix any other potential foreign key constraints
-- Drop any other constraints that might exist
ALTER TABLE interview_schedules DROP CONSTRAINT IF EXISTS fk_company;
ALTER TABLE vacancies DROP CONSTRAINT IF EXISTS fk_company_uuid;

-- Recreate vacancies constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vacancies' 
        AND column_name = 'company_uuid'
    ) THEN
        ALTER TABLE vacancies
        ADD CONSTRAINT vacancies_company_uuid_fkey
        FOREIGN KEY (company_uuid)
        REFERENCES companies(company_uuid)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Test the constraint by checking if it's properly set
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
  AND tc.table_name = 'interview_schedules'
  AND ccu.table_name = 'companies'; 