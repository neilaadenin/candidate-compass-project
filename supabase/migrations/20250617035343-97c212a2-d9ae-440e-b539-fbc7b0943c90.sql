
-- Create candidates table
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  current_position TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  linkedin_url TEXT,
  experience_years INTEGER NOT NULL DEFAULT 0,
  skills TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert sample data
INSERT INTO public.candidates (full_name, current_position, company, location, email, linkedin_url, experience_years, skills) VALUES
('Andi Pratama', 'Senior Frontend Developer', 'Tokopedia', 'Jakarta, Indonesia', 'andi.pratama@email.com', 'https://linkedin.com/in/andipratama', 5, ARRAY['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL']),
('Sari Wulandari', 'Product Manager', 'Gojek', 'Jakarta, Indonesia', 'sari.wulandari@email.com', 'https://linkedin.com/in/sariwulandari', 7, ARRAY['Product Strategy', 'Agile', 'User Research', 'Analytics', 'Figma']),
('Budi Santoso', 'Full Stack Developer', 'Shopee', 'Bandung, Indonesia', 'budi.santoso@email.com', 'https://linkedin.com/in/budisantoso', 4, ARRAY['Node.js', 'Python', 'React', 'PostgreSQL', 'Docker', 'AWS']),
('Maya Indira', 'UX/UI Designer', 'OVO', 'Jakarta, Indonesia', 'maya.indira@email.com', 'https://linkedin.com/in/mayaindira', 3, ARRAY['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Design Systems']),
('Rizki Firmansyah', 'DevOps Engineer', 'Traveloka', 'Jakarta, Indonesia', 'rizki.firmansyah@email.com', 'https://linkedin.com/in/rizkifirmansyah', 6, ARRAY['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Jenkins', 'Monitoring']),
('Dewi Lestari', 'Data Scientist', 'Bukalapak', 'Jakarta, Indonesia', 'dewi.lestari@email.com', 'https://linkedin.com/in/dewilestari', 4, ARRAY['Python', 'Machine Learning', 'SQL', 'Tableau', 'TensorFlow', 'Statistics']),
('Arif Rahman', 'Backend Developer', 'Blibli', 'Jakarta, Indonesia', 'arif.rahman@email.com', 'https://linkedin.com/in/arifrahman', 5, ARRAY['Java', 'Spring Boot', 'Microservices', 'Redis', 'Kafka', 'MySQL']),
('Putri Maharani', 'Mobile Developer', 'Dana', 'Jakarta, Indonesia', 'putri.maharani@email.com', 'https://linkedin.com/in/putrimaharani', 3, ARRAY['Flutter', 'Dart', 'iOS', 'Android', 'Firebase', 'REST API']);

-- Enable Row Level Security (optional - uncomment if you want to add user authentication later)
-- ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access (you can modify this later for authentication)
-- CREATE POLICY "Anyone can view candidates" ON public.candidates FOR SELECT USING (true);
