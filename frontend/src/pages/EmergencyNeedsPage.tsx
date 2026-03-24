import { useState, useEffect } from "react";
import { getAssessments, getNeedItems, submitEmergencyNeeds, getEmergencyNeeds } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Package } from "lucide-react";

interface NeedEntry {
  item_id: string; // From master data
  quantity: string;
}

export default function EmergencyNeedsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [needItems, setNeedItems] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({ assessment_id: "" });
  const [needs, setNeeds] = useState<NeedEntry[]>([{ item_id: "", quantity: "1" }]);

  const fetchData = async () => {
    setFetching(true);
    try {
      const [assessList, items, historyData] = await Promise.all([
        getAssessments(),
        getNeedItems(),
        getEmergencyNeeds()
      ]);
      setAssessments(assessList);
      setNeedItems(items);
      setHistory(historyData);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddNeed = () => setNeeds([...needs, { item_id: "", quantity: "1" }]);
  const handleRemoveNeed = (index: number) => setNeeds(needs.filter((_, i) => i !== index));
  const handleNeedChange = (index: number, field: keyof NeedEntry, value: string) => {
    const newNeeds = [...needs];
    newNeeds[index][field] = value;
    setNeeds(newNeeds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.assessment_id) return toast.error("Silakan pilih data Kaji Cepat");

    const validNeeds = needs.filter(n => n.item_id && parseInt(n.quantity) > 0);
    if (validNeeds.length === 0) return toast.error("Harap masukkan minimal 1 item kebutuhan mendesak");

    setLoading(true);
    try {
      await submitEmergencyNeeds({
        assessment_id: Number(form.assessment_id),
        needs: validNeeds.map(n => ({ item_id: Number(n.item_id), quantity: Number(n.quantity) }))
      });
      toast.success("Kebutuhan mendesak berhasil disimpan");
      setForm({ assessment_id: "" });
      setNeeds([{ item_id: "", quantity: "1" }]);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan kebutuhan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Monitoring Kebutuhan Darurat</h1>
        <p className="page-subtitle">Pencatatan kebutuhan logistik dan peralatan evakuasi pasca bencana</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <div className="stat-card">
            <h3 className="font-semibold mb-4 text-primary flex items-center gap-2">
              <Package className="h-5 w-5" /> Form Input Kebutuhan
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Pilih Data Kaji Cepat (Lokasi Bencana)</Label>
                <Select value={form.assessment_id} onValueChange={v => setForm(f => ({ ...f, assessment_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Pilih hasil kaji cepat..." /></SelectTrigger>
                  <SelectContent>
                    {assessments.map(a => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        Laporan: {a.report_code} - {[a.village, a.district].filter(Boolean).join(', ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t mt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-semibold">Daftar Item Kebutuhan</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddNeed} className="gap-1 h-8"><Plus className="h-3.5 w-3.5" /> Tambah</Button>
                </div>
                
                <div className="space-y-3">
                  {needs.map((need, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-2">
                      <div className="flex-1 w-full">
                        <Select value={need.item_id} onValueChange={v => handleNeedChange(idx, "item_id", v)}>
                          <SelectTrigger><SelectValue placeholder="Pilih barang..." /></SelectTrigger>
                          <SelectContent>
                            {needItems.map(item => (
                              <SelectItem key={item.id} value={String(item.id)}>
                                {item.name} {item.unit ? `(${item.unit})` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <Input type="number" min="1" placeholder="Qty" value={need.quantity} onChange={e => handleNeedChange(idx, "quantity", e.target.value)} className="w-24 text-center" />
                        <span className="text-sm text-muted-foreground w-12 truncate">
                          {need.item_id ? needItems.find(i => String(i.id) === need.item_id)?.unit || "-" : "-"}
                        </span>
                        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0" onClick={() => handleRemoveNeed(idx)} disabled={needs.length === 1}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-6">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Data Kebutuhan
              </Button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="stat-card overflow-hidden flex flex-col h-full">
            <h3 className="font-semibold mb-4 text-primary">Daftar Kebutuhan yang Belum Terpenuhi</h3>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left text-muted-foreground font-medium w-12">No</th>
                    <th className="p-3 text-left text-muted-foreground font-medium">Laporan / Lokasi</th>
                    <th className="p-3 text-left text-muted-foreground font-medium">Item Kebutuhan</th>
                    <th className="p-3 text-left text-muted-foreground font-medium">Status / Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {fetching ? (
                    <tr><td colSpan={4} className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /><p className="mt-2 text-muted-foreground">Memuat data...</p></td></tr>
                  ) : history.length === 0 ? (
                    <tr><td colSpan={4} className="p-12 text-center text-muted-foreground">Belum ada catatan kebutuhan darurat</td></tr>
                  ) : history.map((entry: any, i) => (
                    <tr key={entry.id || i} className="border-b last:border-0 hover:bg-muted/50 align-top">
                      <td className="p-3 text-muted-foreground">{i + 1}</td>
                      <td className="p-3">
                        <div className="font-semibold text-primary">{entry.report_code}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{entry.village || entry.location || "-"}</div>
                      </td>
                      <td className="p-3">
                        {entry.needs && entry.needs.length > 0 ? (
                          <div className="space-y-1">
                            {entry.needs.map((n: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center bg-muted/40 px-2 py-1 rounded text-xs">
                                <span>{n.item_name}</span>
                                <span className="font-semibold text-primary">{n.quantity} {n.unit || ""}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            {/* Fallback to legacy structure if present */}
                            {entry.food > 0 && <div>Makanan: {entry.food}</div>}
                            {entry.water > 0 && <div>Air: {entry.water} ltr</div>}
                            {entry.tents > 0 && <div>Tenda: {entry.tents} unit</div>}
                            {entry.blankets > 0 && <div>Selimut: {entry.blankets} lbr</div>}
                            {entry.medicine > 0 && <div>Perl. Medis: {entry.medicine}</div>}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">Belum Terpenuhi</span>
                        <div className="text-[10px] text-muted-foreground mt-2">{new Date(entry.created_at || Date.now()).toLocaleDateString('id-ID')}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
