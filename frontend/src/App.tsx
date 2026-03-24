import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { hasRouteAccess } from "@/config/rbac";
import { AppLayout } from "@/layouts/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import TeamAssignmentPage from "@/pages/TeamAssignmentPage";
import FieldAssessmentPage from "@/pages/FieldAssessmentPage";
import ImpactPage from "@/pages/ImpactPage";
import EmergencyNeedsPage from "@/pages/EmergencyNeedsPage";
import DisasterMapPage from "@/pages/DisasterMapPage";
import GenerateReportsPage from "@/pages/GenerateReportsPage";
import UsersPage from "@/pages/UsersPage";
import MasterDataPage from "@/pages/MasterDataPage";
import ForbiddenPage from "@/pages/ForbiddenPage";
import ProfilePage from "@/pages/ProfilePage";
import CollaborativeMapPage from "@/pages/CollaborativeMapPage";
import PublicMapPage from "@/pages/PublicMapPage";
import KajiCepatPage from "@/pages/KajiCepatPage";
import KajiCepatFormPage from "@/pages/KajiCepatFormPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

/** Redirects to /login if not authenticated */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Shows ForbiddenPage if the user's role cannot access the current path */
function RoleRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!hasRouteAccess(user?.role, location.pathname)) {
    return <ForbiddenPage />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        {/* Dashboard & Profile — accessible to all authenticated users */}
        <Route index element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Role-protected routes */}
        <Route path="kaji-cepat" element={<RoleRoute><KajiCepatPage /></RoleRoute>} />
        <Route path="kaji-cepat/new" element={<RoleRoute><KajiCepatFormPage /></RoleRoute>} />
        <Route path="kaji-cepat/:id/edit" element={<RoleRoute><KajiCepatFormPage /></RoleRoute>} />
        <Route path="team-assignment" element={<RoleRoute><TeamAssignmentPage /></RoleRoute>} />
        <Route path="field-assessment" element={<RoleRoute><FieldAssessmentPage /></RoleRoute>} />
        <Route path="impact" element={<RoleRoute><ImpactPage /></RoleRoute>} />
        <Route path="emergency-needs" element={<RoleRoute><EmergencyNeedsPage /></RoleRoute>} />
        <Route path="disaster-map" element={<RoleRoute><DisasterMapPage /></RoleRoute>} />
        <Route path="collaborative-map" element={<RoleRoute><CollaborativeMapPage /></RoleRoute>} />
        <Route path="generate-reports" element={<RoleRoute><GenerateReportsPage /></RoleRoute>} />
        <Route path="users" element={<RoleRoute><UsersPage /></RoleRoute>} />
        <Route path="master-data" element={<RoleRoute><MasterDataPage /></RoleRoute>} />
      </Route>
      {/* Public map — no auth required, outside AppLayout */}
      <Route path="/public-map/:assessmentId/:slug?" element={<PublicMapPage />} />
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
