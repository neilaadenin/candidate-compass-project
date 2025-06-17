
import { MapPin, Briefcase, Calendar, Mail, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Candidate {
  id: string;
  full_name: string;
  current_position: string;
  company: string;
  location: string;
  email: string;
  linkedin_url: string | null;
  experience_years: number;
  skills: string[];
  created_at: string;
}

interface CandidateCardProps {
  candidate: Candidate;
}

const CandidateCard = ({ candidate }: CandidateCardProps) => {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-primary">
              {candidate.full_name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {candidate.current_position} at {candidate.company}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {candidate.experience_years} years
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{candidate.location}</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{candidate.email}</span>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Skills:</p>
          <div className="flex flex-wrap gap-1">
            {candidate.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {candidate.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{candidate.skills.length - 3} more
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <a href={`mailto:${candidate.email}`}>
              <Mail className="w-4 h-4 mr-1" />
              Contact
            </a>
          </Button>
          {candidate.linkedin_url && (
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                LinkedIn
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateCard;
