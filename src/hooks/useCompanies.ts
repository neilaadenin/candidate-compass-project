
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

interface ApiCompany {
  id: number;
  company_uuid: string;
  company_name: string;
  company_description: string;
  company_value: string;
  company_logo_url: string;
  company_base_url: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  statusCode: number;
  message: string;
  fulfilled: number;
  data: ApiCompany[];
  pagination: {
    type: string;
    page: number;
    per_page: number;
    total_rows: number;
    total_pages: number;
    numbering_start: number;
    sort: string;
  };
}

const API_BASE_URL = 'https://bumame-sarana-ai-daffa-ai-service-652345969561.asia-southeast2.run.app';

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCompaniesFromAPI = async (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    search?: string;
  }) => {
    try {
      console.log('🔄 API FETCH - Fetching companies from external API...');
      
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sort) queryParams.append('sort', params.sort);
      if (params?.search) queryParams.append('search', params.search);

      const url = `${API_BASE_URL}/public/companies${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch companies from API: ${response.statusText}`);
      }
      
      const data: ApiResponse = await response.json();
      console.log('✅ API FETCH SUCCESS - Companies fetched:', data.data?.length || 0);
      
      return data;
    } catch (err) {
      console.error('❌ API FETCH ERROR:', err);
      throw err;
    }
  };

  const syncCompaniesToSupabase = async (apiCompanies: ApiCompany[]) => {
    try {
      console.log('🔄 SYNC - Syncing companies to Supabase...');
      
      for (const apiCompany of apiCompanies) {
        const { error } = await supabase
          .from('companies')
          .upsert({
            name: apiCompany.company_name,
            company_uuid: apiCompany.company_uuid,
            company_description: apiCompany.company_description,
            company_value: apiCompany.company_value,
            company_logo_url: apiCompany.company_logo_url,
            company_base_url: apiCompany.company_base_url,
            created_at: apiCompany.created_at,
            updated_at: apiCompany.updated_at
          }, {
            onConflict: 'company_uuid'
          });

        if (error) {
          console.error('❌ SYNC ERROR for company:', apiCompany.company_name, error);
          throw new Error(`Failed to sync company: ${apiCompany.company_name}`);
        }
      }
      
      console.log('✅ SYNC SUCCESS - All companies synced to Supabase');
    } catch (err) {
      console.error('❌ SYNC ERROR:', err);
      throw err;
    }
  };

  const fetchAndSyncCompanies = async (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    search?: string;
  }) => {
    try {
      setSyncing(true);
      setError(null);

      // Fetch from API
      const apiData = await fetchCompaniesFromAPI(params);
      
      // Sync to Supabase
      await syncCompaniesToSupabase(apiData.data);
      
      // Refresh local data
      await fetchCompanies();
      
      toast({
        title: "Success",
        description: `Synced ${apiData.data.length} companies from API to Supabase`,
      });
      
      return apiData;
    } catch (err) {
      console.error('❌ FETCH AND SYNC ERROR:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch and sync companies';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setSyncing(false);
    }
  };

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
    syncing,
    refetch: fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    fetchAndSyncCompanies,
    fetchCompaniesFromAPI,
  };
};
