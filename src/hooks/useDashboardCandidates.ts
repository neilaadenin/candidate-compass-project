import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardCandidate {
  id: string;
  name: string;
  profile_url: string | null;
  note_sent: string | null;
  connection_status: string | null;
  out_reach: string | null;
  vacancy_id: number | null;
  created_at: string;
  vacancies?: {
    id: number;
    title: string;
    company_id: number;
    description: string | null;
    created_at: string;
    companies: {
      id: number;
      name: string;
      created_at: string;
    };
  };
}

interface FilterOptions {
  companyUuid?: string;
  vacancyUuid?: string;
}

export const useDashboardCandidates = (filters: FilterOptions) => {
  const [candidates, setCandidates] = useState<DashboardCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching candidates with filters:', filters);

      // If no filters are applied, return empty array
      if (!filters.companyUuid && !filters.vacancyUuid) {
        setCandidates([]);
        return;
      }

      // Fetch candidates through interview_schedules to get the relationship with companies and vacancies
      let query = supabase
        .from('interview_schedules')
        .select(`
          candidate_name,
          vacancy_uuid,
          company_uuid,
          created_at
        `)
        .order('created_at', { ascending: false });

      // Apply filters if provided
      if (filters.companyUuid) {
        query = query.eq('company_uuid', filters.companyUuid);
      }
      
      if (filters.vacancyUuid) {
        query = query.eq('vacancy_uuid', filters.vacancyUuid);
      }

      const { data: scheduleData, error: scheduleError } = await query;

      if (scheduleError) {
        console.error('Error fetching interview schedules:', scheduleError);
        setError(scheduleError.message);
        toast({
          title: "Error",
          description: "Failed to fetch candidates from database",
          variant: "destructive",
        });
        return;
      }

      console.log('Interview schedules fetched successfully:', scheduleData);
      
      // Transform schedule data to match DashboardCandidate interface
      const transformedCandidates = (scheduleData || []).map((schedule, index) => ({
        id: `schedule-${index}`,
        name: schedule.candidate_name,
        profile_url: null,
        note_sent: null,
        connection_status: 'scheduled',
        out_reach: schedule.created_at,
        vacancy_id: null,
        created_at: schedule.created_at || new Date().toISOString(),
        vacancies: undefined
      }));
      
      // Remove duplicates based on candidate name
      const uniqueCandidates = transformedCandidates.filter((candidate, index, self) => 
        index === self.findIndex(c => c.name === candidate.name)
      );
      
      setCandidates(uniqueCandidates);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching candidates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [filters.companyUuid, filters.vacancyUuid]);

  return {
    candidates,
    loading,
    error,
    refetch: fetchCandidates,
  };
}; 