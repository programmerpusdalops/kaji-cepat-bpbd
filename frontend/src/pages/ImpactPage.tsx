import { useEffect, useState } from "react";
import { getDisasterImpact } from "@/services/apiService";

// TODO: GET /api/disaster-impact

export default function ImpactPage() {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => { getDisasterImpact().then(setData); }, []);

  const totals = data.reduce((acc, d) => ({
    meninggal: acc.meninggal + d.meninggal, luka: acc.luka + d.luka,
    pengungsi: acc.pengungsi + d.pengungsi, rusak_rumah: acc.rusak_rumah + d.rusak_rumah,
  }), { meninggal: 0, luka: 0, pengungsi: 0, rusak_rumah: 0 });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Data Dampak Bencana</h1>
        <p className="page-subtitle">Rekap dampak bencana seluruh wilayah</p>
      </div>
      <div className="stat-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left text-muted-foreground">Lokasi</th>
              <th className="p-3 text-right text-muted-foreground">Meninggal</th>
              <th className="p-3 text-right text-muted-foreground">Luka</th>
              <th className="p-3 text-right text-muted-foreground">Pengungsi</th>
              <th className="p-3 text-right text-muted-foreground">Rusak Rumah</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                <td className="p-3 font-medium">{d.lokasi}</td>
                <td className="p-3 text-right">{d.meninggal}</td>
                <td className="p-3 text-right">{d.luka}</td>
                <td className="p-3 text-right">{d.pengungsi}</td>
                <td className="p-3 text-right">{d.rusak_rumah}</td>
              </tr>
            ))}
            <tr className="bg-muted/30 font-bold">
              <td className="p-3">TOTAL</td>
              <td className="p-3 text-right">{totals.meninggal}</td>
              <td className="p-3 text-right">{totals.luka}</td>
              <td className="p-3 text-right">{totals.pengungsi}</td>
              <td className="p-3 text-right">{totals.rusak_rumah}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
