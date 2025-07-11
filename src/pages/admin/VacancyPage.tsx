import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Briefcase, Building2, RefreshCw, Plus, Edit, Trash2, MapPin, DollarSign, Clock } from "lucide-react"; 
import { useState, useMemo } from "react";
import { useVacancies } from "@/hooks/useVacancies";
import { useCompanies } from "@/hooks/useCompanies";
import { useStatistics } from "@/hooks/useStatistics";
import { useDataSync } from "@/hooks/useDataSync";
import { getCandidates } from "@/api/statistics";
import { VacancyForm } from "@/components/VacancyForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  companies: {
    id: number;
    name: string;
    company_uuid: string;
    created_at: string;
  };
}

export default function VacancyPage() {
  const [selectedCompanyUuid, setSelectedCompanyUuid] = useState("");
  const [selectedVacancyUuid, setSelectedVacancyUuid] = useState("");
  const [localCompanyFilter, setLocalCompanyFilter] = useState("all");
  const [localVacancyFilter, setLocalVacancyFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
  const [vacancyToDelete, setVacancyToDelete] = useState<Vacancy | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingFromApi, setIsFetchingFromApi] = useState(false);
  
  const { vacancies, loading: vacanciesLoading, refetch, createVacancy, updateVacancy, deleteVacancy } = useVacancies();
  const { companies: supabaseCompanies } = useCompanies();
  const {
    companies: apiCompanies,
    jobVacancies,
    fetchJobVacancies,
    fetchAllJobVacancies,
    loading: statisticsLoading
  } = useStatistics();
  const { syncAllData, syncJobVacancies, syncing } = useDataSync();

  console.log('VacancyPage - Current state:', {
    selectedCompanyUuid,
    selectedVacancyUuid,
    localCompanyFilter,
    apiCompanies: apiCompanies?.length || 0,
    jobVacancies: jobVacancies?.length || 0,
    vacancies: vacancies?.length || 0,
    supabaseCompanies: supabaseCompanies?.length || 0
  });

  // Filter vacancies berdasarkan company yang dipilih
  const filteredVacancies = useMemo(() => {
    let result = vacancies || [];
    if (localCompanyFilter !== "all") {
      result = result.filter(vacancy => 
        vacancy.companies?.name?.toLowerCase().includes(localCompanyFilter.toLowerCase())
      );
    }
    if (localVacancyFilter) {
      result = result.filter(vacancy => 
        (vacancy.title || vacancy.vacancy_title)?.toLowerCase().includes(localVacancyFilter.toLowerCase())
      );
    }
    return result;
  }, [vacancies, localCompanyFilter, localVacancyFilter]);

  // Get unique companies from vacancies for local filtering
  const availableCompanies = useMemo(() => {
    const companies = (vacancies || []).map(v => v.companies?.name).filter(Boolean);
    return [...new Set(companies)];
  }, [vacancies]);

  // Compute availableVacancies for the selected company
  const availableVacancies = useMemo(() => {
    if (localCompanyFilter === "all") return [];
    return (vacancies || [])
      .filter(v => v.companies?.name === localCompanyFilter)
      .map(v => v.title || v.vacancy_title)
      .filter(Boolean);
  }, [vacancies, localCompanyFilter]);

  // Get selected company object
  const selectedCompany = useMemo(() => {
    return apiCompanies.find(c => c.company_uuid === selectedCompanyUuid);
  }, [apiCompanies, selectedCompanyUuid]);

  // Get selected vacancy object
  const selectedVacancy = useMemo(() => {
    return jobVacancies.find(v => v.uuid === selectedVacancyUuid);
  }, [jobVacancies, selectedVacancyUuid]);

  const handleCompanySelect = async (companyUuid: string) => {
    console.log('Company selected with UUID:', companyUuid);
    setSelectedCompanyUuid(companyUuid);
    setSelectedVacancyUuid(""); // Reset vacancy selection
    
    if (companyUuid) {
      console.log('Fetching job vacancies for company UUID:', companyUuid);
      setIsFetchingFromApi(true);
      try {
        await fetchJobVacancies(companyUuid, { limit: 50 });
      } catch (error) {
        console.error('Error fetching job vacancies:', error);
      } finally {
        setIsFetchingFromApi(false);
      }
    }
  };

  const handleVacancySelect = (vacancyUuid: string) => {
    console.log('Vacancy selected with UUID:', vacancyUuid);
    setSelectedVacancyUuid(vacancyUuid);
  };

  const handleFetchAllVacanciesFromApi = async () => {
    console.log('Fetching all vacancies from API...');
    setIsFetchingFromApi(true);
    try {
      await fetchAllJobVacancies();
    } catch (error) {
      console.error('Error fetching all vacancies from API:', error);
    } finally {
      setIsFetchingFromApi(false);
    }
  };

  const handleSyncSpecificVacancy = async () => {
    if (!selectedCompany || !selectedVacancy) {
      console.error('Company or vacancy not selected');
      return;
    }

    try {
      console.log('Syncing specific vacancy:', { 
        company: selectedCompany.name, 
        vacancy: selectedVacancy.name 
      });
      await syncJobVacancies([selectedVacancy]);
      refetch();
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Error during specific vacancy sync:', error);
    }
  };

  const handleSyncAllVacancies = async () => {
    if (jobVacancies.length === 0) {
      console.error('No job vacancies to sync');
      return;
    }

    try {
      console.log('Syncing all vacancies:', jobVacancies.length);
      await syncJobVacancies(jobVacancies);
      refetch();
      console.log('All vacancies synced successfully');
    } catch (error) {
      console.error('Error syncing all vacancies:', error);
    }
  };

  const handleCreateVacancy = async (data: {
    title: string;
    description?: string;
    company_uuid: string;
    vacancy_location?: string;
    vacancy_requirement?: string;
    vacancy_type?: string;
    salary_min?: number;
    salary_max?: number;
    search_url?: string;
  }) => {
    setIsSubmitting(true);
    try {
      console.log('Creating vacancy with data:', data);
      await createVacancy(data);
      setIsFormOpen(false);
      setEditingVacancy(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateVacancy = async (data: {
    title: string;
    description?: string;
    company_uuid: string;
    vacancy_location?: string;
    vacancy_requirement?: string;
    vacancy_type?: string;
    salary_min?: number;
    salary_max?: number;
    search_url?: string;
  }) => {
    if (!editingVacancy) return;
    
    setIsSubmitting(true);
    try {
      await updateVacancy(editingVacancy.vacancy_uuid, data);
      setIsFormOpen(false);
      setEditingVacancy(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVacancy = async () => {
    if (!vacancyToDelete) return;
    
    setIsSubmitting(true);
    try {
      const success = await deleteVacancy(vacancyToDelete.vacancy_uuid);
      if (success) {
        setIsDeleteDialogOpen(false);
        setVacancyToDelete(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateForm = () => {
    setEditingVacancy(null);
    setIsFormOpen(true);
  };

  const openEditForm = (vacancy: Vacancy) => {
    setEditingVacancy(vacancy);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (vacancy: Vacancy) => {
    setVacancyToDelete(vacancy);
    setIsDeleteDialogOpen(true);
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vacancy Management</h1>
          <p className="text-gray-600 mt-1">Manage job vacancies and sync data from external sources</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleFetchAllVacanciesFromApi}
            disabled={isFetchingFromApi || statisticsLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetchingFromApi ? 'animate-spin' : ''}`} />
            {isFetchingFromApi ? 'Fetching...' : 'Fetch All from API'}
          </Button>
          <Button onClick={openCreateForm} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Vacancy
          </Button>
        </div>
      </div>

      {/* API Sync Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            API Data Sync
          </CardTitle>
          <CardDescription>
            Fetch and sync vacancy data from external API to your database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-500" />
            
            <Select value={selectedCompanyUuid} onValueChange={handleCompanySelect} disabled={isFetchingFromApi}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Company" />
              </SelectTrigger>
              <SelectContent>
                {apiCompanies.map((company) => (
                  <SelectItem key={company.company_uuid} value={company.company_uuid}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedVacancyUuid} 
              onValueChange={handleVacancySelect}
              disabled={!selectedCompanyUuid || jobVacancies.length === 0 || isFetchingFromApi}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Vacancy" />
              </SelectTrigger>
              <SelectContent>
                {jobVacancies.map((vacancy) => (
                  <SelectItem key={vacancy.uuid} value={vacancy.uuid}>
                    {vacancy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2 ml-auto">
              <Button 
                onClick={handleSyncAllVacancies}
                disabled={syncing || jobVacancies.length === 0}
                variant="secondary"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : `Sync All (${jobVacancies.length})`}
              </Button>
              <Button 
                onClick={handleSyncSpecificVacancy}
                disabled={syncing || !selectedCompany || !selectedVacancy}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Selected'}
              </Button>
            </div>
          </div>

          {/* Company Selection Info */}
          {selectedCompany && (
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <strong>Selected Company:</strong> {selectedCompany.name}
              {selectedVacancy && (
                <>
                  <br />
                  <strong>Selected Vacancy:</strong> {selectedVacancy.name}
                  {selectedVacancy.applicant_count !== undefined && (
                    <>
                      <br />
                      <strong>Applicants:</strong> {selectedVacancy.applicant_count}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* Loading state for API fetch */}
          {isFetchingFromApi && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Fetching data from API...</p>
            </div>
          )}

          {/* API Vacancy Results */}
          {jobVacancies.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">
                Available Vacancies from API ({jobVacancies.length})
              </h4>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {jobVacancies.map((vacancy) => (
                  <Card key={vacancy.uuid} className="p-3">
                    <div className="space-y-2">
                      <h5 className="font-semibold text-sm">{vacancy.name}</h5>
                      {vacancy.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">{vacancy.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {vacancy.location && (
                          <Badge variant="outline" className="text-xs">{vacancy.location}</Badge>
                        )}
                        {vacancy.type && (
                          <Badge variant="outline" className="text-xs">{vacancy.type}</Badge>
                        )}
                        {vacancy.category && (
                          <Badge variant="outline" className="text-xs">{vacancy.category}</Badge>
                        )}
                      </div>
                      {vacancy.applicant_count !== undefined && (
                        <div className="text-xs text-gray-500">
                          <strong>Applicants:</strong> {vacancy.applicant_count}
                        </div>
                      )}
                      {vacancy.skills && vacancy.skills.length > 0 && (
                        <div className="text-xs text-gray-500">
                          <strong>Skills:</strong> {vacancy.skills.slice(0, 3).join(', ')}
                          {vacancy.skills.length > 3 && '...'}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Local Database Filters */}
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filter Database:</span>
            <Select value={localCompanyFilter} onValueChange={setLocalCompanyFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {availableCompanies.map((companyName) => (
                  <SelectItem key={companyName} value={companyName}>
                    {companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={localVacancyFilter} 
              onValueChange={setLocalVacancyFilter}
              disabled={localCompanyFilter === "all" || availableVacancies.length === 0}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Vacancy" />
              </SelectTrigger>
              <SelectContent>
                {availableVacancies.map((vacancyTitle) => (
                  <SelectItem key={vacancyTitle} value={vacancyTitle}>
                    {vacancyTitle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(localCompanyFilter !== "all" || localVacancyFilter) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => { 
                  setLocalCompanyFilter("all"); 
                  setLocalVacancyFilter(""); 
                }}
              >
                Clear Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vacancy Database Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              <CardTitle>Vacancy Database</CardTitle>
              <Badge variant="secondary">{filteredVacancies.length} vacancies</Badge>
            </div>
          </div>
          <CardDescription>
            Current vacancies stored in Supabase database
            {localCompanyFilter !== "all" && (
              <span className="text-blue-600"> - Filtered by: {localCompanyFilter}</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(vacanciesLoading || statisticsLoading) ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading vacancies...</p>
            </div>
          ) : filteredVacancies.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {filteredVacancies.map((vacancy) => (
                <Card key={vacancy.vacancy_uuid} className="p-3 max-w-sm">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-sm line-clamp-1">{vacancy.title || vacancy.vacancy_title}</h3>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {vacancy.vacancy_uuid.slice(0, 6)}...
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-3 w-3 text-gray-500 shrink-0" />
                          <span className="text-gray-700 font-medium text-xs line-clamp-1">{vacancy.companies.name}</span>
                        </div>
                      </div>
                    </div>

                    {vacancy.description && (
                      <p className="text-gray-600 text-xs line-clamp-2">{vacancy.description}</p>
                    )}
                    
                    <div className="space-y-1 text-xs text-gray-500">
                      {vacancy.vacancy_location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">{vacancy.vacancy_location}</span>
                        </div>
                      )}
                      {vacancy.vacancy_type && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{vacancy.vacancy_type}</span>
                        </div>
                      )}
                      {formatSalary(vacancy.salary_min, vacancy.salary_max) && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span className="line-clamp-1">{formatSalary(vacancy.salary_min, vacancy.salary_max)}</span>
                        </div>
                      )}
                    </div>

                    {vacancy.vacancy_requirement && (
                      <div>
                        <h4 className="font-medium text-xs text-gray-700 mb-1">Requirements:</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{vacancy.vacancy_requirement}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="text-xs text-gray-400">
                        {formatDate(vacancy.created_at)}
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditForm(vacancy)}
                          className="flex items-center gap-1 h-6 px-2"
                        >
                          <Edit className="h-3 w-3" />
                          <span className="text-xs">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(vacancy)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 h-6 px-2"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="text-xs">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">
                {localCompanyFilter !== "all" ? 'No vacancies found for selected company' : 'No vacancies found'}
              </h3>
              <p>
                {localCompanyFilter !== "all" 
                  ? 'Try selecting a different company or clear the filter.' 
                  : 'Get started by creating your first vacancy or use the sync functionality above to import data.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vacancy Form Modal */}
      <VacancyForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingVacancy(null);
        }}
        onSubmit={editingVacancy ? handleUpdateVacancy : handleCreateVacancy}
        vacancy={editingVacancy}
        companies={(supabaseCompanies || []).map(company => ({
          id: company.id,
          name: company.name,
          company_uuid: company.company_uuid
        }))}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vacancy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{vacancyToDelete?.title || vacancyToDelete?.vacancy_title}"? This action cannot be undone and will also delete any related records (interview schedules, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteVacancy}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
