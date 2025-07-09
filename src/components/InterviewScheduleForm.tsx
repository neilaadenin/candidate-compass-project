
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

interface InterviewScheduleFormProps {
  schedule?: InterviewSchedule;
  onSubmit: (data: CreateInterviewScheduleData) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export function InterviewScheduleForm({ schedule, onSubmit, onCancel, loading = false }: InterviewScheduleFormProps) {
  const { companies } = useCompanies();
  const { vacancies } = useVacancies();

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

  const handleInputChange = (field: keyof CreateInterviewScheduleData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vacancy_uuid || !formData.company_uuid || 
        !formData.candidate_name || !formData.interview_date || !formData.interview_time) {
      return;
    }

    const success = await onSubmit(formData);
    if (success) {
      onCancel();
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
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="vacancy">Vacancy *</Label>
              <Select
                value={formData.vacancy_uuid}
                onValueChange={(value) => handleInputChange('vacancy_uuid', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Vacancy" />
                </SelectTrigger>
                <SelectContent>
                  {vacancies.map((vacancy) => (
                    <SelectItem key={vacancy.vacancy_uuid} value={vacancy.vacancy_uuid}>
                      {vacancy.title || vacancy.vacancy_title || `Vacancy ${vacancy.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="candidate_name">Candidate Name *</Label>
            <Input
              id="candidate_name"
              value={formData.candidate_name}
              onChange={(e) => handleInputChange('candidate_name', e.target.value)}
              placeholder="Enter candidate name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interview_date">Interview Date *</Label>
              <Input
                id="interview_date"
                type="date"
                value={formData.interview_date}
                onChange={(e) => handleInputChange('interview_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interview_time">Interview Time *</Label>
              <Input
                id="interview_time"
                type="time"
                value={formData.interview_time}
                onChange={(e) => handleInputChange('interview_time', e.target.value)}
                required
              />
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
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid || loading}
            >
              {loading ? 'Saving...' : (schedule ? 'Update Schedule' : 'Create Schedule')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
