
-- Fix foreign key constraints untuk memungkinkan CASCADE DELETE
-- Ini akan memastikan ketika company dihapus, semua data terkait juga terhapus

-- Drop existing foreign key constraints
ALTER TABLE interview_schedules DROP CONSTRAINT IF EXISTS interview_schedules_company_uuid_fkey;
ALTER TABLE interview_schedules DROP CONSTRAINT IF EXISTS fk_company;
ALTER TABLE vacancies DROP CONSTRAINT IF EXISTS vacancies_company_uuid_fkey;
ALTER TABLE vacancies DROP CONSTRAINT IF EXISTS fk_company_uuid;

-- Recreate dengan CASCADE DELETE
ALTER TABLE interview_schedules
ADD CONSTRAINT interview_schedules_company_uuid_fkey
FOREIGN KEY (company_uuid)
REFERENCES companies(company_uuid)
ON DELETE CASCADE;

ALTER TABLE vacancies
ADD CONSTRAINT vacancies_company_uuid_fkey
FOREIGN KEY (company_uuid)
REFERENCES companies(company_uuid)
ON DELETE CASCADE;

-- Tambahkan policy DELETE untuk companies table
DROP POLICY IF EXISTS "Allow DELETE for anyone" ON companies;
CREATE POLICY "Allow DELETE for anyone" 
ON companies 
FOR DELETE 
USING (true);

-- Verify constraints sudah benar
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
