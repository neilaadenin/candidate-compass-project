
import { useState, useEffect } from 'react';
import { useStatistics } from '@/hooks/useStatistics';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, BarChart3 } from 'lucide-react';
import StatisticsChart from '@/components/StatisticsChart';

export default function StatisticsPage() {
  const [companyFilter, setCompanyFilter] = useState("all");
  const [vacancyFilter, setVacancyFilter] = useState("all");

  const { 
    statistics, 
    loading, 
    companies, 
    getVacanciesForCompany, 
    getFilteredData, 
    getTotalStats 
  } = useStatistics();

  console.log('Statistics data:', statistics);
  console.log('Companies:', companies);
  console.log('Selected company filter:', companyFilter);
  console.log('Selected vacancy filter:', vacancyFilter);

  // Get vacancies for selected company
  const availableVacancies = companyFilter === "all" 
    ? [] 
    : getVacanciesForCompany(companyFilter);

  console.log('Available vacancies for selected company:', availableVacancies);

  // Reset vacancy filter when company changes
  useEffect(() => {
    if (companyFilter !== "all") {
      const validVacancies = getVacanciesForCompany(companyFilter);
      if (!validVacancies.includes(vacancyFilter) && vacancyFilter !== "all") {
        console.log('Resetting vacancy filter because current selection is not valid');
        setVacancyFilter("all");
      }
    } else {
      setVacancyFilter("all");
    }
  }, [companyFilter, vacancyFilter, getVacanciesForCompany]);

  // Get filtered data
  const filteredData = getFilteredData(companyFilter, vacancyFilter);
  const totalStats = getTotalStats(filteredData);

  console.log('Filtered data:', filteredData);
  console.log('Total stats:', totalStats);

  const handleCompanyFilterChange = (value: string) => {
    console.log('Company filter changed to:', value);
    setCompanyFilter(value);
  };

  const handleVacancyFilterChange = (value: string) => {
    console.log('Vacancy filter changed to:', value);
    setVacancyFilter(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Statistik Kandidat</h1>
            <p className="text-gray-600 mt-1">Analisis data outreach dan applicants</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Memuat data statistik...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistik Kandidat</h1>
          <p className="text-gray-600 mt-1">Analisis data outreach dan applicants berdasarkan perusahaan dan posisi</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filter Data:</span>
            
            <Select value={companyFilter} onValueChange={handleCompanyFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Semua Perusahaan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Perusahaan</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={vacancyFilter} 
              onValueChange={handleVacancyFilterChange}
              disabled={companyFilter === "all"}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Semua Lowongan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Lowongan</SelectItem>
                {availableVacancies.map((vacancy) => (
                  <SelectItem key={vacancy} value={vacancy}>
                    {vacancy}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Display */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle>Dashboard Statistik</CardTitle>
          </div>
          <CardDescription>
            Visualisasi data outreach dan conversion rate
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredData.length > 0 ? (
            <StatisticsChart 
              data={filteredData}
              totalStats={totalStats}
              companyFilter={companyFilter}
              vacancyFilter={vacancyFilter}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada data untuk filter yang dipilih</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
