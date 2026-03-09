import { useState, useEffect } from "react";
import { getDisasterReports, createTeamAssignment, getTeamAssignments } from "@/services/apiService";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { DisasterReport } from "@/dummy-data/reports";

// TODO: POST /api/team-assignments

export default function TeamAssignmentPage() {
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ report_id: "", team_name: "", leader: "", total_members: "", vehicle: "", departure_time: "", arrival_estimate: "" });

  useEffect(() => {
    getDisasterReports().then(setReports);
    getTeamAssignments().then(setAssignments);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTeamAssignment({ ...form, total_members: Number(form.total_members) });
      toast.success("Tim berhasil ditugaskan");
      setForm({ report_id: "", team_name: "", leader: "", total_members: "", vehicle: "", departure_time: "", arrival_estimate: "" });
    } catch { toast.error("Gagal menugaskan tim"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Penugasan Tim TRC</h1>
        <p className="page-subtitle">Buat dan kelola penugasan tim tanggap darurat</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Form Penugasan Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label>Laporan Bencana</Label>
              <Select value={form.report_id} onValueChange={v => setForm(f => ({ ...f, report_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Pilih laporan" /></SelectTrigger>
                <SelectContent>
                  {reports.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.report_code} - {r.disaster_type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Nama Tim</Label><Input value={form.team_name} onChange={e => setForm(f => ({ ...f, team_name: e.target.value }))} placeholder="TRC Alpha" /></div>
              <div><Label>Leader</Label><Input value={form.leader} onChange={e => setForm(f => ({ ...f, leader: e.target.value }))} placeholder="Nama leader" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Jumlah Personel</Label><Input type="number" value={form.total_members} onChange={e => setForm(f => ({ ...f, total_members: e.target.value }))} /></div>
              <div><Label>Kendaraan</Label><Input value={form.vehicle} onChange={e => setForm(f => ({ ...f, vehicle: e.target.value }))} placeholder="Mobil Rescue" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Waktu Berangkat</Label><Input type="datetime-local" value={form.departure_time} onChange={e => setForm(f => ({ ...f, departure_time: e.target.value }))} /></div>
              <div><Label>Estimasi Tiba</Label><Input type="datetime-local" value={form.arrival_estimate} onChange={e => setForm(f => ({ ...f, arrival_estimate: e.target.value }))} /></div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tugaskan Tim
            </Button>
          </form>
        </div>

        <div className="stat-card overflow-x-auto">
          <h3 className="font-semibold mb-4">Daftar Penugasan</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="p-2 text-left text-muted-foreground">Tim</th><th className="p-2 text-left text-muted-foreground">Laporan</th><th className="p-2 text-left text-muted-foreground">Leader</th><th className="p-2 text-left text-muted-foreground">Status</th></tr></thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="p-2 font-medium">{a.team_name}</td>
                  <td className="p-2">{a.report_code}</td>
                  <td className="p-2">{a.leader}</td>
                  <td className="p-2"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
