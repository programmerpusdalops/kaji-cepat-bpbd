import { useEffect, useState, useMemo } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "@/services/apiService";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Users, UserCheck, Search, ShieldCheck } from "lucide-react";

// ───────── Types ─────────
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  instansi: string | null;
  is_active: boolean;
  created_at: string;
}

type UserFormData = {
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  instansi: string;
};

const EMPTY_FORM: UserFormData = { name: "", email: "", password: "", role: "", phone: "", instansi: "" };
const ROLES = ["ADMIN", "PUSDALOPS", "TRC", "PIMPINAN"] as const;

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  PUSDALOPS: "bg-blue-100 text-blue-700",
  TRC: "bg-orange-100 text-orange-700",
  PIMPINAN: "bg-emerald-100 text-emerald-700",
};

// ───────── Component ─────────
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Search / filter
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ── Fetch users ──
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch {
      toast.error("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ── Derived data ──
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = search === "" ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.instansi || "").toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.is_active).length,
    admin: users.filter(u => u.role === "ADMIN").length,
    trc: users.filter(u => u.role === "TRC").length,
  }), [users]);

  // ── Form validation ──
  const validateForm = (isEdit = false): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 3) errors.name = "Nama minimal 3 karakter";
    if (!isEdit) {
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Email tidak valid";
      if (!form.password || form.password.length < 8) errors.password = "Password minimal 8 karakter";
    }
    if (!form.role) errors.role = "Role wajib dipilih";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Handlers ──
  const handleCreate = async () => {
    if (!validateForm(false)) return;
    setSubmitting(true);
    try {
      await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        phone: form.phone.trim() || null,
        instansi: form.instansi.trim() || null,
      });
      toast.success("User berhasil dibuat");
      setCreateOpen(false);
      setForm(EMPTY_FORM);
      setFormErrors({});
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!validateForm(true) || !selectedUser) return;
    setSubmitting(true);
    try {
      await updateUser(selectedUser.id, {
        name: form.name.trim(),
        role: form.role,
        phone: form.phone.trim() || null,
        instansi: form.instansi.trim() || null,
      });
      toast.success("User berhasil diperbarui");
      setEditOpen(false);
      setSelectedUser(null);
      setForm(EMPTY_FORM);
      setFormErrors({});
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await deleteUser(selectedUser.id);
      toast.success("User berhasil dinonaktifkan");
      setDeleteOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Gagal menonaktifkan user");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role, phone: user.phone || "", instansi: user.instansi || "" });
    setFormErrors({});
    setEditOpen(true);
  };

  const openDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  // ── Render helpers ──
  const renderFormFields = (isEdit = false) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="user-name">Nama Lengkap <span className="text-destructive">*</span></Label>
        <Input id="user-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Masukkan nama lengkap" />
        {formErrors.name && <p className="text-xs text-destructive mt-1">{formErrors.name}</p>}
      </div>
      {!isEdit && (
        <>
          <div>
            <Label htmlFor="user-email">Email <span className="text-destructive">*</span></Label>
            <Input id="user-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contoh@email.com" />
            {formErrors.email && <p className="text-xs text-destructive mt-1">{formErrors.email}</p>}
          </div>
          <div>
            <Label htmlFor="user-password">Password <span className="text-destructive">*</span></Label>
            <Input id="user-password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Minimal 8 karakter" />
            {formErrors.password && <p className="text-xs text-destructive mt-1">{formErrors.password}</p>}
          </div>
        </>
      )}
      <div>
        <Label>Role <span className="text-destructive">*</span></Label>
        <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
          <SelectTrigger><SelectValue placeholder="Pilih role..." /></SelectTrigger>
          <SelectContent>
            {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        {formErrors.role && <p className="text-xs text-destructive mt-1">{formErrors.role}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="user-phone">No. Telepon</Label>
          <Input id="user-phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="08xxxxxxxxxx" />
        </div>
        <div>
          <Label htmlFor="user-instansi">Instansi</Label>
          <Input id="user-instansi" value={form.instansi} onChange={e => setForm(f => ({ ...f, instansi: e.target.value }))} placeholder="Nama instansi" />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Manajemen User</h1>
          <p className="page-subtitle">Kelola pengguna sistem BPBD</p>
        </div>
        <Button onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); setCreateOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Tambah User
        </Button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5"><Users className="h-5 w-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Total User</p><p className="text-xl font-bold">{stats.total}</p></div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2.5"><UserCheck className="h-5 w-5 text-emerald-600" /></div>
          <div><p className="text-xs text-muted-foreground">User Aktif</p><p className="text-xl font-bold">{stats.active}</p></div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="rounded-lg bg-purple-500/10 p-2.5"><ShieldCheck className="h-5 w-5 text-purple-600" /></div>
          <div><p className="text-xs text-muted-foreground">Admin</p><p className="text-xl font-bold">{stats.admin}</p></div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="rounded-lg bg-orange-500/10 p-2.5"><Users className="h-5 w-5 text-orange-600" /></div>
          <div><p className="text-xs text-muted-foreground">Tim TRC</p><p className="text-xl font-bold">{stats.trc}</p></div>
        </div>
      </div>

      {/* ── Search & Filter ── */}
      <div className="stat-card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari nama, email, atau instansi..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Role</SelectItem>
              {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Users Table ── */}
      <div className="stat-card overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Memuat data...</span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left text-muted-foreground font-medium">Nama</th>
                <th className="p-3 text-left text-muted-foreground font-medium">Email</th>
                <th className="p-3 text-left text-muted-foreground font-medium hidden sm:table-cell">Role</th>
                <th className="p-3 text-left text-muted-foreground font-medium hidden md:table-cell">Instansi</th>
                <th className="p-3 text-left text-muted-foreground font-medium hidden lg:table-cell">Telepon</th>
                <th className="p-3 text-left text-muted-foreground font-medium">Status</th>
                <th className="p-3 text-right text-muted-foreground font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">{search || roleFilter !== "ALL" ? "Tidak ada user yang cocok" : "Belum ada data user"}</td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    <div className="font-medium">{u.name}</div>
                  </td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3 hidden sm:table-cell">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[u.role] || "bg-gray-100 text-gray-700"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{u.instansi || "—"}</td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground">{u.phone || "—"}</td>
                  <td className="p-3"><StatusBadge status={u.is_active ? "ACTIVE" : "INACTIVE"} /></td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(u)} title="Edit user">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {u.is_active && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => openDelete(u)} title="Nonaktifkan user">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filteredUsers.length > 0 && (
          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            Menampilkan {filteredUsers.length} dari {users.length} user
          </div>
        )}
      </div>

      {/* ── Create User Dialog ── */}
      <Dialog open={createOpen} onOpenChange={o => { if (!o) { setFormErrors({}); } setCreateOpen(o); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah User Baru</DialogTitle>
            <DialogDescription>Buat akun pengguna baru untuk sistem BPBD</DialogDescription>
          </DialogHeader>
          {renderFormFields(false)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>Batal</Button>
            <Button onClick={handleCreate} disabled={submitting} className="gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit User Dialog ── */}
      <Dialog open={editOpen} onOpenChange={o => { if (!o) { setFormErrors({}); setSelectedUser(null); } setEditOpen(o); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Perbarui data pengguna <strong>{selectedUser?.name}</strong></DialogDescription>
          </DialogHeader>
          {renderFormFields(true)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={submitting}>Batal</Button>
            <Button onClick={handleEdit} disabled={submitting} className="gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Perbarui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nonaktifkan User?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menonaktifkan <strong>{selectedUser?.name}</strong> ({selectedUser?.email}). User yang dinonaktifkan tidak akan bisa login ke sistem. Aksi ini dapat di-restore oleh admin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={submitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Ya, Nonaktifkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
