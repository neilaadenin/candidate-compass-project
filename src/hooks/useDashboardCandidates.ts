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

      // For now, fetch all candidates since the types are out of sync
      // In a production environment, you would regenerate the types file
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching candidates:', error);
        setError(error.message);
        toast({
          title: "Error",
          description: "Failed to fetch candidates from database",
          variant: "destructive",
        });
        return;
      }

      console.log('Candidates fetched successfully:', data);
      
      // Transform database fields to match interface
      const transformedCandidates = (data || []).map(candidate => ({
        id: candidate.id.toString(),
        name: candidate.candidates_name,
        profile_url: candidate.profile_url,
        note_sent: candidate.note_sent,
        connection_status: candidate.connection_status,
        out_reach: candidate.created_at,
        vacancy_id: null, // No direct relationship in current schema
        created_at: candidate.created_at || new Date().toISOString(),
        vacancies: undefined // No direct relationship in current schema
      }));
      
      // Apply filtering logic based on requirements
      let filteredCandidates = transformedCandidates;
      
      if (filters.companyUuid || filters.vacancyUuid) {
        // For now, since there's no direct relationship, we'll show all candidates
        // In a real implementation, you would need to:
        // 1. Regenerate the Supabase types to include the missing candidate_id field
        // 2. Use the interview_schedules table to join candidates with vacancies
        console.log('Filters applied but no direct relationship available in current schema');
        console.log('To fix this, regenerate the Supabase types file to include the missing candidate_id field');
      }
      
      setCandidates(filteredCandidates);
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