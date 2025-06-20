
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function CompanyPage() {
  const { companies, loading, refetch } = useCompanies();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [companyName, setCompanyName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      toast({
        title: "Error",
        description: "Company name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Adding company:", companyName.trim());

    try {
      const { data, error } = await supabase
        .from("companies")
        .insert([{ name: companyName.trim() }])
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Company added successfully:", data);
      toast({
        title: "Success",
        description: "Company added successfully",
      });
      
      setCompanyName("");
      setIsAddDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error("Error adding company:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add company",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim() || !editingCompany) {
      toast({
        title: "Error",
        description: "Company name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Updating company:", editingCompany.id, companyName.trim());

    try {
      const { data, error } = await supabase
        .from("companies")
        .update({ name: companyName.trim() })
        .eq("id", editingCompany.id)
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Company updated successfully:", data);
      toast({
        title: "Success",
        description: "Company updated successfully",
      });
      
      setCompanyName("");
      setEditingCompany(null);
      setIsEditDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error("Error updating company:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update company",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompany = async (companyId: number) => {
    if (!confirm("Are you sure you want to delete this company?")) return;

    console.log("Deleting company:", companyId);

    try {
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", companyId);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Company deleted successfully");
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
      
      refetch();
    } catch (error: any) {
      console.error("Error deleting company:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete company",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (company: any) => {
    console.log("Opening edit dialog for company:", company);
    setEditingCompany(company);
    setCompanyName(company.name);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <div>Loading companies...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Companies</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCompany} className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Company"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setCompanyName("");
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

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>{company.id}</TableCell>
                <TableCell>{company.name}</TableCell>
                <TableCell>
                  {new Date(company.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(company)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteCompany(company.id)}
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
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCompany} className="space-y-4">
            <div>
              <Label htmlFor="editCompanyName">Company Name</Label>
              <Input
                id="editCompanyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Company"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setCompanyName("");
                  setEditingCompany(null);
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
    </div>
  );
}
