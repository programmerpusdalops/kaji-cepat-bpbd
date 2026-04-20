/**
 * RBAC Configuration — Role-Based Access Control
 *
 * Single source of truth for menu visibility, route access, and layout selection.
 * To add a new menu/route, simply add an entry to `menuConfig`.
 * To add a new role, just include it in the `roles` array of relevant items.
 */

import {
  LayoutDashboard, FileText, CheckCircle, Users2, ClipboardList,
  BarChart3, AlertTriangle, Map, FileBarChart, Settings, Database, MapPinned,
  Send, Newspaper, Package, Trophy, IdCard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ───────── Types ─────────

export type Role = "ADMIN" | "PUSDALOPS" | "TRC" | "PIMPINAN";

/** Layout type: which shell renders around the page */
export type LayoutType = "admin" | "mobile";

export interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: Role[];
  /** Which layout this item belongs to. Items with "both" show in both layouts. */
  layout?: "admin" | "mobile" | "both";
}

// ───────── Menu Configuration ─────────

export const menuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    roles: ["ADMIN", "PUSDALOPS", "TRC", "PIMPINAN"],
    layout: "both",
  },
  {
    title: "Kaji Cepat",
    url: "/kaji-cepat",
    icon: Send,
    roles: ["ADMIN", "PUSDALOPS"],
    layout: "both",
  },
  {
    title: "Penugasan Tim",
    url: "/team-assignment",
    icon: Users2,
    roles: ["ADMIN", "PUSDALOPS", "PIMPINAN"],
    layout: "admin",
  },
  {
    title: "Kaji Cepat Lapangan",
    url: "/field-assessment",
    icon: ClipboardList,
    roles: ["ADMIN", "TRC"],
    layout: "both",
  },
  {
    title: "Data Dampak Bencana",
    url: "/impact",
    icon: BarChart3,
    roles: ["ADMIN", "PUSDALOPS", "TRC", "PIMPINAN"],
    layout: "admin",
  },
  {
    title: "Kebutuhan Mendesak",
    url: "/emergency-needs",
    icon: AlertTriangle,
    roles: ["ADMIN", "PUSDALOPS", "TRC"],
    layout: "admin",
  },
  {
    title: "Laporan",
    url: "/generate-reports",
    icon: FileBarChart,
    roles: ["ADMIN", "PUSDALOPS", "TRC", "PIMPINAN"],
    layout: "both",
  },
  {
    title: "Peta Kolaboratif",
    url: "/collaborative-map",
    icon: MapPinned,
    roles: ["ADMIN", "PUSDALOPS", "TRC"],
    layout: "both",
  },
  // ── Admin-only ──
  {
    title: "Feed & Moderasi",
    url: "/feeds",
    icon: Newspaper,
    roles: ["ADMIN"],
    layout: "admin",
  },
  {
    title: "Tracking Logistik",
    url: "/resource-tracking",
    icon: Package,
    roles: ["ADMIN"],
    layout: "admin",
  },
  {
    title: "Manajemen User",
    url: "/users",
    icon: Settings,
    roles: ["ADMIN"],
    layout: "admin",
  },
  {
    title: "Data Master",
    url: "/master-data",
    icon: Database,
    roles: ["ADMIN"],
    layout: "admin",
  },
  // ── TRC-only ──
  {
    title: "Jam Terbang",
    url: "/gamification",
    icon: Trophy,
    roles: ["TRC"],
    layout: "mobile",
  },
  {
    title: "CV Digital",
    url: "/digital-cv",
    icon: IdCard,
    roles: ["TRC"],
    layout: "mobile",
  },
];

// ───────── Mobile Bottom Navigation Config ─────────

/** Bottom nav items for TRC mobile layout (max 5) */
export interface MobileNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export const mobileNavConfig: MobileNavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Kaji Cepat", url: "/field-assessment", icon: ClipboardList },
  { title: "Peta", url: "/collaborative-map", icon: MapPinned },
  { title: "Laporan", url: "/generate-reports", icon: FileBarChart },
  { title: "Profil", url: "/profile", icon: IdCard },
];

// ───────── Layout Resolver ─────────

/** Determine which layout shell to use for a given role */
export const getLayoutForRole = (role: string): LayoutType => {
  if (role === "TRC") return "mobile";
  return "admin";
};

// ───────── Helpers ─────────

/**
 * Get menu items visible to a specific role (for admin sidebar)
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

  // Dashboard & Profile always accessible
  if (path === "/" || path === "/profile") return true;

  // Find matching menu item — support nested routes (e.g. /kaji-cepat/5/edit)
  const match = menuConfig.find(item => {
    if (item.url === "/") return false; // skip dashboard for prefix matching
    return path === item.url || path.startsWith(item.url + "/");
  });

  // If no matching menu config found, deny by default
  if (!match) return false;

  return match.roles.includes(role as Role);
};
