import { useState } from "react";
import { submitEmergencyNeeds } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// TODO: POST /api/emergency-needs

export default function EmergencyNeedsPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ assessment_id: "", food: "", water: "", tents: "", blankets: "", medicine: "", heavy_equipment: "" });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitEmergencyNeeds(form);
      toast.success("Kebutuhan mendesak berhasil disimpan");
    } catch { toast.error("Gagal menyimpan"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Kebutuhan Mendesak</h1>
        <p className="page-subtitle">Input kebutuhan darurat di lokasi bencana</p>
      </div>
      <div className="stat-card max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>ID Assessment</Label><Input value={form.assessment_id} onChange={e => update("assessment_id", e.target.value)} placeholder="ID Kaji Cepat" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Makanan (paket)</Label><Input type="number" value={form.food} onChange={e => update("food", e.target.value)} /></div>
            <div><Label>Air Bersih (liter)</Label><Input type="number" value={form.water} onChange={e => update("water", e.target.value)} /></div>
            <div><Label>Tenda (unit)</Label><Input type="number" value={form.tents} onChange={e => update("tents", e.target.value)} /></div>
            <div><Label>Selimut (unit)</Label><Input type="number" value={form.blankets} onChange={e => update("blankets", e.target.value)} /></div>
            <div><Label>Obat-obatan (paket)</Label><Input type="number" value={form.medicine} onChange={e => update("medicine", e.target.value)} /></div>
            <div><Label>Alat Berat (unit)</Label><Input type="number" value={form.heavy_equipment} onChange={e => update("heavy_equipment", e.target.value)} /></div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Kebutuhan
          </Button>
        </form>
      </div>
    </div>
  );
}
