
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, Building, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useStatistics } from "@/hooks/useStatistics";
import { useDataSync } from "@/hooks/useDataSync";
import { getCandidates } from "@/api/statistics";

export default function CompanyPage() {
  const [companyFilter, setCompanyFilter] = useState("");
  const [vacancyFilter, setVacancyFilter] = useState("");
  
  const { companies: supabaseCompanies, loading: companiesLoading, refetch } = useCompanies();
  const {
    companies,
    jobVacancies,
    getCompanyByName,
    fetchJobVacancies,
    loading: statisticsLoading
  } = useStatistics();
  const { syncAllData, syncing } = useDataSync();

  console.log('CompanyPage - Current state:', {
    companyFilter,
    vacancyFilter,
    companies: companies.length,
    jobVacancies: jobVacancies.length,
    supabaseCompanies: supabaseCompanies.length
  });

  const handleCompanyFilterChange = async (companyName: string) => {
    console.log('Company filter changed to:', companyName);
    setCompanyFilter(companyName);
    setVacancyFilter("");
    
    const company = getCompanyByName(companyName);
    if (company) {
      console.log('Fetching vacancies for company:', company.company_uuid);
      await fetchJobVacancies(company.company_uuid);
    }
  };

  const handleVacancyFilterChange = (vacancyName: string) => {
    console.log('Vacancy filter changed to:', vacancyName);
    setVacancyFilter(vacancyName);
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
        
        // Refresh the local company data after sync
        refetch();
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
          <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
          <p className="text-gray-600 mt-1">Manage companies and sync data from external sources</p>
        </div>
      </div>

      {/* Filters and Sync Button */}
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700">Sync Filters:</span>
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

      {/* Show message if no company/vacancy selected for sync */}
      {(!companyFilter || !vacancyFilter) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Building className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Select Company and Vacancy to Sync
              </h3>
              <p className="text-blue-700">
                Choose both a company and vacancy from the filters above to sync external data to Supabase.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company Database Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            <CardTitle>Company Database</CardTitle>
          </div>
          <CardDescription>
            Current companies stored in Supabase database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(companiesLoading || statisticsLoading) ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading companies...</p>
            </div>
          ) : supabaseCompanies.length > 0 ? (
            <div className="grid gap-4">
              {supabaseCompanies.map((company) => (
                <Card key={company.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{company.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">ID: {company.id}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>Created: {new Date(company.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No companies found in database. Use the sync functionality above to import data.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
