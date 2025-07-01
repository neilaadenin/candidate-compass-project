
// Real API endpoints for statistics
export interface Company {
  company_uuid: string;
  company_name: string;
  created_at: string;
}

export interface JobVacancy {
  job_vacancy_uuid: string;
  company_uuid: string;
  position: string;
  description: string;
  created_at: string;
}

export interface Candidate {
  candidate_uuid: string;
  name: string;
  email: string;
  phone: string;
  resume_file_url: string;
  category: string;
  company_name: string;
  position: string;
  created_at: string;
}

export interface StatisticData {
  company: string;
  vacancy: string;
  outreach: number;
  applicants: number;
}

const BASE_URL = 'https://bumame-sarana-ai-daffa-ai-service-652345969561.asia-southeast2.run.app';

export const getCompanies = async (): Promise<Company[]> => {
  console.log('Fetching companies from API...');
  const response = await fetch(`${BASE_URL}/public/companies`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch companies: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('Companies API response:', data);
  return data.data || [];
};

export const getJobVacancies = async (companyUuid: string): Promise<JobVacancy[]> => {
  console.log('Fetching job vacancies for company:', companyUuid);
  const response = await fetch(`${BASE_URL}/public/companies/${companyUuid}/job-vacancies`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch job vacancies: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('Job vacancies API response:', data);
  return data.data || [];
};

export const getCandidates = async (jobVacancyUuid: string): Promise<Candidate[]> => {
  console.log('Fetching candidates for job vacancy:', jobVacancyUuid);
  const response = await fetch(`${BASE_URL}/public/job-vacancies/${jobVacancyUuid}/candidates`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch candidates: ${response.statusText}`);
  }
  
  const data = await response.json();
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
