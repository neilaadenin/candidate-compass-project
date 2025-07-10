-- Test script to verify Company DELETE functionality with CASCADE
-- Run this in Supabase SQL editor to test the foreign key constraints

-- 1. Check current foreign key constraints
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

-- 2. Check if there are any companies with related interview schedules
SELECT 
    c.company_uuid,
    c.name,
    COUNT(is.schedules_uuid) as interview_schedules_count
FROM companies c
LEFT JOIN interview_schedules is ON c.company_uuid = is.company_uuid
GROUP BY c.company_uuid, c.name
HAVING COUNT(is.schedules_uuid) > 0;

-- 3. Test deletion (uncomment to test)
-- DELETE FROM companies WHERE company_uuid = 'your-test-company-uuid';

-- 4. Verify interview schedules are also deleted
-- SELECT COUNT(*) FROM interview_schedules WHERE company_uuid = 'your-test-company-uuid'; 