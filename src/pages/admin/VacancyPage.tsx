import { useState } from "react";
import { useVacancies } from "@/hooks/useVacancies";
import { useCompanies } from "@/hooks/useCompanies";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2 } from "lucide-react";
import VacancyDetailsModal from "@/components/VacancyDetailsModal";

export default function VacancyPage() {
  const { vacancies, loading, refetch } = useVacancies();
  const { companies } = useCompanies();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<any>(null);
  const [vacancyTitle, setVacancyTitle] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [description, setDescription] = useState("");
  const [searchUrl, setSearchUrl] = useState("");
  const [noteSent, setNoteSent] = useState("");
  const [filterCompanyId, setFilterCompanyId] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const filteredVacancies = filterCompanyId === "all"
    ? vacancies
    : vacancies.filter((vacancy) => vacancy.company_id.toString() === filterCompanyId);

  const handleAddVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vacancyTitle.trim() || !companyId) {
      toast({
        title: "Error",
        description: "Vacancy title and company are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Adding vacancy:", { 
      title: vacancyTitle.trim(), 
      company_id: parseInt(companyId), 
      description: description.trim(),
      search_url: searchUrl.trim(),
      note_sent: noteSent.trim()
    });

    try {
      const { data, error } = await supabase
        .from("vacancies")
        .insert([{
          title: vacancyTitle.trim(),
          company_id: parseInt(companyId),
          description: description.trim() || null,
          search_url: searchUrl.trim() || null,
          note_sent: noteSent.trim() || null,
        }])
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Vacancy added successfully:", data);
      toast({
        title: "Success",
        description: "Vacancy added successfully",
      });
      
      resetForm();
      setIsAddDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error("Error adding vacancy:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add vacancy",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vacancyTitle.trim() || !companyId || !editingVacancy) {
      toast({
        title: "Error",
        description: "Vacancy title and company are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Updating vacancy:", editingVacancy.id, { 
      title: vacancyTitle.trim(), 
      company_id: parseInt(companyId), 
      description: description.trim(),
      search_url: searchUrl.trim(),
      note_sent: noteSent.trim()
    });

    try {
      const { data, error } = await supabase
        .from("vacancies")
        .update({
          title: vacancyTitle.trim(),
          company_id: parseInt(companyId),
          description: description.trim() || null,
          search_url: searchUrl.trim() || null,
          note_sent: noteSent.trim() || null,
        })
        .eq("id", editingVacancy.id)
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Vacancy updated successfully:", data);
      toast({
        title: "Success",
        description: "Vacancy updated successfully",
      });
      
      resetForm();
      setEditingVacancy(null);
      setIsEditDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error("Error updating vacancy:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update vacancy",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVacancy = async (vacancyId: number) => {
    if (!confirm("Are you sure you want to delete this vacancy?")) return;

    console.log("Deleting vacancy:", vacancyId);

    try {
      const { error } = await supabase
        .from("vacancies")
        .delete()
        .eq("id", vacancyId);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Vacancy deleted successfully");
      toast({
        title: "Success",
        description: "Vacancy deleted successfully",
      });
      
      refetch();
    } catch (error: any) {
      console.error("Error deleting vacancy:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete vacancy",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (vacancy: any) => {
    console.log("Opening edit dialog for vacancy:", vacancy);
    setEditingVacancy(vacancy);
    setVacancyTitle(vacancy.title);
    setCompanyId(vacancy.company_id.toString());
    setDescription(vacancy.description || "");
    setSearchUrl(vacancy.search_url || "");
    setNoteSent(vacancy.note_sent || "");
    setIsEditDialogOpen(true);
  };

  const openDetailsModal = (vacancy: any) => {
    setSelectedVacancy(vacancy);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setSelectedVacancy(null);
    setIsDetailsModalOpen(false);
  };

  const resetForm = () => {
    setVacancyTitle("");
    setCompanyId("");
    setDescription("");
    setSearchUrl("");
    setNoteSent("");
  };

  if (loading) {
    return <div>Loading vacancies...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vacancies</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Vacancy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Vacancy</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddVacancy} className="space-y-4">
              <div>
                <Label htmlFor="vacancyTitle">Vacancy Title</Label>
                <Input
                  id="vacancyTitle"
                  value={vacancyTitle}
                  onChange={(e) => setVacancyTitle(e.target.value)}
                  placeholder="Enter vacancy title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="companySelect">Company</Label>
                <Select value={companyId} onValueChange={setCompanyId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter vacancy description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="searchUrl">Search URL (Optional)</Label>
                <Input
                  id="searchUrl"
                  value={searchUrl}
                  onChange={(e) => setSearchUrl(e.target.value)}
                  placeholder="Enter search URL"
                  type="url"
                />
              </div>
              <div>
                <Label htmlFor="noteSent">Note Sent (Optional)</Label>
                <Textarea
                  id="noteSent"
                  value={noteSent}
                  onChange={(e) => setNoteSent(e.target.value)}
                  placeholder="Enter note sent"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Vacancy"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    resetForm();
                    setIsAddDialogOpen(false);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center">
        <Label>Filter by Company:</Label>
        <Select value={filterCompanyId} onValueChange={setFilterCompanyId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All companies</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id.toString()}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vacancy Name</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Search URL</TableHead>
              <TableHead>Note Sent</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVacancies.map((vacancy) => (
              <TableRow key={vacancy.id}>
                <TableCell>{vacancy.title}</TableCell>
                <TableCell>{vacancy.companies?.name || 'N/A'}</TableCell>
                <TableCell className="max-w-xs">
                  {vacancy.description ? (
                    <button
                      onClick={() => openDetailsModal(vacancy)}
                      className="text-blue-600 hover:underline text-left truncate block w-full"
                    >
                      {vacancy.description.substring(0, 50)}...
                    </button>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="max-w-xs">
                  {vacancy.search_url ? (
                    <button
                      onClick={() => openDetailsModal(vacancy)}
                      className="text-blue-600 hover:underline text-left truncate block w-full"
                    >
                      View URL
                    </button>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="max-w-xs">
                  {vacancy.note_sent ? (
                    <button
                      onClick={() => openDetailsModal(vacancy)}
                      className="text-blue-600 hover:underline text-left truncate block w-full"
                    >
                      {vacancy.note_sent.substring(0, 30)}...
                    </button>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {new Date(vacancy.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(vacancy)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteVacancy(vacancy.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Vacancy</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditVacancy} className="space-y-4">
            <div>
              <Label htmlFor="editVacancyTitle">Vacancy Title</Label>
              <Input
                id="editVacancyTitle"
                value={vacancyTitle}
                onChange={(e) => setVacancyTitle(e.target.value)}
                placeholder="Enter vacancy title"
                required
              />
            </div>
            <div>
              <Label htmlFor="editCompanySelect">Company</Label>
              <Select value={companyId} onValueChange={setCompanyId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editDescription">Description (Optional)</Label>
              <Textarea
                id="editDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter vacancy description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="editSearchUrl">Search URL (Optional)</Label>
              <Input
                id="editSearchUrl"
                value={searchUrl}
                onChange={(e) => setSearchUrl(e.target.value)}
                placeholder="Enter search URL"
                type="url"
              />
            </div>
            <div>
              <Label htmlFor="editNoteSent">Note Sent (Optional)</Label>
              <Textarea
                id="editNoteSent"
                value={noteSent}
                onChange={(e) => setNoteSent(e.target.value)}
                placeholder="Enter note sent"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Vacancy"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setEditingVacancy(null);
                  setIsEditDialogOpen(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <VacancyDetailsModal
        vacancy={selectedVacancy}
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
      />
    </div>
  );
}
