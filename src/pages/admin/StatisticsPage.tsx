
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
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Statistik Kandidat</h1>
            <p className="text-gray-600 mt-1">Analisis data outreach dan applicants</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuat data statistik...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistik Kandidat</h1>
            <p className="text-gray-600">Analisis data outreach dan applicants berdasarkan perusahaan dan posisi</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-700">
            <Filter className="h-5 w-5" />
            <span className="font-medium">Filter Data:</span>
          </div>
          
          <Select value={companyFilter} onValueChange={handleCompanyFilterChange}>
            <SelectTrigger className="w-48 bg-white">
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
            <SelectTrigger className="w-48 bg-white">
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
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Outreach</p>
                <p className="text-3xl font-bold mt-2">{totalStats.totalOutreach.toLocaleString()}</p>
                <p className="text-blue-100 text-sm mt-1">Kandidat yang dihubungi</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Target className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Applicants</p>
                <p className="text-3xl font-bold mt-2">{totalStats.totalApplicants.toLocaleString()}</p>
                <p className="text-green-100 text-sm mt-1">Kandidat yang apply</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Users className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Conversion Rate</p>
                <p className="text-3xl font-bold mt-2">{totalStats.conversionRate}</p>
                <p className="text-purple-100 text-sm mt-1">Tingkat konversi</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Card className="bg-white shadow-sm border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Dashboard Statistik</CardTitle>
              <CardDescription className="mt-1">
                Visualisasi data outreach dan conversion rate
              </CardDescription>
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
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-gray-400 mx-auto" />
              </div>
              <p className="text-gray-500 text-lg">Tidak ada data untuk filter yang dipilih</p>
              <p className="text-gray-400 text-sm mt-1">Silakan pilih filter yang berbeda untuk melihat data</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
