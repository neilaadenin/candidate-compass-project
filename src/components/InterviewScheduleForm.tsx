
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanies } from '@/hooks/useCompanies';
import { useVacancies } from '@/hooks/useVacancies';
import { CreateInterviewScheduleData, InterviewSchedule } from '@/hooks/useInterviewSchedules';
import { interviewScheduleSchema } from '@/lib/validations';
import { z } from 'zod';

interface InterviewScheduleFormProps {
  schedule?: InterviewSchedule;
  onSubmit: (data: CreateInterviewScheduleData) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export function InterviewScheduleForm({ schedule, onSubmit, onCancel, loading = false }: InterviewScheduleFormProps) {
  const { companies } = useCompanies();
  const { vacancies } = useVacancies();
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateInterviewScheduleData>({
    vacancy_uuid: schedule?.vacancy_uuid || '',
    company_uuid: schedule?.company_uuid || '',
    candidate_name: schedule?.candidate_name || '',
    interview_date: schedule?.interview_date || '',
    interview_time: schedule?.interview_time || '',
    interview_location: schedule?.interview_location || '',
    interview_type: schedule?.interview_type || '',
    interviewer_name: schedule?.interviewer_name || '',
    meeting_link: schedule?.meeting_link || '',
    status: schedule?.status || 'scheduled',
  });

  // Filter vacancies based on selected company
  const filteredVacancies = formData.company_uuid 
    ? vacancies.filter(v => v.companies?.company_uuid === formData.company_uuid)
    : vacancies;

  console.log('InterviewScheduleForm - Debug:', {
    selectedCompanyUuid: formData.company_uuid,
    totalVacancies: vacancies.length,
    filteredVacancies: filteredVacancies.length,
    companies: companies.map(c => ({ name: c.name, uuid: c.company_uuid })),
    vacancies: vacancies.map(v => ({ title: v.title, companyUuid: v.companies?.company_uuid }))
  });

  const handleInputChange = (field: keyof CreateInterviewScheduleData, value: any) => {
    console.log('InterviewScheduleForm - handleInputChange:', { field, value });
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // If company is changed, reset vacancy selection
    if (field === 'company_uuid') {
      console.log('InterviewScheduleForm - Company changed, resetting vacancy');
      setFormData(prev => ({
        ...prev,
        [field]: value,
        vacancy_uuid: '' // Reset vacancy when company changes
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validated = interviewScheduleSchema.parse(formData);
      
      const success = await onSubmit(validated as CreateInterviewScheduleData);
      if (success) {
        onCancel();
      }
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

  const isFormValid = formData.vacancy_uuid && formData.company_uuid && 
                     formData.candidate_name && formData.interview_date && formData.interview_time;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{schedule ? 'Edit Interview Schedule' : 'Create Interview Schedule'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Select
                value={formData.company_uuid}
                onValueChange={(value) => handleInputChange('company_uuid', value)}
              >
                <SelectTrigger className={errors.company_uuid ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.company_uuid} value={company.company_uuid}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.company_uuid && <p className="text-sm text-destructive mt-1">{errors.company_uuid}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vacancy">Vacancy *</Label>
              <Select
                value={formData.vacancy_uuid}
                onValueChange={(value) => handleInputChange('vacancy_uuid', value)}
                disabled={!formData.company_uuid}
              >
                <SelectTrigger className={errors.vacancy_uuid ? "border-destructive" : ""}>
                  <SelectValue placeholder={formData.company_uuid ? "Select Vacancy" : "Select Company First"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredVacancies.map((vacancy) => (
                    <SelectItem key={vacancy.vacancy_uuid} value={vacancy.vacancy_uuid}>
                      {vacancy.title || vacancy.vacancy_title || `Vacancy ${vacancy.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vacancy_uuid && <p className="text-sm text-destructive mt-1">{errors.vacancy_uuid}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="candidate_name">Candidate Name *</Label>
            <Input
              id="candidate_name"
              value={formData.candidate_name}
              onChange={(e) => handleInputChange('candidate_name', e.target.value)}
              placeholder="Enter candidate name"
              className={errors.candidate_name ? "border-destructive" : ""}
            />
            {errors.candidate_name && <p className="text-sm text-destructive mt-1">{errors.candidate_name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interview_date">Interview Date *</Label>
              <Input
                id="interview_date"
                type="date"
                value={formData.interview_date}
                onChange={(e) => handleInputChange('interview_date', e.target.value)}
                className={errors.interview_date ? "border-destructive" : ""}
              />
              {errors.interview_date && <p className="text-sm text-destructive mt-1">{errors.interview_date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="interview_time">Interview Time *</Label>
              <Input
                id="interview_time"
                type="time"
                value={formData.interview_time}
                onChange={(e) => handleInputChange('interview_time', e.target.value)}
                className={errors.interview_time ? "border-destructive" : ""}
              />
              {errors.interview_time && <p className="text-sm text-destructive mt-1">{errors.interview_time}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interview_type">Interview Type</Label>
              <Select
                value={formData.interview_type || ''}
                onValueChange={(value) => handleInputChange('interview_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Interview Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || 'scheduled'}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interview_location">Location</Label>
            <Input
              id="interview_location"
              value={formData.interview_location || ''}
              onChange={(e) => handleInputChange('interview_location', e.target.value)}
              placeholder="Enter interview location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interviewer_name">Interviewer Name</Label>
            <Input
              id="interviewer_name"
              value={formData.interviewer_name || ''}
              onChange={(e) => handleInputChange('interviewer_name', e.target.value)}
              placeholder="Enter interviewer name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting_link">Meeting Link</Label>
            <Input
              id="meeting_link"
              type="url"
              value={formData.meeting_link || ''}
              onChange={(e) => handleInputChange('meeting_link', e.target.value)}
              placeholder="Enter meeting link (e.g., Zoom, Teams)"
              className={errors.meeting_link ? "border-destructive" : ""}
            />
            {errors.meeting_link && <p className="text-sm text-destructive mt-1">{errors.meeting_link}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Saving...' : (schedule ? 'Update Schedule' : 'Create Schedule')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
