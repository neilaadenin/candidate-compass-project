
-- Create interview_schedules table with proper foreign key relationships
CREATE TABLE public.interview_schedules (
  schedules_uuid UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vacancy_uuid UUID NOT NULL REFERENCES public.vacancies(vacancy_uuid) ON DELETE CASCADE,
  company_uuid UUID NOT NULL REFERENCES public.companies(company_uuid) ON DELETE CASCADE,
  candidate_id INTEGER NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  interview_date DATE NOT NULL,
  interview_time TIME NOT NULL,
  interview_location TEXT,
  interview_type TEXT,
  interviewer_name TEXT,
  meeting_link TEXT,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.interview_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (similar to other tables)
CREATE POLICY "Allow public read on interview_schedules" 
  ON public.interview_schedules 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert on interview_schedules" 
  ON public.interview_schedules 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update on interview_schedules" 
  ON public.interview_schedules 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on interview_schedules" 
  ON public.interview_schedules 
  FOR DELETE 
  USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE TRIGGER update_interview_schedules_updated_at
  BEFORE UPDATE ON public.interview_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_interview_schedules_vacancy_uuid ON public.interview_schedules(vacancy_uuid);
CREATE INDEX idx_interview_schedules_company_uuid ON public.interview_schedules(company_uuid);
CREATE INDEX idx_interview_schedules_candidate_id ON public.interview_schedules(candidate_id);
CREATE INDEX idx_interview_schedules_interview_date ON public.interview_schedules(interview_date);
