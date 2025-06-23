
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Vacancy {
  id: number;
  title: string;
  company_id: number;
  description: string | null;
  search_url: string | null;
  note_sent: string | null;
  created_at: string;
  companies: {
    id: number;
    name: string;
    created_at: string;
  };
}

interface VacancyDetailsModalProps {
  vacancy: Vacancy | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VacancyDetailsModal({ vacancy, isOpen, onClose }: VacancyDetailsModalProps) {
  if (!vacancy) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{vacancy.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-sm text-gray-600">Company:</span>
              <Badge variant="outline">{vacancy.companies?.name || 'N/A'}</Badge>
            </div>
            <div className="text-sm text-gray-500">
              Created: {new Date(vacancy.created_at).toLocaleDateString()}
            </div>
          </div>

          <Separator />

          {vacancy.description && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {vacancy.description}
                </p>
              </div>
            </div>
          )}

          {vacancy.search_url && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Search URL</h4>
              <div className="bg-gray-50 p-3 rounded-md">
                <a 
                  href={vacancy.search_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {vacancy.search_url}
                </a>
              </div>
            </div>
          )}

          {vacancy.note_sent && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Note Sent</h4>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {vacancy.note_sent}
                </p>
              </div>
            </div>
          )}

          {!vacancy.description && !vacancy.search_url && !vacancy.note_sent && (
            <div className="text-center py-8 text-gray-500">
              No additional details available for this vacancy.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
