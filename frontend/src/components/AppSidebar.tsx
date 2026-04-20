/**
 * AppSidebar — Premium sidebar for AdminLayout
 *
 * Features: glassmorphism, smooth collapse, role-filtered menu,
 * user card in footer, animated active states
 */

import { AlertTriangle, LogOut, ChevronRight } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getMenuForRole } from "@/config/rbac";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { logout, user } = useAuth();

  // Filter menu items based on user role
  const visibleMenu = getMenuForRole(user?.role || "");

  const isActive = (url: string) => {
    if (url === "/") return location.pathname === "/";
    return location.pathname === url || location.pathname.startsWith(url + "/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* ── Branding ── */}
      <div className="flex h-14 items-center gap-3 px-4 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-md shrink-0">
          <AlertTriangle className="h-4.5 w-4.5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <p className="font-bold text-sidebar-primary-foreground text-sm leading-none">
              PUSDALOPS
            </p>
            <p className="text-[10px] text-sidebar-foreground/50 mt-0.5">
              BPBD Sulawesi Tengah
            </p>
          </div>
        )}
      </div>

      {/* ── Menu ── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider font-semibold">
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenu.map(item => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                    >
                      <NavLink
                        to={item.url}
                        end
                        className={`
                          group relative flex items-center gap-3 rounded-lg px-3 py-2
                          transition-all duration-200 ease-out
                          ${active
                            ? "bg-sidebar-accent text-sidebar-primary font-medium"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                          }
                        `}
                        activeClassName=""
                      >
                        {/* Active indicator bar */}
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-sidebar-primary animate-scale-in" />
                        )}
                        <item.icon className={`h-4 w-4 shrink-0 transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-105"}`} />
                        {!collapsed && (
                          <span className="text-sm">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && user && (
          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-lg p-2 mb-2 hover:bg-sidebar-accent/50 transition-colors group"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0 shadow-sm">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/40">{user.role}</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground/30 group-hover:text-sidebar-foreground/60 transition-colors" />
          </Link>
        )}
        <SidebarMenuButton
          onClick={logout}
          className="hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Keluar</span>}
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
