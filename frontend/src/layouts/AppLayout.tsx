/**
 * AppLayout — Layout Router
 *
 * Selects the correct layout shell based on the current user's role:
 *   - TRC → MobileLayout (bottom nav, mobile-first)
 *   - ADMIN / PUSDALOPS / PIMPINAN → AdminLayout (sidebar, desktop)
 */

import { useAuth } from "@/context/AuthContext";
import { getLayoutForRole } from "@/config/rbac";
import { AdminLayout } from "@/layouts/AdminLayout";
import { MobileLayout } from "@/layouts/MobileLayout";

export function AppLayout() {
  const { user } = useAuth();
  const layout = getLayoutForRole(user?.role || "");

  if (layout === "mobile") {
    return <MobileLayout />;
  }

  return <AdminLayout />;
}
