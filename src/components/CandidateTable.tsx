
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface CandidateTableProps {
  candidates: Candidate[];
}

const CandidateTable = ({ candidates }: CandidateTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCandidates = candidates.filter(candidate =>
    candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.current_position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.skills.some(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search candidates by name, position, company, or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Skills</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{candidate.full_name}</p>
                    <p className="text-sm text-muted-foreground">{candidate.email}</p>
                  </div>
                </TableCell>
                <TableCell>{candidate.current_position}</TableCell>
                <TableCell>{candidate.company}</TableCell>
                <TableCell>{candidate.location}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{candidate.experience_years} years</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 2).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.skills.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{candidate.skills.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No candidates found matching your search.
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredCandidates.length} of {candidates.length} candidates
      </div>
    </div>
  );
};

export default CandidateTable;
