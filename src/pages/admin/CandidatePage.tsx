
import { useCandidates } from "@/hooks/useCandidates";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AnalyzeCandidateDialog } from "@/components/AnalyzeCandidateDialog";

export default function CandidatePage() {
  const { candidates, loading, refetch } = useCandidates();

  if (loading) {
    return <div>Loading candidates...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Candidates</h2>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Profile URL</TableHead>
              <TableHead>Connection Status</TableHead>
              <TableHead>Match %</TableHead>
              <TableHead>Outreach Date</TableHead>
              <TableHead>Note Sent</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell className="font-medium">{candidate.name}</TableCell>
                <TableCell>
                  {candidate.profile_url ? (
                    <a 
                      href={candidate.profile_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Profile
                    </a>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {candidate.connection_status ? (
                    <Badge variant={candidate.connection_status === 'connected' ? 'default' : 'secondary'}>
                      {candidate.connection_status}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {candidate.match_percentage !== null ? (
                    <Badge 
                      variant={
                        candidate.match_percentage >= 80 ? 'default' : 
                        candidate.match_percentage >= 60 ? 'secondary' : 
                        'outline'
                      }
                    >
                      {candidate.match_percentage}%
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {candidate.out_reach ? 
                    new Date(candidate.out_reach).toLocaleDateString() : 
                    "-"
                  }
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {candidate.note_sent || "-"}
                </TableCell>
                <TableCell>
                  {new Date(candidate.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <AnalyzeCandidateDialog
                    candidateId={candidate.id}
                    candidateName={candidate.name}
                    onAnalysisComplete={refetch}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
