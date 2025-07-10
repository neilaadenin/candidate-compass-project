-- Fix companies table structure to match the expected schema
-- Add missing columns if they don't exist

-- Add company_uuid column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'companies' AND column_name = 'company_uuid') THEN
        ALTER TABLE public.companies ADD COLUMN company_uuid UUID DEFAULT gen_random_uuid();
    END IF;
END $$;

-- Add company_description column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'companies' AND column_name = 'company_description') THEN
        ALTER TABLE public.companies ADD COLUMN company_description TEXT;
    END IF;
END $$;

-- Add company_value column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'companies' AND column_name = 'company_value') THEN
        ALTER TABLE public.companies ADD COLUMN company_value TEXT;
    END IF;
END $$;

-- Add company_logo_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'companies' AND column_name = 'company_logo_url') THEN
        ALTER TABLE public.companies ADD COLUMN company_logo_url TEXT;
    END IF;
END $$;

-- Add company_base_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'companies' AND column_name = 'company_base_url') THEN
        ALTER TABLE public.companies ADD COLUMN company_base_url TEXT;
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'companies' AND column_name = 'updated_at') THEN
        ALTER TABLE public.companies ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;

-- Update existing records to have company_uuid if they don't have one
UPDATE public.companies 
SET company_uuid = gen_random_uuid() 
WHERE company_uuid IS NULL;

-- Make company_uuid NOT NULL after ensuring all records have it
ALTER TABLE public.companies ALTER COLUMN company_uuid SET NOT NULL;

-- Create unique index on company_uuid
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_company_uuid ON public.companies(company_uuid);

-- Update the updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 