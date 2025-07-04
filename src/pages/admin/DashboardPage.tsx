
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, Users, Building2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useStatistics } from "@/hooks/useStatistics";
import { useDataSync } from "@/hooks/useDataSync";
import { getCandidates } from "@/api/statistics";
import CandidateTable from "@/components/CandidateTable";

export default function DashboardPage() {
  const [companyFilter, setCompanyFilter] = useState("");
  const [vacancyFilter, setVacancyFilter] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    companies,
    jobVacancies,
    getCompanyByName,
    fetchJobVacancies,
    loading: statisticsLoading
  } = useStatistics();

  const { syncAllData, syncing } = useDataSync();

  console.log('Dashboard - Current state:', {
    companyFilter,
    vacancyFilter,
    companies: companies.length,
    jobVacancies: jobVacancies.length,
    candidates: candidates.length
  });

  const handleCompanyFilterChange = async (companyName: string) => {
    console.log('Company filter changed to:', companyName);
    setCompanyFilter(companyName);
    setVacancyFilter("");
    setCandidates([]);
    
    const company = getCompanyByName(companyName);
    if (company) {
      console.log('Fetching vacancies for company:', company.company_uuid);
      await fetchJobVacancies(company.company_uuid);
    }
  };

  const handleVacancyFilterChange = async (vacancyName: string) => {
    console.log('Vacancy filter changed to:', vacancyName);
    setVacancyFilter(vacancyName);
    
    const vacancy = jobVacancies.find(v => v.name === vacancyName);
    if (vacancy) {
      try {
        setLoading(true);
        console.log('Fetching candidates for vacancy:', vacancy.uuid);
        const candidatesData = await getCandidates(vacancy.uuid);
        
        // Transform candidates to match the expected format for the table
        const transformedCandidates = candidatesData.map(candidate => ({
          id: candidate.id.toString(),
          name: candidate.name,
          profile_url: candidate.resume_file_url,
          note_sent: `${candidate.job_title} - ${candidate.category.join(', ')}`,
          connection_status: candidate.status === 1 ? 'active' : 'inactive',
          out_reach: candidate.created_at,
          vacancy_id: vacancy.id,
          created_at: candidate.created_at,
          vacancies: {
            id: vacancy.id,
            title: vacancy.name,
            company_id: vacancy.company_id,
            description: vacancy.description,
            created_at: vacancy.created_at,
            companies: {
              id: vacancy.company_id,
              name: companyFilter,
              created_at: vacancy.created_at
            }
          }
        }));
        
        console.log('Transformed candidates:', transformedCandidates);
        setCandidates(transformedCandidates);
      } catch (error) {
        console.error('Error fetching candidates:', error);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
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
                  <SelectItem key={company.id} value={company.company_name}>
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
                <SelectValue placeholder="Select Vacancy" />
              </SelectTrigger>
              <SelectContent>
                {jobVacancies.map((vacancy) => (
                  <SelectItem key={vacancy.id} value={vacancy.name}>
                    {vacancy.name}
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
            Browse candidates with search and filter capabilities - showing real API data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(loading || statisticsLoading) ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading candidates...</p>
            </div>
          ) : candidates.length > 0 ? (
            <CandidateTable candidates={candidates} />
          ) : companyFilter && vacancyFilter ? (
            <div className="text-center py-8 text-muted-foreground">
              No candidates found for the selected vacancy.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
