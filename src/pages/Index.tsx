
import { useState } from "react";
import { Users, LayoutGrid, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CandidateCard from "@/components/CandidateCard";
import CandidateTable from "@/components/CandidateTable";
import { useCandidates } from "@/hooks/useCandidates";

const Index = () => {
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const { candidates, loading, error } = useCandidates();

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

  const totalCandidates = candidates.length;
  const avgExperience = totalCandidates > 0 
    ? Math.round(candidates.reduce((sum, candidate) => sum + candidate.experience_years, 0) / totalCandidates)
    : 0;

  // Get unique skills count
  const allSkills = candidates.flatMap(candidate => candidate.skills);
  const uniqueSkills = new Set(allSkills).size;

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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCandidates}</div>
                <p className="text-xs text-muted-foreground">
                  Active candidates in database
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
              <CandidateTable candidates={candidates} />
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {candidates.map((candidate) => (
                    <CandidateCard key={candidate.id} candidate={candidate} />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 p-4 border border-dashed border-green-500/20 rounded-lg bg-green-50/50">
          <p className="text-sm text-green-700 text-center">
            ✅ <strong>Success!</strong> Aplikasi sekarang terhubung dengan Supabase database. 
            Data kandidat diambil langsung dari database PostgreSQL.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
