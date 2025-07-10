
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
  const [companyFilter, setCompanyFilter] = useState("");
  const [vacancyFilter, setVacancyFilter] = useState("");
  const [localCompanyFilter, setLocalCompanyFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [vacancyToDelete, setVacancyToDelete] = useState<Vacancy | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { vacancies, loading: vacanciesLoading, refetch, createVacancy, updateVacancy, deleteVacancy } = useVacancies();
  const { companies: supabaseCompanies } = useCompanies();
  const {
    companies,
    jobVacancies,
    getCompanyByName,
    fetchJobVacancies,
    loading: statisticsLoading
  } = useStatistics();
  const { syncAllData, syncing } = useDataSync();

  console.log('VacancyPage - Current state:', {
    companyFilter,
    vacancyFilter,
    localCompanyFilter,
    companies: companies.length,
    jobVacancies: jobVacancies.length,
    vacancies: vacancies.length,
    supabaseCompanies: supabaseCompanies.length
  });

  // Filter vacancies berdasarkan company yang dipilih
  const filteredVacancies = useMemo(() => {
    if (!localCompanyFilter) return vacancies;
    
    return vacancies.filter(vacancy => 
      vacancy.companies?.name?.toLowerCase().includes(localCompanyFilter.toLowerCase())
    );
  }, [vacancies, localCompanyFilter]);

  // Get unique companies from vacancies for local filtering
  const availableCompanies = useMemo(() => {
    const companies = vacancies.map(v => v.companies?.name).filter(Boolean);
    return [...new Set(companies)];
  }, [vacancies]);

  const handleCompanyFilterChange = async (companyName: string) => {
    console.log('Company filter changed to:', companyName);
    setCompanyFilter(companyName);
    setVacancyFilter("");
    
    const company = getCompanyByName(companyName);
    if (company) {
      console.log('Fetching vacancies for company:', company.company_uuid);
      await fetchJobVacancies(company.company_uuid);
    }
  };

  const handleVacancyFilterChange = (vacancyName: string) => {
    console.log('Vacancy filter changed to:', vacancyName);
    setVacancyFilter(vacancyName);
  };

  const handleLocalCompanyFilterChange = (companyName: string) => {
    console.log('Local company filter changed to:', companyName);
    setLocalCompanyFilter(companyName);
  };

  const handleSync = async () => {
    if (!companyFilter || !vacancyFilter) {
      return;
    }

    const company = getCompanyByName(companyFilter);
    const vacancy = jobVacancies.find(v => v.name === vacancyFilter);
    
    if (company && vacancy) {
      try {
        const candidatesData = await getCandidates(vacancy.uuid);
        await syncAllData([company], [vacancy], candidatesData, vacancy.id);
        refetch();
      } catch (error) {
        console.error('Error during sync:', error);
      }
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
      setSelectedVacancy(null);
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
    if (!selectedVacancy) return;
    
    setIsSubmitting(true);
    try {
      await updateVacancy(selectedVacancy.vacancy_uuid, data);
      setIsFormOpen(false);
      setSelectedVacancy(null);
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
    setSelectedVacancy(null);
    setIsFormOpen(true);
  };

  const openEditForm = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
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
        <Button onClick={openCreateForm} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Vacancy
        </Button>
      </div>

      {/* Filters and Sync Button */}
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700">Sync Filters:</span>
            <Select value={companyFilter} onValueChange={handleCompanyFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.company_name}>
                    {company.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={vacancyFilter} 
              onValueChange={handleVacancyFilterChange}
              disabled={!companyFilter}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Vacancy" />
              </SelectTrigger>
              <SelectContent>
                {jobVacancies.map((vacancy) => (
                  <SelectItem key={vacancy.id} value={vacancy.name}>
                    {vacancy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={handleSync}
              disabled={!companyFilter || !vacancyFilter || syncing}
              className="ml-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync to Supabase'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Local Filters for Database Vacancies */}
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filter Database:</span>
            <Select value={localCompanyFilter} onValueChange={handleLocalCompanyFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Companies</SelectItem>
                {availableCompanies.map((companyName) => (
                  <SelectItem key={companyName} value={companyName}>
                    {companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {localCompanyFilter && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocalCompanyFilter("")}
              >
                Clear Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Show message if no company/vacancy selected for sync */}
      {(!companyFilter || !vacancyFilter) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Briefcase className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Select Company and Vacancy to Sync
              </h3>
              <p className="text-blue-700">
                Choose both a company and vacancy from the filters above to sync external data to Supabase.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
            {localCompanyFilter && (
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredVacancies.map((vacancy) => (
                <Card key={vacancy.vacancy_uuid} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg line-clamp-1">{vacancy.title}</h3>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {vacancy.vacancy_uuid.slice(0, 8)}...
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-gray-500 shrink-0" />
                          <span className="text-gray-700 font-medium text-sm line-clamp-1">{vacancy.companies.name}</span>
                        </div>
                      </div>
                    </div>

                    {vacancy.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">{vacancy.description}</p>
                    )}
                    
                    <div className="space-y-2 text-xs text-gray-500">
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
                          className="flex items-center gap-1 h-7 px-2"
                        >
                          <Edit className="h-3 w-3" />
                          <span className="text-xs">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(vacancy)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 h-7 px-2"
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
                {localCompanyFilter ? 'No vacancies found for selected company' : 'No vacancies found'}
              </h3>
              <p>
                {localCompanyFilter 
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
          setSelectedVacancy(null);
        }}
        onSubmit={selectedVacancy ? handleUpdateVacancy : handleCreateVacancy}
        vacancy={selectedVacancy}
        companies={supabaseCompanies.map(company => ({
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
              Are you sure you want to delete "{vacancyToDelete?.title}"? This action cannot be undone and will also delete any related records (interview schedules, etc.).
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
