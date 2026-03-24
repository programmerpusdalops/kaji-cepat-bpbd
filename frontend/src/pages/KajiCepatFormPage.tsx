import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createRapidAssessment, updateRapidAssessment, getRapidAssessmentById,
  getDisasterTypes, getRegions, getNeedItems, generateWAMessage,
} from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Check, Loader2, Copy, Send, Plus, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";

// ──────────────── Types ────────────────

interface VillageData {
  village: string;
  jumlah_kk: number;
  jumlah_jiwa: number;
  keterangan: string;
  status: "DATA" | "NIHIL" | "PENDING";
}

interface FormData {
  disaster_type_id: string;
  province: string;
  regency: string;
  district: string;
  waktu_kejadian: string;
  waktu_laporan: string;
  villages: string[];
  kronologis: string;
  affected: VillageData[];
  refugees: VillageData[];
  casualties: VillageData[];
  steps: string[];
  needs: number[];
  custom_needs: string[];
  situations: string[];
  sources: string[];
  peta_link: string;
  recipients: { nomor: number; nama: string; is_default: boolean }[];
}

// ──────────────── Constants ────────────────

const STEP_LABELS = [
  "Informasi Kejadian",
  "Lokasi",
  "Kronologis",
  "Data Dampak",
  "Tindakan",
  "Sumber & Kirim",
];

const DEFAULT_STEPS_TEMPLATES = [
  "Melakukan Assessment",
  "Berkoordinasi dengan TRC dan Pusdalops BPBD Kab. {kabupaten}",
  "TRC BPBD Kab. {kabupaten} melakukan assessment",
];

const DEFAULT_SOURCES = [
  "TRC & PUSDALOPS BPBD PROV. SULTENG",
  "PUSDALOPS BPBD KAB. {kabupaten}",
  "APARAT DESA SETEMPAT",
];

const DEFAULT_RECIPIENTS = [
  { nomor: 1, nama: "Kepala BNPB RI", is_default: true },
  { nomor: 2, nama: "Menteri Sosial RI", is_default: true },
  { nomor: 3, nama: "Gubernur Sulteng", is_default: true },
  { nomor: 4, nama: "Wakil Gubernur Sulteng", is_default: true },
  { nomor: 5, nama: "Ketua DPRD Prov. Sulteng", is_default: true },
  { nomor: 6, nama: "Deputi Penanganan Darurat BNPB", is_default: true },
  { nomor: 7, nama: "Deputi Logistik dan Peralatan BNPB", is_default: true },
  { nomor: 8, nama: "Sekda Prov. Sulteng", is_default: true },
  { nomor: 9, nama: "Kadis Sosial Prov. Sulteng", is_default: true },
  { nomor: 10, nama: "Kadis Pangan Prov. Sulteng", is_default: true },
];

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const getHari = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return HARI[d.getDay()] || "";
};

const emptyVillageData = (village: string): VillageData => ({
  village, jumlah_kk: 0, jumlah_jiwa: 0, keterangan: "", status: "PENDING",
});

const initialForm: FormData = {
  disaster_type_id: "",
  province: "Sulawesi Tengah",
  regency: "",
  district: "",
  waktu_kejadian: new Date().toISOString().slice(0, 16),
  waktu_laporan: new Date().toISOString().slice(0, 16),
  villages: [""],
  kronologis: "",
  affected: [],
  refugees: [],
  casualties: [],
  steps: [...DEFAULT_STEPS_TEMPLATES],
  needs: [],
  custom_needs: [],
  situations: [""],
  sources: [...DEFAULT_SOURCES],
  peta_link: "",
  recipients: [...DEFAULT_RECIPIENTS],
};

// ──────────────── Component ────────────────

export default function KajiCepatFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({ ...initialForm });
  const [saving, setSaving] = useState(false);
  const [disasterTypes, setDisasterTypes] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [needItems, setNeedItems] = useState<any[]>([]);
  const [waPreview, setWaPreview] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  // Load master data
  useEffect(() => {
    getDisasterTypes().then(setDisasterTypes).catch(() => {});
    getRegions().then(setRegions).catch(() => {});
    getNeedItems().then(setNeedItems).catch(() => {});
  }, []);

  // Load existing data if editing
  useEffect(() => {
    if (!id) return;
    getRapidAssessmentById(Number(id)).then(data => {
      setForm({
        disaster_type_id: String(data.disaster_type_id),
        province: data.province || "Sulawesi Tengah",
        regency: data.regency || "",
        district: data.district || "",
        waktu_kejadian: data.waktu_kejadian?.slice(0, 16) || "",
        waktu_laporan: data.waktu_laporan?.slice(0, 16) || "",
        villages: data.villages?.map((v: any) => v.village_name) || [""],
        kronologis: data.kronologis || "",
        affected: data.affected?.map((a: any) => ({
          village: a.village_name || "",
          jumlah_kk: a.jumlah_kk || 0,
          jumlah_jiwa: a.jumlah_jiwa || 0,
          keterangan: a.keterangan || "",
          status: a.status || "PENDING",
        })) || [],
        refugees: data.refugees?.map((r: any) => ({
          village: r.village_name || "",
          jumlah_kk: r.jumlah_kk || 0,
          jumlah_jiwa: r.jumlah_jiwa || 0,
          keterangan: r.keterangan || "",
          status: r.status || "PENDING",
        })) || [],
        casualties: data.casualties?.map((c: any) => ({
          village: c.village_name || "",
          jumlah_kk: c.jumlah_kk || 0,
          jumlah_jiwa: c.jumlah_jiwa || 0,
          keterangan: c.keterangan || "",
          status: c.status || "PENDING",
        })) || [],
        steps: data.steps?.map((s: any) => s.langkah) || [...DEFAULT_STEPS_TEMPLATES],
        needs: data.needs?.filter((n: any) => n.need_item_id).map((n: any) => n.need_item_id) || [],
        custom_needs: data.needs?.filter((n: any) => n.custom_name).map((n: any) => n.custom_name) || [],
        situations: data.situations?.map((s: any) => s.situasi) || [""],
        sources: data.sources?.map((s: any) => s.sumber) || [...DEFAULT_SOURCES],
        peta_link: data.peta_link || "",
        recipients: data.recipients?.length > 0
          ? data.recipients.map((r: any) => ({ nomor: r.nomor, nama: r.nama, is_default: r.is_default }))
          : [...DEFAULT_RECIPIENTS],
      });
    }).catch(() => toast.error("Gagal memuat data"));
  }, [id]);

  // Sync village data arrays when villages change
  const syncVillageData = useCallback((villages: string[]) => {
    const validVillages = villages.filter(v => v.trim());
    const syncArr = (arr: VillageData[]) => {
      return validVillages.map(v => arr.find(a => a.village === v) || emptyVillageData(v));
    };
    setForm(f => ({
      ...f,
      affected: syncArr(f.affected),
      refugees: syncArr(f.refugees),
      casualties: syncArr(f.casualties),
    }));
  }, []);

  const updateForm = (key: keyof FormData, value: any) => {
    setForm(f => ({ ...f, [key]: value }));
    if (key === "villages") {
      syncVillageData(value);
    }
  };

  // ── Helpers ──
  const kabupaten = form.regency;
  const replaceVars = (text: string) => text
    .replace(/\{kabupaten\}/g, kabupaten)
    .replace(/\{kecamatan\}/g, form.district);

  // Derived data: unique kabupaten from regions
  const uniqueRegencies = [...new Set(regions.filter((r: any) => r.regency).map((r: any) => r.regency))].sort();
  const uniqueDistricts = [...new Set(regions.filter((r: any) => r.regency === form.regency && r.district).map((r: any) => r.district))].sort();
  const uniqueVillages = [...new Set(regions.filter((r: any) => r.district === form.district && r.village).map((r: any) => r.village))].sort();

  // ──────────────── Submit ────────────────
  const handleSubmit = async () => {
    // Validation
    if (!form.disaster_type_id) { toast.error("Jenis bencana wajib dipilih"); return; }
    if (!form.regency.trim()) { toast.error("Kabupaten wajib diisi"); return; }
    if (!form.district.trim()) { toast.error("Kecamatan wajib diisi"); return; }
    if (form.villages.filter(v => v.trim()).length === 0) { toast.error("Minimal 1 desa harus diisi"); return; }

    const validVillages = form.villages.filter(v => v.trim());

    const payload = {
      disaster_type_id: Number(form.disaster_type_id),
      province: form.province,
      regency: form.regency,
      district: form.district,
      waktu_kejadian: form.waktu_kejadian ? new Date(form.waktu_kejadian).toISOString() : new Date().toISOString(),
      waktu_laporan: form.waktu_laporan ? new Date(form.waktu_laporan).toISOString() : new Date().toISOString(),
      villages: validVillages,
      kronologis: form.kronologis,
      affected: form.affected.filter(a => validVillages.includes(a.village)),
      refugees: form.refugees.filter(r => validVillages.includes(r.village)),
      casualties: form.casualties.filter(c => validVillages.includes(c.village)),
      steps: form.steps.filter(s => s.trim()).map(s => replaceVars(s)),
      needs: [
        ...form.needs.map(id => ({ need_item_id: id, custom_name: null })),
        ...form.custom_needs.filter(n => n.trim()).map(n => ({ need_item_id: null, custom_name: n })),
      ],
      situations: form.situations.filter(s => s.trim()),
      sources: form.sources.filter(s => s.trim()).map(s => replaceVars(s)),
      peta_link: form.peta_link,
      recipients: form.recipients,
    };

    try {
      setSaving(true);
      if (isEdit) {
        await updateRapidAssessment(Number(id), payload);
        toast.success("Kaji cepat berhasil diperbarui");
      } else {
        await createRapidAssessment(payload);
        toast.success("Kaji cepat berhasil dibuat");
      }
      navigate("/kaji-cepat");
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan kaji cepat");
    } finally {
      setSaving(false);
    }
  };

  // WA Preview (on last step)
  const loadPreview = async () => {
    if (!isEdit || !id) return;
    try {
      setPreviewLoading(true);
      const data = await generateWAMessage(Number(id));
      setWaPreview(data.message);
    } catch {
      // Silent fail
    } finally {
      setPreviewLoading(false);
    }
  };

  const canNext = () => {
    switch (step) {
      case 0: return form.disaster_type_id && form.waktu_kejadian && form.waktu_laporan;
      case 1: return form.regency.trim() && form.district.trim() && form.villages.some(v => v.trim());
      default: return true;
    }
  };

  // ──────────────── Render Helpers ────────────────

  const renderVillageDataSection = (title: string, dataKey: "affected" | "refugees" | "casualties") => {
    const validVillages = form.villages.filter(v => v.trim());
    if (validVillages.length === 0) return <p className="text-sm text-muted-foreground">Tambahkan desa di Step 2 terlebih dahulu</p>;

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-sm">{title}</h4>
        {validVillages.map((village, vi) => {
          const data = form[dataKey].find(d => d.village === village) || emptyVillageData(village);
          const idx = form[dataKey].findIndex(d => d.village === village);

          const updateData = (field: keyof VillageData, value: any) => {
            setForm(f => {
              const arr = [...f[dataKey]];
              if (idx >= 0) {
                arr[idx] = { ...arr[idx], [field]: value };
              } else {
                arr.push({ ...emptyVillageData(village), [field]: value });
              }
              return { ...f, [dataKey]: arr };
            });
          };

          return (
            <div key={vi} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Desa {village}</span>
                <Select value={data.status} onValueChange={v => updateData("status", v)}>
                  <SelectTrigger className="w-40 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DATA">Ada Data</SelectItem>
                    <SelectItem value="PENDING">Dalam Pendataan</SelectItem>
                    <SelectItem value="NIHIL">NIHIL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {data.status === "DATA" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Jumlah KK</Label>
                    <Input type="number" min={0} value={data.jumlah_kk} onChange={e => updateData("jumlah_kk", Number(e.target.value))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Jumlah Jiwa</Label>
                    <Input type="number" min={0} value={data.jumlah_jiwa} onChange={e => updateData("jumlah_jiwa", Number(e.target.value))} className="h-8 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Keterangan (opsional)</Label>
                    <Input value={data.keterangan} onChange={e => updateData("keterangan", e.target.value)} placeholder="Keterangan tambahan" className="h-8 text-sm" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ──────────────── Steps Content ────────────────

  const renderStep = () => {
    switch (step) {
      // ── Step 0: Informasi Kejadian ──
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Jenis Bencana *</Label>
              <Select value={form.disaster_type_id} onValueChange={v => updateForm("disaster_type_id", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih jenis bencana..." /></SelectTrigger>
                <SelectContent>
                  {disasterTypes.map((t: any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Waktu Kejadian *</Label>
                <Input type="datetime-local" value={form.waktu_kejadian} onChange={e => updateForm("waktu_kejadian", e.target.value)} />
                {form.waktu_kejadian && <p className="text-xs text-muted-foreground">Hari: {getHari(form.waktu_kejadian)}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Waktu Terima Laporan *</Label>
                <Input type="datetime-local" value={form.waktu_laporan} onChange={e => updateForm("waktu_laporan", e.target.value)} />
                {form.waktu_laporan && <p className="text-xs text-muted-foreground">Hari: {getHari(form.waktu_laporan)}</p>}
              </div>
            </div>
          </div>
        );

      // ── Step 1: Lokasi ──
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Provinsi</Label>
              <Input value={form.province} disabled className="bg-muted" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Kabupaten *</Label>
                {uniqueRegencies.length > 0 ? (
                  <Select value={form.regency} onValueChange={v => { updateForm("regency", v); updateForm("district", ""); updateForm("villages", [""]); }}>
                    <SelectTrigger><SelectValue placeholder="Pilih kabupaten..." /></SelectTrigger>
                    <SelectContent>{uniqueRegencies.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                ) : (
                  <Input value={form.regency} onChange={e => updateForm("regency", e.target.value)} placeholder="Ketik nama kabupaten" />
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Kecamatan *</Label>
                {uniqueDistricts.length > 0 ? (
                  <Select value={form.district} onValueChange={v => { updateForm("district", v); updateForm("villages", [""]); }}>
                    <SelectTrigger><SelectValue placeholder="Pilih kecamatan..." /></SelectTrigger>
                    <SelectContent>{uniqueDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                ) : (
                  <Input value={form.district} onChange={e => updateForm("district", e.target.value)} placeholder="Ketik nama kecamatan" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Desa * (bisa lebih dari 1)</Label>
              {form.villages.map((v, i) => (
                <div key={i} className="flex gap-2">
                  {uniqueVillages.length > 0 ? (
                    <Select value={v} onValueChange={val => {
                      const newVillages = [...form.villages];
                      newVillages[i] = val;
                      updateForm("villages", newVillages);
                    }}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="Pilih desa..." /></SelectTrigger>
                      <SelectContent>{uniqueVillages.filter(uv => !form.villages.includes(uv) || uv === v).map(uv => <SelectItem key={uv} value={uv}>{uv}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : (
                    <Input className="flex-1" value={v} onChange={e => {
                      const newVillages = [...form.villages];
                      newVillages[i] = e.target.value;
                      updateForm("villages", newVillages);
                    }} placeholder="Ketik nama desa" />
                  )}
                  {form.villages.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => {
                      const newVillages = form.villages.filter((_, idx) => idx !== i);
                      updateForm("villages", newVillages);
                    }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => updateForm("villages", [...form.villages, ""])} className="gap-1">
                <Plus className="h-3 w-3" /> Tambah Desa
              </Button>
            </div>
          </div>
        );

      // ── Step 2: Kronologis ──
      case 2: {
        const template = `Pada ${getHari(form.waktu_kejadian)}, ${form.waktu_kejadian ? new Date(form.waktu_kejadian).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "[tanggal]"} sekitar pukul ${form.waktu_kejadian ? new Date(form.waktu_kejadian).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "[jam]"} WITA, terjadi ${disasterTypes.find((t: any) => String(t.id) === form.disaster_type_id)?.name || "[jenis bencana]"} di ${form.villages.filter(v => v.trim()).map(v => `Desa ${v}`).join(", ")} Kec. ${form.district || "[kecamatan]"} Kab. ${form.regency || "[kabupaten]"}. Kejadian disebabkan oleh `;

        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Kronologis Kejadian</Label>
                <Button variant="outline" size="sm" onClick={() => updateForm("kronologis", template)} className="gap-1 text-xs">
                  <Wand2 className="h-3 w-3" /> Template Otomatis
                </Button>
              </div>
              <textarea
                value={form.kronologis}
                onChange={e => updateForm("kronologis", e.target.value)}
                placeholder="Tuliskan kronologis kejadian bencana..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[150px] focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        );
      }

      // ── Step 3: Data Dampak ──
      case 3:
        return (
          <div className="space-y-6">
            {renderVillageDataSection("📌 TERDAMPAK", "affected")}
            <hr />
            {renderVillageDataSection("📌 PENGUNGSI", "refugees")}
            <hr />
            {renderVillageDataSection("📌 KORBAN JIWA", "casualties")}
          </div>
        );

      // ── Step 4: Tindakan ──
      case 4:
        return (
          <div className="space-y-6">
            {/* Langkah */}
            <div className="space-y-2">
              <Label>Langkah yang Dilaksanakan</Label>
              {form.steps.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-sm text-muted-foreground mt-2 w-6">{i + 1}.</span>
                  <Input className="flex-1" value={s} onChange={e => {
                    const arr = [...form.steps]; arr[i] = e.target.value; updateForm("steps", arr);
                  }} placeholder="Langkah..." />
                  {form.steps.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => updateForm("steps", form.steps.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => updateForm("steps", [...form.steps, ""])} className="gap-1">
                <Plus className="h-3 w-3" /> Tambah Langkah
              </Button>
              <p className="text-xs text-muted-foreground">Gunakan {"{kabupaten}"} untuk auto-replace nama kabupaten</p>
            </div>

            <hr />

            {/* Kebutuhan */}
            <div className="space-y-2">
              <Label>Kebutuhan Mendesak</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {needItems.map((item: any) => (
                  <label key={item.id} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={form.needs.includes(item.id)}
                      onCheckedChange={(checked) => {
                        updateForm("needs", checked ? [...form.needs, item.id] : form.needs.filter((n: number) => n !== item.id));
                      }}
                    />
                    {item.name}
                  </label>
                ))}
              </div>
              {/* Custom needs */}
              {form.custom_needs.map((n, i) => (
                <div key={i} className="flex gap-2">
                  <Input className="flex-1" value={n} onChange={e => {
                    const arr = [...form.custom_needs]; arr[i] = e.target.value; updateForm("custom_needs", arr);
                  }} placeholder="Kebutuhan lainnya..." />
                  <Button variant="ghost" size="icon" onClick={() => updateForm("custom_needs", form.custom_needs.filter((_, idx) => idx !== i))}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => updateForm("custom_needs", [...form.custom_needs, ""])} className="gap-1">
                <Plus className="h-3 w-3" /> Kebutuhan Lainnya
              </Button>
            </div>

            <hr />

            {/* Situasi Akhir */}
            <div className="space-y-2">
              <Label>Situasi Akhir</Label>
              {form.situations.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-sm text-muted-foreground mt-2 w-6">{i + 1}.</span>
                  <Input className="flex-1" value={s} onChange={e => {
                    const arr = [...form.situations]; arr[i] = e.target.value; updateForm("situations", arr);
                  }} placeholder="Situasi..." />
                  {form.situations.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => updateForm("situations", form.situations.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => updateForm("situations", [...form.situations, ""])} className="gap-1">
                <Plus className="h-3 w-3" /> Tambah Situasi
              </Button>
            </div>
          </div>
        );

      // ── Step 5: Sumber & Kirim ──
      case 5:
        return (
          <div className="space-y-6">
            {/* Sumber */}
            <div className="space-y-2">
              <Label>Sumber Informasi</Label>
              {form.sources.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-sm text-muted-foreground mt-2 w-6">{i + 1}.</span>
                  <Input className="flex-1" value={s} onChange={e => {
                    const arr = [...form.sources]; arr[i] = e.target.value; updateForm("sources", arr);
                  }} placeholder="Sumber..." />
                  {form.sources.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => updateForm("sources", form.sources.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => updateForm("sources", [...form.sources, ""])} className="gap-1">
                <Plus className="h-3 w-3" /> Tambah Sumber
              </Button>
            </div>

            <hr />

            {/* Peta */}
            <div className="space-y-1.5">
              <Label>Link Peta Kolaboratif (opsional)</Label>
              <Input value={form.peta_link} onChange={e => updateForm("peta_link", e.target.value)} placeholder="https://..." />
            </div>

            <hr />

            {/* Penerima WA */}
            <div className="space-y-2">
              <Label>Penerima WhatsApp</Label>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {form.recipients.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-6 text-muted-foreground text-right">{r.nomor}.</span>
                    {r.is_default ? (
                      <span className="flex-1">{r.nama}</span>
                    ) : (
                      <Input className="flex-1 h-8 text-sm" value={r.nama} onChange={e => {
                        const arr = [...form.recipients]; arr[i] = { ...arr[i], nama: e.target.value }; updateForm("recipients", arr);
                      }} />
                    )}
                    {!r.is_default && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateForm("recipients", form.recipients.filter((_, idx) => idx !== i))}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                const nextNomor = Math.max(...form.recipients.map(r => r.nomor), 0) + 1;
                updateForm("recipients", [...form.recipients, { nomor: nextNomor, nama: "", is_default: false }]);
              }} className="gap-1">
                <Plus className="h-3 w-3" /> Tambah Penerima
              </Button>
            </div>

            {/* WA Preview */}
            {isEdit && waPreview && (
              <>
                <hr />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Preview Pesan WhatsApp</Label>
                    <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(waPreview); toast.success("Disalin!"); }} className="gap-1 text-xs">
                      <Copy className="h-3 w-3" /> Salin
                    </Button>
                  </div>
                  <pre className="whitespace-pre-wrap text-xs bg-muted/50 p-3 rounded-lg max-h-60 overflow-auto font-sans">{waPreview}</pre>
                </div>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // ──────────────── Main Render ────────────────

  return (
    <div className="max-w-3xl mx-auto">
      <Button variant="ghost" onClick={() => navigate("/kaji-cepat")} className="mb-4 gap-1">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Button>

      <h1 className="page-title mb-1">{isEdit ? "Edit Kaji Cepat" : "Buat Kaji Cepat Baru"}</h1>
      <p className="page-subtitle mb-6">Isi form bertahap untuk menghasilkan laporan kaji cepat bencana</p>

      {/* Stepper */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
        {STEP_LABELS.map((label, i) => (
          <button
            key={i}
            onClick={() => { if (i < step || canNext()) setStep(i); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              i === step ? "bg-primary text-primary-foreground shadow-sm" :
              i < step ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20" :
              "bg-muted text-muted-foreground"
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
              i < step ? "bg-primary text-primary-foreground" :
              i === step ? "bg-primary-foreground text-primary" :
              "bg-muted-foreground/30 text-muted-foreground"
            }`}>
              {i < step ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="stat-card p-6 mb-6">
        <h3 className="font-semibold mb-4">
          Step {step + 1}: {STEP_LABELS[step]}
        </h3>
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Sebelumnya
        </Button>

        {step < STEP_LABELS.length - 1 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="gap-1">
            Selanjutnya <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex gap-2">
            {isEdit && (
              <Button variant="outline" onClick={loadPreview} disabled={previewLoading} className="gap-1">
                {previewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Preview WA
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={saving} className="gap-1">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {isEdit ? "Simpan Perubahan" : "Simpan Kaji Cepat"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
