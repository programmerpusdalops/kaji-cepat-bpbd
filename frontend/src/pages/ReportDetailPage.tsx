import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDisasterReportById, type DisasterReport } from "@/services/apiService";
import { StatusBadge } from "@/components/StatusBadge";
import { DisasterMap } from "@/components/DisasterMap";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle, MapPin, Clock, User, FileText } from "lucide-react";

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<DisasterReport | null>(null);

  useEffect(() => {
    if (id) getDisasterReportById(Number(id)).then(setReport).catch(() => { });
  }, [id]);

  if (!report) return <div className="flex items-center justify-center h-64 text-muted-foreground">Memuat data...</div>;

  const mapPoint = { id: report.id, lat: report.latitude, lng: report.longitude, jenis_bencana: report.disaster_type, status: report.status, lokasi: report.description?.substring(0, 50) || report.report_code };

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <div>
          <h1 className="page-title">{report.report_code}</h1>
          <p className="page-subtitle">{report.disaster_type} - {report.reporter_name}</p>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="stat-card space-y-4">
          <h3 className="font-semibold text-foreground">Informasi Kejadian</h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3"><FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><span className="text-muted-foreground">Jenis Bencana</span><p className="font-medium">{report.disaster_type}</p></div></div>
            <div className="flex gap-3"><Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><span className="text-muted-foreground">Waktu Kejadian</span><p className="font-medium">{new Date(report.report_time).toLocaleString("id-ID")}</p></div></div>
            <div className="flex gap-3"><MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><span className="text-muted-foreground">Koordinat</span><p className="font-medium">{report.latitude}, {report.longitude}</p></div></div>
            <div className="flex gap-3"><User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><span className="text-muted-foreground">Pelapor / Sumber</span><p className="font-medium">{report.reporter_name} ({report.report_source})</p></div></div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Deskripsi</span>
            <p className="text-sm mt-1">{report.description}</p>
          </div>
        </div>

        <div className="stat-card">
          <h3 className="font-semibold text-foreground mb-4">Lokasi Peta</h3>
          <DisasterMap points={[mapPoint]} center={[report.latitude, report.longitude]} zoom={13} className="h-[300px]" />
        </div>
      </div>

      {/* Verification Logs */}
      {report.verification_logs && report.verification_logs.length > 0 && (
        <div className="stat-card mb-6">
          <h3 className="font-semibold text-foreground mb-4">Riwayat Verifikasi</h3>
          <div className="space-y-3">
            {report.verification_logs.map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <StatusBadge status={log.status} />
                <div className="flex-1 text-sm">
                  <p className="font-medium">{log.verifier_name}</p>
                  {log.notes && <p className="text-muted-foreground mt-1">{log.notes}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(log.created_at).toLocaleString("id-ID")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.status === "PENDING" && (
        <div className="flex gap-3">
          <Button onClick={() => navigate(`/verification?id=${report.id}`)}>
            <CheckCircle className="h-4 w-4 mr-2" /> Verifikasi
          </Button>
          <Button variant="destructive" onClick={() => navigate(`/verification?id=${report.id}&action=reject`)}>
            <XCircle className="h-4 w-4 mr-2" /> Tolak
          </Button>
        </div>
      )}
    </div>
  );
}
