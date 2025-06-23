
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import CandidateDetailsModal from "./CandidateDetailsModal";

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  position: string | null;
  cv_url: string | null;
  portfolio_url: string | null;
  notes: string | null;
  status: string;
  vacancy_id: number | null;
  created_at: string;
  vacancies?: {
    id: number;
    title: string;
    company_id: number;
    companies?: {
      name: string;
    };
  } | null;
}

interface CandidateTableProps {
  candidates: Candidate[];
}

export default function CandidateTable({ candidates }: CandidateTableProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'interview': return 'bg-blue-100 text-blue-800';
      case 'applied': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openDetailsModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setSelectedCandidate(null);
    setIsDetailsModalOpen(false);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Vacancy</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Applied Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell className="font-medium">
                <button
                  onClick={() => openDetailsModal(candidate)}
                  className="text-blue-600 hover:underline text-left"
                >
                  {candidate.name}
                </button>
              </TableCell>
              <TableCell>{candidate.email}</TableCell>
              <TableCell>{candidate.position || 'N/A'}</TableCell>
              <TableCell>
                {candidate.vacancies ? (
                  <div>
                    <div className="font-medium">{candidate.vacancies.title}</div>
                    {candidate.vacancies.companies?.name && (
                      <div className="text-sm text-gray-500">
                        {candidate.vacancies.companies.name}
                      </div>
                    )}
                  </div>
                ) : (
                  'N/A'
                )}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(candidate.status)}>
                  {candidate.status}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs">
                {candidate.notes ? (
                  <button
                    onClick={() => openDetailsModal(candidate)}
                    className="text-blue-600 hover:underline text-left truncate block w-full"
                  >
                    {candidate.notes.substring(0, 30)}...
                  </button>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                {new Date(candidate.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CandidateDetailsModal
        candidate={selectedCandidate}
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
      />
    </>
  );
}
