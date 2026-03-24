import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getProfile, updateProfile, changePassword } from "@/services/apiService";
import { toast } from "sonner";
import { User, Mail, Phone, Building2, Shield, Calendar, Loader2, Save, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  instansi: string | null;
  created_at: string;
}

const roleBadgeColors: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  PUSDALOPS: "bg-blue-100 text-blue-700",
  TRC: "bg-green-100 text-green-700",
  PIMPINAN: "bg-purple-100 text-purple-700",
};

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  PUSDALOPS: "Operator Pusdalops",
  TRC: "Tim Reaksi Cepat",
  PIMPINAN: "Pimpinan",
};

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // -- Profile form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [instansi, setInstansi] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // -- Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
      setName(data.name || "");
      setPhone(data.phone || "");
      setInstansi(data.instansi || "");
    } catch {
      toast.error("Gagal memuat data profil");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }
    try {
      setSavingProfile(true);
      const updated = await updateProfile({ name: name.trim(), phone: phone.trim() || undefined, instansi: instansi.trim() || undefined });
      setProfile(updated);
      // Update localStorage so sidebar/header reflects new name
      const stored = localStorage.getItem("bpbd_user");
      if (stored) {
        const userObj = JSON.parse(stored);
        userObj.name = updated.name;
        userObj.phone = updated.phone;
        userObj.instansi = updated.instansi;
        localStorage.setItem("bpbd_user", JSON.stringify(userObj));
      }
      toast.success("Profil berhasil diperbarui");
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui profil");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error("Password lama wajib diisi");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    try {
      setSavingPassword(true);
      await changePassword({ currentPassword, newPassword });
      toast.success("Password berhasil diubah. Silakan login ulang.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Log out after password change for security
      setTimeout(() => logout(), 2000);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah password");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Profil Saya</h1>
        <p className="text-muted-foreground">Kelola informasi profil dan keamanan akun Anda</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Avatar Banner */}
        <div className="h-24 bg-gradient-to-r from-primary/80 to-primary/40" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-6">
            <div className="h-20 w-20 rounded-full border-4 border-card bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
              {profile?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-semibold">{profile?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeColors[profile?.role || ""] || "bg-gray-100 text-gray-700"}`}>
                  <Shield className="h-3 w-3" />
                  {roleLabels[profile?.role || ""] || profile?.role}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Bergabung {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }) : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Info readonly */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{profile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm font-medium">{roleLabels[profile?.role || ""] || profile?.role}</p>
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <User className="h-4 w-4" /> Informasi Pribadi
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="profile-name">Nama Lengkap</Label>
                <Input id="profile-name" value={name} onChange={e => setName(e.target.value)} placeholder="Masukkan nama" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-phone">No. Telepon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="profile-phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" className="pl-9" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-instansi">Instansi</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="profile-instansi" value={instansi} onChange={e => setInstansi(e.target.value)} placeholder="Nama instansi" className="pl-9" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleUpdateProfile} disabled={savingProfile}>
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4" /> Ubah Password
        </h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current-pw">Password Lama</Label>
            <div className="relative">
              <Input
                id="current-pw"
                type={showCurrentPw ? "text" : "password"}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Masukkan password lama"
              />
              <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-pw">Password Baru</Label>
              <div className="relative">
                <Input
                  id="new-pw"
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-pw">Konfirmasi Password Baru</Label>
              <Input
                id="confirm-pw"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
              />
            </div>
          </div>
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-destructive">Password baru dan konfirmasi tidak cocok</p>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleChangePassword} disabled={savingPassword}>
              {savingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
              Ubah Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
