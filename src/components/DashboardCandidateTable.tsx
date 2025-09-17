
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink, User } from "lucide-react";

interface DashboardCandidate {
  id: string;
  name: string;
  profile_url: string | null;
  note_sent: string | null;
  connection_status: string | null;
  search_template: string | null;
  out_reach: string | null;
  vacancy_id: number | null;
  created_at: string;
  vacancies?: {
    id: number;
    title: string;
    company_id: number;
    description: string | null;
    created_at: string;
    companies: {
      id: number;
      name: string;
      created_at: string;
    };
  };
}

interface DashboardCandidateTableProps {
  candidates: DashboardCandidate[];
}

export default function DashboardCandidateTable({ candidates }: DashboardCandidateTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getConnectionStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search candidates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Candidates Grid */}
      <div className="grid gap-4">
        {filteredCandidates.length > 0 ? (
          filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="p-4">
              <CardContent className="p-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {candidate.name}
                        </h3>
                        {candidate.connection_status && (
                          <Badge className={`text-xs ${getConnectionStatusColor(candidate.connection_status)}`}>
                            {candidate.connection_status}
                          </Badge>
                        )}
                        {candidate.search_template && (
                          <Badge variant="secondary" className="text-xs">
                            {candidate.search_template}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        {candidate.note_sent && (
                          <p><span className="font-medium">Note:</span> {candidate.note_sent}</p>
                        )}
                        
                        {candidate.vacancies && (
                          <div>
                            <span className="font-medium">Position:</span> {candidate.vacancies.title}
                            <br />
                            <span className="font-medium">Company:</span> {candidate.vacancies.companies.name}
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500">
                          Added: {formatDate(candidate.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {candidate.profile_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(candidate.profile_url!, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Profile
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
            <p>
              {searchTerm 
                ? `No candidates match "${searchTerm}"`
                : "No candidates available for the selected filters."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
