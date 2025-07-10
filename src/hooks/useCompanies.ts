
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Company {
  id: number;
  name: string;
  company_uuid: string;
  company_description: string | null;
  company_value: string | null;
  company_logo_url: string | null;
  company_base_url: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateCompanyData {
  name: string;
  company_description?: string;
  company_value?: string;
  company_logo_url?: string;
  company_base_url?: string;
}

interface UpdateCompanyData {
  name?: string;
  company_description?: string;
  company_value?: string;
  company_logo_url?: string;
  company_base_url?: string;
}

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 FETCH DEBUG - Fetching companies with user:', user?.email);

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ FETCH ERROR:', error);
        setError(error.message);
        toast({
          title: "Error",
          description: "Failed to fetch companies from database",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ FETCH SUCCESS - Companies fetched:', data?.length || 0);
      console.log('✅ FETCH DEBUG - Companies data:', data);
      setCompanies(data || []);
      console.log('✅ FETCH DEBUG - State updated with companies:', data?.length || 0);
    } catch (err) {
      console.error('❌ FETCH UNEXPECTED ERROR:', err);
      setError('An unexpected error occurred');
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching companies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log('✅ FETCH DEBUG - Loading set to false');
    }
  };

  const createCompany = async (companyData: CreateCompanyData): Promise<Company | null> => {
    try {
      console.log('Creating company:', companyData);

      const { data, error } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();

      if (error) {
        console.error('Error creating company:', error);
        toast({
          title: "Error",
          description: "Failed to create company",
          variant: "destructive",
        });
        return null;
      }

      console.log('Company created successfully:', data);
      toast({
        title: "Success",
        description: "Company created successfully",
      });

      // Refresh the companies list
      await fetchCompanies();
      return data;
    } catch (err) {
      console.error('Unexpected error creating company:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating company",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateCompany = async (companyUuid: string, companyData: UpdateCompanyData): Promise<Company | null> => {
    try {
      console.log('Updating company:', companyUuid, companyData);

      const { data, error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('company_uuid', companyUuid)
        .select()
        .single();

      if (error) {
        console.error('Error updating company:', error);
        toast({
          title: "Error",
          description: "Failed to update company",
          variant: "destructive",
        });
        return null;
      }

      console.log('Company updated successfully:', data);
      toast({
        title: "Success",
        description: "Company updated successfully",
      });

      // Refresh the companies list
      await fetchCompanies();
      return data;
    } catch (err) {
      console.error('Unexpected error updating company:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating company",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteCompany = async (companyUuid: string): Promise<boolean> => {
    console.log('🔍 DELETE DEBUG - Company UUID:', companyUuid);
    console.log('🔍 DELETE DEBUG - Current companies:', companies.map(c => ({ uuid: c.company_uuid, name: c.name })));
    
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('company_uuid', companyUuid);

    if (error) {
      console.error('❌ DELETE ERROR:', error);
      toast({
        title: "Error",
        description: `Failed to delete company: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }

    console.log('✅ DELETE SUCCESS - Company deleted from DB');
    toast({
      title: "Success",
      description: "Company deleted successfully",
    });
    
    // Force refresh the list
    console.log('🔄 Refreshing companies list...');
    await fetchCompanies();
    
    console.log('✅ DELETE COMPLETE - UI updated');
    return true;
  };

  useEffect(() => {
    if (user) {
      fetchCompanies();
    }
  }, [user]);

  return {
    companies,
    loading,
    error,
    refetch: fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
  };
};
