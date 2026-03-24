import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, FileDown, ClipboardList, Eye } from "lucide-react";
import { getJuklakAssessments, downloadReportDocx, downloadReportPdf } from "@/services/apiService";

export default function GenerateReportsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<"docx" | "pdf" | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getJuklakAssessments();
      setAssessments(data || []);
    } catch { toast.error("Gagal memuat data"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const selectedData = assessments.find(a => a.id === selected);

  const handleDownload = async (type: "docx" | "pdf") => {
    if (!selected) { toast.error("Pilih assessment yang akan di-generate"); return; }
    try {
      setDownloading(type);
      const fn = type === "docx" ? downloadReportDocx : downloadReportPdf;
      const { blob, filename } = await fn(selected);
      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`File ${type.toUpperCase()} berhasil diunduh`);
    } catch (err: any) {
      toast.error(err.message || `Gagal generate ${type.toUpperCase()}`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Generate Laporan</h1>
        <p className="page-subtitle">Buat laporan kaji cepat dalam format Word/PDF sesuai Juklak resmi</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Step 1: Pilih Assessment */}
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-base">
            <ClipboardList className="h-5 w-5 text-primary" /> Pilih Data Kaji Cepat Lapangan
          </h3>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Belum ada data field assessment.</p>
              <p className="text-xs mt-1">Buat data kaji cepat lapangan terlebih dahulu di menu Field Assessment.</p>
            </div>
          ) : (
            <Select value={selected?.toString() || ""} onValueChange={v => setSelected(Number(v))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih assessment..." />
              </SelectTrigger>
              <SelectContent>
                {assessments.map((a: any) => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.report_code} — {a.disaster_type} ({a.district}, {a.regency}) · {a.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Preview */}
          {selectedData && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
              <p className="text-sm font-medium">{selectedData.report_code} — {selectedData.disaster_type}</p>
              <p className="text-xs text-muted-foreground">Lokasi: {selectedData.district}, {selectedData.regency}</p>
              <p className="text-xs text-muted-foreground">Status: <span className={selectedData.status === "FINAL" ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>{selectedData.status}</span></p>
              <p className="text-xs text-muted-foreground">Pembuat: {selectedData.creator_name} · {new Date(selectedData.created_at).toLocaleDateString("id-ID")}</p>
            </div>
          )}
        </div>

        {/* Step 2: Download Buttons */}
        {selected && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="bg-card rounded-xl border p-6 flex flex-col items-center text-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-foreground">Generate Word</h3>
              <p className="text-sm text-muted-foreground">Format .docx sesuai template Juklak resmi</p>
              <Button onClick={() => handleDownload("docx")} disabled={!!downloading} className="mt-2 gap-2">
                {downloading === "docx" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                Download DOCX
              </Button>
            </div>
            <div className="bg-card rounded-xl border p-6 flex flex-col items-center text-center gap-3">
              <div className="rounded-lg bg-red-500/10 p-4">
                <FileText className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-foreground">Generate PDF</h3>
              <p className="text-sm text-muted-foreground">Konversi ke PDF dari template Word</p>
              <Button onClick={() => handleDownload("pdf")} disabled={!!downloading} className="mt-2 gap-2" variant="outline">
                {downloading === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
