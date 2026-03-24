import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRapidAssessments, deleteRapidAssessment, generateWAMessage } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Eye, Pencil, Trash2, Send, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function KajiCepatPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMsg, setPreviewMsg] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getRapidAssessments(statusFilter !== "ALL" ? { status: statusFilter } : undefined);
      setAssessments(data || []);
    } catch {
      toast.error("Gagal memuat data kaji cepat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [statusFilter]);

  const filtered = assessments.filter(a => {
    const text = `${a.disaster_type_name} ${a.regency} ${a.district}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const handlePreview = async (id: number) => {
    try {
      setPreviewLoading(true);
      setPreviewOpen(true);
      const data = await generateWAMessage(id);
      setPreviewMsg(data.message);
    } catch {
      toast.error("Gagal generate pesan WA");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(previewMsg);
    toast.success("Pesan berhasil disalin");
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteRapidAssessment(id);
      toast.success("Data kaji cepat berhasil dihapus");
      setDeleteConfirm(null);
      loadData();
    } catch {
      toast.error("Gagal menghapus data");
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Kaji Cepat</h1>
            <p className="page-subtitle">Buat dan kelola laporan kaji cepat bencana</p>
          </div>
          <Button onClick={() => navigate("/kaji-cepat/new")} className="gap-2">
            <Plus className="h-4 w-4" /> Buat Kaji Cepat
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div className="stat-card p-4">
          <div className="text-2xl font-bold">{assessments.length}</div>
          <div className="text-xs text-muted-foreground">Total Kaji Cepat</div>
        </div>
        <div className="stat-card p-4">
          <div className="text-2xl font-bold text-amber-500">{assessments.filter(a => a.status === "DRAFT").length}</div>
          <div className="text-xs text-muted-foreground">Draft</div>
        </div>
        <div className="stat-card p-4">
          <div className="text-2xl font-bold text-green-500">{assessments.filter(a => a.status === "SENT").length}</div>
          <div className="text-xs text-muted-foreground">Terkirim</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari berdasarkan jenis, kabupaten..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SENT">Terkirim</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="stat-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-3 font-medium text-muted-foreground">Jenis Bencana</th>
              <th className="p-3 font-medium text-muted-foreground">Lokasi</th>
              <th className="p-3 font-medium text-muted-foreground hidden md:table-cell">Waktu Kejadian</th>
              <th className="p-3 font-medium text-muted-foreground hidden sm:table-cell">Status</th>
              <th className="p-3 font-medium text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Belum ada data kaji cepat</td></tr>
            ) : filtered.map(a => (
              <tr key={a.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                <td className="p-3 font-medium">{a.disaster_type_name}</td>
                <td className="p-3">
                  <div>Kab. {a.regency}</div>
                  <div className="text-xs text-muted-foreground">Kec. {a.district}</div>
                </td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">{formatDate(a.waktu_kejadian)}</td>
                <td className="p-3 hidden sm:table-cell">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    a.status === "SENT" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}>
                    {a.status === "SENT" ? "Terkirim" : "Draft"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" title="Lihat Preview WA" onClick={() => handlePreview(a.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Edit" onClick={() => navigate(`/kaji-cepat/${a.id}/edit`)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Hapus" className="text-destructive" onClick={() => setDeleteConfirm(a.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* WA Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Send className="h-5 w-5" /> Preview Pesan WhatsApp</DialogTitle>
          </DialogHeader>
          {previewLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg max-h-[60vh] overflow-auto font-sans">
              {previewMsg}
            </pre>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Tutup</Button>
            <Button onClick={handleCopy} className="gap-2">
              <Copy className="h-4 w-4" /> Salin Pesan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Kaji Cepat?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Data yang sudah dihapus tidak dapat dikembalikan.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
