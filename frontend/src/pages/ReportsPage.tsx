import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDisasterReports } from "@/services/apiService";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Search } from "lucide-react";
import type { DisasterReport } from "@/dummy-data/reports";

// TODO: GET /api/disaster-reports

export default function ReportsPage() {
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => { getDisasterReports().then(setReports); }, []);

  const filtered = reports.filter(r => {
    const matchSearch = r.report_code.toLowerCase().includes(search.toLowerCase()) || r.disaster_type.toLowerCase().includes(search.toLowerCase()) || r.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Laporan Kejadian</h1>
        <p className="page-subtitle">Daftar laporan bencana yang masuk</p>
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
            <SelectItem value="NEW">Baru</SelectItem>
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
              <th className="p-3 font-medium text-muted-foreground hidden md:table-cell">Lokasi</th>
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
                <td className="p-3 hidden md:table-cell">{r.village}, {r.regency}</td>
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
    </div>
  );
}
