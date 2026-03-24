import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import { AlertTriangle, Layers, Map as MapIcon } from "lucide-react";

const BASEMAPS = [
  { id: "osm", label: "OpenStreetMap", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attr: "&copy; OSM" },
  { id: "satellite", label: "Satelit (Esri)", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attr: "&copy; Esri" },
  { id: "topo", label: "Topografi", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", attr: "&copy; OpenTopoMap" },
  { id: "dark", label: "Dark Mode", url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", attr: "&copy; CartoDB" },
  { id: "light", label: "Light (CartoDB)", url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", attr: "&copy; CartoDB" },
];

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

const BASE_URL = "/api/v1";

// ── Dynamic color palette (same as editor) ──
const COLOR_PALETTE = [
  "#3B82F6", "#EF4444", "#8B5CF6", "#F97316", "#06B6D4",
  "#A16207", "#10B981", "#EC4899", "#6366F1", "#14B8A6",
  "#F59E0B", "#84CC16", "#D946EF", "#0EA5E9", "#78716C",
];

const getCategoryColor = (cat: string) => {
  if (!cat) return "#6B7280";
  let hash = 0;
  for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
};

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
      <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;background:${getCategoryColor(props.category)}20;color:${getCategoryColor(props.category)};font-weight:500;margin:4px 0">${props.category || 'Tanpa Kategori'}</span>
      ${props.description ? `<p style="font-size:12px;margin:6px 0;color:#555">${props.description}</p>` : ''}
      <p style="font-size:11px;color:#999;margin-top:6px">Diperbarui: ${new Date(props.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
  `;
}

function FitBounds({ geojson }: { geojson: any }) {
  const map = useMap();
  useEffect(() => {
    if (!geojson?.features?.length) return;
    try {
      const geoLayer = L.geoJSON(geojson);
      const bounds = geoLayer.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] });
    } catch { /* ignore */ }
  }, [geojson, map]);
  return null;
}

export default function PublicMapPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(new Set());
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);
  const [showLegend, setShowLegend] = useState(true);
  const [basemapId, setBasemapId] = useState("satellite");
  const [showBasemapPicker, setShowBasemapPicker] = useState(false);
  const currentBasemap = BASEMAPS.find(b => b.id === basemapId) || BASEMAPS[0];

  const fetchData = useCallback(async () => {
    if (!assessmentId) return;
    try {
      const res = await fetch(`${BASE_URL}/map-objects/public/assessment/${assessmentId}`);
      const json = await res.json();
      if (json.success) {
        setGeojsonData(json.data);
        setError(null);
        // Derive dynamic categories from data
        const cats = [...new Set((json.data.features || []).map((f: any) => f.properties?.category).filter(Boolean))] as string[];
        setDynamicCategories(cats);
        setVisibleCategories(new Set(cats));
      } else {
        setError(json.message || "Gagal memuat data");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  // Initial load
  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const toggleCategory = (cat: string) => {
    setVisibleCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const filteredGeoJSON = geojsonData ? {
    ...geojsonData,
    features: (geojsonData.features || []).filter((f: any) => visibleCategories.has(f.properties?.category || "")),
  } : null;

  const disaster = geojsonData?.disaster;
  const totalObjects = geojsonData?.features?.length || 0;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Memuat peta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Peta Tidak Tersedia</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header Bar */}
      <header className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 shrink-0 z-[1001]">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-orange-500">
            <AlertTriangle className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-white text-sm font-semibold">BPBD</span>
            {disaster && (
              <span className="text-gray-400 text-xs ml-2">
                {disaster.disaster_type} — {disaster.report_code}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xs">{totalObjects} objek</span>
          <button onClick={() => setShowLegend(!showLegend)} className="text-gray-400 hover:text-white transition-colors" title="Toggle legenda">
            <Layers className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer center={[-1.43, 121.45]} zoom={10} className="h-full w-full" scrollWheelZoom={true} zoomControl={false}>
          <BasemapSwitcher basemap={currentBasemap} />
          {filteredGeoJSON && <FitBounds geojson={filteredGeoJSON} />}
          {filteredGeoJSON && filteredGeoJSON.features?.length > 0 && (
            <GeoJSON
              key={JSON.stringify(filteredGeoJSON)}
              data={filteredGeoJSON}
              pointToLayer={(feature, latlng) => {
                const color = getCategoryColor(feature.properties?.category);
                return L.circleMarker(latlng, { radius: 9, fillColor: color, color: "#fff", weight: 2, fillOpacity: 0.9 });
              }}
              style={(feature) => {
                const color = getCategoryColor(feature?.properties?.category);
                return { color, weight: 3, fillColor: color, fillOpacity: 0.15 };
              }}
              onEachFeature={(feature, layer) => {
                layer.bindPopup(buildPopupContent(feature.properties));
              }}
            />
          )}
        </MapContainer>

        {/* Legend / Layer Toggle */}
        {showLegend && (
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 w-52">
            <h4 className="text-xs font-semibold mb-2 text-gray-700">Legenda & Layer</h4>
            <div className="space-y-0.5">
              {dynamicCategories.map(cat => (
                <label key={cat} className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 cursor-pointer text-xs text-gray-700">
                  <input type="checkbox" checked={visibleCategories.has(cat)} onChange={() => toggleCategory(cat)} className="rounded" />
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: getCategoryColor(cat) }} />
                  <span className="capitalize">{cat}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Basemap Picker */}
        <div className="absolute bottom-4 right-4 z-[1000]">
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
                    className={`w-full text-left text-xs px-2 py-1.5 rounded hover:bg-gray-100 flex items-center gap-2 ${basemapId === bm.id ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${basemapId === bm.id ? "bg-blue-600" : "bg-gray-300"}`} />
                    {bm.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats overlay */}
        {disaster && (
          <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 max-w-xs">
            <h3 className="font-semibold text-sm text-gray-800">{disaster.disaster_type}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{disaster.description?.substring(0, 100) || disaster.report_code}</p>
            <p className="text-xs text-gray-400 mt-1">Status: {disaster.status} · {new Date(disaster.report_time).toLocaleDateString("id-ID")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
