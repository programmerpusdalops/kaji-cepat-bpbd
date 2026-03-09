import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDisasterReportById } from "@/services/apiService";
import { StatusBadge } from "@/components/StatusBadge";
import { DisasterMap } from "@/components/DisasterMap";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle, MapPin, Clock, User, FileText } from "lucide-react";
import type { DisasterReport } from "@/dummy-data/reports";

// TODO: GET /api/disaster-reports/{id}

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<DisasterReport | null>(null);

  useEffect(() => {
    if (id) getDisasterReportById(Number(id)).then(r => setReport(r || null));
  }, [id]);

  if (!report) return <div className="flex items-center justify-center h-64 text-muted-foreground">Memuat data...</div>;

  const mapPoint = { id: report.id, lat: report.latitude, lng: report.longitude, jenis_bencana: report.disaster_type, status: report.status, lokasi: report.location };

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <div>
          <h1 className="page-title">{report.report_code}</h1>
          <p className="page-subtitle">{report.disaster_type} - {report.village}, {report.regency}</p>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="stat-card space-y-4">
          <h3 className="font-semibold text-foreground">Informasi Kejadian</h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3"><FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><span className="text-muted-foreground">Jenis Bencana</span><p className="font-medium">{report.disaster_type}</p></div></div>
            <div className="flex gap-3"><Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><span className="text-muted-foreground">Waktu Kejadian</span><p className="font-medium">{new Date(report.report_time).toLocaleString("id-ID")}</p></div></div>
            <div className="flex gap-3"><MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><span className="text-muted-foreground">Lokasi</span><p className="font-medium">{report.location}, {report.village}, {report.district}, {report.regency}</p></div></div>
            <div className="flex gap-3"><User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><span className="text-muted-foreground">Sumber Laporan</span><p className="font-medium">{report.report_source}</p></div></div>
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

      {report.status === "NEW" && (
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
