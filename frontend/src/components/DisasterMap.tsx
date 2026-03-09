import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const iconColors: Record<string, string> = {
  Banjir: "#3B82F6",
  Longsor: "#F97316",
  Gempa: "#EF4444",
  Kebakaran: "#EAB308",
};

function createIcon(color: string) {
  return L.divIcon({
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

interface MapPoint {
  id: number;
  lat: number;
  lng: number;
  jenis_bencana: string;
  status: string;
  lokasi: string;
}

interface DisasterMapProps {
  points: MapPoint[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export function DisasterMap({ points, center = [-6.9, 107.6], zoom = 9, className = "h-[400px]" }: DisasterMapProps) {
  return (
    <MapContainer center={center} zoom={zoom} className={`rounded-lg ${className}`} scrollWheelZoom={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM" />
      {points.map(p => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={createIcon(iconColors[p.jenis_bencana] || "#6B7280")}>
          <Popup>
            <strong>{p.jenis_bencana}</strong><br />
            {p.lokasi}<br />
            <span className="text-xs">{p.status}</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
