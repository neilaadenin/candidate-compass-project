
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Company {
  id: number;
  name: string;
  company_uuid: string;
  description?: string;
}

interface JobVacancy {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  location?: string;
  requirements?: string;
  type?: string;
  salary_min?: number;
  salary_max?: number;
  company_uuid: string;
}

interface Candidate {
  id: number;
  name: string;
  profile_url?: string;
  connection_status?: string;
  note_sent?: string;
}

export const useDataSync = () => {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const syncCompanies = async (companies: Company[]) => {
    console.log('Syncing companies to Supabase:', companies);
    
    for (const company of companies) {
      try {
        const { data: existingCompany } = await supabase
          .from('companies')
          .select('id')
          .eq('company_uuid', company.company_uuid)
          .single();

        if (existingCompany) {
          // Update existing company
          const { error } = await supabase
            .from('companies')
            .update({
              name: company.name,
              company_description: company.description,
              updated_at: new Date().toISOString(),
            })
            .eq('company_uuid', company.company_uuid);

          if (error) {
            console.error('Error updating company:', error);
            throw error;
          }
          console.log('Updated company:', company.name);
        } else {
          // Insert new company
          const { error } = await supabase
            .from('companies')
            .insert({
              name: company.name,
              company_uuid: company.company_uuid,
              company_description: company.description,
            });

          if (error) {
            console.error('Error inserting company:', error);
            throw error;
          }
          console.log('Inserted new company:', company.name);
        }
      } catch (error) {
        console.error('Error syncing company:', company.name, error);
        throw error;
      }
    }
  };

  const syncJobVacancies = async (jobVacancies: JobVacancy[]) => {
    console.log('Syncing job vacancies to Supabase:', jobVacancies);
    
    for (const vacancy of jobVacancies) {
      try {
        const { data: existingVacancy } = await supabase
          .from('vacancies')
          .select('id')
          .eq('vacancy_uuid', vacancy.uuid)
          .single();

        if (existingVacancy) {
          // Update existing vacancy
          const { error } = await supabase
            .from('vacancies')
            .update({
              title: vacancy.name,
              vacancy_title: vacancy.name,
              description: vacancy.description,
              vacancy_description: vacancy.description,
              vacancy_location: vacancy.location,
              vacancy_requirement: vacancy.requirements,
              vacancy_type: vacancy.type,
              salary_min: vacancy.salary_min,
              salary_max: vacancy.salary_max,
              company_uuid: vacancy.company_uuid,
              updated_at: new Date().toISOString(),
            })
            .eq('vacancy_uuid', vacancy.uuid);

          if (error) {
            console.error('Error updating vacancy:', error);
            throw error;
          }
          console.log('Updated vacancy:', vacancy.name);
        } else {
          // Insert new vacancy
          const { error } = await supabase
            .from('vacancies')
            .insert({
              title: vacancy.name,
              vacancy_title: vacancy.name,
              vacancy_uuid: vacancy.uuid,
              description: vacancy.description,
              vacancy_description: vacancy.description,
              vacancy_location: vacancy.location,
              vacancy_requirement: vacancy.requirements,
              vacancy_type: vacancy.type,
              salary_min: vacancy.salary_min,
              salary_max: vacancy.salary_max,
              company_uuid: vacancy.company_uuid,
            });

          if (error) {
            console.error('Error inserting vacancy:', error);
            throw error;
          }
          console.log('Inserted new vacancy:', vacancy.name);
        }
      } catch (error) {
        console.error('Error syncing vacancy:', vacancy.name, error);
        throw error;
      }
    }
  };

  const syncCandidates = async (candidates: Candidate[], vacancyId: string) => {
    console.log('Syncing candidates to Supabase:', candidates);
    
    for (const candidate of candidates) {
      try {
        const { data: existingCandidate } = await supabase
          .from('candidates')
          .select('id')
          .eq('candidates_name', candidate.name)
          .single();

        if (!existingCandidate) {
          const { error } = await supabase
            .from('candidates')
            .insert({
              candidates_name: candidate.name,
              profile_url: candidate.profile_url,
              connection_status: candidate.connection_status,
              note_sent: candidate.note_sent,
            });

          if (error) {
            console.error('Error inserting candidate:', error);
            throw error;
          }
          console.log('Inserted new candidate:', candidate.name);
        }
      } catch (error) {
        console.error('Error syncing candidate:', candidate.name, error);
        throw error;
      }
    }
  };

  const syncAllData = async (
    companies: Company[], 
    jobVacancies: JobVacancy[], 
    candidates: Candidate[], 
    vacancyId: string
  ) => {
    setSyncing(true);
    try {
      console.log('Starting data synchronization...');
      
      // Sync companies first
      if (companies.length > 0) {
        await syncCompanies(companies);
        toast({
          title: "Success",
          description: `${companies.length} companies synced successfully`,
        });
      }

      // Sync job vacancies
      if (jobVacancies.length > 0) {
        await syncJobVacancies(jobVacancies);
        toast({
          title: "Success",
          description: `${jobVacancies.length} job vacancies synced successfully`,
        });
      }

      // Sync candidates
      if (candidates.length > 0) {
        await syncCandidates(candidates, vacancyId);
        toast({
          title: "Success",
          description: `${candidates.length} candidates synced successfully`,
        });
      }

      console.log('All data synced successfully');
    } catch (error) {
      console.error('Error during sync:', error);
      toast({
        title: "Error",
        description: "Failed to sync data to Supabase",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncing,
    syncAllData,
    syncCompanies,
    syncJobVacancies,
    syncCandidates,
  };
};
