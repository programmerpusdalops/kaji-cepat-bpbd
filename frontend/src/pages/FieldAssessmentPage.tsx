import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Check, Save, ClipboardList, FileText, Users, Home, ShieldAlert, Lightbulb, Camera } from "lucide-react";
import {
  getRapidAssessmentsDropdown, getRapidAssessmentById,
  getJuklakAssessments, getJuklakAssessment,
  createJuklakAssessment, updateJuklakAssessment, deleteJuklakAssessment
} from "@/services/apiService";

// ── Default structures ──

const defaultKR = () => ({ bayi: 0, balita: 0, anak: 0, lansia: 0, ibu_hamil: 0, ibu_menyusui: 0, disabilitas: 0, orang_sakit: 0 });
const defaultKK = () => ({ odgj: 0, wanita_usia_subur: 0 });
const defaultPopulation = () => ({ total: 0, laki_laki: 0, perempuan: 0, kelompok_rentan: defaultKR(), kelompok_khusus: defaultKK() });

const DEFAULT_SEKTOR = [
  "Kesehatan", "Penyelamatan dan evakuasi", "Air bersih, sanitasi, dan hygiene",
  "Pangan (memperhatikan pola makanan pokok)", "Nonpangan", "Penampungan dan hunian sementara",
  "Rumah tidak layak huni akibat bencana", "Kerusakan prasarana jalan", "Kerusakan jembatan",
  "Kerusakan lahan", "Sarana utilitas (jaringan listrik, telekomunikasi, dan air bersih)",
  "Prasarana dan sarana lain",
];

const emptyDetail = () => ({
  pendahuluan: { jenis_kejadian: "", lokasi: "", waktu_kejadian: "", lama_waktu: "", kronologis: "" },
  cakupan_wilayah: "",
  penduduk_terdampak: defaultPopulation(),
  korban: { meninggal: 0, mortalitas: "0%", luka: 0, sakit: 0, hilang: 0, ...defaultPopulation() },
  pengungsi: { ...defaultPopulation(), jumlah_kk: 0 },
  tidak_mengungsi: defaultPopulation(),
  kerusakan: { rumah_terdampak: 0, rumah_tidak_layak: 0, jalan: "", jembatan: "", lahan: "", listrik: "", telekomunikasi: "", air_bersih: "", lainnya: "" },
  upaya_darurat: { evakuasi: "", kebutuhan: "", pemulihan: "" },
  kebutuhan: [{ kegiatan: "", detail: "" }],
  informasi_lain: { titik_lokasi: "", rencana_penanganan: "", sumber_informasi: "" },
  kesimpulan: { rekomendasi_status: "", perkiraan_hari: 0, alasan: "", sektor_kebutuhan: DEFAULT_SEKTOR.map(s => ({ sektor: s, kebutuhan: "" })) },
  tim_trc: { surat_tugas_nomor: "", surat_tugas_tanggal: "", anggota: [{ no: 1, nama: "", keterangan: "Ketua Tim" }] },
});

const STEPS = [
  { label: "Pendahuluan", icon: FileText },
  { label: "Dampak Penduduk", icon: Users },
  { label: "Korban & Pengungsi", icon: ShieldAlert },
  { label: "Kerusakan", icon: Home },
  { label: "Upaya & Kebutuhan", icon: Lightbulb },
  { label: "Kesimpulan", icon: ClipboardList },
  { label: "Dokumentasi", icon: Camera },
];

// ── Kelompok Rentan Table Component ──
function KelompokRentanTable({ data, onChange, label }: { data: any; onChange: (d: any) => void; label: string }) {
  const kr = data?.kelompok_rentan || defaultKR();
  const kk = data?.kelompok_khusus || defaultKK();

  const setKR = (field: string, val: number) => {
    onChange({ ...data, kelompok_rentan: { ...kr, [field]: val } });
  };
  const setKK = (field: string, val: number) => {
    onChange({ ...data, kelompok_khusus: { ...kk, [field]: val } });
  };

  const krTotal = (Object.values(kr) as number[]).reduce((a, b) => a + (Number(b) || 0), 0);
  const kkTotal = (Number(kk.odgj) || 0) + (Number(kk.wanita_usia_subur) || 0);

  const krRows = [
    { key: "bayi", label: "Bayi (0–11 bulan)" }, { key: "balita", label: "Balita (12–59 bulan)" },
    { key: "anak", label: "Anak-anak (5–17 tahun)" }, { key: "lansia", label: "Lansia (≥ 60 tahun)" },
    { key: "ibu_hamil", label: "Ibu Hamil" }, { key: "ibu_menyusui", label: "Ibu Menyusui" },
    { key: "disabilitas", label: "Disabilitas" }, { key: "orang_sakit", label: "Orang Sakit" },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground">{label}</h4>
      {/* Population totals */}
      <div className="grid grid-cols-3 gap-3">
        <div><Label className="text-xs">Total Penduduk</Label><Input type="number" value={data?.total || 0} onChange={e => onChange({ ...data, total: Number(e.target.value) })} /></div>
        <div><Label className="text-xs">Laki-laki</Label><Input type="number" value={data?.laki_laki || 0} onChange={e => onChange({ ...data, laki_laki: Number(e.target.value) })} /></div>
        <div><Label className="text-xs">Perempuan</Label><Input type="number" value={data?.perempuan || 0} onChange={e => onChange({ ...data, perempuan: Number(e.target.value) })} /></div>
      </div>
      {/* Kelompok Rentan Table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted/50"><th className="text-left px-3 py-2 text-xs font-medium">Kelompok Rentan</th><th className="text-right px-3 py-2 text-xs font-medium w-28">Jumlah</th></tr></thead>
          <tbody>
            {krRows.map(r => (
              <tr key={r.key} className="border-t"><td className="px-3 py-1.5 text-xs">{r.label}</td><td className="px-3 py-1"><Input type="number" className="h-7 text-xs text-right" value={kr[r.key] || 0} onChange={e => setKR(r.key, Number(e.target.value))} /></td></tr>
            ))}
            <tr className="border-t bg-muted/30 font-semibold"><td className="px-3 py-1.5 text-xs">Total</td><td className="px-3 py-1.5 text-xs text-right">{krTotal}</td></tr>
          </tbody>
        </table>
      </div>
      {/* Kelompok Khusus Table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted/50"><th className="text-left px-3 py-2 text-xs font-medium">Kelompok Khusus</th><th className="text-right px-3 py-2 text-xs font-medium w-28">Jumlah</th></tr></thead>
          <tbody>
            <tr className="border-t"><td className="px-3 py-1.5 text-xs">ODGJ</td><td className="px-3 py-1"><Input type="number" className="h-7 text-xs text-right" value={kk.odgj || 0} onChange={e => setKK("odgj", Number(e.target.value))} /></td></tr>
            <tr className="border-t"><td className="px-3 py-1.5 text-xs">Wanita Usia Subur</td><td className="px-3 py-1"><Input type="number" className="h-7 text-xs text-right" value={kk.wanita_usia_subur || 0} onChange={e => setKK("wanita_usia_subur", Number(e.target.value))} /></td></tr>
            <tr className="border-t bg-muted/30 font-semibold"><td className="px-3 py-1.5 text-xs">Total</td><td className="px-3 py-1.5 text-xs text-right">{kkTotal}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function FieldAssessmentPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kajiCepatList, setKajiCepatList] = useState<any[]>([]);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const [selectedKC, setSelectedKC] = useState<number | null>(null);
  const [detail, setDetail] = useState<any>(emptyDetail());
  const [saving, setSaving] = useState(false);

  // Uploads (base64 preview for UI, sent separately or as part of save)
  const [docPhotoPreviews, setDocPhotoPreviews] = useState<string[]>([]);
  const [infographicPreview, setInfographicPreview] = useState<string | null>(null);
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteConfirmStep2, setDeleteConfirmStep2] = useState<number | null>(null);

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      const [jl, kc] = await Promise.all([getJuklakAssessments(), getRapidAssessmentsDropdown()]);
      setAssessments(jl || []);
      setKajiCepatList(kc || []);
    } catch { toast.error("Gagal memuat data"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);

  const openCreate = () => {
    setEditId(null);
    setIsViewMode(false);
    setSelectedKC(null);
    setDetail(emptyDetail());
    setStep(0);
    setDocPhotoPreviews([]);
    setInfographicPreview(null);
    setAttachmentNames([]);
    setShowForm(true);
  };

  const openEdit = async (id: number) => {
    try {
      const data = await getJuklakAssessment(id);
      setEditId(id);
      setIsViewMode(false);
      setSelectedKC(data.assessment_id);
      setDetail(data.detail && Object.keys(data.detail).length > 0 ? data.detail : emptyDetail());
      setStep(0);
      setDocPhotoPreviews(data.doc_photos || []);
      setInfographicPreview(data.infographic_path || null);
      setAttachmentNames(data.attachments || []);
      setShowForm(true);
    } catch { toast.error("Gagal memuat data"); }
  };

  const openView = async (id: number) => {
    try {
      const data = await getJuklakAssessment(id);
      setEditId(id);
      setIsViewMode(true);
      setSelectedKC(data.assessment_id);
      setDetail(data.detail && Object.keys(data.detail).length > 0 ? data.detail : emptyDetail());
      setStep(0);
      setDocPhotoPreviews(data.doc_photos || []);
      setInfographicPreview(data.infographic_path || null);
      setAttachmentNames(data.attachments || []);
      setShowForm(true);
    } catch { toast.error("Gagal memuat data"); }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteJuklakAssessment(id);
      toast.success("Data berhasil dihapus");
      setDeleteConfirm(null);
      setDeleteConfirmStep2(null);
      loadList();
    } catch (err: any) { 
      toast.error(err.message || "Gagal menghapus data"); 
    }
  };

  const handleSelectKC = async (kcId: number) => {
    setSelectedKC(kcId);
    try {
      const kc = await getRapidAssessmentById(kcId);
      const d = { ...emptyDetail() };
      d.pendahuluan.jenis_kejadian = kc.disaster_type_name || "";
      const villages = kc.villages?.map((v: any) => v.village_name).join(", ") || "";
      d.pendahuluan.lokasi = `${villages ? villages + ", " : ""}${kc.district || ""}, ${kc.regency || ""}`;
      d.pendahuluan.waktu_kejadian = kc.waktu_kejadian || "";
      d.pendahuluan.kronologis = kc.kronologis || "";
      if (kc.sources?.length) d.informasi_lain.sumber_informasi = kc.sources.map((s: any) => s.sumber).join(", ");
      if (kc.peta_link) d.informasi_lain.titik_lokasi = kc.peta_link;
      setDetail(d);
    } catch { /* keep empty detail */ }
  };

  const handleSave = async (asDraft = true) => {
    if (!selectedKC) { toast.error("Pilih Kaji Cepat terlebih dahulu"); return; }
    try {
      setSaving(true);
      const payload = {
        assessment_id: selectedKC,
        detail,
        status: asDraft ? "DRAFT" : "FINAL",
        doc_photos: docPhotoPreviews,
        infographic_path: infographicPreview,
        attachments: attachmentNames,
      };
      if (editId) {
        await updateJuklakAssessment(editId, payload);
        toast.success("Berhasil diperbarui");
      } else {
        await createJuklakAssessment(payload);
        toast.success("Berhasil disimpan");
      }
      setShowForm(false);
      loadList();
    } catch (err: any) { toast.error(err.message || "Gagal menyimpan"); }
    finally { setSaving(false); }
  };

  // Setter helpers
  const setP = (field: string, val: any) => setDetail((d: any) => ({ ...d, pendahuluan: { ...d.pendahuluan, [field]: val } }));
  const setKs = (field: string, val: any) => setDetail((d: any) => ({ ...d, kerusakan: { ...d.kerusakan, [field]: val } }));
  const setUd = (field: string, val: any) => setDetail((d: any) => ({ ...d, upaya_darurat: { ...d.upaya_darurat, [field]: val } }));
  const setIl = (field: string, val: any) => setDetail((d: any) => ({ ...d, informasi_lain: { ...d.informasi_lain, [field]: val } }));
  const setKp = (field: string, val: any) => setDetail((d: any) => ({ ...d, kesimpulan: { ...d.kesimpulan, [field]: val } }));

  const formatDate = (d: string) => { try { return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); } catch { return d; } };

  // ── Photo upload handlers ──
  const handleDocPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setDocPhotoPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleInfographic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setInfographicPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAttachments = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setAttachmentNames(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  // ── Render Form Steps ──
  const renderStep = () => {
    switch (step) {
      case 0: // Pendahuluan
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-base">I. PENDAHULUAN</h3>
            <div className="space-y-3">
              <div><Label>Pilih Kaji Cepat *</Label>
                <Select value={selectedKC?.toString() || ""} onValueChange={v => handleSelectKC(Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Pilih data kaji cepat..." /></SelectTrigger>
                  <SelectContent>{kajiCepatList.map((k: any) => <SelectItem key={k.id} value={k.id.toString()}>KC-{k.id} — {k.disaster_type_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>a. Jenis Kejadian</Label><Input value={detail.pendahuluan.jenis_kejadian} onChange={e => setP("jenis_kejadian", e.target.value)} /></div>
              <div><Label>b. Lokasi Kejadian</Label><Input value={detail.pendahuluan.lokasi} onChange={e => setP("lokasi", e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>c. Waktu Kejadian</Label><Input type="datetime-local" value={detail.pendahuluan.waktu_kejadian ? new Date(detail.pendahuluan.waktu_kejadian).toISOString().slice(0, 16) : ""} onChange={e => setP("waktu_kejadian", e.target.value)} /></div>
                <div><Label>d. Lama Waktu Kejadian</Label><Input value={detail.pendahuluan.lama_waktu} onChange={e => setP("lama_waktu", e.target.value)} placeholder="cth: 3 Jam" /></div>
              </div>
              <div><Label>e. Kronologis</Label><textarea value={detail.pendahuluan.kronologis} onChange={e => setP("kronologis", e.target.value)} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]" /></div>
            </div>
          </div>
        );

      case 1: // Dampak Penduduk
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-base">II. ANALISIS SITUASI DAMPAK</h3>
            <div><Label>a. Cakupan Wilayah Terdampak</Label><textarea value={detail.cakupan_wilayah} onChange={e => setDetail((d: any) => ({ ...d, cakupan_wilayah: e.target.value }))} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]" placeholder="Desa A, Desa B, ..." /></div>
            <KelompokRentanTable label="b. Cakupan Penduduk Terdampak" data={detail.penduduk_terdampak} onChange={(d: any) => setDetail((prev: any) => ({ ...prev, penduduk_terdampak: d }))} />
          </div>
        );

      case 2: // Korban & Pengungsi
        return (
          <div className="space-y-6">
            <h3 className="font-semibold text-base">II. ANALISIS SITUASI DAMPAK (lanjutan)</h3>
            {/* Korban */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">c. Informasi Korban</h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div><Label className="text-xs">Meninggal</Label><Input type="number" value={detail.korban.meninggal || 0} onChange={e => setDetail((d: any) => ({ ...d, korban: { ...d.korban, meninggal: Number(e.target.value) } }))} /></div>
                <div><Label className="text-xs">Luka</Label><Input type="number" value={detail.korban.luka || 0} onChange={e => setDetail((d: any) => ({ ...d, korban: { ...d.korban, luka: Number(e.target.value) } }))} /></div>
                <div><Label className="text-xs">Sakit</Label><Input type="number" value={detail.korban.sakit || 0} onChange={e => setDetail((d: any) => ({ ...d, korban: { ...d.korban, sakit: Number(e.target.value) } }))} /></div>
                <div><Label className="text-xs">Hilang</Label><Input type="number" value={detail.korban.hilang || 0} onChange={e => setDetail((d: any) => ({ ...d, korban: { ...d.korban, hilang: Number(e.target.value) } }))} /></div>
                <div><Label className="text-xs">Mortalitas</Label><Input value={detail.korban.mortalitas || "0%"} onChange={e => setDetail((d: any) => ({ ...d, korban: { ...d.korban, mortalitas: e.target.value } }))} /></div>
              </div>
              <KelompokRentanTable label="Kelompok Rentan / Khusus — Korban" data={detail.korban} onChange={(d: any) => setDetail((prev: any) => ({ ...prev, korban: { ...prev.korban, ...d } }))} />
            </div>
            {/* Pengungsi */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">d. Informasi Penduduk Mengungsi/Dikarantina</h4>
              <div><Label className="text-xs">Jumlah KK Mengungsi</Label><Input type="number" value={detail.pengungsi.jumlah_kk || 0} onChange={e => setDetail((d: any) => ({ ...d, pengungsi: { ...d.pengungsi, jumlah_kk: Number(e.target.value) } }))} /></div>
              <KelompokRentanTable label="Kelompok Rentan / Khusus — Pengungsi" data={detail.pengungsi} onChange={(d: any) => setDetail((prev: any) => ({ ...prev, pengungsi: { ...prev.pengungsi, ...d } }))} />
            </div>
            {/* Tidak Mengungsi */}
            <div className="space-y-3">
              <KelompokRentanTable label="e. Penduduk Terdampak Tidak Mengungsi" data={detail.tidak_mengungsi} onChange={(d: any) => setDetail((prev: any) => ({ ...prev, tidak_mengungsi: d }))} />
            </div>
          </div>
        );

      case 3: // Kerusakan
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-base">II. ANALISIS SITUASI DAMPAK — f. Informasi Kerusakan</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Jumlah Rumah Terdampak</Label><Input type="number" value={detail.kerusakan.rumah_terdampak || 0} onChange={e => setKs("rumah_terdampak", Number(e.target.value))} /></div>
              <div><Label className="text-xs">Rumah Tidak Layak Huni</Label><Input type="number" value={detail.kerusakan.rumah_tidak_layak || 0} onChange={e => setKs("rumah_tidak_layak", Number(e.target.value))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Kerusakan Jalan</Label><Input value={detail.kerusakan.jalan || ""} onChange={e => setKs("jalan", e.target.value)} placeholder="cth: 500m rusak" /></div>
              <div><Label className="text-xs">Kerusakan Jembatan</Label><Input value={detail.kerusakan.jembatan || ""} onChange={e => setKs("jembatan", e.target.value)} /></div>
            </div>
            <div><Label className="text-xs">Kerusakan Lahan</Label><Input value={detail.kerusakan.lahan || ""} onChange={e => setKs("lahan", e.target.value)} placeholder="cth: 2 Ha" /></div>
            <h4 className="text-sm font-semibold text-muted-foreground mt-2">Kerusakan Utilitas</h4>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">Jaringan Listrik</Label><Input value={detail.kerusakan.listrik || ""} onChange={e => setKs("listrik", e.target.value)} /></div>
              <div><Label className="text-xs">Jaringan Telekomunikasi</Label><Input value={detail.kerusakan.telekomunikasi || ""} onChange={e => setKs("telekomunikasi", e.target.value)} /></div>
              <div><Label className="text-xs">Jaringan Air Bersih</Label><Input value={detail.kerusakan.air_bersih || ""} onChange={e => setKs("air_bersih", e.target.value)} /></div>
            </div>
            <div><Label className="text-xs">Kerusakan Prasarana dan Sarana Lain</Label><Input value={detail.kerusakan.lainnya || ""} onChange={e => setKs("lainnya", e.target.value)} /></div>
          </div>
        );

      case 4: // Upaya & Kebutuhan
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-base">III. INFORMASI UPAYA PENANGANAN DARURAT</h3>
            <div><Label>a. Upaya Penyelamatan dan Evakuasi</Label><textarea value={detail.upaya_darurat.evakuasi || ""} onChange={e => setUd("evakuasi", e.target.value)} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]" /></div>
            <div><Label>b. Upaya Pemenuhan Kebutuhan</Label><textarea value={detail.upaya_darurat.kebutuhan || ""} onChange={e => setUd("kebutuhan", e.target.value)} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]" /></div>
            <div><Label>c. Pemulihan Sarana dan Prasarana Vital</Label><textarea value={detail.upaya_darurat.pemulihan || ""} onChange={e => setUd("pemulihan", e.target.value)} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]" /></div>

            <h3 className="font-semibold text-base mt-6">IV. INFORMASI KEBUTUHAN TINDAKAN</h3>
            {detail.kebutuhan.map((k: any, i: number) => (
              <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-start">
                <div><Label className="text-xs">{String.fromCharCode(97 + i)}. Kegiatan</Label><Input value={k.kegiatan} onChange={e => { const arr = [...detail.kebutuhan]; arr[i] = { ...arr[i], kegiatan: e.target.value }; setDetail((d: any) => ({ ...d, kebutuhan: arr })); }} /></div>
                <div><Label className="text-xs">Detail</Label><Input value={k.detail} onChange={e => { const arr = [...detail.kebutuhan]; arr[i] = { ...arr[i], detail: e.target.value }; setDetail((d: any) => ({ ...d, kebutuhan: arr })); }} /></div>
                {!isViewMode && <Button variant="ghost" size="icon" className="mt-5" onClick={() => { const arr = detail.kebutuhan.filter((_: any, j: number) => j !== i); setDetail((d: any) => ({ ...d, kebutuhan: arr.length ? arr : [{ kegiatan: "", detail: "" }] })); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
              </div>
            ))}
            {!isViewMode && <Button variant="outline" size="sm" onClick={() => setDetail((d: any) => ({ ...d, kebutuhan: [...d.kebutuhan, { kegiatan: "", detail: "" }] }))}><Plus className="h-4 w-4 mr-1" /> Tambah Kebutuhan</Button>}

            <h3 className="font-semibold text-base mt-6">V. INFORMASI LAIN</h3>
            <div><Label>a. Titik Lokasi</Label><Input value={detail.informasi_lain.titik_lokasi || ""} onChange={e => setIl("titik_lokasi", e.target.value)} placeholder="cth: -1.43, 121.45" /></div>
            <div><Label>b. Rencana Estimasi Penanganan</Label><Input value={detail.informasi_lain.rencana_penanganan || ""} onChange={e => setIl("rencana_penanganan", e.target.value)} /></div>
            <div><Label>c. Sumber Informasi</Label><Input value={detail.informasi_lain.sumber_informasi || ""} onChange={e => setIl("sumber_informasi", e.target.value)} placeholder="auto-fill dari kaji cepat" /></div>
          </div>
        );

      case 5: // Kesimpulan
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-base">VI. KESIMPULAN DAN REKOMENDASI</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Rekomendasi Penetapan Status</Label>
                <Select value={detail.kesimpulan.rekomendasi_status || ""} onValueChange={v => setKp("rekomendasi_status", v)}>
                  <SelectTrigger><SelectValue placeholder="Ya / Tidak" /></SelectTrigger>
                  <SelectContent><SelectItem value="Ya">Ya</SelectItem><SelectItem value="Tidak">Tidak</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Perkiraan Lama (Hari)</Label><Input type="number" value={detail.kesimpulan.perkiraan_hari || 0} onChange={e => setKp("perkiraan_hari", Number(e.target.value))} /></div>
            </div>
            <div><Label>Alasan</Label><textarea value={detail.kesimpulan.alasan || ""} onChange={e => setKp("alasan", e.target.value)} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]" /></div>

            <h4 className="text-sm font-semibold mt-4">Kesimpulan Kebutuhan Tindakan dan Sumber Daya</h4>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-muted/50"><th className="text-left px-3 py-2 text-xs font-medium">Sektor</th><th className="text-left px-3 py-2 text-xs font-medium">Kebutuhan Tindakan dan Sumber Daya</th></tr></thead>
                <tbody>
                  {detail.kesimpulan.sektor_kebutuhan.map((s: any, i: number) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-1.5 text-xs align-top whitespace-nowrap">{s.sektor}</td>
                      <td className="px-3 py-1"><Input className="h-7 text-xs" value={s.kebutuhan || ""} onChange={e => {
                        const arr = [...detail.kesimpulan.sektor_kebutuhan];
                        arr[i] = { ...arr[i], kebutuhan: e.target.value };
                        setKp("sektor_kebutuhan", arr);
                      }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 6: // Dokumentasi
        return (
          <div className="space-y-6">
            <h3 className="font-semibold text-base">DOKUMENTASI & LAMPIRAN</h3>
            {/* Dokumentasi Foto */}
            <div className="space-y-2">
              <Label>Dokumentasi Pengkajian Cepat (Foto)</Label>
              <Input type="file" accept="image/jpeg,image/png,image/jpg" multiple onChange={handleDocPhotos} />
              {docPhotoPreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {docPhotoPreviews.map((p, i) => (
                    <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border group">
                      <img src={p} className="h-full w-full object-cover" alt={`Dok ${i + 1}`} />
                      {!isViewMode && <button onClick={() => setDocPhotoPreviews(prev => prev.filter((_, j) => j !== i))} className="absolute top-0 right-0 bg-destructive text-white text-[10px] rounded-bl px-1 opacity-0 group-hover:opacity-100 transition-opacity">×</button>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Infografis */}
            <div className="space-y-2">
              <Label>Infografis Pengkajian Cepat (Gambar)</Label>
              {!isViewMode && <Input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleInfographic} />}
              {infographicPreview && (
                <div className="relative max-w-xs mt-2">
                  <img src={infographicPreview} className="rounded-lg border max-h-48 object-contain" alt="Infografis" />
                  {!isViewMode && <button onClick={() => setInfographicPreview(null)} className="absolute top-1 right-1 bg-destructive text-white text-xs rounded px-1.5 py-0.5">×</button>}
                </div>
              )}
            </div>
            {/* Lampiran */}
            <div className="space-y-2">
              <Label>Lampiran (PDF, PNG, JPG)</Label>
              {!isViewMode && <Input type="file" accept=".pdf,image/jpeg,image/png,image/jpg" multiple onChange={handleAttachments} />}
              {attachmentNames.length > 0 && (
                <div className="space-y-1 mt-2">
                  {attachmentNames.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs p-2 rounded border bg-muted/30">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate">{a.startsWith("data:") ? `Lampiran ${i + 1}` : a}</span>
                      {!isViewMode && <button onClick={() => setAttachmentNames(prev => prev.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/80"><Trash2 className="h-3 w-3" /></button>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      default: return null;
    }
  };

  // ── Status badge ──
  const StatusBadge = ({ status }: { status: string }) => {
    const cls = status === "FINAL" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700";
    return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cls}`}>{status}</span>;
  };

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Stepper */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const done = i < step;
            return (
              <button key={i} onClick={() => setStep(i)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${active ? "bg-primary text-primary-foreground" : done ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
                {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Content */}
        <div className="bg-card rounded-xl border p-6 min-h-[400px]">
          <fieldset disabled={isViewMode} className="group">
            {renderStep()}
          </fieldset>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            {step > 0 && <Button variant="outline" onClick={() => setStep(s => s - 1)}><ChevronLeft className="h-4 w-4 mr-1" /> Sebelumnya</Button>}
            <Button variant="ghost" onClick={() => { setShowForm(false); setIsViewMode(false); }}>{isViewMode ? "Tutup" : "Batal"}</Button>
          </div>
          <div className="flex gap-2">
            {!isViewMode && (
              <Button variant="outline" onClick={() => handleSave(true)} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Simpan Draft
              </Button>
            )}
            {step < STEPS.length - 1
              ? <Button onClick={() => setStep(s => s + 1)}>Selanjutnya <ChevronRight className="h-4 w-4 ml-1" /></Button>
              : !isViewMode && <Button onClick={() => handleSave(false)} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />} Simpan Final</Button>
            }
          </div>
        </div>
      </div>
    );
  }

  // ── List View ──
  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Field Assessment (Kaji Cepat Lapangan)</h1>
            <p className="page-subtitle">Input data kaji cepat sesuai format Juklak resmi</p>
          </div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Buat Kaji Cepat Lapangan</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div className="stat-card p-4"><div className="text-2xl font-bold">{assessments.length}</div><div className="text-xs text-muted-foreground">Total</div></div>
        <div className="stat-card p-4"><div className="text-2xl font-bold text-amber-500">{assessments.filter(a => a.status === "DRAFT").length}</div><div className="text-xs text-muted-foreground">Draft</div></div>
        <div className="stat-card p-4"><div className="text-2xl font-bold text-green-500">{assessments.filter(a => a.status === "FINAL").length}</div><div className="text-xs text-muted-foreground">Final</div></div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : assessments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Belum ada data kaji cepat lapangan.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {assessments.map((a: any) => (
            <div key={a.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/30 transition-colors">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{a.report_code}</span>
                  <StatusBadge status={a.status || "DRAFT"} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{a.disaster_type} — {a.district}, {a.regency}</p>
                <p className="text-xs text-muted-foreground">{a.creator_name} · {formatDate(a.created_at)}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => openView(a.id)} title="Lihat"><Eye className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(a.id)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(a.id)} className="text-destructive hover:bg-destructive/10" title="Hapus"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog Hapus Step 1 */}
      <Dialog open={deleteConfirm !== null && deleteConfirmStep2 === null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Data Kaji Cepat?</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground whitespace-pre-line">
            Apakah Anda yakin ingin menghapus data ini?
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => setDeleteConfirmStep2(deleteConfirm)}>Ya, Lanjutkan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Hapus Step 2 (Konfirmasi Berlapis) */}
      <Dialog open={deleteConfirmStep2 !== null} onOpenChange={(open) => {
        if (!open) { setDeleteConfirm(null); setDeleteConfirmStep2(null); }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Konfirmasi Akhir Penghapusan!</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm font-semibold flex flex-col gap-2">
            <p>Peringatan: Data yang dihapus TIDAK DAPAT dikembalikan.</p>
            <p className="text-muted-foreground font-normal">Tekan "Hapus Permanen" jika Anda benar-benar yakin.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteConfirm(null); setDeleteConfirmStep2(null); }}>Batal</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteConfirmStep2!)}>Hapus Permanen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
