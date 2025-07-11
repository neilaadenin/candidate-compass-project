
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Plus, Edit, Trash2, ExternalLink, RefreshCw, Download, Search } from "lucide-react";
import { useState } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanyForm } from "@/components/CompanyForm";
import { Input } from "@/components/ui/input";
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

export default function CompanyPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { 
    companies, 
    loading, 
    error, 
    syncing,
    createCompany, 
    updateCompany, 
    deleteCompany,
    fetchAndSyncCompanies
  } = useCompanies();

  const handleCreateCompany = async (data: {
    name: string;
    company_description?: string;
    company_value?: string;
    company_logo_url?: string;
    company_base_url?: string;
  }) => {
    setIsSubmitting(true);
    try {
      await createCompany(data);
      setIsFormOpen(false);
      setSelectedCompany(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCompany = async (data: {
    name: string;
    company_description?: string;
    company_value?: string;
    company_logo_url?: string;
    company_base_url?: string;
  }) => {
    if (!selectedCompany) return;
    
    setIsSubmitting(true);
    try {
      await updateCompany(selectedCompany.company_uuid, data);
      setIsFormOpen(false);
      setSelectedCompany(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    
    setIsSubmitting(true);
    try {
      const success = await deleteCompany(companyToDelete.company_uuid);
      if (success) {
        setIsDeleteDialogOpen(false);
        setCompanyToDelete(null);
      }
      // If not successful, the dialog stays open and user sees the error message
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSyncFromAPI = async () => {
    try {
      await fetchAndSyncCompanies({
        limit: 50, // Fetch more companies
        sort: 'id asc',
        search: searchTerm || undefined
      });
    } catch (error) {
      // Error handling is done in the hook
      console.error('Sync failed:', error);
    }
  };

  const openCreateForm = () => {
    setSelectedCompany(null);
    setIsFormOpen(true);
  };

  const openEditForm = (company: Company) => {
    setSelectedCompany(company);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (company: Company) => {
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.company_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.company_value?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
          <p className="text-gray-600 mt-1">Manage companies with full CRUD operations and API sync</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleSyncFromAPI} 
            variant="outline"
            className="flex items-center gap-2" 
            disabled={syncing}
          >
            <Download className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing from API...' : 'Sync from API'}
          </Button>
          <Button onClick={openCreateForm} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Company
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search companies by name, description, or value..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setSearchTerm('')}
              disabled={!searchTerm}
            >
              Clear
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Error Loading Companies
              </h3>
              <p className="text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Companies List */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            <CardTitle>Companies</CardTitle>
            <Badge variant="secondary">{filteredCompanies.length} companies</Badge>
            {searchTerm && (
              <Badge variant="outline">
                Filtered from {companies.length} total
              </Badge>
            )}
          </div>
          <CardDescription>
            Manage all companies in the system. Sync data from external API or manage manually.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading companies...</p>
            </div>
          ) : filteredCompanies.length > 0 ? (
            <div className="grid gap-4">
              {filteredCompanies.map((company) => (
                <Card key={company.company_uuid} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {company.company_logo_url && (
                          <img 
                            src={company.company_logo_url} 
                            alt={`${company.name} logo`}
                            className="w-8 h-8 rounded object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <h3 className="font-semibold text-lg">{company.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {company.company_uuid.slice(0, 8)}...
                        </Badge>
                      </div>
                      
                      {company.company_description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">{company.company_description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                        {company.company_value && (
                          <div>
                            <span className="font-medium">Value:</span> 
                            <span className="line-clamp-1">{company.company_value}</span>
                          </div>
                        )}
                        {company.company_base_url && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Website:</span>
                            <a 
                              href={company.company_base_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              Visit
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 text-xs text-gray-400">
                        <div>Created: {formatDate(company.created_at)}</div>
                        <div>Updated: {formatDate(company.updated_at)}</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditForm(company)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(company)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No companies found' : 'No companies found'}
              </h3>
              <p>
                {searchTerm 
                  ? 'Try adjusting your search terms or clear the search to see all companies.'
                  : 'Get started by syncing companies from the API or creating your first company manually.'
                }
              </p>
              {!searchTerm && (
                <div className="flex gap-2 justify-center mt-4">
                  <Button onClick={handleSyncFromAPI} disabled={syncing}>
                    <Download className="h-4 w-4 mr-2" />
                    Sync from API
                  </Button>
                  <Button variant="outline" onClick={openCreateForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Manually
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Form Modal */}
      <CompanyForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCompany(null);
        }}
        onSubmit={selectedCompany ? handleUpdateCompany : handleCreateCompany}
        company={selectedCompany}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{companyToDelete?.name}"? This action cannot be undone and will also delete any related records (vacancies, interview schedules, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCompany}
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
