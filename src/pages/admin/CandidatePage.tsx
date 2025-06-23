
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

export default function CandidatePage() {
  const { candidates, loading } = useCandidates();

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
              <TableHead>Email/Profile</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Portfolio</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell className="font-medium">{candidate.name}</TableCell>
                <TableCell>
                  {candidate.email ? (
                    <a 
                      href={candidate.email} 
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
                  {candidate.status ? (
                    <Badge variant={candidate.status === 'connected' ? 'default' : 'secondary'}>
                      {candidate.status}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {candidate.portfolio_url ? (
                    <a 
                      href={candidate.portfolio_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Portfolio
                    </a>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {candidate.notes || "-"}
                </TableCell>
                <TableCell>
                  {new Date(candidate.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
