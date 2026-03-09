import {
  LayoutDashboard, FileText, CheckCircle, Users2, ClipboardList,
  BarChart3, AlertTriangle, Map, FileBarChart, Settings, Database, LogOut
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Laporan Kejadian", url: "/reports", icon: FileText },
  { title: "Verifikasi Laporan", url: "/verification", icon: CheckCircle },
  { title: "Penugasan Tim", url: "/team-assignment", icon: Users2 },
  { title: "Kaji Cepat Lapangan", url: "/field-assessment", icon: ClipboardList },
  { title: "Data Dampak Bencana", url: "/impact", icon: BarChart3 },
  { title: "Kebutuhan Mendesak", url: "/emergency-needs", icon: AlertTriangle },
  { title: "Peta Bencana", url: "/disaster-map", icon: Map },
  { title: "Laporan", url: "/generate-reports", icon: FileBarChart },
  { title: "Manajemen User", url: "/users", icon: Settings },
  { title: "Data Master", url: "/master-data", icon: Database },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="flex h-14 items-center gap-2 px-4 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <AlertTriangle className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && <span className="font-bold text-sidebar-primary-foreground text-sm">PUSDALOPS BPBD</span>}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink to={item.url} end className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && user && (
          <div className="mb-2 px-1">
            <p className="text-xs font-medium text-sidebar-foreground">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/50">{user.role}</p>
          </div>
        )}
        <SidebarMenuButton onClick={logout} className="hover:bg-sidebar-accent text-sidebar-foreground/70">
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Keluar</span>}
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
