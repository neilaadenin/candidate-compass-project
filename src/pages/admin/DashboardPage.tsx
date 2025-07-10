
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, Users, Building2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useStatistics } from "@/hooks/useStatistics";
import { useDataSync } from "@/hooks/useDataSync";
import { getCandidates } from "@/api/statistics";
import DashboardCandidateTable from "@/components/DashboardCandidateTable";
import { useDashboardCandidates } from "@/hooks/useDashboardCandidates";
import { useCompanies } from "@/hooks/useCompanies";
import { useVacancies } from "@/hooks/useVacancies";

export default function DashboardPage() {
  const [companyFilter, setCompanyFilter] = useState("");
  const [vacancyFilter, setVacancyFilter] = useState("");
  const [selectedCompanyUuid, setSelectedCompanyUuid] = useState<string>("");
  const [selectedVacancyUuid, setSelectedVacancyUuid] = useState<string>("");

  // Use the new dashboard candidates hook with proper filtering
  const { candidates, loading: candidatesLoading, error: candidatesError } = useDashboardCandidates({
    companyUuid: selectedCompanyUuid,
    vacancyUuid: selectedVacancyUuid
  });

  // Use Supabase hooks for companies and vacancies
  const { companies, loading: companiesLoading } = useCompanies();
  const { vacancies, loading: vacanciesLoading } = useVacancies();

  const {
    companies: apiCompanies,
    jobVacancies,
    getCompanyByName,
    fetchJobVacancies,
    loading: statisticsLoading
  } = useStatistics();

  const { syncAllData, syncing } = useDataSync();

  console.log('Dashboard - Current state:', {
    companyFilter,
    vacancyFilter,
    selectedCompanyUuid,
    selectedVacancyUuid,
    companies: companies.length,
    vacancies: vacancies.length,
    candidates: candidates.length
  });

  const handleCompanyFilterChange = async (companyName: string) => {
    console.log('Company filter changed to:', companyName);
    setCompanyFilter(companyName);
    setVacancyFilter("");
    setSelectedVacancyUuid("");
    
    // Find the company UUID from Supabase companies
    const company = companies.find(c => c.name === companyName);
    if (company) {
      console.log('Setting company UUID:', company.company_uuid);
      setSelectedCompanyUuid(company.company_uuid);
    } else {
      setSelectedCompanyUuid("");
    }
  };

  const handleVacancyFilterChange = async (vacancyName: string) => {
    console.log('Vacancy filter changed to:', vacancyName);
    setVacancyFilter(vacancyName);
    
    // Find the vacancy UUID from Supabase vacancies
    const vacancy = vacancies.find(v => v.title === vacancyName);
    if (vacancy) {
      console.log('Setting vacancy UUID:', vacancy.vacancy_uuid);
      setSelectedVacancyUuid(vacancy.vacancy_uuid);
    } else {
      setSelectedVacancyUuid("");
    }
  };

  const handleSync = async () => {
    if (!companyFilter || !vacancyFilter) {
      return;
    }

    const company = getCompanyByName(companyFilter);
    const vacancy = jobVacancies.find(v => v.name === vacancyFilter);
    
    if (company && vacancy) {
      try {
        // Get the real candidates data from the API
        const candidatesData = await getCandidates(vacancy.uuid);
        
        await syncAllData([company], [vacancy], candidatesData, vacancy.id);
      } catch (error) {
        console.error('Error during sync:', error);
      }
    }
  };

  // Filter vacancies based on selected company
  const filteredVacancies = selectedCompanyUuid 
    ? vacancies.filter(v => v.companies?.name === companyFilter)
    : vacancies;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidate Management System</h1>
          <p className="text-gray-600 mt-1">Kelola dan cari kandidat terbaik untuk tim Anda</p>
        </div>
      </div>

      {/* Filters and Sync Button */}
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filters:</span>
            <Select value={companyFilter} onValueChange={handleCompanyFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.name}>
                    {company.name}
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
                <SelectValue placeholder="Select Vacancy" />
              </SelectTrigger>
              <SelectContent>
                {filteredVacancies.map((vacancy) => (
                  <SelectItem key={vacancy.id} value={vacancy.title}>
                    {vacancy.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={handleSync}
              disabled={!companyFilter || !vacancyFilter || syncing}
              className="ml-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync to Supabase'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Show message if no company/vacancy selected */}
      {(!companyFilter || !vacancyFilter) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Building2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Select Company and Vacancy
              </h3>
              <p className="text-blue-700">
                Please select both a company and vacancy from the filters above to view candidates.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards - Only show when data is available */}
      {candidates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Candidates</p>
                  <p className="text-3xl font-bold text-gray-900">{candidates.length}</p>
                  <p className="text-sm text-gray-500">For selected vacancy</p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Companies</p>
                  <p className="text-3xl font-bold text-gray-900">{companies.length}</p>
                  <p className="text-sm text-gray-500">Total companies</p>
                </div>
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Candidate Database Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>Candidate Database</CardTitle>
          </div>
          <CardDescription>
            Browse candidates with search and filter capabilities - showing real Supabase data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(candidatesLoading || companiesLoading || vacanciesLoading) ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading candidates...</p>
            </div>
          ) : candidates.length > 0 ? (
            <DashboardCandidateTable candidates={candidates} />
          ) : companyFilter && vacancyFilter ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No candidates found for the selected filters.</p>
              <p className="text-sm mt-2">
                Note: The filtering functionality requires the Supabase types to be regenerated 
                to include the missing candidate_id field in the interview_schedules table.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
