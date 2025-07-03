

// Real API endpoints for statistics
export interface Company {
  id: number;
  company_uuid: string;
  company_name: string;
  company_description: string;
  company_value: string;
  company_logo_url: string;
  company_base_url: string;
  created_at: string;
  updated_at: string;
}

export interface JobVacancy {
  id: number;
  uuid: string;
  applicant_count: number;
  training_id: number;
  uuid_training: string;
  company_id: number;
  company_uuid: string;
  name: string;
  category: string;
  company_name: string;
  company_image: string;
  company_city: string;
  company_base_url: string;
  company_value: string;
  description: string;
  enable_auto_assess: number;
  rubric_score: string;
  work_type: string;
  location_type: string;
  minimum_salary: number;
  maximum_salary: number;
  skills: string[];
  level: string;
  outreach_message: string;
  with_deadline: boolean;
  deadline_at: string;
  likert_scale_data: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: number;
  company_name: string;
  name: string;
  email: string;
  job_title: string;
  category: string[];
  net_worth: number;
  status: number;
  resume_file_url: string;
  created_at: string;
  updated_at: string;
}

export interface StatisticData {
  company: string;
  vacancy: string;
  outreach: number;
  applicants: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  fulfilled: number;
  data: T[];
  pagination: {
    type: string;
    page: number;
    per_page: number;
    total_rows: number;
    total_pages: number;
    numbering_start: number;
    sort: string;
  };
}

const BASE_URL = 'https://bumame-sarana-ai-daffa-ai-service-652345969561.asia-southeast2.run.app';

export const getCompanies = async (): Promise<Company[]> => {
  console.log('Fetching companies from API...');
  const response = await fetch(`${BASE_URL}/public/companies`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch companies: ${response.statusText}`);
  }
  
  const data: ApiResponse<Company> = await response.json();
  console.log('Companies API response:', data);
  return data.data || [];
};

export const getJobVacancies = async (companyUuid: string): Promise<JobVacancy[]> => {
  console.log('Fetching job vacancies for company:', companyUuid);
  const response = await fetch(`${BASE_URL}/public/companies/${companyUuid}/job-vacancies`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch job vacancies: ${response.statusText}`);
  }
  
  const data: ApiResponse<JobVacancy> = await response.json();
  console.log('Job vacancies API response:', data);
  return data.data || [];
};

export const getCandidates = async (jobVacancyUuid: string): Promise<Candidate[]> => {
  console.log('Fetching candidates for job vacancy:', jobVacancyUuid);
  const response = await fetch(`${BASE_URL}/public/job-vacancies/${jobVacancyUuid}/candidates`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch candidates: ${response.statusText}`);
  }
  
  const data: ApiResponse<Candidate> = await response.json();
  console.log('Candidates API response:', data);
  return data.data || [];
};

// Transform candidates data to statistics format
export const transformCandidatesToStatistics = (candidates: Candidate[], companyName: string, position: string): StatisticData => {
  // For now, we'll use candidate count as applicants
  // You may want to add outreach data from another endpoint
  const applicants = candidates.length;
  
  return {
    company: companyName,
    vacancy: position,
    outreach: applicants * 5, // Assuming 5x outreach for demo - replace with real data
    applicants: applicants
  };
};

