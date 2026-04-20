import { useState, useEffect } from "react";
import {
  getRapidAssessmentsDropdown,
  createTeamAssignment,
  updateTeamAssignment,
  deleteTeamAssignment,
  getTeamAssignments,
  downloadSuratTugasDocx,
  downloadSuratTugasPdf,
} from "@/services/apiService";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Users, FileText, Download, Pencil, Eye, X, Info } from "lucide-react";

interface TeamMember { name: string; division: string; }
interface DropdownAssessment {
  id: number; disaster_type_name: string; regency: string; district: string;
  waktu_kejadian: string; status: string;
}

const BULAN_OPTIONS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

const emptyForm = {
  assessment_id: "", team_name: "", leader: "", vehicle: "",
  departure_time: "", arrival_estimate: "",
  nomor_surat: "", tanggal_surat: "", bulan_surat: "",
  tahun_surat: new Date().getFullYear().toString(),
  desa: "", nama_aparat_desa: "",
};

export default function TeamAssignmentPage() {
  const [assessments, setAssessments] = useState<DropdownAssessment[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({ ...emptyForm });
  const [members, setMembers] = useState<TeamMember[]>([{ name: "", division: "TRC" }]);

  // Edit mode
  const [editId, setEditId] = useState<number | null>(null);

  // View dialog
  const [viewItem, setViewItem] = useState<any>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  // DOCX & PDF download
  const [downloading, setDownloading] = useState<number | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<number | null>(null);

  const fetchData = async () => {
    setFetching(true);
    try {
      const [aData, tData] = await Promise.all([
        getRapidAssessmentsDropdown(),
        getTeamAssignments(),
      ]);
      setAssessments(aData);
      setAssignments(tData);
    } catch (e) { console.error(e); } finally { setFetching(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // ─── Member helpers ───
  const addMember = () => setMembers([...members, { name: "", division: "TRC" }]);
  const removeMember = (i: number) => setMembers(members.filter((_, idx) => idx !== i));
  const changeMember = (i: number, f: keyof TeamMember, v: string) => {
    const m = [...members]; m[i][f] = v; setMembers(m);
  };

  // ─── Reset form ───
  const resetForm = () => {
    setForm({ ...emptyForm });
    setMembers([{ name: "", division: "TRC" }]);
    setEditId(null);
  };

  // ─── Start edit ───
  const startEdit = (a: any) => {
    setEditId(a.id);
    setForm({
      assessment_id: String(a.assessment_id),
      team_name: a.team_name || "",
      leader: a.leader || "",
      vehicle: a.vehicle || "",
      departure_time: a.departure_time ? a.departure_time.slice(0, 16) : "",
      arrival_estimate: a.arrival_estimate ? a.arrival_estimate.slice(0, 16) : "",
      nomor_surat: a.nomor_surat || "",
      tanggal_surat: a.tanggal_surat || "",
      bulan_surat: a.bulan_surat || "",
      tahun_surat: a.tahun_surat || new Date().getFullYear().toString(),
      desa: a.desa || "",
      nama_aparat_desa: a.nama_aparat_desa || "",
    });
    setMembers(
      a.members && a.members.length > 0
        ? a.members.map((m: any) => ({ name: m.name, division: m.division || "TRC" }))
        : [{ name: "", division: "TRC" }]
    );
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Submit (create or update) ───
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
      const payload = {
        ...form,
        assessment_id: Number(form.assessment_id),
        total_members: validMembers.length,
        members: validMembers,
      };

      if (editId) {
        await updateTeamAssignment(editId, payload);
        toast.success("Penugasan tim berhasil diperbarui");
      } else {
        await createTeamAssignment(payload);
        toast.success("Tim berhasil ditugaskan");
      }
      resetForm();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan penugasan");
    } finally {
      setLoading(false);
    }
  };

  // ─── Delete ───
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTeamAssignment(deleteTarget.id);
      toast.success("Penugasan tim berhasil dihapus");
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus");
    } finally {
      setDeleting(false);
    }
  };

  // ─── Download DOCX ───
  const handleDownload = async (a: any) => {
    if (!a.nomor_surat) {
      return toast.error("Harap isi data surat tugas terlebih dahulu (edit penugasan)");
    }
    setDownloading(a.id);
    try {
      const { blob, filename } = await downloadSuratTugasDocx(a.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Surat Tugas berhasil diunduh");
    } catch (err: any) {
      toast.error(err.message || "Gagal generate Surat Tugas");
    } finally {
      setDownloading(null);
    }
  };

  // ─── Download PDF ───
  const handleDownloadPdf = async (a: any) => {
    if (!a.nomor_surat) {
      return toast.error("Harap isi data surat tugas terlebih dahulu (edit penugasan)");
    }
    setDownloadingPdf(a.id);
    try {
      const { blob, filename } = await downloadSuratTugasPdf(a.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Surat Tugas PDF berhasil diunduh");
    } catch (err: any) {
      toast.error(err.message || "Gagal generate Surat Tugas PDF");
    } finally {
      setDownloadingPdf(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Penugasan Tim TRC</h1>
        <p className="page-subtitle">Buat penugasan tim, atur personel, dan generate Surat Tugas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ═══ FORM ═══ */}
        <div className="lg:col-span-5 space-y-6">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-primary flex items-center gap-2">
                <Users className="h-5 w-5" />
                {editId ? "Edit Penugasan" : "Form Penugasan"}
              </h3>
              {editId && (
                <Button type="button" variant="ghost" size="sm" onClick={resetForm} className="gap-1 text-xs h-7">
                  <X className="h-3.5 w-3.5" /> Batal Edit
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Kaji Cepat */}
              <div>
                <Label>Data Kaji Cepat</Label>
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

              {/* Tim Info */}
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Nama Tim</Label><Input value={form.team_name} onChange={e => setForm(f => ({ ...f, team_name: e.target.value }))} placeholder="TRC Alpha" /></div>
                <div><Label>Ketua Tim</Label><Input value={form.leader} onChange={e => setForm(f => ({ ...f, leader: e.target.value }))} placeholder="Budi Santoso" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Kendaraan</Label><Input value={form.vehicle} onChange={e => setForm(f => ({ ...f, vehicle: e.target.value }))} placeholder="Mobil Rescue 01" /></div>
                <div><Label>Total Personel</Label><Input disabled value={`${members.filter(m => m.name.trim()).length} Orang`} className="bg-muted font-medium" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Waktu Berangkat</Label><Input type="datetime-local" value={form.departure_time} onChange={e => setForm(f => ({ ...f, departure_time: e.target.value }))} /></div>
                <div><Label>Estimasi Tiba</Label><Input type="datetime-local" value={form.arrival_estimate} onChange={e => setForm(f => ({ ...f, arrival_estimate: e.target.value }))} /></div>
              </div>

              {/* Anggota */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-semibold">Anggota Tim</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addMember} className="gap-1 h-8"><Plus className="h-3.5 w-3.5" /> Tambah</Button>
                </div>
                <div className="space-y-3">
                  {members.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input className="flex-1" placeholder="Nama personil" value={m.name} onChange={e => changeMember(i, "name", e.target.value)} />
                      <Select value={m.division} onValueChange={v => changeMember(i, "division", v)}>
                        <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TRC">TRC</SelectItem>
                          <SelectItem value="PUSDALOPS">PUSDALOPS</SelectItem>
                          <SelectItem value="LOGISTIK">LOGISTIK</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeMember(i)} disabled={members.length === 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ═══ SURAT TUGAS SECTION ═══ */}
              <div className="mt-6 p-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-900/10">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <Label className="text-base font-semibold text-blue-900 dark:text-blue-300">Data Surat Tugas</Label>
                </div>
                <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mb-4 flex items-center gap-1.5 leading-relaxed">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  Isi data di bawah ini jika Anda ingin meng-generate/mendownload Surat Tugas. Jika belum, bagian ini bisa dikosongkan.
                </p>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Nomor Surat</Label>
                    <Input placeholder="360/ST-TRC/BPBD/III/2026" value={form.nomor_surat} onChange={e => setForm(f => ({ ...f, nomor_surat: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Tanggal</Label>
                      <Input placeholder="25" value={form.tanggal_surat} onChange={e => setForm(f => ({ ...f, tanggal_surat: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">Bulan</Label>
                      <Select value={form.bulan_surat} onValueChange={v => setForm(f => ({ ...f, bulan_surat: v }))}>
                        <SelectTrigger><SelectValue placeholder="Bulan" /></SelectTrigger>
                        <SelectContent>
                          {BULAN_OPTIONS.map(b => (
                            <SelectItem key={b} value={b}>{b}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Tahun</Label>
                      <Input value={form.tahun_surat} onChange={e => setForm(f => ({ ...f, tahun_surat: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Desa</Label>
                      <Input placeholder="Nama desa" value={form.desa} onChange={e => setForm(f => ({ ...f, desa: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">Nama Aparat Desa</Label>
                      <Input placeholder="Kepala desa" value={form.nama_aparat_desa} onChange={e => setForm(f => ({ ...f, nama_aparat_desa: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-6">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editId ? "Simpan Perubahan" : "Tugaskan Tim ke Lokasi"}
              </Button>
            </form>
          </div>
        </div>

        {/* ═══ TABLE ═══ */}
        <div className="lg:col-span-7">
          <div className="stat-card overflow-hidden flex flex-col h-full">
            <h3 className="font-semibold mb-4 text-primary">Riwayat Penugasan & Tim</h3>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left text-muted-foreground font-medium w-10">No</th>
                    <th className="p-3 text-left text-muted-foreground font-medium">Tim & Bencana</th>
                    <th className="p-3 text-left text-muted-foreground font-medium hidden sm:table-cell">Personel</th>
                    <th className="p-3 text-left text-muted-foreground font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {fetching ? (
                    <tr><td colSpan={4} className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /><p className="mt-2 text-muted-foreground">Memuat data...</p></td></tr>
                  ) : assignments.length === 0 ? (
                    <tr><td colSpan={4} className="p-12 text-center text-muted-foreground">Belum ada tim yang ditugaskan</td></tr>
                  ) : assignments.map((a: any, i) => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-muted/50 align-top">
                      <td className="p-3 text-muted-foreground">{i + 1}</td>
                      <td className="p-3">
                        <div className="font-semibold text-primary">{a.team_name}</div>
                        <div className="text-xs text-muted-foreground">Ldr: {a.leader}</div>
                        <div className="text-xs mt-1">{a.disaster_type} — {a.report_code}</div>
                        {a.nomor_surat && (
                          <div className="text-[10px] mt-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded inline-block">
                            ST: {a.nomor_surat}
                          </div>
                        )}
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <div className="text-xs font-medium mb-1">{a.total_members} orang</div>
                        {a.members?.slice(0, 4).map((m: any) => (
                          <div key={m.id} className="text-xs flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            {m.name}
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1 rounded">{m.division}</span>
                          </div>
                        ))}
                        {a.members?.length > 4 && <div className="text-[10px] text-muted-foreground mt-1">+{a.members.length - 4} lainnya</div>}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1.5">
                          <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs w-full justify-start" onClick={() => setViewItem(a)}>
                            <Eye className="h-3 w-3" /> Lihat
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs w-full justify-start" onClick={() => startEdit(a)}>
                            <Pencil className="h-3 w-3" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs w-full justify-start text-blue-600 hover:text-blue-700" onClick={() => handleDownload(a)} disabled={downloading === a.id}>
                            {downloading === a.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                            DOCX
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs w-full justify-start text-red-600 hover:text-red-700" onClick={() => handleDownloadPdf(a)} disabled={downloadingPdf === a.id}>
                            {downloadingPdf === a.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                            PDF
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs w-full justify-start text-destructive hover:text-destructive" onClick={() => setDeleteTarget(a)}>
                            <Trash2 className="h-3 w-3" /> Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ VIEW DIALOG ═══ */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Eye className="h-5 w-5 text-primary" /> Detail Penugasan</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-muted/50 rounded-lg p-3">
                <div><span className="text-muted-foreground">Tim:</span> <span className="font-medium">{viewItem.team_name}</span></div>
                <div><span className="text-muted-foreground">Leader:</span> <span className="font-medium">{viewItem.leader}</span></div>
                <div><span className="text-muted-foreground">Bencana:</span> <span className="font-medium">{viewItem.disaster_type}</span></div>
                <div><span className="text-muted-foreground">Kendaraan:</span> <span className="font-medium">{viewItem.vehicle || "-"}</span></div>
              </div>
              {viewItem.nomor_surat && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="font-semibold text-blue-700 text-xs mb-1">Surat Tugas</div>
                  <div><span className="text-muted-foreground">No:</span> {viewItem.nomor_surat}</div>
                  <div><span className="text-muted-foreground">Tanggal:</span> {viewItem.tanggal_surat} {viewItem.bulan_surat} {viewItem.tahun_surat}</div>
                  <div><span className="text-muted-foreground">Desa:</span> {viewItem.desa || "-"}</div>
                  <div><span className="text-muted-foreground">Aparat Desa:</span> {viewItem.nama_aparat_desa || "-"}</div>
                </div>
              )}
              <div>
                <div className="font-semibold text-xs mb-2">Anggota ({viewItem.members?.length || 0} orang)</div>
                {viewItem.members?.map((m: any, i: number) => (
                  <div key={m.id} className="flex items-center gap-2 py-1 border-b last:border-0">
                    <span className="text-muted-foreground w-5">{i + 1}.</span>
                    <span className="flex-1">{m.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{m.division}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══ DELETE DIALOG ═══ */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Yakin ingin menghapus penugasan <span className="font-semibold text-foreground">{deleteTarget?.team_name}</span>?
            Data dan anggota tim akan dihapus permanen.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
