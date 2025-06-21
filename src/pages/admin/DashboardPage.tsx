
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Users, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useCandidates } from "@/hooks/useCandidates";
import { useCompanies } from "@/hooks/useCompanies";
import { useVacancies } from "@/hooks/useVacancies";
import CandidateTable from "@/components/CandidateTable";

export default function DashboardPage() {
  const [companyFilter, setCompanyFilter] = useState("all");
  const [vacancyFilter, setVacancyFilter] = useState("all");

  const { candidates, loading: candidatesLoading } = useCandidates();
  const { companies } = useCompanies();
  const { vacancies } = useVacancies();

  // Create candidates with vacancy and company information
  const enrichedCandidates = candidates.map(candidate => {
    const vacancy = candidate.vacancy_id 
      ? vacancies.find(v => v.id === candidate.vacancy_id)
      : null;
    
    return {
      ...candidate,
      vacancies: vacancy
    };
  });

  // Filter vacancies based on selected company
  const filteredVacancies = companyFilter === "all" 
    ? vacancies 
    : vacancies.filter(vacancy => vacancy.company_id === parseInt(companyFilter));

  // Reset vacancy filter when company filter changes
  useEffect(() => {
    if (companyFilter !== "all") {
      // Check if current vacancy filter is still valid for the selected company
      const isVacancyValidForCompany = filteredVacancies.some(
        vacancy => vacancy.id === parseInt(vacancyFilter)
      );
      
      if (!isVacancyValidForCompany) {
        setVacancyFilter("all");
      }
    }
  }, [companyFilter, filteredVacancies, vacancyFilter]);

  // Filter candidates
  const filteredCandidates = enrichedCandidates.filter(candidate => {
    const matchesCompany = companyFilter === "all" || 
      (candidate.vacancies?.company_id === parseInt(companyFilter));
    
    const matchesVacancy = vacancyFilter === "all" || 
      (candidate.vacancy_id === parseInt(vacancyFilter));
    
    return matchesCompany && matchesVacancy;
  });

  const handleCompanyFilterChange = (value: string) => {
    setCompanyFilter(value);
    // Reset vacancy filter when company changes
    if (value === "all") {
      setVacancyFilter("all");
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

      {/* Filters */}
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filters:</span>
            <Select value={companyFilter} onValueChange={handleCompanyFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={vacancyFilter} onValueChange={setVacancyFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Vacancies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vacancies</SelectItem>
                {filteredVacancies.map((vacancy) => (
                  <SelectItem key={vacancy.id} value={vacancy.id.toString()}>
                    {vacancy.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards - Only Total Candidates and Companies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Candidates</p>
                <p className="text-3xl font-bold text-gray-900">{filteredCandidates.length}</p>
                <p className="text-sm text-gray-500">Filtered candidates</p>
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

      {/* Candidate Database Section - Always Table View */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>Candidate Database</CardTitle>
          </div>
          <CardDescription>
            Browse candidates with search and filter capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {candidatesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading candidates...</p>
            </div>
          ) : (
            <CandidateTable candidates={filteredCandidates} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
