import { useEffect, useState, useMemo } from "react";
import {
  getMasterData,
  createDisasterType, updateDisasterType, deleteDisasterType,
  createAgency, updateAgency, deleteAgency,
  createRegion, updateRegion, deleteRegion,
  createNeedItem, updateNeedItem, deleteNeedItem,
} from "@/services/apiService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Loader2, Plus, Pencil, Trash2, Search, Database, Building2, MapPin, AlertTriangle, Package,
} from "lucide-react";

// ───────── Types ─────────
interface DisasterType { id: number; name: string }
interface Agency { id: number; name: string; type: string | null }
interface Region { id: number; province: string; regency: string; district: string; village: string }
interface NeedItem { id: number; name: string; unit: string | null }

// ───────── Generic CRUD Hook ─────────
function useCrud<T extends { id: number }>(
  createFn: (...args: any[]) => Promise<T>,
  updateFn: (...args: any[]) => Promise<T>,
  deleteFn: (id: number) => Promise<any>,
  onSuccess: () => void,
) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<T | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const doCreate = async (args: any[]) => {
    setSubmitting(true);
    try { await createFn(...args); setCreateOpen(false); onSuccess(); return true; }
    catch (err: any) { toast.error(err.message || "Gagal menambahkan data"); return false; }
    finally { setSubmitting(false); }
  };
  const doUpdate = async (id: number, args: any[]) => {
    setSubmitting(true);
    try { await updateFn(id, ...args); setEditOpen(false); setSelected(null); onSuccess(); return true; }
    catch (err: any) { toast.error(err.message || "Gagal memperbarui data"); return false; }
    finally { setSubmitting(false); }
  };
  const doDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    try { await deleteFn(selected.id); setDeleteOpen(false); setSelected(null); onSuccess(); }
    catch (err: any) { toast.error(err.message || "Gagal menghapus data"); }
    finally { setSubmitting(false); }
  };

  return { createOpen, setCreateOpen, editOpen, setEditOpen, deleteOpen, setDeleteOpen, selected, setSelected, submitting, doCreate, doUpdate, doDelete };
}

export default function MasterDataPage() {
  const [disasterTypes, setDisasterTypes] = useState<DisasterType[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [needItems, setNeedItems] = useState<NeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchDT, setSearchDT] = useState("");
  const [searchAg, setSearchAg] = useState("");
  const [searchRg, setSearchRg] = useState("");
  const [searchNI, setSearchNI] = useState("");

  // Form state per entity type
  const [dtForm, setDtForm] = useState({ name: "" });
  const [agForm, setAgForm] = useState({ name: "", type: "" });
  const [rgForm, setRgForm] = useState({ province: "", regency: "", district: "", village: "" });
  const [niForm, setNiForm] = useState({ name: "", unit: "" });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await getMasterData();
      setDisasterTypes(data.disaster_types || []);
      setAgencies(data.agencies || []);
      setRegions(data.regions || []);
      setNeedItems(data.need_items || []);
    } catch { toast.error("Gagal memuat data master"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  // CRUD hooks
  const dt = useCrud(createDisasterType, updateDisasterType, deleteDisasterType, () => { fetchAll(); toast.success("Berhasil!"); });
  const ag = useCrud(createAgency, updateAgency, deleteAgency, () => { fetchAll(); toast.success("Berhasil!"); });
  const rg = useCrud(createRegion, updateRegion, deleteRegion, () => { fetchAll(); toast.success("Berhasil!"); });
  const ni = useCrud(createNeedItem, updateNeedItem, deleteNeedItem, () => { fetchAll(); toast.success("Berhasil!"); });

  // Filtered data
  const filteredDT = useMemo(() => disasterTypes.filter(t => t.name.toLowerCase().includes(searchDT.toLowerCase())), [disasterTypes, searchDT]);
  const filteredAg = useMemo(() => agencies.filter(a => a.name.toLowerCase().includes(searchAg.toLowerCase()) || (a.type || "").toLowerCase().includes(searchAg.toLowerCase())), [agencies, searchAg]);
  const filteredRg = useMemo(() => {
    if (!searchRg) return regions;
    const s = searchRg.toLowerCase();
    return regions.filter(r => r.province.toLowerCase().includes(s) || (r.regency || "").toLowerCase().includes(s) || (r.district || "").toLowerCase().includes(s) || (r.village || "").toLowerCase().includes(s));
  }, [regions, searchRg]);
  const filteredNI = useMemo(() => needItems.filter(n => n.name.toLowerCase().includes(searchNI.toLowerCase()) || (n.unit || "").toLowerCase().includes(searchNI.toLowerCase())), [needItems, searchNI]);

  const stats = useMemo(() => ({
    totalDT: disasterTypes.length, totalAg: agencies.length,
    totalRg: regions.length, totalNI: needItems.length,
  }), [disasterTypes, agencies, regions, needItems]);

  // ── Helper: table rendering ──
  const SearchBar = ({ value, onChange, placeholder, onAdd }: { value: string; onChange: (v: string) => void; placeholder: string; onAdd: () => void }) => (
    <div className="stat-card"><div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="pl-9" /></div>
      <Button onClick={onAdd} className="gap-2"><Plus className="h-4 w-4" /> Tambah</Button>
    </div></div>
  );

  const ActionBtns = ({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) => (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={onEdit} title="Edit"><Pencil className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onDelete} title="Hapus"><Trash2 className="h-4 w-4" /></Button>
    </div>
  );

  const LoadingRow = ({ cols }: { cols: number }) => (
    <tr><td colSpan={cols} className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /><p className="mt-2 text-muted-foreground">Memuat data...</p></td></tr>
  );

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Data Master</h1><p className="page-subtitle">Kelola data referensi sistem BPBD</p></div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card flex items-center gap-3"><div className="rounded-lg bg-red-500/10 p-2.5"><AlertTriangle className="h-5 w-5 text-red-600" /></div><div><p className="text-xs text-muted-foreground">Jenis Bencana</p><p className="text-xl font-bold">{stats.totalDT}</p></div></div>
        <div className="stat-card flex items-center gap-3"><div className="rounded-lg bg-blue-500/10 p-2.5"><Building2 className="h-5 w-5 text-blue-600" /></div><div><p className="text-xs text-muted-foreground">Instansi</p><p className="text-xl font-bold">{stats.totalAg}</p></div></div>
        <div className="stat-card flex items-center gap-3"><div className="rounded-lg bg-emerald-500/10 p-2.5"><MapPin className="h-5 w-5 text-emerald-600" /></div><div><p className="text-xs text-muted-foreground">Wilayah</p><p className="text-xl font-bold">{stats.totalRg}</p></div></div>
        <div className="stat-card flex items-center gap-3"><div className="rounded-lg bg-orange-500/10 p-2.5"><Package className="h-5 w-5 text-orange-600" /></div><div><p className="text-xs text-muted-foreground">Item Kebutuhan</p><p className="text-xl font-bold">{stats.totalNI}</p></div></div>
      </div>

      <Tabs defaultValue="disaster_types">
        <TabsList>
          <TabsTrigger value="disaster_types">Jenis Bencana</TabsTrigger>
          <TabsTrigger value="agencies">Instansi</TabsTrigger>
          <TabsTrigger value="regions">Wilayah</TabsTrigger>
          <TabsTrigger value="need_items">Kebutuhan</TabsTrigger>
        </TabsList>

        {/* ═══ Tab: Jenis Bencana ═══ */}
        <TabsContent value="disaster_types" className="mt-4 space-y-4">
          <SearchBar value={searchDT} onChange={setSearchDT} placeholder="Cari jenis bencana..." onAdd={() => { setDtForm({ name: "" }); dt.setCreateOpen(true); }} />
          <div className="stat-card overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="border-b"><th className="p-3 text-left text-muted-foreground font-medium w-16">No</th><th className="p-3 text-left text-muted-foreground font-medium">Nama</th><th className="p-3 text-right text-muted-foreground font-medium w-24">Aksi</th></tr></thead>
              <tbody>{loading ? <LoadingRow cols={3} /> : filteredDT.length === 0 ? <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">Tidak ada data</td></tr> : filteredDT.map((t, i) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors"><td className="p-3 text-muted-foreground">{i + 1}</td><td className="p-3"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500" /><span className="font-medium">{t.name}</span></div></td><td className="p-3 text-right"><ActionBtns onEdit={() => { dt.setSelected(t); setDtForm({ name: t.name }); dt.setEditOpen(true); }} onDelete={() => { dt.setSelected(t); dt.setDeleteOpen(true); }} /></td></tr>
              ))}</tbody></table>
          </div>
        </TabsContent>

        {/* ═══ Tab: Instansi ═══ */}
        <TabsContent value="agencies" className="mt-4 space-y-4">
          <SearchBar value={searchAg} onChange={setSearchAg} placeholder="Cari instansi..." onAdd={() => { setAgForm({ name: "", type: "" }); ag.setCreateOpen(true); }} />
          <div className="stat-card overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="border-b"><th className="p-3 text-left text-muted-foreground font-medium w-16">No</th><th className="p-3 text-left text-muted-foreground font-medium">Nama</th><th className="p-3 text-left text-muted-foreground font-medium hidden sm:table-cell">Tipe</th><th className="p-3 text-right text-muted-foreground font-medium w-24">Aksi</th></tr></thead>
              <tbody>{loading ? <LoadingRow cols={4} /> : filteredAg.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Tidak ada data</td></tr> : filteredAg.map((a, i) => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors"><td className="p-3 text-muted-foreground">{i + 1}</td><td className="p-3 font-medium">{a.name}</td><td className="p-3 hidden sm:table-cell">{a.type ? <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">{a.type}</span> : <span className="text-muted-foreground">—</span>}</td><td className="p-3 text-right"><ActionBtns onEdit={() => { ag.setSelected(a); setAgForm({ name: a.name, type: a.type || "" }); ag.setEditOpen(true); }} onDelete={() => { ag.setSelected(a); ag.setDeleteOpen(true); }} /></td></tr>
              ))}</tbody></table>
          </div>
        </TabsContent>

        {/* ═══ Tab: Wilayah ═══ */}
        <TabsContent value="regions" className="mt-4 space-y-4">
          <SearchBar value={searchRg} onChange={setSearchRg} placeholder="Cari wilayah..." onAdd={() => { setRgForm({ province: "", regency: "", district: "", village: "" }); rg.setCreateOpen(true); }} />
          <div className="stat-card overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="border-b"><th className="p-3 text-left text-muted-foreground font-medium w-16">No</th><th className="p-3 text-left text-muted-foreground font-medium">Provinsi</th><th className="p-3 text-left text-muted-foreground font-medium hidden sm:table-cell">Kab/Kota</th><th className="p-3 text-left text-muted-foreground font-medium hidden md:table-cell">Kecamatan</th><th className="p-3 text-left text-muted-foreground font-medium hidden lg:table-cell">Desa/Kel</th><th className="p-3 text-right text-muted-foreground font-medium w-24">Aksi</th></tr></thead>
              <tbody>{loading ? <LoadingRow cols={6} /> : filteredRg.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Tidak ada data</td></tr> : filteredRg.map((r, i) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors"><td className="p-3 text-muted-foreground">{i + 1}</td><td className="p-3 font-medium">{r.province}</td><td className="p-3 hidden sm:table-cell">{r.regency || "—"}</td><td className="p-3 hidden md:table-cell">{r.district || "—"}</td><td className="p-3 hidden lg:table-cell">{r.village || "—"}</td><td className="p-3 text-right"><ActionBtns onEdit={() => { rg.setSelected(r); setRgForm({ province: r.province, regency: r.regency || "", district: r.district || "", village: r.village || "" }); rg.setEditOpen(true); }} onDelete={() => { rg.setSelected(r); rg.setDeleteOpen(true); }} /></td></tr>
              ))}</tbody></table>
            {!loading && filteredRg.length > 0 && <div className="border-t px-3 py-2 text-xs text-muted-foreground">Menampilkan {filteredRg.length} dari {regions.length} wilayah</div>}
          </div>
        </TabsContent>

        {/* ═══ Tab: Kebutuhan ═══ */}
        <TabsContent value="need_items" className="mt-4 space-y-4">
          <SearchBar value={searchNI} onChange={setSearchNI} placeholder="Cari item kebutuhan..." onAdd={() => { setNiForm({ name: "", unit: "" }); ni.setCreateOpen(true); }} />
          <div className="stat-card overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="border-b"><th className="p-3 text-left text-muted-foreground font-medium w-16">No</th><th className="p-3 text-left text-muted-foreground font-medium">Nama Item</th><th className="p-3 text-left text-muted-foreground font-medium">Satuan</th><th className="p-3 text-right text-muted-foreground font-medium w-24">Aksi</th></tr></thead>
              <tbody>{loading ? <LoadingRow cols={4} /> : filteredNI.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Tidak ada data</td></tr> : filteredNI.map((n, i) => (
                <tr key={n.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors"><td className="p-3 text-muted-foreground">{i + 1}</td><td className="p-3 font-medium">{n.name}</td><td className="p-3">{n.unit ? <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">{n.unit}</span> : "—"}</td><td className="p-3 text-right"><ActionBtns onEdit={() => { ni.setSelected(n); setNiForm({ name: n.name, unit: n.unit || "" }); ni.setEditOpen(true); }} onDelete={() => { ni.setSelected(n); ni.setDeleteOpen(true); }} /></td></tr>
              ))}</tbody></table>
          </div>
        </TabsContent>
      </Tabs>

      {/* ═══════════ Dialogs: Disaster Types ═══════════ */}
      <Dialog open={dt.createOpen} onOpenChange={dt.setCreateOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Tambah Jenis Bencana</DialogTitle><DialogDescription>Tambahkan jenis bencana baru</DialogDescription></DialogHeader><div className="space-y-4"><div><Label>Nama <span className="text-destructive">*</span></Label><Input value={dtForm.name} onChange={e => setDtForm({ name: e.target.value })} placeholder="Contoh: Banjir" /></div></div><DialogFooter><Button variant="outline" onClick={() => dt.setCreateOpen(false)} disabled={dt.submitting}>Batal</Button><Button onClick={() => { if (!dtForm.name.trim()) return toast.error("Nama wajib diisi"); dt.doCreate([dtForm.name.trim()]); }} disabled={dt.submitting} className="gap-2">{dt.submitting && <Loader2 className="h-4 w-4 animate-spin" />} Simpan</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={dt.editOpen} onOpenChange={o => { if (!o) dt.setSelected(null); dt.setEditOpen(o); }}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Edit Jenis Bencana</DialogTitle><DialogDescription>Perbarui <strong>{dt.selected?.name}</strong></DialogDescription></DialogHeader><div className="space-y-4"><div><Label>Nama <span className="text-destructive">*</span></Label><Input value={dtForm.name} onChange={e => setDtForm({ name: e.target.value })} /></div></div><DialogFooter><Button variant="outline" onClick={() => dt.setEditOpen(false)} disabled={dt.submitting}>Batal</Button><Button onClick={() => { if (!dtForm.name.trim() || !dt.selected) return; dt.doUpdate(dt.selected.id, [dtForm.name.trim()]); }} disabled={dt.submitting} className="gap-2">{dt.submitting && <Loader2 className="h-4 w-4 animate-spin" />} Perbarui</Button></DialogFooter></DialogContent></Dialog>
      <AlertDialog open={dt.deleteOpen} onOpenChange={dt.setDeleteOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus Jenis Bencana?</AlertDialogTitle><AlertDialogDescription>Hapus <strong>{dt.selected?.name}</strong>? Jenis bencana yang digunakan oleh laporan tidak dapat dihapus.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={dt.submitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={dt.doDelete} disabled={dt.submitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2">{dt.submitting && <Loader2 className="h-4 w-4 animate-spin" />} Ya, Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>

      {/* ═══════════ Dialogs: Agencies ═══════════ */}
      <Dialog open={ag.createOpen} onOpenChange={ag.setCreateOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Tambah Instansi</DialogTitle><DialogDescription>Tambahkan instansi baru</DialogDescription></DialogHeader><div className="space-y-4"><div><Label>Nama <span className="text-destructive">*</span></Label><Input value={agForm.name} onChange={e => setAgForm(f => ({ ...f, name: e.target.value }))} placeholder="BPBD Kota Palu" /></div><div><Label>Tipe <span className="text-muted-foreground text-xs">(opsional)</span></Label><Input value={agForm.type} onChange={e => setAgForm(f => ({ ...f, type: e.target.value }))} placeholder="Pemerintah, TNI, PMI" /></div></div><DialogFooter><Button variant="outline" onClick={() => ag.setCreateOpen(false)} disabled={ag.submitting}>Batal</Button><Button onClick={() => { if (!agForm.name.trim()) return toast.error("Nama wajib diisi"); ag.doCreate([agForm.name.trim(), agForm.type.trim() || undefined]); }} disabled={ag.submitting} className="gap-2">{ag.submitting && <Loader2 className="h-4 w-4 animate-spin" />} Simpan</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={ag.editOpen} onOpenChange={o => { if (!o) ag.setSelected(null); ag.setEditOpen(o); }}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Edit Instansi</DialogTitle><DialogDescription>Perbarui <strong>{ag.selected?.name}</strong></DialogDescription></DialogHeader><div className="space-y-4"><div><Label>Nama <span className="text-destructive">*</span></Label><Input value={agForm.name} onChange={e => setAgForm(f => ({ ...f, name: e.target.value }))} /></div><div><Label>Tipe</Label><Input value={agForm.type} onChange={e => setAgForm(f => ({ ...f, type: e.target.value }))} /></div></div><DialogFooter><Button variant="outline" onClick={() => ag.setEditOpen(false)} disabled={ag.submitting}>Batal</Button><Button onClick={() => { if (!agForm.name.trim() || !ag.selected) return; ag.doUpdate(ag.selected.id, [agForm.name.trim(), agForm.type.trim() || undefined]); }} disabled={ag.submitting} className="gap-2">{ag.submitting && <Loader2 className="h-4 w-4 animate-spin" />} Perbarui</Button></DialogFooter></DialogContent></Dialog>
      <AlertDialog open={ag.deleteOpen} onOpenChange={ag.setDeleteOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus Instansi?</AlertDialogTitle><AlertDialogDescription>Hapus <strong>{ag.selected?.name}</strong>?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={ag.submitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={ag.doDelete} disabled={ag.submitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2">{ag.submitting && <Loader2 className="h-4 w-4 animate-spin" />} Ya, Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>

      {/* ═══════════ Dialogs: Regions ═══════════ */}
      <Dialog open={rg.createOpen} onOpenChange={rg.setCreateOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Tambah Wilayah</DialogTitle><DialogDescription>Tambahkan data wilayah baru</DialogDescription></DialogHeader><div className="space-y-4"><div><Label>Provinsi <span className="text-destructive">*</span></Label><Input value={rgForm.province} onChange={e => setRgForm(f => ({ ...f, province: e.target.value }))} placeholder="Sulawesi Tengah" /></div><div><Label>Kabupaten/Kota</Label><Input value={rgForm.regency} onChange={e => setRgForm(f => ({ ...f, regency: e.target.value }))} placeholder="Kota Palu" /></div><div className="grid grid-cols-2 gap-3"><div><Label>Kecamatan</Label><Input value={rgForm.district} onChange={e => setRgForm(f => ({ ...f, district: e.target.value }))} /></div><div><Label>Desa/Kelurahan</Label><Input value={rgForm.village} onChange={e => setRgForm(f => ({ ...f, village: e.target.value }))} /></div></div></div><DialogFooter><Button variant="outline" onClick={() => rg.setCreateOpen(false)} disabled={rg.submitting}>Batal</Button><Button onClick={() => { if (!rgForm.province.trim()) return toast.error("Provinsi wajib diisi"); rg.doCreate([{ province: rgForm.province.trim(), regency: rgForm.regency.trim() || undefined, district: rgForm.district.trim() || undefined, village: rgForm.village.trim() || undefined }]); }} disabled={rg.submitting} className="gap-2">{rg.submitting && <Loader2 className="h-4 w-4 animate-spin" />} Simpan</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={rg.editOpen} onOpenChange={o => { if (!o) rg.setSelected(null); rg.setEditOpen(o); }}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Edit Wilayah</DialogTitle><DialogDescription>Perbarui data wilayah</DialogDescription></DialogHeader><div className="space-y-4"><div><Label>Provinsi <span className="text-destructive">*</span></Label><Input value={rgForm.province} onChange={e => setRgForm(f => ({ ...f, province: e.target.value }))} /></div><div><Label>Kabupaten/Kota</Label><Input value={rgForm.regency} onChange={e => setRgForm(f => ({ ...f, regency: e.target.value }))} /></div><div className="grid grid-cols-2 gap-3"><div><Label>Kecamatan</Label><Input value={rgForm.district} onChange={e => setRgForm(f => ({ ...f, district: e.target.value }))} /></div><div><Label>Desa/Kelurahan</Label><Input value={rgForm.village} onChange={e => setRgForm(f => ({ ...f, village: e.target.value }))} /></div></div></div><DialogFooter><Button variant="outline" onClick={() => rg.setEditOpen(false)} disabled={rg.submitting}>Batal</Button><Button onClick={() => { if (!rgForm.province.trim() || !rg.selected) return; rg.doUpdate(rg.selected.id, [{ province: rgForm.province.trim(), regency: rgForm.regency.trim() || undefined, district: rgForm.district.trim() || undefined, village: rgForm.village.trim() || undefined }]); }} disabled={rg.submitting} className="gap-2">{rg.submitting && <Loader2 className="h-4 w-4 animate-spin" />} Perbarui</Button></DialogFooter></DialogContent></Dialog>
      <AlertDialog open={rg.deleteOpen} onOpenChange={rg.setDeleteOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus Wilayah?</AlertDialogTitle><AlertDialogDescription>Hapus wilayah ini?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={rg.submitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={rg.doDelete} disabled={rg.submitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2">{rg.submitting && <Loader2 className="h-4 w-4 animate-spin" />} Ya, Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>

      {/* ═══════════ Dialogs: Need Items ═══════════ */}
      <Dialog open={ni.createOpen} onOpenChange={ni.setCreateOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Tambah Item Kebutuhan</DialogTitle><DialogDescription>Tambahkan item kebutuhan baru untuk keperluan darurat</DialogDescription></DialogHeader><div className="space-y-4"><div><Label>Nama Kebutuhan <span className="text-destructive">*</span></Label><Input value={niForm.name} onChange={e => setNiForm(f => ({ ...f, name: e.target.value }))} placeholder="Contoh: Masker, Tenda, dll" /></div><div><Label>Satuan <span className="text-muted-foreground text-xs">(opsional)</span></Label><Input value={niForm.unit} onChange={e => setNiForm(f => ({ ...f, unit: e.target.value }))} placeholder="Contoh: paket, liter, unit, buah" /></div></div><DialogFooter><Button variant="outline" onClick={() => ni.setCreateOpen(false)} disabled={ni.submitting}>Batal</Button><Button onClick={() => { if (!niForm.name.trim()) return toast.error("Nama wajib diisi"); ni.doCreate([niForm.name.trim(), niForm.unit.trim() || undefined]); }} disabled={ni.submitting} className="gap-2">{ni.submitting && <Loader2 className="h-4 w-4 animate-spin" />} Simpan</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={ni.editOpen} onOpenChange={o => { if (!o) ni.setSelected(null); ni.setEditOpen(o); }}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Edit Item Kebutuhan</DialogTitle><DialogDescription>Perbarui <strong>{ni.selected?.name}</strong></DialogDescription></DialogHeader><div className="space-y-4"><div><Label>Nama <span className="text-destructive">*</span></Label><Input value={niForm.name} onChange={e => setNiForm(f => ({ ...f, name: e.target.value }))} /></div><div><Label>Satuan</Label><Input value={niForm.unit} onChange={e => setNiForm(f => ({ ...f, unit: e.target.value }))} /></div></div><DialogFooter><Button variant="outline" onClick={() => ni.setEditOpen(false)} disabled={ni.submitting}>Batal</Button><Button onClick={() => { if (!niForm.name.trim() || !ni.selected) return; ni.doUpdate(ni.selected.id, [niForm.name.trim(), niForm.unit.trim() || undefined]); }} disabled={ni.submitting} className="gap-2">{ni.submitting && <Loader2 className="h-4 w-4 animate-spin" />} Perbarui</Button></DialogFooter></DialogContent></Dialog>
      <AlertDialog open={ni.deleteOpen} onOpenChange={ni.setDeleteOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus Item Kebutuhan?</AlertDialogTitle><AlertDialogDescription>Hapus <strong>{ni.selected?.name}</strong>?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={ni.submitting}>Batal</AlertDialogCancel><AlertDialogAction onClick={ni.doDelete} disabled={ni.submitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2">{ni.submitting && <Loader2 className="h-4 w-4 animate-spin" />} Ya, Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
