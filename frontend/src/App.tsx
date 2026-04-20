import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { hasRouteAccess } from "@/config/rbac";
import { AppLayout } from "@/layouts/AppLayout";
import { CommandPalette } from "@/components/CommandPalette";
import { lazy, Suspense } from "react";

// ── Eager loads (critical path) ──
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ForbiddenPage from "@/pages/ForbiddenPage";
import NotFound from "@/pages/NotFound";

// ── Lazy loads (code splitting for performance) ──
const TeamAssignmentPage = lazy(() => import("@/pages/TeamAssignmentPage"));
const FieldAssessmentPage = lazy(() => import("@/pages/FieldAssessmentPage"));
const ImpactPage = lazy(() => import("@/pages/ImpactPage"));
const EmergencyNeedsPage = lazy(() => import("@/pages/EmergencyNeedsPage"));
const DisasterMapPage = lazy(() => import("@/pages/DisasterMapPage"));
const GenerateReportsPage = lazy(() => import("@/pages/GenerateReportsPage"));
const UsersPage = lazy(() => import("@/pages/UsersPage"));
const MasterDataPage = lazy(() => import("@/pages/MasterDataPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const CollaborativeMapPage = lazy(() => import("@/pages/CollaborativeMapPage"));
const PublicMapPage = lazy(() => import("@/pages/PublicMapPage"));
const KajiCepatPage = lazy(() => import("@/pages/KajiCepatPage"));
const KajiCepatFormPage = lazy(() => import("@/pages/KajiCepatFormPage"));

// ── New pages (Phase 5 & 6) ──
const FeedsPage = lazy(() => import("@/pages/admin/FeedsPage"));
const ResourceTrackingPage = lazy(() => import("@/pages/admin/ResourceTrackingPage"));
const GamificationPage = lazy(() => import("@/pages/trc/GamificationPage"));
const DigitalCVPage = lazy(() => import("@/pages/trc/DigitalCVPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 min cache
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ── Suspense fallback ──
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Memuat halaman...</p>
      </div>
    </div>
  );
}

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
    <>
      {/* Command Palette — global, rendered outside routes */}
      {isAuthenticated && <CommandPalette />}

      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          {/* Dashboard & Profile — accessible to all authenticated users */}
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />

          {/* Role-protected routes */}
          <Route path="kaji-cepat" element={<RoleRoute><Suspense fallback={<PageLoader />}><KajiCepatPage /></Suspense></RoleRoute>} />
          <Route path="kaji-cepat/new" element={<RoleRoute><Suspense fallback={<PageLoader />}><KajiCepatFormPage /></Suspense></RoleRoute>} />
          <Route path="kaji-cepat/:id/edit" element={<RoleRoute><Suspense fallback={<PageLoader />}><KajiCepatFormPage /></Suspense></RoleRoute>} />
          <Route path="team-assignment" element={<RoleRoute><Suspense fallback={<PageLoader />}><TeamAssignmentPage /></Suspense></RoleRoute>} />
          <Route path="field-assessment" element={<RoleRoute><Suspense fallback={<PageLoader />}><FieldAssessmentPage /></Suspense></RoleRoute>} />
          <Route path="impact" element={<RoleRoute><Suspense fallback={<PageLoader />}><ImpactPage /></Suspense></RoleRoute>} />
          <Route path="emergency-needs" element={<RoleRoute><Suspense fallback={<PageLoader />}><EmergencyNeedsPage /></Suspense></RoleRoute>} />
          <Route path="disaster-map" element={<RoleRoute><Suspense fallback={<PageLoader />}><DisasterMapPage /></Suspense></RoleRoute>} />
          <Route path="collaborative-map" element={<RoleRoute><Suspense fallback={<PageLoader />}><CollaborativeMapPage /></Suspense></RoleRoute>} />
          <Route path="generate-reports" element={<RoleRoute><Suspense fallback={<PageLoader />}><GenerateReportsPage /></Suspense></RoleRoute>} />
          <Route path="users" element={<RoleRoute><Suspense fallback={<PageLoader />}><UsersPage /></Suspense></RoleRoute>} />
          <Route path="master-data" element={<RoleRoute><Suspense fallback={<PageLoader />}><MasterDataPage /></Suspense></RoleRoute>} />

          {/* New Phase 5 routes — Admin-only */}
          <Route path="feeds" element={<RoleRoute><Suspense fallback={<PageLoader />}><FeedsPage /></Suspense></RoleRoute>} />
          <Route path="resource-tracking" element={<RoleRoute><Suspense fallback={<PageLoader />}><ResourceTrackingPage /></Suspense></RoleRoute>} />

          {/* New Phase 6 routes — TRC-only */}
          <Route path="gamification" element={<RoleRoute><Suspense fallback={<PageLoader />}><GamificationPage /></Suspense></RoleRoute>} />
          <Route path="digital-cv" element={<RoleRoute><Suspense fallback={<PageLoader />}><DigitalCVPage /></Suspense></RoleRoute>} />
        </Route>
        {/* Public map — no auth required, outside AppLayout */}
        <Route path="/public-map/:assessmentId/:slug?" element={<PublicMapPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
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
