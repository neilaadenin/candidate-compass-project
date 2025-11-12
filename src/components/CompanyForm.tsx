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
import { companySchema, CompanyFormData } from "@/lib/validations";
import { z } from "zod";

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
  
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setErrors({});
    
    try {
      const validated = companySchema.parse(formData);
      
      await onSubmit({
        name: validated.name,
        company_description: validated.company_description || undefined,
        company_value: validated.company_value || undefined,
        company_logo_url: validated.company_logo_url || undefined,
        company_base_url: validated.company_base_url || undefined,
      });

      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
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
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_description">Description</Label>
            <Textarea
              id="company_description"
              value={formData.company_description}
              onChange={(e) => handleInputChange("company_description", e.target.value)}
              placeholder="Enter company description"
              rows={3}
              className={errors.company_description ? "border-destructive" : ""}
            />
            {errors.company_description && <p className="text-sm text-destructive">{errors.company_description}</p>}
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
              className={errors.company_logo_url ? "border-destructive" : ""}
            />
            {errors.company_logo_url && <p className="text-sm text-destructive">{errors.company_logo_url}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_base_url">Base URL</Label>
            <Input
              id="company_base_url"
              value={formData.company_base_url}
              onChange={(e) => handleInputChange("company_base_url", e.target.value)}
              placeholder="Enter base URL"
              className={errors.company_base_url ? "border-destructive" : ""}
            />
            {errors.company_base_url && <p className="text-sm text-destructive">{errors.company_base_url}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Update Company" : "Create Company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 