
import { useState, useEffect } from 'react';
import { getStatistics, StatisticData, getUniqueCompanies, getVacanciesByCompany } from '@/api/statistics';
import { useToast } from '@/hooks/use-toast';

export const useStatistics = () => {
  const [statistics, setStatistics] = useState<StatisticData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching statistics data...');
      const data = await getStatistics();
      
      console.log('Statistics fetched successfully:', data);
      setStatistics(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Failed to fetch statistics');
      toast({
        title: "Error",
        description: "Failed to fetch statistics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const companies = getUniqueCompanies(statistics);
  
  const getVacanciesForCompany = (company: string) => {
    return getVacanciesByCompany(statistics, company);
  };

  const getFilteredData = (companyFilter: string, vacancyFilter: string) => {
    return statistics.filter(item => {
      const matchesCompany = companyFilter === "all" || item.company === companyFilter;
      const matchesVacancy = vacancyFilter === "all" || item.vacancy === vacancyFilter;
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
    getVacanciesForCompany,
    getFilteredData,
    getTotalStats,
    refetch: fetchStatistics,
  };
};
