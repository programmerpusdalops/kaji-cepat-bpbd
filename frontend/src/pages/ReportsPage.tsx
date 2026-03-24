import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDisasterReports, createDisasterReport, getDisasterTypes, type DisasterReport } from "@/services/apiService";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Eye, Search, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ReportsPage() {
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const navigate = useNavigate();

  // -- Add form state
  const [showForm, setShowForm] = useState(false);
  const [disasterTypes, setDisasterTypes] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    disaster_type_id: "",
    reporter_name: "",
    report_source: "INTERNAL",
    description: "",
    latitude: "",
    longitude: "",
    report_time: new Date().toISOString().slice(0, 16),
  });

  const loadReports = () => {
    getDisasterReports().then(setReports).catch(() => {});
  };

  useEffect(() => {
    loadReports();
    getDisasterTypes().then(setDisasterTypes).catch(() => {});
  }, []);

  const filtered = reports.filter(r => {
    const matchSearch = r.report_code.toLowerCase().includes(search.toLowerCase()) || r.disaster_type.toLowerCase().includes(search.toLowerCase()) || (r.description || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSubmit = async () => {
    if (!form.disaster_type_id) { toast.error("Jenis bencana wajib dipilih"); return; }
    if (!form.reporter_name.trim()) { toast.error("Nama pelapor wajib diisi"); return; }
    if (!form.description.trim()) { toast.error("Deskripsi wajib diisi"); return; }

    try {
      setSaving(true);
      await createDisasterReport({
        disaster_type_id: Number(form.disaster_type_id),
        reporter_name: form.reporter_name.trim(),
        report_source: form.report_source,
        description: form.description.trim(),
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        report_time: form.report_time || new Date().toISOString(),
      });
      toast.success("Laporan kejadian berhasil ditambahkan");
      setShowForm(false);
      setForm({
        disaster_type_id: "",
        reporter_name: "",
        report_source: "INTERNAL",
        description: "",
        latitude: "",
        longitude: "",
        report_time: new Date().toISOString().slice(0, 16),
      });
      loadReports();
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan laporan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Laporan Kejadian</h1>
            <p className="page-subtitle">Daftar laporan bencana yang masuk</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Tambah Kejadian
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari laporan..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value="PENDING">Baru</SelectItem>
            <SelectItem value="VERIFIED">Terverifikasi</SelectItem>
            <SelectItem value="REJECTED">Ditolak</SelectItem>
            <SelectItem value="MONITORING">Monitoring</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="stat-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-3 font-medium text-muted-foreground">Kode</th>
              <th className="p-3 font-medium text-muted-foreground">Jenis</th>
              <th className="p-3 font-medium text-muted-foreground hidden md:table-cell">Pelapor</th>
              <th className="p-3 font-medium text-muted-foreground hidden lg:table-cell">Tanggal</th>
              <th className="p-3 font-medium text-muted-foreground hidden lg:table-cell">Sumber</th>
              <th className="p-3 font-medium text-muted-foreground">Status</th>
              <th className="p-3 font-medium text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Tidak ada data laporan</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                <td className="p-3 font-medium">{r.report_code}</td>
                <td className="p-3">{r.disaster_type}</td>
                <td className="p-3 hidden md:table-cell">{r.reporter_name}</td>
                <td className="p-3 hidden lg:table-cell">{new Date(r.report_time).toLocaleDateString("id-ID")}</td>
                <td className="p-3 hidden lg:table-cell">{r.report_source}</td>
                <td className="p-3"><StatusBadge status={r.status} /></td>
                <td className="p-3">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/reports/${r.id}`)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tambah Kejadian Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" /> Tambah Laporan Kejadian
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Jenis Bencana *</Label>
                <Select value={form.disaster_type_id} onValueChange={v => setForm(f => ({ ...f, disaster_type_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Pilih jenis..." /></SelectTrigger>
                  <SelectContent>
                    {disasterTypes.map((t: any) => (
                      <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Sumber Laporan</Label>
                <Select value={form.report_source} onValueChange={v => setForm(f => ({ ...f, report_source: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INTERNAL">Internal</SelectItem>
                    <SelectItem value="MASYARAKAT">Masyarakat</SelectItem>
                    <SelectItem value="MEDIA">Media</SelectItem>
                    <SelectItem value="INSTANSI">Instansi Lain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Nama Pelapor *</Label>
              <Input
                value={form.reporter_name}
                onChange={e => setForm(f => ({ ...f, reporter_name: e.target.value }))}
                placeholder="Nama pelapor"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi Kejadian *</Label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Jelaskan kejadian bencana..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Latitude</Label>
                <Input
                  type="number" step="any"
                  value={form.latitude}
                  onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
                  placeholder="-1.43"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Longitude</Label>
                <Input
                  type="number" step="any"
                  value={form.longitude}
                  onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
                  placeholder="121.45"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Waktu Kejadian</Label>
              <Input
                type="datetime-local"
                value={form.report_time}
                onChange={e => setForm(f => ({ ...f, report_time: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
