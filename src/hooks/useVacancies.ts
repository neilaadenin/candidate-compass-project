
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Company {
  id: number;
  name: string;
  company_uuid: string;
  created_at: string;
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

interface CreateVacancyData {
  title: string;
  description?: string;
  company_uuid: string;
  vacancy_location?: string;
  vacancy_requirement?: string;
  vacancy_type?: string;
  salary_min?: number;
  salary_max?: number;
  search_url?: string;
}

interface UpdateVacancyData {
  title?: string;
  description?: string;
  company_uuid?: string;
  vacancy_location?: string;
  vacancy_requirement?: string;
  vacancy_type?: string;
  salary_min?: number;
  salary_max?: number;
  search_url?: string;
}

export const useVacancies = () => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching vacancies with user:', user?.email);

      const { data, error } = await supabase
        .from('vacancies')
        .select(`
          id,
          title,
          vacancy_uuid,
          vacancy_title,
          description,
          vacancy_description,
          search_url,
          note_sent,
          vacancy_location,
          vacancy_requirement,
          vacancy_type,
          salary_min,
          salary_max,
          created_at,
          companies (
            id,
            name,
            company_uuid,
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

      console.log('Vacancies fetched successfully:', data);
      
      // Transform database fields to match interface
      const transformedVacancies = (data || []).map(vacancy => ({
        id: vacancy.id,
        title: vacancy.title || vacancy.vacancy_title || 'Untitled Position',
        vacancy_uuid: vacancy.vacancy_uuid,
        vacancy_title: vacancy.vacancy_title || vacancy.title || 'Untitled Position',
        company_id: vacancy.companies?.id || 0,
        description: vacancy.description || vacancy.vacancy_description,
        vacancy_description: vacancy.vacancy_description,
        search_url: vacancy.search_url,
        note_sent: vacancy.note_sent ? 'Note sent' : null,
        vacancy_location: vacancy.vacancy_location,
        vacancy_requirement: vacancy.vacancy_requirement,
        vacancy_type: vacancy.vacancy_type,
        salary_min: vacancy.salary_min,
        salary_max: vacancy.salary_max,
        created_at: vacancy.created_at || new Date().toISOString(),
        companies: {
          id: vacancy.companies?.id || 0,
          name: vacancy.companies?.name || 'Unknown Company',
          company_uuid: vacancy.companies?.company_uuid || '',
          created_at: vacancy.companies?.created_at || vacancy.created_at || new Date().toISOString()
        }
      }));
      
      setVacancies(transformedVacancies);
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

  const createVacancy = async (vacancyData: CreateVacancyData): Promise<Vacancy | null> => {
    try {
      console.log('Creating vacancy:', vacancyData);

      const { data, error } = await supabase
        .from('vacancies')
        .insert([{
          title: vacancyData.title,
          vacancy_title: vacancyData.title,
          description: vacancyData.description,
          vacancy_description: vacancyData.description,
          company_uuid: vacancyData.company_uuid,
          vacancy_location: vacancyData.vacancy_location,
          vacancy_requirement: vacancyData.vacancy_requirement,
          vacancy_type: vacancyData.vacancy_type,
          salary_min: vacancyData.salary_min,
          salary_max: vacancyData.salary_max,
          search_url: vacancyData.search_url,
        }])
        .select(`
          id,
          title,
          vacancy_uuid,
          vacancy_title,
          description,
          vacancy_description,
          search_url,
          note_sent,
          vacancy_location,
          vacancy_requirement,
          vacancy_type,
          salary_min,
          salary_max,
          created_at,
          companies (
            id,
            name,
            company_uuid,
            created_at
          )
        `)
        .single();

      if (error) {
        console.error('Error creating vacancy:', error);
        toast({
          title: "Error",
          description: "Failed to create vacancy",
          variant: "destructive",
        });
        return null;
      }

      console.log('Vacancy created successfully:', data);
      toast({
        title: "Success",
        description: "Vacancy created successfully",
      });

      // Refresh the vacancies list
      await fetchVacancies();
      return data as Vacancy;
    } catch (err) {
      console.error('Unexpected error creating vacancy:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating vacancy",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateVacancy = async (vacancyUuid: string, vacancyData: UpdateVacancyData): Promise<Vacancy | null> => {
    try {
      console.log('Updating vacancy:', vacancyUuid, vacancyData);

      const updateData: any = {};
      if (vacancyData.title) {
        updateData.title = vacancyData.title;
        updateData.vacancy_title = vacancyData.title;
      }
      if (vacancyData.description !== undefined) {
        updateData.description = vacancyData.description;
        updateData.vacancy_description = vacancyData.description;
      }
      if (vacancyData.company_uuid) updateData.company_uuid = vacancyData.company_uuid;
      if (vacancyData.vacancy_location !== undefined) updateData.vacancy_location = vacancyData.vacancy_location;
      if (vacancyData.vacancy_requirement !== undefined) updateData.vacancy_requirement = vacancyData.vacancy_requirement;
      if (vacancyData.vacancy_type !== undefined) updateData.vacancy_type = vacancyData.vacancy_type;
      if (vacancyData.salary_min !== undefined) updateData.salary_min = vacancyData.salary_min;
      if (vacancyData.salary_max !== undefined) updateData.salary_max = vacancyData.salary_max;
      if (vacancyData.search_url !== undefined) updateData.search_url = vacancyData.search_url;

      const { data, error } = await supabase
        .from('vacancies')
        .update(updateData)
        .eq('vacancy_uuid', vacancyUuid)
        .select(`
          id,
          title,
          vacancy_uuid,
          vacancy_title,
          description,
          vacancy_description,
          search_url,
          note_sent,
          vacancy_location,
          vacancy_requirement,
          vacancy_type,
          salary_min,
          salary_max,
          created_at,
          companies (
            id,
            name,
            company_uuid,
            created_at
          )
        `)
        .single();

      if (error) {
        console.error('Error updating vacancy:', error);
        toast({
          title: "Error",
          description: "Failed to update vacancy",
          variant: "destructive",
        });
        return null;
      }

      console.log('Vacancy updated successfully:', data);
      toast({
        title: "Success",
        description: "Vacancy updated successfully",
      });

      // Refresh the vacancies list
      await fetchVacancies();
      return data as Vacancy;
    } catch (err) {
      console.error('Unexpected error updating vacancy:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating vacancy",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteVacancy = async (vacancyUuid: string): Promise<boolean> => {
    console.log('🔍 DELETE VACANCY DEBUG - Vacancy UUID:', vacancyUuid);
    console.log('🔍 DELETE VACANCY DEBUG - Current vacancies:', vacancies.map(v => ({ uuid: v.vacancy_uuid, title: v.title })));
    
    const { error } = await supabase
      .from('vacancies')
      .delete()
      .eq('vacancy_uuid', vacancyUuid);

    if (error) {
      console.error('❌ DELETE VACANCY ERROR:', error);
      toast({
        title: "Error",
        description: `Failed to delete vacancy: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }

    console.log('✅ DELETE VACANCY SUCCESS - Vacancy deleted from DB');
    toast({
      title: "Success",
      description: "Vacancy deleted successfully",
    });
    
    // Force refresh the list
    console.log('🔄 Refreshing vacancies list...');
    await fetchVacancies();
    
    console.log('✅ DELETE VACANCY COMPLETE - UI updated');
    return true;
  };

  useEffect(() => {
    if (user) {
      fetchVacancies();
    }
  }, [user]);

  return {
    vacancies,
    loading,
    error,
    refetch: fetchVacancies,
    createVacancy,
    updateVacancy,
    deleteVacancy,
  };
};
