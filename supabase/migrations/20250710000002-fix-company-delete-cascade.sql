-- Fix Company DELETE functionality by updating foreign key constraints
-- This ensures companies can be deleted even when linked to interview_schedules

-- First, let's check what foreign key constraints exist
-- This will help us identify the correct constraint names
SELECT 
    tc.constraint_name,
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
    LEFT JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'interview_schedules'
  AND ccu.table_name = 'companies';

-- Drop all existing foreign key constraints that reference companies.company_uuid
-- We'll drop them by name to be safe
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Drop interview_schedules foreign key constraints
    FOR constraint_name IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu 
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = 'interview_schedules'
            AND ccu.table_name = 'companies'
            AND kcu.column_name = 'company_uuid'
    LOOP
        EXECUTE 'ALTER TABLE interview_schedules DROP CONSTRAINT IF EXISTS ' || constraint_name;
    END LOOP;
    
    -- Drop vacancies foreign key constraints
    FOR constraint_name IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu 
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = 'vacancies'
            AND ccu.table_name = 'companies'
            AND kcu.column_name = 'company_uuid'
    LOOP
        EXECUTE 'ALTER TABLE vacancies DROP CONSTRAINT IF EXISTS ' || constraint_name;
    END LOOP;
END $$;

-- Recreate the foreign key constraints with CASCADE
-- For interview_schedules
ALTER TABLE interview_schedules
ADD CONSTRAINT interview_schedules_company_uuid_fkey
FOREIGN KEY (company_uuid)
REFERENCES companies(company_uuid)
ON DELETE CASCADE;

-- For vacancies (if it has company_uuid column)
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

-- Verify the constraints are properly set
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