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
  const [filterCompanyId, setFilterCompanyId] = useState("all");

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

    try {
      const { error } = await supabase
        .from("vacancies")
        .insert([{
          title: vacancyTitle.trim(),
          company_id: parseInt(companyId),
          description: description.trim() || null,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vacancy added successfully",
      });
      
      resetForm();
      setIsAddDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error adding vacancy:", error);
      toast({
        title: "Error",
        description: "Failed to add vacancy",
        variant: "destructive",
      });
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

    try {
      const { error } = await supabase
        .from("vacancies")
        .update({
          title: vacancyTitle.trim(),
          company_id: parseInt(companyId),
          description: description.trim() || null,
        })
        .eq("id", editingVacancy.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vacancy updated successfully",
      });
      
      resetForm();
      setEditingVacancy(null);
      setIsEditDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error updating vacancy:", error);
      toast({
        title: "Error",
        description: "Failed to update vacancy",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVacancy = async (vacancyId: number) => {
    if (!confirm("Are you sure you want to delete this vacancy?")) return;

    try {
      const { error } = await supabase
        .from("vacancies")
        .delete()
        .eq("id", vacancyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vacancy deleted successfully",
      });
      
      refetch();
    } catch (error) {
      console.error("Error deleting vacancy:", error);
      toast({
        title: "Error",
        description: "Failed to delete vacancy",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (vacancy: any) => {
    setEditingVacancy(vacancy);
    setVacancyTitle(vacancy.title);
    setCompanyId(vacancy.company_id.toString());
    setDescription(vacancy.description || "");
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setVacancyTitle("");
    setCompanyId("");
    setDescription("");
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
          <DialogContent>
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
              <div className="flex gap-2">
                <Button type="submit">Add Vacancy</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    resetForm();
                    setIsAddDialogOpen(false);
                  }}
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
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVacancies.map((vacancy) => (
              <TableRow key={vacancy.id}>
                <TableCell>{vacancy.title}</TableCell>
                <TableCell>{vacancy.companies.name}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {vacancy.description || "-"}
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
        <DialogContent>
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
            <div className="flex gap-2">
              <Button type="submit">Update Vacancy</Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setEditingVacancy(null);
                  setIsEditDialogOpen(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
