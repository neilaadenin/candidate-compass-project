
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./layouts/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import CompanyPage from "./pages/admin/CompanyPage";
import VacancyPage from "./pages/admin/VacancyPage";
import CandidatePage from "./pages/admin/CandidatePage";
import StatisticsPage from "./pages/admin/StatisticsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Redirect root to admin dashboard */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Admin routes - all protected */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminLayout>
                  <DashboardPage />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/company" element={
              <ProtectedRoute>
                <AdminLayout>
                  <CompanyPage />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/vacancy" element={
              <ProtectedRoute>
                <AdminLayout>
                  <VacancyPage />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/candidate" element={
              <ProtectedRoute>
                <AdminLayout>
                  <CandidatePage />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/statistics" element={
              <ProtectedRoute>
                <AdminLayout>
                  <StatisticsPage />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
