
import { MapPin, Briefcase, Calendar, Mail, ExternalLink, Building2, FileText, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Company {
  id: number;
  name: string;
  created_at: string;
}

interface Vacancy {
  id: number;
  title: string;
  company_id: number;
  description: string | null;
  created_at: string;
  companies: Company;
}

interface Candidate {
  id: string;
  name: string;
  profile_url: string | null;
  note_sent: string | null;
  connection_status: string | null;
  apply_date: string | null;
  vacancy_id: number | null;
  created_at: string;
  vacancies: Vacancy | null;
}

interface CandidateCardProps {
  candidate: Candidate;
}

const CandidateCard = ({ candidate }: CandidateCardProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getConnectionStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'connected': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-primary">
              {candidate.name}
            </CardTitle>
            {candidate.vacancies && (
              <p className="text-sm text-muted-foreground mt-1">
                {candidate.vacancies.title} at {candidate.vacancies.companies?.name}
              </p>
            )}
          </div>
          {candidate.connection_status && (
            <Badge 
              variant="secondary" 
              className={`text-xs text-white ${getConnectionStatusColor(candidate.connection_status)}`}
            >
              {candidate.connection_status}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {candidate.vacancies?.companies && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="font-medium">{candidate.vacancies.companies.name}</span>
          </div>
        )}

        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>Applied: {formatDate(candidate.apply_date)}</span>
        </div>
        
        {candidate.note_sent && (
          <div className="flex items-center text-sm text-muted-foreground">
            <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">Note: {candidate.note_sent}</span>
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          {candidate.profile_url && (
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a href={candidate.profile_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                Profile
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" className="flex-1">
            <CheckCircle className="w-4 h-4 mr-1" />
            Update Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateCard;
