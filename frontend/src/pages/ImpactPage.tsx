import { useState, useEffect } from "react";
import { getDisasterImpact } from "@/services/apiService";
import { Loader2, AlertTriangle, Users, Home, Activity } from "lucide-react";

export default function ImpactPage() {
  const [impactData, setImpactData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getDisasterImpact();
        setImpactData(data);
      } catch (error) {
        console.error("Failed to fetch impact data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalKorban = impactData.reduce((acc, curr) => acc + (curr.meninggal + curr.hilang + curr.luka_berat + curr.luka_ringan), 0);
  const totalPengungsi = impactData.reduce((acc, curr) => acc + curr.pengungsi, 0);
  const totalRumah = impactData.reduce((acc, curr) => acc + (curr.rumah_berat + curr.rumah_sedang + curr.rumah_ringan), 0);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Dampak Bencana</h1>
        <p className="page-subtitle">Rekapitulasi dampak bencana meliputi korban jiwa, pengungsi, dan kerusakan dari hasil Kaji Cepat Lapanagan.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Memuat data dampak bencana...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="stat-card flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg"><Activity className="h-6 w-6" /></div>
              <div><p className="text-sm text-muted-foreground font-medium">Total Korban Jiwa/Luka</p><h3 className="text-2xl font-bold">{totalKorban.toLocaleString()}</h3></div>
            </div>
            <div className="stat-card flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Users className="h-6 w-6" /></div>
              <div><p className="text-sm text-muted-foreground font-medium">Total Pengungsi</p><h3 className="text-2xl font-bold">{totalPengungsi.toLocaleString()}</h3></div>
            </div>
            <div className="stat-card flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-lg"><Home className="h-6 w-6" /></div>
              <div><p className="text-sm text-muted-foreground font-medium">Rumah Rusak</p><h3 className="text-2xl font-bold">{totalRumah.toLocaleString()}</h3></div>
            </div>
          </div>

          <div className="stat-card overflow-hidden">
            <h3 className="font-semibold mb-4 text-primary flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Rincian Dampak per Lokasi Bencana
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="p-3 text-left font-medium">Lokasi / Detail Laporan</th>
                    <th className="p-3 text-center font-medium bg-red-50/50 dark:bg-red-950/20">Meninggal</th>
                    <th className="p-3 text-center font-medium bg-red-50/50 dark:bg-red-950/20">Hilang</th>
                    <th className="p-3 text-center font-medium bg-yellow-50/50 dark:bg-yellow-950/20">Luka Berat</th>
                    <th className="p-3 text-center font-medium bg-yellow-50/50 dark:bg-yellow-950/20">Luka Ringan</th>
                    <th className="p-3 text-center font-medium bg-blue-50/50 dark:bg-blue-950/20">Pengungsi</th>
                    <th className="p-3 text-center font-medium bg-orange-50/50 dark:bg-orange-950/20">RB</th>
                    <th className="p-3 text-center font-medium bg-orange-50/50 dark:bg-orange-950/20">RS</th>
                    <th className="p-3 text-center font-medium bg-orange-50/50 dark:bg-orange-950/20">RR</th>
                  </tr>
                </thead>
                <tbody>
                  {impactData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">
                        Belum ada laporan bencana dengan detail dampak kejadian.
                      </td>
                    </tr>
                  ) : (
                    impactData.map((impact) => (
                      <tr key={impact.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-primary">{impact.lokasi}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{impact.report_code}</span>
                            <span className="text-xs text-muted-foreground">{impact.disaster_type}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center font-semibold text-red-600">{impact.meninggal}</td>
                        <td className="p-3 text-center font-medium">{impact.hilang}</td>
                        <td className="p-3 text-center font-medium text-amber-600">{impact.luka_berat}</td>
                        <td className="p-3 text-center font-medium">{impact.luka_ringan}</td>
                        <td className="p-3 text-center font-bold text-blue-600">{impact.pengungsi}</td>
                        <td className="p-3 text-center font-bold text-red-500">{impact.rumah_berat}</td>
                        <td className="p-3 text-center font-medium text-orange-500">{impact.rumah_sedang}</td>
                        <td className="p-3 text-center font-medium text-yellow-500">{impact.rumah_ringan}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex gap-4 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border">
              <div><strong>Keterangan Rumah Rusak:</strong></div>
              <div className="flex gap-4">
                <span><strong className="text-red-500">RB</strong>: Rusak Berat</span>
                <span><strong className="text-orange-500">RS</strong>: Rusak Sedang</span>
                <span><strong className="text-yellow-500">RR</strong>: Rusak Ringan</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
