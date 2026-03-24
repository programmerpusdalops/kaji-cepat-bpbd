import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDisasterReports,
  verifyReport,
  type DisasterReport,
} from "@/services/apiService";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Loader2,
  Clock,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function VerificationPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // -- Verify dialog state
  const [showVerify, setShowVerify] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DisasterReport | null>(
    null
  );
  const [verifyStatus, setVerifyStatus] = useState("VERIFIED");
  const [verifyNote, setVerifyNote] = useState("");
  const [saving, setSaving] = useState(false);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await getDisasterReports();
      setReports(data);
    } catch {
      toast.error("Gagal memuat data laporan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // -- Stats
  const countPending = reports.filter((r) => r.status === "PENDING").length;
  const countVerified = reports.filter((r) => r.status === "VERIFIED").length;
  const countRejected = reports.filter((r) => r.status === "REJECTED").length;

  // -- Filtering
  const filtered = reports.filter((r) => {
    const matchSearch =
      r.report_code.toLowerCase().includes(search.toLowerCase()) ||
      r.disaster_type.toLowerCase().includes(search.toLowerCase()) ||
      (r.reporter_name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // -- Open verify dialog
  const openVerifyDialog = (report: DisasterReport, action: "verify" | "reject") => {
    setSelectedReport(report);
    setVerifyStatus(action === "reject" ? "REJECTED" : "VERIFIED");
    setVerifyNote("");
    setShowVerify(true);
  };

  // -- Submit verification
  const handleVerify = async () => {
    if (!selectedReport) return;
    try {
      setSaving(true);
      await verifyReport(selectedReport.id, {
        status: verifyStatus,
        verification_note: verifyNote,
      });
      toast.success(
        verifyStatus === "VERIFIED"
          ? "Laporan berhasil diverifikasi"
          : verifyStatus === "REJECTED"
          ? "Laporan ditolak"
          : "Status laporan diperbarui"
      );
      setShowVerify(false);
      loadReports();
    } catch {
      toast.error("Gagal memverifikasi laporan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Verifikasi Laporan</h1>
        <p className="page-subtitle">
          Tinjau dan verifikasi laporan bencana yang masuk
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="stat-card flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{countPending}</p>
            <p className="text-xs text-muted-foreground">Menunggu Verifikasi</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{countVerified}</p>
            <p className="text-xs text-muted-foreground">Terverifikasi</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{countRejected}</p>
            <p className="text-xs text-muted-foreground">Ditolak</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari laporan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
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

      {/* Table */}
      <div className="stat-card overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Memuat data...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3 font-medium text-muted-foreground">Kode</th>
                <th className="p-3 font-medium text-muted-foreground">Jenis</th>
                <th className="p-3 font-medium text-muted-foreground hidden md:table-cell">
                  Pelapor
                </th>
                <th className="p-3 font-medium text-muted-foreground hidden lg:table-cell">
                  Tanggal
                </th>
                <th className="p-3 font-medium text-muted-foreground">Status</th>
                <th className="p-3 font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-muted-foreground"
                  >
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    Tidak ada laporan ditemukan
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3 font-medium">{r.report_code}</td>
                    <td className="p-3">{r.disaster_type}</td>
                    <td className="p-3 hidden md:table-cell">
                      {r.reporter_name}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      {new Date(r.report_time).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/reports/${r.id}`)}
                          title="Lihat Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {r.status === "PENDING" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openVerifyDialog(r, "verify")}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Verifikasi"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openVerifyDialog(r, "reject")}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Tolak"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Verify Dialog */}
      <Dialog open={showVerify} onOpenChange={setShowVerify}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Verifikasi Laporan
            </DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Kode:</span>{" "}
                  <span className="font-medium">
                    {selectedReport.report_code}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Jenis:</span>{" "}
                  {selectedReport.disaster_type}
                </p>
                <p>
                  <span className="text-muted-foreground">Pelapor:</span>{" "}
                  {selectedReport.reporter_name}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Status Verifikasi</Label>
                <Select value={verifyStatus} onValueChange={setVerifyStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VERIFIED">Terverifikasi</SelectItem>
                    <SelectItem value="REJECTED">Ditolak</SelectItem>
                    <SelectItem value="MONITORING">Monitoring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Catatan Verifikasi</Label>
                <Textarea
                  value={verifyNote}
                  onChange={(e) => setVerifyNote(e.target.value)}
                  placeholder="Tambahkan catatan verifikasi..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerify(false)}>
              Batal
            </Button>
            <Button onClick={handleVerify} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Simpan Verifikasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
