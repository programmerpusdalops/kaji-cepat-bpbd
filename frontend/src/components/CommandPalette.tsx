/**
 * CommandPalette — Global search & quick-action modal
 *
 * Triggered via Cmd+K / Ctrl+K or the header search button.
 * Uses the cmdk library (already installed) for fuzzy search.
 * Filters items by the current user's role via RBAC.
 */

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { menuConfig, type Role } from "@/config/rbac";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Plus, FileText, Users, Search, ArrowRight,
} from "lucide-react";

/** Quick actions available in the palette */
const quickActions = [
  {
    label: "Buat Kaji Cepat Baru",
    icon: Plus,
    url: "/kaji-cepat/new",
    roles: ["ADMIN", "PUSDALOPS"] as Role[],
  },
  {
    label: "Buat Assessment Lapangan",
    icon: FileText,
    url: "/field-assessment",
    roles: ["ADMIN", "TRC"] as Role[],
  },
  {
    label: "Kelola Penugasan Tim",
    icon: Users,
    url: "/team-assignment",
    roles: ["ADMIN", "PUSDALOPS"] as Role[],
  },
];

export function CommandPalette() {
  const { open, setOpen, close } = useCommandPalette();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role as Role;

  const handleSelect = (url: string) => {
    close();
    navigate(url);
  };

  // Filter menu items by current user role
  const navItems = menuConfig.filter(
    item => item.roles.includes(role) && item.url !== "/"
  );

  // Filter quick actions by role
  const actions = quickActions.filter(a => a.roles.includes(role));

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Cari halaman, aksi, atau fitur..." />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
            <Search className="h-8 w-8 opacity-40" />
            <p className="text-sm">Tidak ditemukan.</p>
            <p className="text-xs">Coba kata kunci lain.</p>
          </div>
        </CommandEmpty>

        {/* Quick Actions */}
        {actions.length > 0 && (
          <CommandGroup heading="Aksi Cepat">
            {actions.map(action => (
              <CommandItem
                key={action.url}
                onSelect={() => handleSelect(action.url)}
                className="gap-3 py-2.5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <action.icon className="h-4 w-4" />
                </div>
                <span className="flex-1 font-medium">{action.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-aria-selected:opacity-100 transition-opacity" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Navigation */}
        <CommandGroup heading="Navigasi">
          {navItems.map(item => (
            <CommandItem
              key={item.url}
              onSelect={() => handleSelect(item.url)}
              className="gap-3 py-2"
            >
              <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
