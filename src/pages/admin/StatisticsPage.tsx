
import { useState, useEffect } from 'react';
import { useStatistics } from '@/hooks/useStatistics';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, BarChart3, TrendingUp, Users, Target } from 'lucide-react';
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
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Statistik Kandidat</h1>
          <p className="text-gray-600 mt-1">Analisis data outreach dan applicants</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-500">Memuat data statistik...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Statistik Kandidat</h1>
        <p className="text-gray-600">Analisis data outreach dan applicants berdasarkan perusahaan dan posisi</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filter Data:</span>
            </div>
            
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Outreach</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalStats.totalOutreach.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applicants</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalStats.totalApplicants.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalStats.conversionRate}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Dashboard Statistik</CardTitle>
              <CardDescription>Visualisasi data outreach dan conversion rate</CardDescription>
            </div>
          </div>
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
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">Tidak ada data untuk filter yang dipilih</p>
              <p className="text-gray-400 text-sm mt-1">Silakan pilih filter yang berbeda untuk melihat data</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
