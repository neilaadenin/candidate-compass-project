import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Company {
  id: number;
  name: string;
  company_uuid: string;
  company_description: string | null;
  company_value: string | null;
  company_logo_url: string | null;
  company_base_url: string | null;
  created_at: string;
  updated_at: string;
}

interface CompanyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    company_description?: string;
    company_value?: string;
    company_logo_url?: string;
    company_base_url?: string;
  }) => Promise<void>;
  company?: Company | null;
  isLoading?: boolean;
}

export function CompanyForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  company, 
  isLoading = false 
}: CompanyFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    company_description: "",
    company_value: "",
    company_logo_url: "",
    company_base_url: "",
  });

  const isEditing = !!company;

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        company_description: company.company_description || "",
        company_value: company.company_value || "",
        company_logo_url: company.company_logo_url || "",
        company_base_url: company.company_base_url || "",
      });
    } else {
      setFormData({
        name: "",
        company_description: "",
        company_value: "",
        company_logo_url: "",
        company_base_url: "",
      });
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    await onSubmit({
      name: formData.name.trim(),
      company_description: formData.company_description.trim() || undefined,
      company_value: formData.company_value.trim() || undefined,
      company_logo_url: formData.company_logo_url.trim() || undefined,
      company_base_url: formData.company_base_url.trim() || undefined,
    });

    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Company" : "Create New Company"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the company information below."
              : "Fill in the company information below."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter company name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_description">Description</Label>
            <Textarea
              id="company_description"
              value={formData.company_description}
              onChange={(e) => handleInputChange("company_description", e.target.value)}
              placeholder="Enter company description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_value">Company Value</Label>
            <Input
              id="company_value"
              value={formData.company_value}
              onChange={(e) => handleInputChange("company_value", e.target.value)}
              placeholder="Enter company value"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_logo_url">Logo URL</Label>
            <Input
              id="company_logo_url"
              value={formData.company_logo_url}
              onChange={(e) => handleInputChange("company_logo_url", e.target.value)}
              placeholder="Enter logo URL"
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_base_url">Base URL</Label>
            <Input
              id="company_base_url"
              value={formData.company_base_url}
              onChange={(e) => handleInputChange("company_base_url", e.target.value)}
              placeholder="Enter base URL"
              type="url"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? "Saving..." : isEditing ? "Update Company" : "Create Company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 