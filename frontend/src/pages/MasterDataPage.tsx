import { useEffect, useState } from "react";
import { getMasterData } from "@/services/apiService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// TODO: GET /api/master-data

export default function MasterDataPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { getMasterData().then(setData); }, []);

  if (!data) return <div className="flex items-center justify-center h-64 text-muted-foreground">Memuat...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Data Master</h1>
        <p className="page-subtitle">Kelola data referensi sistem</p>
      </div>
      <Tabs defaultValue="disaster_types">
        <TabsList>
          <TabsTrigger value="disaster_types">Jenis Bencana</TabsTrigger>
          <TabsTrigger value="regions">Wilayah</TabsTrigger>
          <TabsTrigger value="agencies">Instansi</TabsTrigger>
          <TabsTrigger value="volunteers">Relawan</TabsTrigger>
        </TabsList>

        <TabsContent value="disaster_types" className="stat-card mt-4">
          <ul className="space-y-2">
            {data.disaster_types.map((t: string, i: number) => (
              <li key={i} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {t}
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="regions" className="stat-card mt-4">
          {data.regions.map((r: any, i: number) => (
            <div key={i} className="mb-4">
              <h4 className="font-medium mb-2">{r.province}</h4>
              <div className="flex flex-wrap gap-2">
                {r.regencies.map((reg: string) => (
                  <span key={reg} className="rounded-full bg-muted px-3 py-1 text-xs">{reg}</span>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="agencies" className="stat-card mt-4">
          <ul className="space-y-2">
            {data.agencies.map((a: string, i: number) => (
              <li key={i} className="p-2 rounded hover:bg-muted/50">{a}</li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="volunteers" className="stat-card mt-4">
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="p-2 text-left text-muted-foreground">Nama</th><th className="p-2 text-left text-muted-foreground">Organisasi</th><th className="p-2 text-left text-muted-foreground">Keahlian</th></tr></thead>
            <tbody>
              {data.volunteers.map((v: any) => (
                <tr key={v.id} className="border-b last:border-0"><td className="p-2">{v.name}</td><td className="p-2">{v.org}</td><td className="p-2">{v.skill}</td></tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
