import { Button } from "@/components/ui/button";
import { generateReport } from "@/services/apiService";
import { toast } from "sonner";
import { FileText, ClipboardList, FileBarChart } from "lucide-react";

// TODO: POST /api/reports/generate

const reportTypes = [
  { type: "initial", title: "Laporan Awal", desc: "Laporan awal kejadian bencana", icon: FileText },
  { type: "assessment", title: "Laporan Kaji Cepat", desc: "Laporan hasil kaji cepat lapangan", icon: ClipboardList },
  { type: "sitrep", title: "Laporan Sitrep", desc: "Situation Report berkala", icon: FileBarChart },
];

export default function GenerateReportsPage() {
  const handleGenerate = async (type: string) => {
    try {
      await generateReport(type);
      toast.success("Laporan berhasil di-generate");
    } catch { toast.error("Gagal generate laporan"); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Generate Laporan</h1>
        <p className="page-subtitle">Buat laporan otomatis berdasarkan data yang tersedia</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {reportTypes.map(r => (
          <div key={r.type} className="stat-card flex flex-col items-center text-center gap-3 py-8">
            <div className="rounded-lg bg-primary/10 p-4"><r.icon className="h-8 w-8 text-primary" /></div>
            <h3 className="font-semibold text-foreground">{r.title}</h3>
            <p className="text-sm text-muted-foreground">{r.desc}</p>
            <Button onClick={() => handleGenerate(r.type)} className="mt-2">Generate</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
