
import { useState } from "react";
import { Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  out_reach: string | null;
  vacancy_id: number | null;
  created_at: string;
  vacancies: Vacancy | null;
}

interface CandidateTableProps {
  candidates: Candidate[];
}

const CandidateTable = ({ candidates }: CandidateTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.vacancies?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.vacancies?.companies?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.connection_status?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = selectedDate 
      ? candidate.out_reach && new Date(candidate.out_reach).toDateString() === selectedDate.toDateString()
      : true;

    return matchesSearch && matchesDate;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getConnectionStatusVariant = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'connected': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates by name, vacancy, company, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <Calendar className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {selectedDate && (
          <Button variant="ghost" onClick={() => setSelectedDate(undefined)}>
            Clear date
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Vacancy</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Outreach Date</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{candidate.name}</p>
                    {candidate.profile_url && (
                      <a 
                        href={candidate.profile_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Profile
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>{candidate.vacancies?.title || 'No vacancy'}</TableCell>
                <TableCell>{candidate.vacancies?.companies?.name || 'No company'}</TableCell>
                <TableCell>
                  <Badge variant={getConnectionStatusVariant(candidate.connection_status)}>
                    {candidate.connection_status || 'No status'}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(candidate.out_reach)}</TableCell>
                <TableCell>
                  <div className="max-w-xs truncate">
                    {candidate.note_sent || 'No note'}
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
