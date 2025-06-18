
-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert 7 dummy clients
INSERT INTO public.clients (name) VALUES
('Client A'),
('Client B'),
('Client C'),
('Client D'),
('Client E'),
('Client F'),
('Client G');

-- Add client_id column to candidates table
ALTER TABLE public.candidates 
ADD COLUMN client_id UUID REFERENCES public.clients(id);

-- Update existing candidates with random client assignments
UPDATE public.candidates 
SET client_id = (
  SELECT id FROM public.clients 
  ORDER BY RANDOM() 
  LIMIT 1
);

-- Make client_id NOT NULL after assigning values
ALTER TABLE public.candidates 
ALTER COLUMN client_id SET NOT NULL;
