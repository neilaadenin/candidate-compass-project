
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Company {
  id: number;
  name: string;
  created_at: string;
}

interface Vacancy {
  id: number;
  title: string;
  company_id: number;
  description: string | null;
  created_at: string;
  companies: Company;
}

export const useVacancies = () => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('vacancies')
        .select(`
          *,
          companies (
            id,
            name,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vacancies:', error);
        setError(error.message);
        toast({
          title: "Error",
          description: "Failed to fetch vacancies from database",
          variant: "destructive",
        });
        return;
      }

      setVacancies(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching vacancies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVacancies();
  }, []);

  return {
    vacancies,
    loading,
    error,
    refetch: fetchVacancies,
  };
};
