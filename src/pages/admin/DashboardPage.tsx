
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Users, Building2, Briefcase, LayoutGrid, Table as TableIcon } from "lucide-react";
import { useState } from "react";
import { useCandidates } from "@/hooks/useCandidates";
import { useCompanies } from "@/hooks/useCompanies";
import { useVacancies } from "@/hooks/useVacancies";
import CandidateTable from "@/components/CandidateTable";

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [vacancyFilter, setVacancyFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

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

  // Filter candidates
  const filteredCandidates = enrichedCandidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.vacancies?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.vacancies?.companies?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.connection_status?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = companyFilter === "all" || 
      (candidate.vacancies?.company_id === parseInt(companyFilter));
    
    const matchesVacancy = vacancyFilter === "all" || 
      (candidate.vacancy_id === parseInt(vacancyFilter));
    
    return matchesSearch && matchesCompany && matchesVacancy;
  });

  // Calculate stats
  const connectedCount = candidates.filter(c => c.connection_status === 'connected').length;
  const pendingCount = candidates.filter(c => c.connection_status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidate Management System</h1>
          <p className="text-gray-600 mt-1">Kelola dan cari kandidat terbaik untuk tim Anda</p>
        </div>
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="flex items-center gap-2"
          >
            <TableIcon className="h-4 w-4" />
            Table
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="flex items-center gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            Grid
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filters:</span>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
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
                {vacancies.map((vacancy) => (
                  <SelectItem key={vacancy.id} value={vacancy.id.toString()}>
                    {vacancy.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <p className="text-sm text-gray-600">Connected</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-gray-900">{connectedCount}</p>
                  <Badge className="bg-green-500 text-white text-xs">
                    {connectedCount}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">Successfully connected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
                  <Badge className="bg-yellow-500 text-white text-xs">
                    {pendingCount}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">Awaiting response</p>
              </div>
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

      {/* Candidate Database Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>Candidate Database</CardTitle>
          </div>
          <CardDescription>
            Browse candidates in table format with search and filter capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search candidates by name, vacancy, company, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

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
