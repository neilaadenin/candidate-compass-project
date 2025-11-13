
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Candidate {
  id: string;
  name: string;
  profile_url: string | null;
  note_sent: string | null;
  connection_status: string | null;
  out_reach: string | null;
  vacancy_id: number | null;
  created_at: string;
  match_percentage: number | null;
}

export const useCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching candidates with user:', user?.email);

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
        out_reach: candidate.created_at, // Using created_at as fallback for out_reach
        vacancy_id: null, // Database doesn't have this field yet
        created_at: candidate.created_at || new Date().toISOString(),
        match_percentage: candidate.match_percentage,
      }));
      
      setCandidates(transformedCandidates);
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
    if (user) {
      fetchCandidates();
    }
  }, [user]);

  return {
    candidates,
    loading,
    error,
    refetch: fetchCandidates,
  };
};
