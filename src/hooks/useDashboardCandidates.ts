import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardCandidate {
  id: string;
  name: string;
  profile_url: string | null;
  note_sent: string | null;
  connection_status: string | null;
  search_template: string | null;
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
      const transformedCandidates: DashboardCandidate[] = (data || []).map((candidate: any) => ({
        id: candidate.id?.toString?.() ?? String(candidate.id),
        name: candidate.candidates_name,
        profile_url: candidate.profile_url,
        note_sent: candidate.note_sent,
        connection_status: candidate.connection_status,
        search_template: candidate.search_template ?? null,
        out_reach: candidate.created_at,
        vacancy_id: null, // No direct relationship in current schema
        created_at: candidate.created_at || new Date().toISOString(),
        vacancies: undefined // No direct relationship in current schema
      }));
      
      // Apply filtering logic based on requirements
      let filteredCandidates = transformedCandidates;

      // Filter by company using candidates.search_template that stores company info
      if (filters.companyUuid) {
        try {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('name')
            .eq('company_uuid', filters.companyUuid)
            .single();

          if (companyError) {
            console.warn('Unable to resolve company name for filtering:', companyError.message);
          }

          const companyName = companyData?.name?.toLowerCase();
          if (companyName) {
            filteredCandidates = filteredCandidates.filter(c =>
              (c.search_template ?? '').toLowerCase().includes(companyName)
            );
          }
        } catch (e) {
          console.warn('Company name lookup failed:', e);
        }
      }

      // Note: Vacancy-based filtering requires a relation that is not
      // present in the current schema. Once available, apply it here.
      
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