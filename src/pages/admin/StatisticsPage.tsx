
import { useState, useEffect } from 'react';
import { useStatistics } from '@/hooks/useStatistics';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, BarChart3, TrendingUp, Users, Target, AlertCircle } from 'lucide-react';
import StatisticsChart from '@/components/StatisticsChart';

export default function StatisticsPage() {
  const [companyFilter, setCompanyFilter] = useState("");
  const [vacancyFilter, setVacancyFilter] = useState("");

  const { 
    statistics, 
    loading, 
    companies, 
    jobVacancies,
    getCompanyByName,
    getVacanciesForCompany, 
    getFilteredData, 
    getTotalStats,
    fetchJobVacancies,
    fetchStatisticsForVacancy
  } = useStatistics();

  console.log('Statistics data:', statistics);
  console.log('Companies:', companies);
  console.log('Job vacancies:', jobVacancies);
  console.log('Selected company filter:', companyFilter);
  console.log('Selected vacancy filter:', vacancyFilter);

  // Get vacancies for selected company
  const availableVacancies = getVacanciesForCompany(companyFilter);

  console.log('Available vacancies for selected company:', availableVacancies);

  // Reset vacancy filter when company changes
  useEffect(() => {
    if (companyFilter) {
      setVacancyFilter("");
      
      // Find company UUID and fetch job vacancies
      const selectedCompany = getCompanyByName(companyFilter);
      if (selectedCompany) {
        fetchJobVacancies(selectedCompany.company_uuid);
      }
    }
  }, [companyFilter, getCompanyByName, fetchJobVacancies]);

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
    
    // Find the selected job vacancy
    const selectedVacancy = jobVacancies.find(jv => jv.name === value);
    if (selectedVacancy) {
      fetchStatisticsForVacancy(selectedVacancy.uuid, companyFilter, value);
    }
  };

  if (loading && companies.length === 0) {
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
                <SelectValue placeholder="Pilih Perusahaan" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.company_uuid} value={company.company_name}>
                    {company.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={vacancyFilter} 
              onValueChange={handleVacancyFilterChange}
              disabled={!companyFilter}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Pilih Lowongan" />
              </SelectTrigger>
              <SelectContent>
                {availableVacancies.map((vacancy) => (
                  <SelectItem key={vacancy} value={vacancy}>
                    {vacancy}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {loading && companyFilter && (
            <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Memuat data lowongan...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Show message when no company is selected */}
      {!companyFilter && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-amber-900">Pilih Perusahaan</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Silakan pilih perusahaan terlebih dahulu untuk melihat data statistik
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards - only show when data is available */}
      {companyFilter && vacancyFilter && filteredData.length > 0 && (
        <>
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
              <StatisticsChart 
                data={filteredData}
                totalStats={totalStats}
                companyFilter={companyFilter}
                vacancyFilter={vacancyFilter}
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* No data message when filters are selected but no data available */}
      {companyFilter && vacancyFilter && filteredData.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">Tidak ada data untuk filter yang dipilih</p>
              <p className="text-gray-400 text-sm mt-1">Data belum tersedia untuk kombinasi perusahaan dan lowongan ini</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
