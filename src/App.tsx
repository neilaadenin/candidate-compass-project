
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./layouts/AdminLayout";
import CompanyPage from "./pages/admin/CompanyPage";
import VacancyPage from "./pages/admin/VacancyPage";
import CandidatePage from "./pages/admin/CandidatePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/company" element={
            <AdminLayout>
              <CompanyPage />
            </AdminLayout>
          } />
          <Route path="/admin/vacancy" element={
            <AdminLayout>
              <VacancyPage />
            </AdminLayout>
          } />
          <Route path="/admin/candidate" element={
            <AdminLayout>
              <CandidatePage />
            </AdminLayout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
