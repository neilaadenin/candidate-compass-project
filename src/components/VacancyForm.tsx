
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
}

interface Vacancy {
  id: number;
  title: string;
  vacancy_uuid: string;
  vacancy_title: string;
  company_id: number;
  description: string | null;
  vacancy_description: string | null;
  search_url: string | null;
  note_sent: string | null;
  vacancy_location: string | null;
  vacancy_requirement: string | null;
  vacancy_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  created_at: string;
  companies: Company;
}

interface VacancyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    company_uuid: string;
    vacancy_location?: string;
    vacancy_requirement?: string;
    vacancy_type?: string;
    salary_min?: number;
    salary_max?: number;
    search_url?: string;
  }) => Promise<void>;
  vacancy?: Vacancy | null;
  companies: Company[];
  isLoading?: boolean;
}

export function VacancyForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  vacancy, 
  companies,
  isLoading = false 
}: VacancyFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company_uuid: "",
    vacancy_location: "",
    vacancy_requirement: "",
    vacancy_type: "",
    salary_min: "",
    salary_max: "",
    search_url: "",
  });

  const isEditing = !!vacancy;

  useEffect(() => {
    if (vacancy) {
      setFormData({
        title: vacancy.title || vacancy.vacancy_title || "",
        description: vacancy.description || vacancy.vacancy_description || "",
        company_uuid: vacancy.companies?.company_uuid || "",
        vacancy_location: vacancy.vacancy_location || "",
        vacancy_requirement: vacancy.vacancy_requirement || "",
        vacancy_type: vacancy.vacancy_type || "",
        salary_min: vacancy.salary_min?.toString() || "",
        salary_max: vacancy.salary_max?.toString() || "",
        search_url: vacancy.search_url || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        company_uuid: "",
        vacancy_location: "",
        vacancy_requirement: "",
        vacancy_type: "",
        salary_min: "",
        salary_max: "",
        search_url: "",
      });
    }
  }, [vacancy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.company_uuid) {
      return;
    }

    await onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      company_uuid: formData.company_uuid,
      vacancy_location: formData.vacancy_location.trim() || undefined,
      vacancy_requirement: formData.vacancy_requirement.trim() || undefined,
      vacancy_type: formData.vacancy_type.trim() || undefined,
      salary_min: formData.salary_min ? parseInt(formData.salary_min) : undefined,
      salary_max: formData.salary_max ? parseInt(formData.salary_max) : undefined,
      search_url: formData.search_url.trim() || undefined,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Vacancy" : "Create New Vacancy"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the vacancy information below."
              : "Fill in the vacancy information below."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter job title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_uuid">Company *</Label>
              <Select value={formData.company_uuid} onValueChange={(value) => handleInputChange("company_uuid", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.company_uuid} value={company.company_uuid}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter job description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vacancy_location">Location</Label>
              <Input
                id="vacancy_location"
                value={formData.vacancy_location}
                onChange={(e) => handleInputChange("vacancy_location", e.target.value)}
                placeholder="Enter job location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vacancy_type">Job Type</Label>
              <Select value={formData.vacancy_type} onValueChange={(value) => handleInputChange("vacancy_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_min">Minimum Salary</Label>
              <Input
                id="salary_min"
                type="number"
                value={formData.salary_min}
                onChange={(e) => handleInputChange("salary_min", e.target.value)}
                placeholder="Enter minimum salary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_max">Maximum Salary</Label>
              <Input
                id="salary_max"
                type="number"
                value={formData.salary_max}
                onChange={(e) => handleInputChange("salary_max", e.target.value)}
                placeholder="Enter maximum salary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vacancy_requirement">Requirements</Label>
            <Textarea
              id="vacancy_requirement"
              value={formData.vacancy_requirement}
              onChange={(e) => handleInputChange("vacancy_requirement", e.target.value)}
              placeholder="Enter job requirements"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="search_url">Search URL</Label>
            <Input
              id="search_url"
              type="url"
              value={formData.search_url}
              onChange={(e) => handleInputChange("search_url", e.target.value)}
              placeholder="Enter search URL"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.title.trim() || !formData.company_uuid}>
              {isLoading ? "Saving..." : isEditing ? "Update Vacancy" : "Create Vacancy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
