import { useEffect, useState } from "react";
import { getDashboardData } from "@/services/apiService";
import { StatCard } from "@/components/StatCard";
import { DisasterMap } from "@/components/DisasterMap";
import { AlertTriangle, Users, Home, Tent } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

// TODO: API GET /api/disasters/dashboard

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getDashboardData().then(setData);
  }, []);

  if (!data) return <div className="flex items-center justify-center h-64 text-muted-foreground">Memuat...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard Command Center</h1>
        <p className="page-subtitle">Pusat Pengendalian Operasi Penanggulangan Bencana</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Kejadian" value={data.stats.total_disaster} icon={AlertTriangle} />
        <StatCard title="Total Korban" value={data.stats.total_victims} icon={Users} />
        <StatCard title="Total Pengungsi" value={data.stats.total_refugees} icon={Tent} />
        <StatCard title="Kerusakan Rumah" value={data.stats.total_damage} icon={Home} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="stat-card">
          <h3 className="font-semibold text-foreground mb-4">Jenis Bencana</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {data.byType.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="stat-card">
          <h3 className="font-semibold text-foreground mb-4">Tren Kejadian Bencana</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Line type="monotone" dataKey="kejadian" stroke="hsl(24, 95%, 53%)" strokeWidth={2} dot={{ fill: "hsl(24, 95%, 53%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="stat-card">
        <h3 className="font-semibold text-foreground mb-4">Peta Lokasi Bencana</h3>
        <DisasterMap points={data.mapPoints} />
      </div>
    </div>
  );
}
