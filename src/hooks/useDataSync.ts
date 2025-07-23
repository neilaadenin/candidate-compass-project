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
    setSyncing(true);
    
    try {
      for (const vacancy of jobVacancies) {
        try {
          // First, ensure the company exists
          const { data: companyExists } = await supabase
            .from('companies')
            .select('id')
            .eq('company_uuid', vacancy.company_uuid)
            .single();

          if (!companyExists) {
            console.warn(`Company with UUID ${vacancy.company_uuid} not found. Skipping vacancy: ${vacancy.name}`);
            continue;
          }

          const { data: existingVacancy } = await supabase
            .from('vacancies')
            .select('id')
            .eq('vacancy_uuid', vacancy.uuid)
            .single();

          const vacancyData = {
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
          };

          if (existingVacancy) {
            // Update existing vacancy
            const { error } = await supabase
              .from('vacancies')
              .update(vacancyData)
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
                ...vacancyData,
                vacancy_uuid: vacancy.uuid,
              });

            if (error) {
              console.error('Error inserting vacancy:', error);
              throw error;
            }
            console.log('Inserted new vacancy:', vacancy.name);
          }
        } catch (error) {
          console.error('Error syncing vacancy:', vacancy.name, error);
          // Continue with other vacancies instead of throwing
          console.log('Continuing with next vacancy...');
        }
      }

      toast({
        title: "Vacancies Synced",
        description: `${jobVacancies.length} job vacancies synced successfully`,
      });
    } catch (error) {
      console.error('Error during vacancy sync:', error);
      toast({
        title: "Sync Error",
        description: "There was an error syncing some vacancies. Check console for details.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSyncing(false);
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
        // Continue with other candidates
        console.log('Continuing with next candidate...');
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
      console.log('Starting comprehensive data synchronization...');
      
      // Sync companies first
      if (companies.length > 0) {
        console.log('Syncing companies...');
        await syncCompanies(companies);
        toast({
          title: "Companies Synced",
          description: `${companies.length} companies synced successfully`,
        });
      }

      // Sync job vacancies
      if (jobVacancies.length > 0) {
        console.log('Syncing job vacancies...');
        await syncJobVacancies(jobVacancies);
      }

      // Sync candidates
      if (candidates.length > 0) {
        console.log('Syncing candidates...');
        await syncCandidates(candidates, vacancyId);
        toast({
          title: "Candidates Synced",
          description: `${candidates.length} candidates synced successfully`,
        });
      }

      toast({
        title: "Sync Complete",
        description: "All data has been synchronized successfully!",
      });
      
      console.log('All data synced successfully');
    } catch (error) {
      console.error('Error during sync:', error);
      toast({
        title: "Sync Error",
        description: "There was an error syncing some data. Check console for details.",
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
