
import { useState } from "react";
import { Users, LayoutGrid, Table, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CandidateCard from "@/components/CandidateCard";
import CandidateTable from "@/components/CandidateTable";
import { useCandidates } from "@/hooks/useCandidates";
import { useClients } from "@/hooks/useClients";

const Index = () => {
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [gridSearchTerm, setGridSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const { candidates, loading, error } = useCandidates();
  const { clients } = useClients();

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Filter candidates by selected client
  const filteredByClient = selectedClient === "all" 
    ? candidates 
    : candidates.filter(candidate => candidate.client_id === selectedClient);

  const totalCandidates = filteredByClient.length;
  const avgExperience = totalCandidates > 0 
    ? Math.round(filteredByClient.reduce((sum, candidate) => sum + candidate.experience_years, 0) / totalCandidates)
    : 0;

  // Get unique skills count from filtered candidates
  const allSkills = filteredByClient.flatMap(candidate => candidate.skills);
  const uniqueSkills = new Set(allSkills).size;

  // Filter candidates for grid view (includes client filter + search)
  const filteredGridCandidates = filteredByClient.filter(candidate =>
    candidate.full_name.toLowerCase().includes(gridSearchTerm.toLowerCase()) ||
    candidate.current_position.toLowerCase().includes(gridSearchTerm.toLowerCase()) ||
    candidate.company.toLowerCase().includes(gridSearchTerm.toLowerCase()) ||
    candidate.skills.some(skill => 
      skill.toLowerCase().includes(gridSearchTerm.toLowerCase())
    )
  );

  // Get client name by ID
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

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

          {/* Client Filter */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter by Client:</span>
              </div>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedClient !== "all" && (
                <Badge variant="secondary">
                  {getClientName(selectedClient)}
                </Badge>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {selectedClient === "all" ? "Total Candidates" : "Filtered Candidates"}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCandidates}</div>
                <p className="text-xs text-muted-foreground">
                  {selectedClient === "all" ? "Active candidates in database" : `For ${getClientName(selectedClient)}`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Experience</CardTitle>
                <Badge variant="secondary">{avgExperience} years</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgExperience} Years</div>
                <p className="text-xs text-muted-foreground">
                  Average work experience
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Skills</CardTitle>
                <Badge variant="outline">{uniqueSkills}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uniqueSkills}</div>
                <p className="text-xs text-muted-foreground">
                  Different skill sets
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
              <CandidateTable candidates={filteredByClient} />
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search candidates by name, position, company, or skills..."
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
                    No candidates found matching your search.
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  Showing {filteredGridCandidates.length} of {filteredByClient.length} candidates
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 p-4 border border-dashed border-green-500/20 rounded-lg bg-green-50/50">
          <p className="text-sm text-green-700 text-center">
            ✅ <strong>Success!</strong> Aplikasi sekarang terhubung dengan Supabase database dan mendukung filtering berdasarkan client. 
            Data kandidat diambil langsung dari database PostgreSQL dengan relasi client.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
