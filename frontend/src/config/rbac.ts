/**
 * RBAC Configuration — Role-Based Access Control
 *
 * Single source of truth for menu visibility AND route access.
 * To add a new menu/route, simply add an entry to `menuConfig`.
 * To add a new role, just include it in the `roles` array of relevant items.
 */

import {
  LayoutDashboard, FileText, CheckCircle, Users2, ClipboardList,
  BarChart3, AlertTriangle, Map, FileBarChart, Settings, Database, MapPinned,
  Send,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ───────── Types ─────────

export type Role = "ADMIN" | "PUSDALOPS" | "TRC" | "PIMPINAN";

export interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: Role[];
}

// ───────── Menu Configuration ─────────

export const menuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    roles: ["ADMIN", "PUSDALOPS", "TRC", "PIMPINAN"],
  },
  {
    title: "Kaji Cepat",
    url: "/kaji-cepat",
    icon: Send,
    roles: ["ADMIN", "PUSDALOPS"],
  },
  {
    title: "Penugasan Tim",
    url: "/team-assignment",
    icon: Users2,
    roles: ["ADMIN", "PUSDALOPS"],
  },
  {
    title: "Kaji Cepat Lapangan",
    url: "/field-assessment",
    icon: ClipboardList,
    roles: ["ADMIN", "TRC"],
  },
  {
    title: "Data Dampak Bencana",
    url: "/impact",
    icon: BarChart3,
    roles: ["ADMIN", "PUSDALOPS", "TRC", "PIMPINAN"],
  },
  {
    title: "Kebutuhan Mendesak",
    url: "/emergency-needs",
    icon: AlertTriangle,
    roles: ["ADMIN", "PUSDALOPS", "TRC"],
  },
  {
    title: "Peta Bencana",
    url: "/disaster-map",
    icon: Map,
    roles: ["ADMIN", "PUSDALOPS", "PIMPINAN"],
  },
  {
    title: "Laporan",
    url: "/generate-reports",
    icon: FileBarChart,
    roles: ["ADMIN", "PUSDALOPS", "PIMPINAN"],
  },
  {
    title: "Peta Kolaboratif",
    url: "/collaborative-map",
    icon: MapPinned,
    roles: ["ADMIN", "PUSDALOPS", "TRC"],
  },
  {
    title: "Manajemen User",
    url: "/users",
    icon: Settings,
    roles: ["ADMIN"],
  },
  {
    title: "Data Master",
    url: "/master-data",
    icon: Database,
    roles: ["ADMIN"],
  },
];

// ───────── Helpers ─────────

/**
 * Get menu items visible to a specific role
 */
export const getMenuForRole = (role: string): MenuItem[] =>
  menuConfig.filter(item => item.roles.includes(role as Role));

/**
 * Check if a role can access a given route path
 * Dashboard ("/") is always accessible. Detail routes (e.g. /reports/:id)
 * inherit the parent permission.
 */
export const hasRouteAccess = (role: string | undefined, path: string): boolean => {
  if (!role) return false;

  // Dashboard always accessible
  if (path === "/") return true;

  // Find matching menu item — support nested routes (e.g. /reports/5)
  const match = menuConfig.find(item => {
    if (item.url === "/") return false; // skip dashboard for prefix matching
    return path === item.url || path.startsWith(item.url + "/");
  });

  // If no matching menu config found, deny by default
  if (!match) return false;

  return match.roles.includes(role as Role);
};
