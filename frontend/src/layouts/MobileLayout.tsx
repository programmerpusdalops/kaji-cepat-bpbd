/**
 * MobileLayout — Mobile-first bottom navigation layout
 *
 * Used for: TRC (Tim Reaksi Cepat)
 * Features: Bottom nav bar with glassmorphism, compact header,
 *           thumb-friendly touch targets, haptic feedback on nav
 */

import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { NetworkStatusBar } from "@/components/NetworkStatusBar";
import { mobileNavConfig } from "@/config/rbac";
import { Moon, Sun, Bell, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

/** Provide haptic vibration feedback if supported */
function haptic(pattern: number | number[] = 10) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

export function MobileLayout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Check active tab
  const isActive = (url: string) => {
    if (url === "/") return location.pathname === "/";
    return location.pathname === url || location.pathname.startsWith(url + "/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NetworkStatusBar />

      {/* ── Compact Top Header ── */}
      <header className="h-14 flex items-center justify-between px-4 border-b bg-card/80 glass sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-sm">
            <span className="text-primary-foreground text-xs font-bold">KC</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-none">KajiCepat</p>
            <p className="text-[10px] text-muted-foreground">TRC BPBD</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { toggle(); haptic(); }}
            className="h-8 w-8 text-muted-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
          </Button>

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.role}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">Profil Saya</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/digital-cv">CV Digital</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1 overflow-auto p-4 pb-24 animate-fade-in">
        <Outlet />
      </main>

      {/* ── Bottom Navigation ── */}
      <nav className="fixed bottom-0 inset-x-0 z-40 glass-nav safe-bottom">
        <div
          className="flex items-center justify-around h-16"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {mobileNavConfig.map((item) => {
            const active = isActive(item.url);
            const Icon = item.icon;

            return (
              <button
                key={item.url}
                onClick={() => {
                  haptic();
                  navigate(item.url);
                }}
                className={`
                  relative flex flex-col items-center justify-center gap-0.5
                  w-16 h-14 rounded-xl transition-all duration-200
                  ${active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {/* Active indicator pill */}
                {active && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-primary animate-scale-in" />
                )}
                <Icon className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`} />
                <span className={`text-[10px] leading-none font-medium ${active ? "font-semibold" : ""}`}>
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
