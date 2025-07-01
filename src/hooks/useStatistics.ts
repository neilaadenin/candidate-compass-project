
import { useState, useEffect } from 'react';
import { getCompanies, getJobVacancies, getCandidates, transformCandidatesToStatistics, Company, JobVacancy, StatisticData } from '@/api/statistics';
import { useToast } from '@/hooks/use-toast';

export const useStatistics = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobVacancies, setJobVacancies] = useState<JobVacancy[]>([]);
  const [statistics, setStatistics] = useState<StatisticData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching companies...');
      const companiesData = await getCompanies();
      
      console.log('Companies fetched successfully:', companiesData);
      setCompanies(companiesData);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to fetch companies');
      toast({
        title: "Error",
        description: "Failed to fetch companies data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchJobVacancies = async (companyUuid: string) => {
    try {
      setLoading(true);
      console.log('Fetching job vacancies for company:', companyUuid);
      const vacanciesData = await getJobVacancies(companyUuid);
      
      console.log('Job vacancies fetched successfully:', vacanciesData);
      setJobVacancies(vacanciesData);
    } catch (err) {
      console.error('Error fetching job vacancies:', err);
      toast({
        title: "Error",
        description: "Failed to fetch job vacancies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatisticsForVacancy = async (jobVacancyUuid: string, companyName: string, position: string) => {
    try {
      setLoading(true);
      console.log('Fetching candidates for job vacancy:', jobVacancyUuid);
      const candidatesData = await getCandidates(jobVacancyUuid);
      
      console.log('Candidates fetched successfully:', candidatesData);
      const statisticData = transformCandidatesToStatistics(candidatesData, companyName, position);
      setStatistics([statisticData]);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      toast({
        title: "Error",
        description: "Failed to fetch candidates data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const getCompanyByName = (companyName: string): Company | undefined => {
    return companies.find(company => company.company_name === companyName);
  };
  
  const getVacanciesForCompany = (companyName: string) => {
    return jobVacancies.map(vacancy => vacancy.position);
  };

  const getFilteredData = (companyFilter: string, vacancyFilter: string) => {
    if (!companyFilter || !vacancyFilter) {
      return [];
    }
    return statistics.filter(item => {
      const matchesCompany = item.company === companyFilter;
      const matchesVacancy = item.vacancy === vacancyFilter;
      return matchesCompany && matchesVacancy;
    });
  };

  const getTotalStats = (data: StatisticData[]) => {
    const totalOutreach = data.reduce((sum, item) => sum + item.outreach, 0);
    const totalApplicants = data.reduce((sum, item) => sum + item.applicants, 0);
    const conversionRate = totalOutreach > 0 ? ((totalApplicants / totalOutreach) * 100).toFixed(1) : "0";
    
    return {
      totalOutreach,
      totalApplicants,
      conversionRate: `${conversionRate}%`
    };
  };

  return {
    statistics,
    loading,
    error,
    companies,
    jobVacancies,
    getCompanyByName,
    getVacanciesForCompany,
    getFilteredData,
    getTotalStats,
    fetchJobVacancies,
    fetchStatisticsForVacancy,
    refetch: fetchCompanies,
  };
};
