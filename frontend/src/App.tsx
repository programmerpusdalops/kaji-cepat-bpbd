import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/layouts/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ReportsPage from "@/pages/ReportsPage";
import ReportDetailPage from "@/pages/ReportDetailPage";
import VerificationPage from "@/pages/VerificationPage";
import TeamAssignmentPage from "@/pages/TeamAssignmentPage";
import FieldAssessmentPage from "@/pages/FieldAssessmentPage";
import ImpactPage from "@/pages/ImpactPage";
import EmergencyNeedsPage from "@/pages/EmergencyNeedsPage";
import DisasterMapPage from "@/pages/DisasterMapPage";
import GenerateReportsPage from "@/pages/GenerateReportsPage";
import UsersPage from "@/pages/UsersPage";
import MasterDataPage from "@/pages/MasterDataPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reports/:id" element={<ReportDetailPage />} />
        <Route path="verification" element={<VerificationPage />} />
        <Route path="team-assignment" element={<TeamAssignmentPage />} />
        <Route path="field-assessment" element={<FieldAssessmentPage />} />
        <Route path="impact" element={<ImpactPage />} />
        <Route path="emergency-needs" element={<EmergencyNeedsPage />} />
        <Route path="disaster-map" element={<DisasterMapPage />} />
        <Route path="generate-reports" element={<GenerateReportsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="master-data" element={<MasterDataPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
