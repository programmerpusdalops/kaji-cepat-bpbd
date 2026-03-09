import { useEffect, useState } from "react";
import { getDisasterMapData } from "@/services/apiService";
import { DisasterMap } from "@/components/DisasterMap";

// TODO: GET /api/disaster-map

export default function DisasterMapPage() {
  const [points, setPoints] = useState<any[]>([]);
  useEffect(() => { getDisasterMapData().then(setPoints); }, []);

  return (
    <div className="h-[calc(100vh-7rem)]">
      <div className="page-header">
        <h1 className="page-title">Peta Bencana</h1>
        <p className="page-subtitle">Sebaran lokasi bencana, posko, dan tim TRC</p>
      </div>
      <div className="stat-card h-[calc(100%-4rem)]">
        <DisasterMap points={points} className="h-full" zoom={8} />
      </div>
    </div>
  );
}
