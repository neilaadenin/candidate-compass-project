
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InterviewSchedule {
  schedules_uuid: string;
  vacancy_uuid: string;
  company_uuid: string;
  candidate_name: string;
  interview_date: string;
  interview_time: string;
  interview_location?: string;
  interview_type?: string;
  interviewer_name?: string;
  meeting_link?: string;
  status?: string;
  created_at: string;
  updated_at?: string;
  // Related data
  vacancy?: {
    title: string;
    vacancy_title: string;
  };
  company?: {
    name: string;
  };
}

export interface CreateInterviewScheduleData {
  vacancy_uuid: string;
  company_uuid: string;
  candidate_name: string;
  interview_date: string;
  interview_time: string;
  interview_location?: string;
  interview_type?: string;
  interviewer_name?: string;
  meeting_link?: string;
  status?: string;
}

export interface UpdateInterviewScheduleData extends Partial<CreateInterviewScheduleData> {}

export function useInterviewSchedules() {
  const [schedules, setSchedules] = useState<InterviewSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching interview schedules...');

      const { data, error } = await supabase
        .from('interview_schedules')
        .select(`
          schedules_uuid,
          vacancy_uuid,
          company_uuid,
          candidate_name,
          interview_date,
          interview_time,
          interview_location,
          interview_type,
          interviewer_name,
          meeting_link,
          status,
          created_at,
          updated_at,
          vacancy:vacancies(title, vacancy_title),
          company:companies(name)
        `)
        .order('interview_date', { ascending: true });

      if (error) {
        console.error('Error fetching interview schedules:', error);
        setError(error.message);
        toast({
          title: "Error",
          description: `Failed to fetch interview schedules: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Interview schedules fetched successfully:', data);
      
      // Transform the data to match our interface
      const transformedSchedules: InterviewSchedule[] = (data || []).map(schedule => ({
        schedules_uuid: schedule.schedules_uuid,
        vacancy_uuid: schedule.vacancy_uuid,
        company_uuid: schedule.company_uuid,
        candidate_name: schedule.candidate_name,
        interview_date: schedule.interview_date,
        interview_time: schedule.interview_time,
        interview_location: schedule.interview_location,
        interview_type: schedule.interview_type,
        interviewer_name: schedule.interviewer_name,
        meeting_link: schedule.meeting_link,
        status: schedule.status,
        created_at: schedule.created_at || new Date().toISOString(),
        updated_at: schedule.updated_at,
        vacancy: schedule.vacancy,
        company: schedule.company
      }));
      
      setSchedules(transformedSchedules);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching interview schedules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async (scheduleData: CreateInterviewScheduleData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('Creating interview schedule:', scheduleData);

      const { data, error } = await supabase
        .from('interview_schedules')
        .insert([scheduleData])
        .select()
        .single();

      if (error) {
        console.error('Error creating interview schedule:', error);
        setError(error.message);
        toast({
          title: "Error",
          description: `Failed to create interview schedule: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Interview schedule created successfully:', data);
      toast({
        title: "Success",
        description: "Interview schedule created successfully",
      });

      await fetchSchedules();
      return true;
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the interview schedule",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateSchedule = async (schedules_uuid: string, scheduleData: UpdateInterviewScheduleData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('Updating interview schedule:', schedules_uuid, scheduleData);

      const { data, error } = await supabase
        .from('interview_schedules')
        .update(scheduleData)
        .eq('schedules_uuid', schedules_uuid)
        .select()
        .single();

      if (error) {
        console.error('Error updating interview schedule:', error);
        setError(error.message);
        toast({
          title: "Error",
          description: `Failed to update interview schedule: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Interview schedule updated successfully:', data);
      toast({
        title: "Success",
        description: "Interview schedule updated successfully",
      });

      await fetchSchedules();
      return true;
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the interview schedule",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (schedules_uuid: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('Deleting interview schedule:', schedules_uuid);

      const { error } = await supabase
        .from('interview_schedules')
        .delete()
        .eq('schedules_uuid', schedules_uuid);

      if (error) {
        console.error('Error deleting interview schedule:', error);
        setError(error.message);
        toast({
          title: "Error",
          description: `Failed to delete interview schedule: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Interview schedule deleted successfully');
      toast({
        title: "Success",
        description: "Interview schedule deleted successfully",
      });

      await fetchSchedules();
      return true;
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the interview schedule",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
}
