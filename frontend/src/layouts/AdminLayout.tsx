/**
 * AdminLayout — Desktop-first sidebar layout
 *
 * Used for: ADMIN, PUSDALOPS, PIMPINAN
 * Features: Collapsible sidebar, header with theme toggle,
 *           command palette trigger, notification bell, user avatar
 */

import { Outlet, Link, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { NetworkStatusBar } from "@/components/NetworkStatusBar";
import {
  Bell, Moon, Sun, Search, ChevronRight, Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Simple breadcrumb from current path */
function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const labels: Record<string, string> = {
    "kaji-cepat": "Kaji Cepat",
    "team-assignment": "Penugasan Tim",
    "field-assessment": "Kaji Cepat Lapangan",
    impact: "Dampak Bencana",
    "emergency-needs": "Kebutuhan Mendesak",
    "collaborative-map": "Peta Kolaboratif",
    "generate-reports": "Laporan",
    users: "Manajemen User",
    "master-data": "Data Master",
    feeds: "Feed & Moderasi",
    "resource-tracking": "Tracking Logistik",
    profile: "Profil",
    new: "Baru",
    edit: "Edit",
  };

  return (
    <nav className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
      <Link to="/" className="hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((seg, i) => {
        const label = labels[seg] || seg;
        const isLast = i === segments.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 opacity-40" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <span>{label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  // Emit custom event to open command palette
  const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <NetworkStatusBar />

          {/* ── Header ── */}
          <header className="h-14 flex items-center justify-between border-b bg-card/80 glass px-4 shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Breadcrumbs />
              <span className="text-sm font-medium text-muted-foreground md:hidden">
                Sistem Kaji Cepat
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Command Palette trigger */}
              <Button
                variant="ghost"
                size="sm"
                onClick={openCommandPalette}
                className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground h-8 px-3"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="text-xs">Cari...</span>
                <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </Button>

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
              </Button>

              {/* User avatar dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden sm:flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-xs font-bold shadow-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-sm font-medium text-foreground leading-none">{user?.name}</p>
                      <p className="text-[11px] text-muted-foreground">{user?.role}</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profil Saya</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive"
                  >
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* ── Page Content ── */}
          <main className="flex-1 overflow-auto p-4 md:p-6 animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
