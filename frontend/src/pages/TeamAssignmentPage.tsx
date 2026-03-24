import { useState, useEffect } from "react";
import { getRapidAssessmentsDropdown, createTeamAssignment, getTeamAssignments } from "@/services/apiService";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Users } from "lucide-react";

interface TeamMember {
  name: string;
  division: string;
}

interface DropdownAssessment {
  id: number;
  disaster_type_name: string;
  regency: string;
  district: string;
  waktu_kejadian: string;
  status: string;
}

export default function TeamAssignmentPage() {
  const [assessments, setAssessments] = useState<DropdownAssessment[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [form, setForm] = useState({ 
    assessment_id: "", 
    team_name: "", 
    leader: "", 
    vehicle: "", 
    departure_time: "", 
    arrival_estimate: "" 
  });
  
  const [members, setMembers] = useState<TeamMember[]>([
    { name: "", division: "TRC" }
  ]);

  const fetchData = async () => {
    setFetching(true);
    try {
      const [assessmentsData, assignmentsData] = await Promise.all([
        getRapidAssessmentsDropdown(),
        getTeamAssignments()
      ]);
      setAssessments(assessmentsData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMember = () => {
    setMembers([...members, { name: "", division: "TRC" }]);
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.assessment_id || !form.team_name || !form.leader) {
      return toast.error("Harap isi kaji cepat, nama tim, dan leader");
    }

    const validMembers = members.filter(m => m.name.trim() !== "");
    if (validMembers.length === 0) {
      return toast.error("Harap masukkan minimal 1 anggota tim");
    }

    setLoading(true);
    try {
      await createTeamAssignment({
        ...form,
        assessment_id: Number(form.assessment_id),
        total_members: validMembers.length,
        members: validMembers
      });
      toast.success("Tim berhasil ditugaskan");
      
      // Reset form
      setForm({ assessment_id: "", team_name: "", leader: "", vehicle: "", departure_time: "", arrival_estimate: "" });
      setMembers([{ name: "", division: "TRC" }]);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menugaskan tim");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Penugasan Tim TRC</h1>
        <p className="page-subtitle">Buat penugasan tim dan atur personel yang berangkat ke lokasi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <div className="stat-card">
            <h3 className="font-semibold mb-4 text-primary flex items-center gap-2">
              <Users className="h-5 w-5" /> Form Penugasan
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Data Kaji Cepat Tersedia</Label>
                <Select value={form.assessment_id} onValueChange={v => setForm(f => ({ ...f, assessment_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Pilih kaji cepat..." /></SelectTrigger>
                  <SelectContent>
                    {assessments.map(a => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        KC-{a.id} — {a.disaster_type_name} ({a.district || a.regency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Nama Tim</Label><Input value={form.team_name} onChange={e => setForm(f => ({ ...f, team_name: e.target.value }))} placeholder="Ex: TRC Alpha" /></div>
                <div><Label>Ketua Tim (Leader)</Label><Input value={form.leader} onChange={e => setForm(f => ({ ...f, leader: e.target.value }))} placeholder="Ex: Budi Santoso" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Kendaraan</Label><Input value={form.vehicle} onChange={e => setForm(f => ({ ...f, vehicle: e.target.value }))} placeholder="Ex: Mobil Rescue 01" /></div>
                <div><Label>Total Personel</Label><Input disabled value={`${members.filter(m => m.name.trim()).length} Orang`} className="bg-muted font-medium" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Waktu Berangkat</Label><Input type="datetime-local" value={form.departure_time} onChange={e => setForm(f => ({ ...f, departure_time: e.target.value }))} /></div>
                <div><Label>Estimasi Tiba</Label><Input type="datetime-local" value={form.arrival_estimate} onChange={e => setForm(f => ({ ...f, arrival_estimate: e.target.value }))} /></div>
              </div>
              
              <div className="pt-4 border-t mt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-semibold">Anggota Tim</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddMember} className="gap-1 h-8"><Plus className="h-3.5 w-3.5" /> Tambah</Button>
                </div>
                
                <div className="space-y-3">
                  {members.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input placeholder="Nama personil" value={member.name} onChange={e => handleMemberChange(idx, "name", e.target.value)} />
                      </div>
                      <div className="w-[140px]">
                        <Select value={member.division} onValueChange={v => handleMemberChange(idx, "division", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TRC">TRC</SelectItem>
                            <SelectItem value="PUSDALOPS">PUSDALOPS</SelectItem>
                            <SelectItem value="LOGISTIK">LOGISTIK</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0" onClick={() => handleRemoveMember(idx)} disabled={members.length === 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-6">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tugaskan Tim ke Lokasi
              </Button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="stat-card overflow-hidden flex flex-col h-full">
            <h3 className="font-semibold mb-4 text-primary">Riwayat Penugasan & Tim</h3>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left text-muted-foreground font-medium w-12">No</th>
                    <th className="p-3 text-left text-muted-foreground font-medium">Tim & Leader</th>
                    <th className="p-3 text-left text-muted-foreground font-medium">Kaji Cepat</th>
                    <th className="p-3 text-left text-muted-foreground font-medium hidden sm:table-cell">Anggota</th>
                    <th className="p-3 text-left text-muted-foreground font-medium hidden md:table-cell">Kendaraan</th>
                  </tr>
                </thead>
                <tbody>
                  {fetching ? (
                    <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /><p className="mt-2 text-muted-foreground">Memuat data...</p></td></tr>
                  ) : assignments.length === 0 ? (
                    <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">Belum ada tim yang ditugaskan</td></tr>
                  ) : assignments.map((a: any, i) => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-muted/50 align-top">
                      <td className="p-3 text-muted-foreground">{i + 1}</td>
                      <td className="p-3">
                        <div className="font-semibold text-primary">{a.team_name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Ldr: {a.leader}</div>
                        <div className="mt-2"><StatusBadge status={a.status} /></div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{a.report_code || `KC-${a.assessment_id}`}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{a.disaster_type}</div>
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <div className="font-medium text-xs mb-1">{a.total_members} Personel:</div>
                        {a.members && a.members.length > 0 ? (
                          <div className="text-xs space-y-1">
                            {a.members.map((m: any) => (
                              <div key={m.id} className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                                <span>{m.name}</span>
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{m.division}</span>
                              </div>
                            ))}
                          </div>
                        ) : <span className="text-xs text-muted-foreground">-</span>}
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <div>{a.vehicle || "-"}</div>
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
