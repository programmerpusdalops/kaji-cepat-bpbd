import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyReport } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

// TODO: POST /api/disaster-reports/{id}/verify

export default function VerificationPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const reportId = params.get("id") || "";
  const [status, setStatus] = useState(params.get("action") === "reject" ? "REJECTED" : "VERIFIED");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyReport(Number(reportId), { status, verification_note: note, verified_by: "admin" });
      toast.success("Laporan berhasil diverifikasi");
      navigate("/reports");
    } catch {
      toast.error("Gagal memverifikasi laporan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
      </Button>
      <div className="page-header">
        <h1 className="page-title">Verifikasi Laporan</h1>
        <p className="page-subtitle">Laporan ID: {reportId || "Pilih dari halaman laporan"}</p>
      </div>
      <div className="stat-card max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Status Verifikasi</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="VERIFIED">Terverifikasi</SelectItem>
                <SelectItem value="REJECTED">Ditolak</SelectItem>
                <SelectItem value="MONITORING">Monitoring</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Catatan Verifikasi</Label>
            <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Tambahkan catatan..." rows={4} />
          </div>
          <Button type="submit" disabled={loading || !reportId}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Verifikasi
          </Button>
        </form>
      </div>
    </div>
  );
}
