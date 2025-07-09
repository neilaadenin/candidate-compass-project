
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Company, JobVacancy, Candidate } from '@/api/statistics';

export const useDataSync = () => {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const syncCompaniesToSupabase = async (companies: Company[]) => {
    console.log('Syncing companies to Supabase:', companies);
    
    for (const company of companies) {
      const { error } = await supabase
        .from('companies')
        .upsert({
          name: company.company_name,
          company_uuid: company.company_uuid,
          company_description: company.company_description,
          company_value: company.company_value,
          company_logo_url: company.company_logo_url,
          company_base_url: company.company_base_url,
          created_at: company.created_at,
          updated_at: company.updated_at
        }, {
          onConflict: 'company_uuid'
        });

      if (error) {
        console.error('Error syncing company:', error);
        throw new Error(`Failed to sync company: ${company.company_name}`);
      }
    }
  };

  const syncVacanciesToSupabase = async (vacancies: JobVacancy[]) => {
    console.log('Syncing vacancies to Supabase:', vacancies);
    
    for (const vacancy of vacancies) {
      const { error } = await supabase
        .from('vacancies')
        .upsert({
          vacancy_uuid: vacancy.uuid,
          title: vacancy.name,
          description: vacancy.description,
          company_uuid: vacancy.company_uuid,
          search_url: vacancy.company_base_url,
          note_sent: Boolean(vacancy.outreach_message),
          salary_min: vacancy.minimum_salary,
          salary_max: vacancy.maximum_salary,
          vacancy_type: vacancy.work_type,
          vacancy_location: vacancy.location_type,
          vacancy_description: vacancy.description,
          created_at: vacancy.created_at,
          updated_at: vacancy.updated_at
        }, {
          onConflict: 'vacancy_uuid'
        });

      if (error) {
        console.error('Error syncing vacancy:', error);
        throw new Error(`Failed to sync vacancy: ${vacancy.name}`);
      }
    }
  };

  const syncCandidatesToSupabase = async (candidates: Candidate[], vacancyId: number) => {
    console.log('Syncing candidates to Supabase:', candidates);
    
    for (const candidate of candidates) {
      const { error } = await supabase
        .from('candidates')
        .upsert({
          candidates_name: candidate.name,
          profile_url: candidate.resume_file_url,
          note_sent: `${candidate.job_title} - ${candidate.category.join(', ')}`,
          connection_status: candidate.status === 1 ? 'active' : 'inactive',
          search_url: candidate.resume_file_url,
          created_at: candidate.created_at
        }, {
          onConflict: 'id',
          ignoreDuplicates: true
        });

      if (error) {
        console.error('Error syncing candidate:', error);
        throw new Error(`Failed to sync candidate: ${candidate.name}`);
      }
    }
  };

  const syncAllData = async (companies: Company[], jobVacancies: JobVacancy[], candidates: Candidate[], selectedVacancyId: number) => {
    try {
      setSyncing(true);
      
      console.log('Starting data sync to Supabase...');
      
      // Sync companies
      await syncCompaniesToSupabase(companies);
      toast({
        title: "Companies synced",
        description: `${companies.length} companies synced successfully`,
      });

      // Sync vacancies
      await syncVacanciesToSupabase(jobVacancies);
      toast({
        title: "Vacancies synced",
        description: `${jobVacancies.length} vacancies synced successfully`,
      });

      // Sync candidates
      await syncCandidatesToSupabase(candidates, selectedVacancyId);
      toast({
        title: "Candidates synced",
        description: `${candidates.length} candidates synced successfully`,
      });

      toast({
        title: "Sync completed",
        description: "All data has been successfully synced to Supabase",
      });

    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Failed to sync data",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncAllData,
    syncing
  };
};
