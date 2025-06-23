
-- Add search_url and note_sent columns to the vacancies table
ALTER TABLE public.vacancies 
ADD COLUMN search_url TEXT,
ADD COLUMN note_sent TEXT;
