
import { useState } from "react";
import { Users, LayoutGrid, Table, Search, Filter, Building, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CandidateCard from "@/components/CandidateCard";
import CandidateTable from "@/components/CandidateTable";
import { useCandidates } from "@/hooks/useCandidates";
import { useCompanies } from "@/hooks/useCompanies";
import { useVacancies } from "@/hooks/useVacancies";

const Index = () => {
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [gridSearchTerm, setGridSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedVacancy, setSelectedVacancy] = useState<string>("all");
  
  const { candidates, loading: candidatesLoading, error: candidatesError } = useCandidates();
  const { companies, loading: companiesLoading } = useCompanies();
  const { vacancies, loading: vacanciesLoading } = useVacancies();

  const loading = candidatesLoading || companiesLoading || vacanciesLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (candidatesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{candidatesError}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Filter candidates by selected company and vacancy
  let filteredCandidates = candidates;

  if (selectedCompany !== "all") {
    filteredCandidates = filteredCandidates.filter(candidate => 
      candidate.vacancies?.companies?.id.toString() === selectedCompany
    );
  }

  if (selectedVacancy !== "all") {
    filteredCandidates = filteredCandidates.filter(candidate => 
      candidate.vacancy_id?.toString() === selectedVacancy
    );
  }

  const totalCandidates = filteredCandidates.length;
  const connectedCandidates = filteredCandidates.filter(c => c.connection_status === 'connected').length;
  const pendingCandidates = filteredCandidates.filter(c => c.connection_status === 'pending').length;

  // Filter candidates for grid view (includes filters + search)
  const filteredGridCandidates = filteredCandidates.filter(candidate =>
    candidate.name.toLowerCase().includes(gridSearchTerm.toLowerCase()) ||
    candidate.vacancies?.title.toLowerCase().includes(gridSearchTerm.toLowerCase()) ||
    candidate.vacancies?.companies?.name.toLowerCase().includes(gridSearchTerm.toLowerCase()) ||
    candidate.connection_status?.toLowerCase().includes(gridSearchTerm.toLowerCase())
  );

  // Get company name by ID
  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id.toString() === companyId);
    return company?.name || 'Unknown Company';
  };

  // Get vacancy name by ID
  const getVacancyName = (vacancyId: string) => {
    const vacancy = vacancies.find(v => v.id.toString() === vacancyId);
    return vacancy?.title || 'Unknown Vacancy';
  };

  // Filter vacancies by selected company for the vacancy dropdown
  const filteredVacancies = selectedCompany === "all" 
    ? vacancies 
    : vacancies.filter(v => v.company_id.toString() === selectedCompany);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">
                Candidate Management System
              </h1>
              <p className="text-lg text-muted-foreground">
                Kelola dan cari kandidat terbaik untuk tim Anda
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <Table className="w-4 h-4 mr-2" />
                Table
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Grid
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                <Select value={selectedCompany} onValueChange={(value) => {
                  setSelectedCompany(value);
                  setSelectedVacancy("all"); // Reset vacancy when company changes
                }}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select company" />
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
              </div>

              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <Select value={selectedVacancy} onValueChange={setSelectedVacancy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select vacancy" />
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

              {(selectedCompany !== "all" || selectedVacancy !== "all") && (
                <div className="flex gap-2">
                  {selectedCompany !== "all" && (
                    <Badge variant="secondary">
                      {getCompanyName(selectedCompany)}
                    </Badge>
                  )}
                  {selectedVacancy !== "all" && (
                    <Badge variant="secondary">
                      {getVacancyName(selectedVacancy)}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCandidates}</div>
                <p className="text-xs text-muted-foreground">
                  Filtered candidates
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connected</CardTitle>
                <Badge variant="default" className="bg-green-500">{connectedCandidates}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{connectedCandidates}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully connected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Badge variant="secondary" className="bg-yellow-500">{pendingCandidates}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCandidates}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting response
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Companies</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{companies.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total companies
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Candidate Database
            </CardTitle>
            <CardDescription>
              {viewMode === "table" 
                ? "Browse candidates in table format with search and filter capabilities"
                : "Browse candidates in card format for better visual overview"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {viewMode === "table" ? (
              <CandidateTable candidates={filteredCandidates} />
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search candidates by name, vacancy, company, or status..."
                    value={gridSearchTerm}
                    onChange={(e) => setGridSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGridCandidates.map((candidate) => (
                    <CandidateCard key={candidate.id} candidate={candidate} />
                  ))}
                </div>
                {filteredGridCandidates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No candidates found matching your search and filters.
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  Showing {filteredGridCandidates.length} of {filteredCandidates.length} candidates
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 p-4 border border-dashed border-green-500/20 rounded-lg bg-green-50/50">
          <p className="text-sm text-green-700 text-center">
            ✅ <strong>Success!</strong> Aplikasi sekarang menggunakan struktur database baru dengan companies, vacancies, dan candidates. 
            Data diambil langsung dari database PostgreSQL dengan relasi yang tepat.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
