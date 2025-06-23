
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

interface CandidateDetailsModalProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CandidateDetailsModal({ candidate, isOpen, onClose }: CandidateDetailsModalProps) {
  if (!candidate) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'interview': return 'bg-blue-100 text-blue-800';
      case 'applied': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{candidate.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-semibold text-sm text-gray-600">Email:</span>
              <p className="text-sm">{candidate.email}</p>
            </div>
            <div>
              <span className="font-semibold text-sm text-gray-600">Phone:</span>
              <p className="text-sm">{candidate.phone || 'N/A'}</p>
            </div>
            <div>
              <span className="font-semibold text-sm text-gray-600">Position:</span>
              <p className="text-sm">{candidate.position || 'N/A'}</p>
            </div>
            <div>
              <span className="font-semibold text-sm text-gray-600">Status:</span>
              <Badge className={getStatusColor(candidate.status)}>
                {candidate.status}
              </Badge>
            </div>
          </div>

          {candidate.vacancies && (
            <div>
              <span className="font-semibold text-sm text-gray-600">Applied for:</span>
              <p className="text-sm">
                {candidate.vacancies.title}
                {candidate.vacancies.companies?.name && (
                  <span className="text-gray-500"> at {candidate.vacancies.companies.name}</span>
                )}
              </p>
            </div>
          )}

          <div className="text-sm text-gray-500">
            Applied: {new Date(candidate.created_at).toLocaleDateString()}
          </div>

          <Separator />

          {candidate.cv_url && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">CV</h4>
              <div className="bg-gray-50 p-3 rounded-md">
                <a 
                  href={candidate.cv_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  View CV
                </a>
              </div>
            </div>
          )}

          {candidate.portfolio_url && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Portfolio</h4>
              <div className="bg-gray-50 p-3 rounded-md">
                <a 
                  href={candidate.portfolio_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  View Portfolio
                </a>
              </div>
            </div>
          )}

          {candidate.notes && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Notes</h4>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {candidate.notes}
                </p>
              </div>
            </div>
          )}

          {!candidate.cv_url && !candidate.portfolio_url && !candidate.notes && (
            <div className="text-center py-8 text-gray-500">
              No additional details available for this candidate.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
