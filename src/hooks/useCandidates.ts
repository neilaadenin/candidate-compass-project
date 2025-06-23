
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  position: string | null;
  cv_url: string | null;
  portfolio_url: string | null;
  notes: string | null;
  status: string;
  vacancy_id: number | null;
  created_at: string;
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

      console.log('Raw candidates data from database:', data);

      // Transform the database data to match the expected Candidate interface
      const transformedCandidates = (data || []).map(candidate => ({
        id: parseInt(candidate.id) || 0,
        name: candidate.name || '',
        email: candidate.profile_url || '', // Using profile_url as email for now
        phone: candidate.connection_status || null,
        position: null, // Not available in current schema
        cv_url: candidate.profile_url || null,
        portfolio_url: candidate.search_url || null,
        notes: candidate.note_sent || null,
        status: candidate.connection_status || 'applied', // Default status
        vacancy_id: candidate.vacancy_id || null,
        created_at: candidate.created_at || new Date().toISOString(),
      }));

      console.log('Transformed candidates:', transformedCandidates);
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
