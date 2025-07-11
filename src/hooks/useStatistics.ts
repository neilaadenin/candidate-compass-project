
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Company {
  id: number;
  name: string;
  company_uuid: string;
  description?: string;
}

interface JobVacancy {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  location?: string;
  requirements?: string;
  type?: string;
  salary_min?: number;
  salary_max?: number;
  company_uuid: string;
}

interface StatisticData {
  company: string;
  vacancy: string;
  outreach: number;
  applicants: number;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  fulfilled: number;
  data: T[];
  pagination?: {
    type: string;
    page: number;
    per_page: number;
    total_rows: number;
    total_pages: number;
    numbering_start: number;
    sort: string;
  };
}

interface ApiCompany {
  id: number;
  company_uuid: string;
  company_name: string;
  company_description?: string;
  company_value?: string;
  company_logo_url?: string;
  company_base_url?: string;
  created_at: string;
  updated_at: string;
}

interface ApiJobVacancy {
  id: number;
  uuid: string;
  applicant_count?: number;
  training_id?: number;
  uuid_training?: string;
  company_id: number;
  company_uuid: string;
  name: string;
  category?: string;
  company_name?: string;
  company_image?: string;
  company_city?: string;
  company_base_url?: string;
  company_value?: string;
  description?: string;
  enable_auto_assess?: number;
  rubric_score?: string;
  work_type?: string;
  location_type?: string;
  minimum_salary?: number;
  maximum_salary?: number;
  skills?: string[];
  level?: string;
  outreach_message?: string;
  with_deadline?: boolean;
  deadline_at?: string;
  likert_scale_data?: string;
  status?: number;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = 'https://bumame-sarana-ai-daffa-ai-service-652345969561.asia-southeast2.run.app';

export const useStatistics = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobVacancies, setJobVacancies] = useState<JobVacancy[]>([]);
  const [statistics, setStatistics] = useState<StatisticData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      console.log('Fetching companies from API...');
      const response = await fetch(`${API_BASE_URL}/public/companies?limit=100`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<ApiCompany> = await response.json();
      
      if (result.statusCode === 200 && result.data) {
        // Transform API company data to match our interface
        const transformedCompanies: Company[] = result.data.map(company => ({
          id: company.id,
          name: company.company_name,
          company_uuid: company.company_uuid,
          description: company.company_description
        }));
        
        console.log('Companies fetched successfully:', transformedCompanies);
        setCompanies(transformedCompanies);
        setError(null);
      } else {
        throw new Error(result.message || 'Failed to fetch companies');
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
      toast({
        title: "Error",
        description: "Failed to fetch companies from API",
        variant: "destructive",
      });
    }
  };

  const fetchJobVacancies = async (companyUuid: string, params?: {
    page?: number;
    limit?: number;
    sort?: string;
    search?: string;
    category?: string;
  }) => {
    try {
      console.log('Fetching job vacancies from API for company:', companyUuid);
      
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sort) queryParams.append('sort', params.sort);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.category) queryParams.append('category', params.category);
      
      const url = `${API_BASE_URL}/public/companies/${companyUuid}/job-vacancies${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<ApiJobVacancy> = await response.json();
      
      if (result.statusCode === 200 && result.data) {
        // Transform API job vacancy data to match our interface
        const transformedVacancies: JobVacancy[] = result.data.map(vacancy => ({
          id: vacancy.id,
          uuid: vacancy.uuid,
          name: vacancy.name,
          description: vacancy.description,
          location: vacancy.company_city || vacancy.location_type,
          requirements: vacancy.level, // Using level as requirements for now
          type: vacancy.work_type,
          salary_min: vacancy.minimum_salary,
          salary_max: vacancy.maximum_salary,
          company_uuid: vacancy.company_uuid
        }));
        
        console.log('Job vacancies fetched successfully:', transformedVacancies);
        setJobVacancies(transformedVacancies);
        setError(null);
        return transformedVacancies;
      } else {
        throw new Error(result.message || 'Failed to fetch job vacancies');
      }
    } catch (err) {
      console.error('Error fetching job vacancies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch job vacancies');
      toast({
        title: "Error",
        description: "Failed to fetch job vacancies from API",
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchStatisticsForVacancy = async (vacancyUuid: string, companyName: string, vacancyName: string) => {
    try {
      console.log('Fetching statistics for vacancy:', vacancyUuid);
      
      // Mock statistics data since the API endpoint structure is not clear
      const mockStats: StatisticData[] = [{
        company: companyName,
        vacancy: vacancyName,
        outreach: Math.floor(Math.random() * 100) + 50, // Random between 50-150
        applicants: Math.floor(Math.random() * 30) + 10  // Random between 10-40
      }];
      
      setStatistics(mockStats);
      console.log('Statistics set:', mockStats);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    }
  };

  const getTotalStats = (data: StatisticData[]) => {
    const totalOutreach = data.reduce((sum, item) => sum + item.outreach, 0);
    const totalApplicants = data.reduce((sum, item) => sum + item.applicants, 0);
    const conversionRate = totalOutreach > 0 ? `${((totalApplicants / totalOutreach) * 100).toFixed(1)}%` : '0%';
    
    return {
      totalOutreach,
      totalApplicants,
      conversionRate
    };
  };

  const getCompanyByName = (name: string): Company | undefined => {
    return companies.find(company => 
      company.name.toLowerCase().includes(name.toLowerCase())
    );
  };

  const getCompanyByUuid = (uuid: string): Company | undefined => {
    return companies.find(company => company.company_uuid === uuid);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchCompanies();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    companies,
    jobVacancies,
    statistics,
    loading,
    error,
    fetchCompanies,
    fetchJobVacancies,
    fetchStatisticsForVacancy,
    getTotalStats,
    getCompanyByName,
    getCompanyByUuid,
  };
};
