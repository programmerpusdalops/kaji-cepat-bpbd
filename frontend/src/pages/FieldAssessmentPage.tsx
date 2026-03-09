import { useState } from "react";
import { submitFieldAssessment } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// TODO: POST /api/field-assessment

export default function FieldAssessmentPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    report_id: "", province: "Jawa Barat", regency: "", district: "", village: "", lat: "", lng: "",
    dead: "0", missing: "0", serious_injury: "0", minor_injury: "0", refugees: "0",
    house_heavy: "0", house_medium: "0", house_light: "0",
    fac_school: "0", fac_worship: "0", fac_health: "0", fac_gov: "0",
    inf_road: false, inf_bridge: false, inf_electricity: false, inf_water: false, inf_telecom: false,
  });

  const update = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitFieldAssessment({
        report_id: form.report_id,
        location: { province: form.province, regency: form.regency, district: form.district, village: form.village, lat: Number(form.lat), lng: Number(form.lng) },
        victims: { dead: +form.dead, missing: +form.missing, serious_injury: +form.serious_injury, minor_injury: +form.minor_injury, refugees: +form.refugees },
        house_damage: { heavy: +form.house_heavy, medium: +form.house_medium, light: +form.house_light },
        facility_damage: { school: +form.fac_school, worship: +form.fac_worship, health: +form.fac_health, government: +form.fac_gov },
        infrastructure_damage: { road: form.inf_road, bridge: form.inf_bridge, electricity: form.inf_electricity, water: form.inf_water, telecom: form.inf_telecom },
      });
      toast.success("Data kaji cepat berhasil disimpan");
    } catch { toast.error("Gagal menyimpan data"); }
    finally { setLoading(false); }
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="stat-card"><h3 className="font-semibold mb-4 text-foreground">{title}</h3><div className="space-y-3">{children}</div></div>
  );

  const NumField = ({ label, field }: { label: string; field: string }) => (
    <div><Label>{label}</Label><Input type="number" min="0" value={(form as any)[field]} onChange={e => update(field, e.target.value)} /></div>
  );

  const CheckField = ({ label, field }: { label: string; field: string }) => (
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={(form as any)[field]} onChange={e => update(field, e.target.checked)} className="rounded border-input" />{label}</label>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Kaji Cepat Lapangan</h1>
        <p className="page-subtitle">Form input data kaji cepat bencana</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl">
        <Section title="Lokasi">
          <div><Label>ID Laporan</Label><Input value={form.report_id} onChange={e => update("report_id", e.target.value)} placeholder="ID Laporan Terkait" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>Provinsi</Label><Input value={form.province} onChange={e => update("province", e.target.value)} /></div>
            <div><Label>Kabupaten/Kota</Label><Input value={form.regency} onChange={e => update("regency", e.target.value)} /></div>
            <div><Label>Kecamatan</Label><Input value={form.district} onChange={e => update("district", e.target.value)} /></div>
            <div><Label>Desa/Kelurahan</Label><Input value={form.village} onChange={e => update("village", e.target.value)} /></div>
            <div><Label>Latitude</Label><Input value={form.lat} onChange={e => update("lat", e.target.value)} placeholder="-6.9175" /></div>
            <div><Label>Longitude</Label><Input value={form.lng} onChange={e => update("lng", e.target.value)} placeholder="107.6191" /></div>
          </div>
        </Section>

        <Section title="Dampak Korban">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <NumField label="Meninggal" field="dead" />
            <NumField label="Hilang" field="missing" />
            <NumField label="Luka Berat" field="serious_injury" />
            <NumField label="Luka Ringan" field="minor_injury" />
            <NumField label="Mengungsi" field="refugees" />
          </div>
        </Section>

        <Section title="Kerusakan Rumah">
          <div className="grid grid-cols-3 gap-3">
            <NumField label="Rusak Berat" field="house_heavy" />
            <NumField label="Rusak Sedang" field="house_medium" />
            <NumField label="Rusak Ringan" field="house_light" />
          </div>
        </Section>

        <Section title="Kerusakan Fasilitas">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <NumField label="Sekolah" field="fac_school" />
            <NumField label="Rumah Ibadah" field="fac_worship" />
            <NumField label="Puskesmas" field="fac_health" />
            <NumField label="Kantor Desa" field="fac_gov" />
          </div>
        </Section>

        <Section title="Kerusakan Infrastruktur">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <CheckField label="Jalan" field="inf_road" />
            <CheckField label="Jembatan" field="inf_bridge" />
            <CheckField label="Listrik" field="inf_electricity" />
            <CheckField label="Air Bersih" field="inf_water" />
            <CheckField label="Telekomunikasi" field="inf_telecom" />
          </div>
        </Section>

        <Button type="submit" disabled={loading} size="lg">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Data Kaji Cepat
        </Button>
      </form>
    </div>
  );
}
