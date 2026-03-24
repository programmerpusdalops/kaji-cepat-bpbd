import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Share2, Layers, List, Plus, Trash2, MapPin, Copy, Search, Crosshair, Map as MapIcon, AlertTriangle, Upload, Download, Hexagon, Route, ImageIcon, PanelLeftOpen, PanelLeftClose, X } from "lucide-react";
import {
  getRapidAssessmentsDropdown, getMapObjectsByAssessment, createMapObject,
  updateMapObject, deleteMapObject, uploadMapPhotos,
} from "@/services/apiService";

// ── Color palette for dynamic categories ──
const COLOR_PALETTE = [
  "#3B82F6", "#EF4444", "#8B5CF6", "#F97316", "#06B6D4",
  "#A16207", "#10B981", "#EC4899", "#6366F1", "#14B8A6",
  "#F59E0B", "#84CC16", "#D946EF", "#0EA5E9", "#78716C",
];

const getCategoryColor = (cat: string, index?: number) => {
  if (!cat) return "#6B7280";
  // Derive consistent color from category string
  if (index !== undefined) return COLOR_PALETTE[index % COLOR_PALETTE.length];
  let hash = 0;
  for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
};

// ── Draw Control Component ──
function DrawControl({ onCreated }: { onCreated: (layer: L.Layer, type: string) => void }) {
  const map = useMap();

  useEffect(() => {
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new (L.Control as any).Draw({
      position: "topright",
      draw: {
        marker: { icon: L.icon({ iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41] }) },
        polygon: { allowIntersection: false, shapeOptions: { color: "#3B82F6", weight: 3 } },
        polyline: { shapeOptions: { color: "#EF4444", weight: 3 } },
        rectangle: false,
        circle: false,
        circlemarker: false,
      },
      edit: { featureGroup: drawnItems, remove: false },
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      const type = e.layerType === "marker" ? "marker" : e.layerType === "polygon" ? "polygon" : "polyline";
      onCreated(layer, type);
    });

    return () => {
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
    };
  }, [map, onCreated]);

  return null;
}

// ── Basemap switcher component ──
function BasemapSwitcher({ basemap }: { basemap: typeof BASEMAPS[0] }) {
  const map = useMap();
  const tileRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (tileRef.current) map.removeLayer(tileRef.current);
    const tile = L.tileLayer(basemap.url, { attribution: basemap.attr });
    tile.addTo(map);
    tileRef.current = tile;
    return () => { if (tileRef.current) map.removeLayer(tileRef.current); };
  }, [basemap, map]);

  return null;
}

const STATUS_OPTIONS = [
  { value: "aktif", label: "Aktif" },
  { value: "ditangani", label: "Ditangani" },
  { value: "selesai", label: "Selesai" },
];

const BASEMAPS = [
  { id: "osm", label: "OpenStreetMap", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attr: "&copy; OSM" },
  { id: "satellite", label: "Satelit (Esri)", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attr: "&copy; Esri" },
  { id: "topo", label: "Topografi", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", attr: "&copy; OpenTopoMap" },
  { id: "dark", label: "Dark Mode", url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", attr: "&copy; CartoDB" },
  { id: "light", label: "Light (CartoDB)", url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", attr: "&copy; CartoDB" },
];

// ── Popup builder with photo gallery support ──
function buildPopupContent(props: any) {
  const photos: string[] = props.photos || [];
  const photoGallery = photos.length > 0
    ? `<div style="display:flex;gap:4px;overflow-x:auto;margin-bottom:6px;padding-bottom:4px">
         ${photos.map((p: string) => `<img src="${p}" style="height:90px;min-width:90px;object-fit:cover;border-radius:6px;cursor:pointer" onclick="window.open('${p}','_blank')" />`).join('')}
       </div>`
    : '';
  return `
    <div style="min-width:200px;max-width:300px">
      ${photoGallery}
      <strong style="font-size:14px">${props.title}</strong><br/>
      <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;background:${getCategoryColor(props.category)}20;color:${getCategoryColor(props.category)};margin:4px 0;font-weight:500">${props.category || 'Tanpa Kategori'}</span>
      ${props.description ? `<p style="font-size:12px;margin:4px 0;color:#666">${props.description}</p>` : ''}
      <p style="font-size:11px;color:#999;margin-top:4px">${props.creator_name || ''} · ${new Date(props.updated_at).toLocaleDateString('id-ID')}</p>
    </div>
  `;
}

// ── Map Center Hook ──
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const centerStr = center.join(',');
  useEffect(() => { map.setView(center, zoom); }, [centerStr, zoom, map]);
  return null;
}

// ── FlyTo component ──
function FlyTo({ latlng }: { latlng: [number, number] | null }) {
  const map = useMap();
  const latlngStr = latlng?.join(',');
  useEffect(() => {
    if (latlng) map.flyTo(latlng, 15, { duration: 1.5 });
  }, [latlngStr, map]);
  return null;
}

// ── Custom icon for the disaster report location ──
const reportLocationIcon = L.divIcon({
  className: "report-location-marker",
  html: `
    <div style="position:relative;width:36px;height:44px">
      <div style="position:absolute;top:4px;left:4px;width:28px;height:28px;border-radius:50%;background:rgba(239,68,68,0.25);animation:pulse-ring 1.5s ease-out infinite"></div>
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 24 30" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 18 12 18s12-9 12-18C24 5.4 18.6 0 12 0z" fill="#DC2626"/>
        <circle cx="12" cy="10" r="4" fill="white"/>
        <path d="M12 7.5c-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5S13.4 7.5 12 7.5z" fill="#DC2626"/>
      </svg>
    </div>
    <style>
      @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }
    </style>
  `,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
  popupAnchor: [0, -44],
});

// ── Custom icon generator for category objects ──
const createCategoryIcon = (color: string) => L.divIcon({
  className: `category-marker-${color.replace('#', '')}`,
  html: `
    <div style="position:relative;width:28px;height:34px">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="34" viewBox="0 0 24 30" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,0.4))">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 18 12 18s12-9 12-18C24 5.4 18.6 0 12 0z" fill="${color}"/>
        <circle cx="12" cy="10" r="5" fill="white"/>
      </svg>
    </div>
  `,
  iconSize: [28, 34],
  iconAnchor: [14, 34],
  popupAnchor: [0, -34],
});

export default function CollaborativeMapPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<number | null>(null);
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [objectList, setObjectList] = useState<any[]>([]);

  // -- Form state
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<string>("marker");
  const [formGeometry, setFormGeometry] = useState<any>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formStatus, setFormStatus] = useState("aktif");
  const [formPhotos, setFormPhotos] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  // -- Delete dialog state
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // -- Share dialog
  const [showShare, setShowShare] = useState(false);

  // -- Sidebar tab
  const [sidebarTab, setSidebarTab] = useState<"layers" | "objects">("layers");
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(new Set());
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // -- Search & coordinates
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [coordInput, setCoordInput] = useState("");
  const searchTimeout = useRef<any>(null);

  // -- Basemap
  const [basemapId, setBasemapId] = useState("satellite");
  const [showBasemapPicker, setShowBasemapPicker] = useState(false);
  const currentBasemap = BASEMAPS.find(b => b.id === basemapId) || BASEMAPS[1];

  // -- KML import
  const [importing, setImporting] = useState(false);
  const kmlInputRef = useRef<HTMLInputElement>(null);

  const geojsonRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    getRapidAssessmentsDropdown().then(setAssessments).catch(() => {});
  }, []);

  const loadMapData = useCallback(async (assessmentId: number) => {
    try {
      setLoading(true);
      const data = await getMapObjectsByAssessment(assessmentId);
      setGeojsonData(data);
      setObjectList(data.features || []);
      // Derive dynamic categories from data
      const cats = [...new Set((data.features || []).map((f: any) => f.properties?.category).filter(Boolean))] as string[];
      setDynamicCategories(cats);
      setVisibleCategories(new Set(cats));
    } catch {
      toast.error("Gagal memuat data peta");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedAssessment) loadMapData(selectedAssessment);
  }, [selectedAssessment, loadMapData]);

  // ── Search using Nominatim ──
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query.trim()) { setSearchResults([]); return; }

    searchTimeout.current = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=id`
        );
        const data = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  }, []);

  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setFlyTarget([lat, lon]);
    setSearchQuery(result.display_name);
    setSearchResults([]);
  };

  // ── Coordinate input ──
  const handleGoToCoord = () => {
    const cleaned = coordInput.trim().replace(/\s+/g, " ");
    // Try formats: "-1.43, 121.45" or "-1.43 121.45"
    const parts = cleaned.split(/[,\s]+/).map(Number);
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      setFlyTarget([parts[0], parts[1]]);
      toast.success(`Menuju ke ${parts[0].toFixed(4)}, ${parts[1].toFixed(4)}`);
    } else {
      toast.error("Format koordinat salah. Gunakan: lat, lng");
    }
  };

  const handleDrawCreated = useCallback((layer: L.Layer, type: string) => {
    let geometry: any;
    if (type === "marker") {
      const ll = (layer as L.Marker).getLatLng();
      geometry = { type: "Point", coordinates: [ll.lng, ll.lat] };
    } else if (type === "polygon") {
      const lls = (layer as L.Polygon).getLatLngs()[0] as L.LatLng[];
      geometry = { type: "Polygon", coordinates: [lls.map(ll => [ll.lng, ll.lat]).concat([[lls[0].lng, lls[0].lat]])] };
    } else {
      const lls = (layer as L.Polyline).getLatLngs() as L.LatLng[];
      geometry = { type: "LineString", coordinates: lls.map(ll => [ll.lng, ll.lat]) };
    }
    setFormType(type);
    setFormGeometry(geometry);
    setFormTitle("");
    setFormDesc("");
    setFormCategory("");
    setFormStatus("aktif");
    setFormPhotos([]);
    setShowForm(true);
  }, []);

  const handleSave = async () => {
    if (!formTitle.trim()) { toast.error("Judul wajib diisi"); return; }
    if (!selectedAssessment) { toast.error("Pilih kaji cepat terlebih dahulu"); return; }
    try {
      setSaving(true);
      const result = await createMapObject({
        assessment_id: selectedAssessment,
        type: formType,
        title: formTitle.trim(),
        description: formDesc.trim(),
        category: formCategory.trim() || undefined,
        geometry: formGeometry,
        status: formStatus,
      });
      if (formPhotos.length > 0 && result.id) {
        await uploadMapPhotos(result.id, formPhotos);
      }
      toast.success("Object peta berhasil ditambahkan");
      setShowForm(false);
      loadMapData(selectedAssessment);
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: number) => {
    setItemToDelete(id);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteMapObject(itemToDelete);
      toast.success("Object berhasil dihapus");
      if (selectedAssessment) loadMapData(selectedAssessment);
    } catch {
      toast.error("Gagal menghapus");
    } finally {
      setItemToDelete(null);
    }
  };

  const toggleCategory = (cat: string) => {
    setVisibleCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  // ── KML Import ──
  const parseKML = (kmlText: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(kmlText, "text/xml");
    const placemarks = doc.querySelectorAll("Placemark");
    const features: any[] = [];

    placemarks.forEach(pm => {
      const name = pm.querySelector("name")?.textContent || "Tanpa Nama";
      const desc = pm.querySelector("description")?.textContent || "";

      // Point
      const point = pm.querySelector("Point coordinates");
      if (point) {
        const coords = point.textContent!.trim().split(",").map(Number);
        features.push({ title: name, description: desc, type: "marker", geometry: { type: "Point", coordinates: [coords[0], coords[1]] } });
        return;
      }

      // LineString
      const lineString = pm.querySelector("LineString coordinates");
      if (lineString) {
        const coords = lineString.textContent!.trim().split(/\s+/).map(c => {
          const p = c.split(",").map(Number);
          return [p[0], p[1]];
        });
        features.push({ title: name, description: desc, type: "polyline", geometry: { type: "LineString", coordinates: coords } });
        return;
      }

      // Polygon
      const polygon = pm.querySelector("Polygon outerBoundaryIs LinearRing coordinates");
      if (polygon) {
        const coords = polygon.textContent!.trim().split(/\s+/).map(c => {
          const p = c.split(",").map(Number);
          return [p[0], p[1]];
        });
        features.push({ title: name, description: desc, type: "polygon", geometry: { type: "Polygon", coordinates: [coords] } });
      }
    });

    return features;
  };

  const handleImportKML = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!selectedAssessment) { toast.error("Pilih kaji cepat terlebih dahulu"); return; }

    try {
      setImporting(true);
      const text = await file.text();
      const features = parseKML(text);

      if (features.length === 0) {
        toast.error("Tidak ada data yang ditemukan di file KML");
        return;
      }

      let added = 0;
      for (const f of features) {
        try {
          await createMapObject({
            assessment_id: selectedAssessment,
            type: f.type,
            title: f.title,
            description: f.description,
            category: "posko",
            geometry: f.geometry,
            status: "aktif",
          });
          added++;
        } catch { /* skip failed items */ }
      }

      toast.success(`${added} dari ${features.length} objek berhasil diimport`);
      loadMapData(selectedAssessment);
    } catch {
      toast.error("Gagal membaca file KML");
    } finally {
      setImporting(false);
      if (kmlInputRef.current) kmlInputRef.current.value = "";
    }
  };

  // ── KML Export ──
  const handleExportKML = async () => {
    if (!selectedAssessment) {
      toast.error("Pilih kaji cepat terlebih dahulu");
      return;
    }

    try {
      // Always fetch fresh data from API to ensure latest objects
      const freshData = await getMapObjectsByAssessment(selectedAssessment);

      if (!freshData?.features?.length) {
        toast.error("Tidak ada data untuk diekspor");
        return;
      }

      const disasterName = freshData.disaster?.disaster_type || "Bencana";
      const reportCode = freshData.disaster?.report_code || "";

      const placemarks = freshData.features.map((f: any) => {
        const p = f.properties;
        const g = f.geometry;
        let geomKml = "";

        if (g.type === "Point") {
          geomKml = `<Point><coordinates>${g.coordinates[0]},${g.coordinates[1]},0</coordinates></Point>`;
        } else if (g.type === "LineString") {
          const coords = g.coordinates.map((c: number[]) => `${c[0]},${c[1]},0`).join("\n            ");
          geomKml = `<LineString><coordinates>\n            ${coords}\n          </coordinates></LineString>`;
        } else if (g.type === "Polygon") {
          const coords = g.coordinates[0].map((c: number[]) => `${c[0]},${c[1]},0`).join("\n              ");
          geomKml = `<Polygon><outerBoundaryIs><LinearRing><coordinates>\n              ${coords}\n            </coordinates></LinearRing></outerBoundaryIs></Polygon>`;
        }

        return `
    <Placemark>
      <name>${escapeXml(p.title || "Tanpa Nama")}</name>
      <description>${escapeXml(p.description || "")}</description>
      <ExtendedData>
        <Data name="category"><value>${escapeXml(p.category || '')}</value></Data>
        <Data name="status"><value>${escapeXml(p.status || "")}</value></Data>
      </ExtendedData>
      ${geomKml}
    </Placemark>`;
      }).join("\n");

      const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(`${disasterName} - ${reportCode}`)}</name>
    <description>Data peta kolaboratif BPBD</description>
${placemarks}
  </Document>
</kml>`;

      const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `peta-${reportCode || "bencana"}.kml`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("File KML berhasil diunduh");
    } catch {
      toast.error("Gagal mengekspor KML");
    }
  };

  const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const filteredGeoJSON = geojsonData ? {
    ...geojsonData,
    features: (geojsonData.features || []).filter((f: any) => visibleCategories.has(f.properties?.category || "")),
  } : null;

  const mapCenter: [number, number] = geojsonData?.disaster
    ? [geojsonData.disaster.latitude || -1.43, geojsonData.disaster.longitude || 121.45]
    : [-1.43, 121.45];

  const publicUrl = selectedAssessment && geojsonData?.disaster
    ? `${window.location.origin}/public-map/${selectedAssessment}/${geojsonData.disaster.slug || ""}`
    : "";

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      {/* Header — z-index lower than sidebar overlay (1050) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 relative z-[1040]">
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold">Peta Kolaboratif</h1>
          <p className="text-sm text-muted-foreground">Tandai lokasi terdampak, posko, dan area bencana</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <Select value={selectedAssessment?.toString() || ""} onValueChange={v => setSelectedAssessment(Number(v))}>
            <SelectTrigger className="w-full sm:w-[260px] h-9">
              <SelectValue placeholder="Pilih Kaji Cepat..." />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="z-[1200]">
              {assessments.map((a: any) => (
                <SelectItem key={a.id} value={a.id.toString()}>
                  KC-{a.id} — {a.disaster_type_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedAssessment && (
            <>
              <Button variant="outline" size="sm" className="h-9" onClick={() => kmlInputRef.current?.click()} disabled={importing}>
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                <span className="hidden sm:inline ml-1">Import</span>
              </Button>
              <Button variant="outline" size="sm" className="h-9" onClick={handleExportKML}>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Export</span>
              </Button>
              <Button variant="outline" size="sm" className="h-9" onClick={() => setShowShare(true)}>
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Bagikan</span>
              </Button>
            </>
          )}
          {/* Hidden KML file input */}
          <input
            ref={kmlInputRef}
            type="file"
            accept=".kml,.kmz"
            onChange={handleImportKML}
            className="hidden"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-3 min-h-0 relative">
        {/* Sidebar — collapsible on mobile */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-[1050] lg:hidden" onClick={() => setSidebarOpen(false)} />}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-[1060] lg:z-auto
          w-72 sm:w-80 lg:w-64 shrink-0 rounded-none lg:rounded-xl border bg-card overflow-hidden flex flex-col
          transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Mobile close button */}
          <div className="flex items-center justify-between p-2 border-b lg:hidden">
            <span className="text-sm font-semibold">Panel</span>
            <button onClick={() => setSidebarOpen(false)} className="p-1 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
          {/* Search Bar */}
          <div className="p-2 border-b space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Cari daerah..."
                className="w-full h-8 pl-8 pr-2 text-xs rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {searchLoading && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-muted-foreground" />}
            </div>
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="rounded-md border bg-popover shadow-md max-h-40 overflow-auto">
                {searchResults.map((r: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSearchResult(r)}
                    className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-muted border-b last:border-0 flex items-start gap-1.5"
                  >
                    <MapPin className="h-3 w-3 shrink-0 mt-0.5 text-primary" />
                    <span className="line-clamp-2">{r.display_name}</span>
                  </button>
                ))}
              </div>
            )}
            {/* Coordinate Input */}
            <div className="flex gap-1">
              <input
                value={coordInput}
                onChange={e => setCoordInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleGoToCoord()}
                placeholder="lat, lng (cth: -1.43, 121.45)"
                className="flex-1 h-7 px-2 text-xs rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleGoToCoord}
                className="h-7 w-7 flex items-center justify-center rounded-md border hover:bg-muted"
                title="Pergi ke koordinat"
              >
                <Crosshair className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Tab headers */}
          <div className="flex border-b">
            <button onClick={() => setSidebarTab("layers")} className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1 ${sidebarTab === "layers" ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground"}`}>
              <Layers className="h-3.5 w-3.5" /> Layer
            </button>
            <button onClick={() => setSidebarTab("objects")} className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1 ${sidebarTab === "objects" ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground"}`}>
              <List className="h-3.5 w-3.5" /> Objek ({objectList.length})
            </button>
          </div>
          <div className="flex-1 overflow-auto p-3">
            {sidebarTab === "layers" ? (
              <div className="space-y-1">
                {dynamicCategories.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">Pilih bencana untuk melihat layer.</p>
                )}
                {dynamicCategories.map((cat, i) => (
                  <label key={cat} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer text-sm">
                    <input type="checkbox" checked={visibleCategories.has(cat)} onChange={() => toggleCategory(cat)} className="rounded" />
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ background: getCategoryColor(cat, i) }} />
                    <span className="capitalize">{cat}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {objectList.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">Belum ada objek. Gunakan tools di peta untuk menambah.</p>
                )}
                {objectList.map((feature: any) => {
                  const obj = feature.properties;
                  const geom = feature.geometry;
                  const objType = obj.type || (geom?.type === "Point" ? "marker" : geom?.type === "Polygon" ? "polygon" : "polyline");

                  // Compute center for fly-to
                  const getCenter = (): [number, number] | null => {
                    if (!geom) return null;
                    if (geom.type === "Point") {
                      return [geom.coordinates[1], geom.coordinates[0]];
                    } else if (geom.type === "LineString") {
                      const mid = Math.floor(geom.coordinates.length / 2);
                      return [geom.coordinates[mid][1], geom.coordinates[mid][0]];
                    } else if (geom.type === "Polygon" && geom.coordinates[0]?.length) {
                      const ring = geom.coordinates[0];
                      const avgLat = ring.reduce((s: number, c: number[]) => s + c[1], 0) / ring.length;
                      const avgLng = ring.reduce((s: number, c: number[]) => s + c[0], 0) / ring.length;
                      return [avgLat, avgLng];
                    }
                    return null;
                  };

                  const TypeIcon = objType === "marker" ? MapPin : objType === "polygon" ? Hexagon : Route;

                  return (
                    <div
                      key={obj.id}
                      className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted group text-sm cursor-pointer transition-colors"
                      onClick={() => {
                        const center = getCenter();
                        if (center) setFlyTarget(center);
                      }}
                    >
                      <TypeIcon className="h-4 w-4 shrink-0 mt-0.5" style={{ color: getCategoryColor(obj.category) }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{obj.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {obj.category || 'Tanpa Kategori'} · <span className="capitalize">{objType}</span>
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); confirmDelete(obj.id); }}
                        className="opacity-0 group-hover:opacity-100 text-destructive"
                        title="Hapus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 rounded-xl overflow-hidden border relative">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-3 left-3 z-[900] h-9 w-9 rounded-lg bg-white shadow-lg border flex items-center justify-center hover:bg-gray-50 transition-colors lg:hidden"
            title="Buka Panel"
          >
            <PanelLeftOpen className="h-4 w-4 text-gray-600" />
          </button>
          {loading && (
            <div className="absolute inset-0 z-[1000] bg-background/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!selectedAssessment && (
            <div className="absolute inset-0 z-[1000] bg-background/80 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">Pilih Kaji Cepat</p>
                <p className="text-sm text-muted-foreground">Pilih data kaji cepat untuk mulai menandai peta</p>
              </div>
            </div>
          )}

          {/* Basemap Picker */}
          <div className="absolute bottom-3 right-3 z-[900]">
            <div className="relative">
              <button
                onClick={() => setShowBasemapPicker(!showBasemapPicker)}
                className="h-9 w-9 rounded-lg bg-white shadow-lg border flex items-center justify-center hover:bg-gray-50 transition-colors"
                title="Ganti Basemap"
              >
                <MapIcon className="h-4 w-4 text-gray-600" />
              </button>
              {showBasemapPicker && (
                <div className="absolute bottom-11 right-0 bg-white rounded-lg shadow-xl border p-2 w-44">
                  <p className="text-[10px] font-semibold text-gray-500 px-2 mb-1">BASEMAP</p>
                  {BASEMAPS.map(bm => (
                    <button
                      key={bm.id}
                      onClick={() => { setBasemapId(bm.id); setShowBasemapPicker(false); }}
                      className={`w-full text-left text-xs px-2 py-1.5 rounded hover:bg-gray-100 flex items-center gap-2 ${basemapId === bm.id ? "bg-primary/10 text-primary font-medium" : "text-gray-700"}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${basemapId === bm.id ? "bg-primary" : "bg-gray-300"}`} />
                      {bm.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <MapContainer center={mapCenter} zoom={10} className="h-full w-full" scrollWheelZoom={true}>
            <ChangeView center={mapCenter} zoom={10} />
            <BasemapSwitcher basemap={currentBasemap} />
            <FlyTo latlng={flyTarget} />
            {selectedAssessment && <DrawControl onCreated={handleDrawCreated} />}

            {/* Report Location Marker — auto-displayed from report data */}
            {geojsonData?.disaster?.latitude && geojsonData?.disaster?.longitude && (
              <Marker
                position={[geojsonData.disaster.latitude, geojsonData.disaster.longitude]}
                icon={reportLocationIcon}
              >
                <Popup maxWidth={280}>
                  <div style={{ minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ background: '#DC2626', color: 'white', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>LOKASI KEJADIAN</span>
                    </div>
                    <strong style={{ fontSize: 14 }}>{geojsonData.disaster.report_code}</strong><br/>
                    <span style={{ fontSize: 12, color: '#666' }}>{geojsonData.disaster.disaster_type}</span>
                    {geojsonData.disaster.description && (
                      <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>{geojsonData.disaster.description}</p>
                    )}
                    <p style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                      {geojsonData.disaster.reporter_name} · {new Date(geojsonData.disaster.report_time).toLocaleDateString('id-ID')}
                    </p>
                    <p style={{ fontSize: 11, color: '#999' }}>
                      📍 {geojsonData.disaster.latitude}, {geojsonData.disaster.longitude}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {filteredGeoJSON && filteredGeoJSON.features?.length > 0 && (
              <GeoJSON
                key={JSON.stringify(filteredGeoJSON)}
                data={filteredGeoJSON}
                ref={geojsonRef as any}
                pointToLayer={(feature, latlng) => {
                  const color = getCategoryColor(feature.properties?.category);
                  return L.marker(latlng, { icon: createCategoryIcon(color) });
                }}
                style={(feature) => {
                  const color = getCategoryColor(feature?.properties?.category);
                  return { color, weight: 3, fillColor: color, fillOpacity: 0.2 };
                }}
                onEachFeature={(feature, layer) => {
                  layer.bindPopup(buildPopupContent(feature.properties));
                }}
              />
            )}
          </MapContainer>
        </div>
      </div>

      {/* Create Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" /> Tambah Object — {formType === "marker" ? "Marker" : formType === "polygon" ? "Polygon" : "Polyline"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Judul / Nama Lokasi *</Label>
              <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Contoh: Posko Utama Kecamatan Sigi" />
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi</Label>
              <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Deskripsi tambahan..." className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[70px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <Input
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  placeholder="Contoh: Posko, Pengungsian, Area Banjir"
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  {dynamicCategories.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Foto (opsional, maks 5 foto)</Label>
              <Input
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={e => setFormPhotos(Array.from(e.target.files || []))}
              />
              {formPhotos.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {formPhotos.map((f, i) => (
                    <div key={i} className="relative h-16 w-16 rounded-md overflow-hidden border">
                      <img src={URL.createObjectURL(f)} className="h-full w-full object-cover" />
                      <button
                        onClick={() => setFormPhotos(prev => prev.filter((_, j) => j !== i))}
                        className="absolute top-0 right-0 bg-destructive text-white text-[10px] rounded-bl px-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShare} onOpenChange={setShowShare}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" /> Bagikan Peta Publik</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Salin link di bawah ini untuk membagikan peta publik yang dapat dilihat tanpa login:</p>
          <div className="flex gap-2">
            <Input value={publicUrl} readOnly className="text-xs" />
            <Button size="sm" onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success("Link disalin!"); }}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={itemToDelete !== null} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Konfirmasi Hapus
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-sm text-foreground">
              Apakah Anda yakin ingin menghapus objek peta ini?
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Data yang dihapus tidak dapat dikembalikan.
            </p>
          </div>
          <DialogFooter className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setItemToDelete(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={executeDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
