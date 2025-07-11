
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

interface ApiResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

const API_BASE_URL = 'https://bumame-sarana-ai-daffa-ai-service-652345969561.asia-southeast2.run.app';

export const useStatistics = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobVacancies, setJobVacancies] = useState<JobVacancy[]>([]);
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
      
      const result: ApiResponse<Company> = await response.json();
      
      if (result.success && result.data) {
        console.log('Companies fetched successfully:', result.data);
        setCompanies(result.data);
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
      
      const result: ApiResponse<JobVacancy> = await response.json();
      
      if (result.success && result.data) {
        console.log('Job vacancies fetched successfully:', result.data);
        setJobVacancies(result.data);
        setError(null);
        return result.data;
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
    loading,
    error,
    fetchCompanies,
    fetchJobVacancies,
    getCompanyByName,
    getCompanyByUuid,
  };
};
