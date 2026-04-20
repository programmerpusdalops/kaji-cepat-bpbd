import { useEffect, useState } from "react";
import { getDashboardData } from "@/services/apiService";
import { DisasterMap } from "@/components/DisasterMap";
import { DashboardSkeleton } from "@/components/SkeletonLoaders";
import {
  AlertTriangle, Users, Home, Tent, ShieldCheck, Clock,
  TrendingUp, MapPin, Activity, Skull, UserX, Stethoscope,
  HeartPulse, Loader2, CheckCircle2, AlertCircle, BarChart3
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, Legend
} from "recharts";

/* ──────────────── Types ──────────────── */

interface DashboardData {
  stats: {
    total_disaster: number;
    total_victims: number;
    total_refugees: number;
    total_house_damage: number;
    total_affected_kk: number;
    total_affected_jiwa: number;
  };
  victims_detail: {
    dead: number;
    missing: number;
    severe_injured: number;
    minor_injured: number;
  };
  house_damage_detail: {
    heavy: number;
    moderate: number;
    light: number;
  };
  refugees_detail: {
    kk: number;
    jiwa: number;
  };
  verification: {
    total: number;
    field_verified: number;
    pending_verification: number;
    rate: number;
  };
  by_status: Record<string, number>;
  by_type: { name: string; value: number; color: string }[];
  trend: { month: string; kejadian: number }[];
  recent_events: {
    id: number;
    disaster_type: string;
    location: string;
    status: string;
    waktu_kejadian: string;
    created_at: string;
    has_field_assessment: boolean;
  }[];
  map_points: {
    id: number;
    lat: number;
    lng: number;
    jenis_bencana: string;
    status: string;
    lokasi: string;
    has_field_assessment: boolean;
  }[];
}

/* ──────────────── Helpers ──────────────── */

const formatNumber = (n: number) => n.toLocaleString("id-ID");
const formatDate = (d: string) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusLabel: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Terkirim",
  VERIFIED: "Terverifikasi",
  MONITORING: "Monitoring",
  CLOSED: "Selesai",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SENT: "bg-blue-100 text-blue-700",
  VERIFIED: "bg-green-100 text-green-700",
  MONITORING: "bg-amber-100 text-amber-700",
  CLOSED: "bg-purple-100 text-purple-700",
};

/* ──────────────── Sub Components ──────────────── */

function BigStatCard({
  title,
  value,
  icon: Icon,
  gradient,
  subtitle,
}: {
  title: string;
  value: number;
  icon: any;
  gradient: string;
  subtitle?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl p-5 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${gradient}`}>
      <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
        <Icon className="h-28 w-28" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-5 w-5 opacity-80" />
          <p className="text-sm font-medium opacity-90">{title}</p>
        </div>
        <p className="text-3xl font-extrabold tracking-tight">{formatNumber(value)}</p>
        {subtitle && <p className="text-xs mt-1 opacity-75">{subtitle}</p>}
      </div>
    </div>
  );
}

function VerificationBadge({ verification }: { verification: DashboardData["verification"] }) {
  const rate = verification.rate;
  const ringColor =
    rate >= 75 ? "text-green-500" : rate >= 40 ? "text-amber-500" : "text-red-400";
  const circumference = 2 * Math.PI * 28;
  const dashOffset = circumference - (rate / 100) * circumference;

  return (
    <div className="stat-card flex items-center gap-5 p-5">
      {/* Ring progress */}
      <div className="relative flex-shrink-0">
        <svg width="70" height="70" viewBox="0 0 70 70">
          <circle cx="35" cy="35" r="28" fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
          <circle
            cx="35" cy="35" r="28" fill="none"
            className={ringColor}
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 35 35)"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-foreground">{rate}%</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground mb-1">Tingkat Verifikasi Lapangan</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            {verification.field_verified} terverifikasi
          </span>
          <span className="flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
            {verification.pending_verification} menunggu
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
          Dari {verification.total} kejadian, {verification.field_verified} sudah ditinjau langsung oleh tim TRC di lapangan.
        </p>
      </div>
    </div>
  );
}

function VictimsDetailCard({ detail }: { detail: DashboardData["victims_detail"] }) {
  const items = [
    { label: "Meninggal", value: detail.dead, icon: Skull, color: "text-red-500 bg-red-50" },
    { label: "Hilang", value: detail.missing, icon: UserX, color: "text-orange-500 bg-orange-50" },
    { label: "Luka Berat", value: detail.severe_injured, icon: Stethoscope, color: "text-amber-600 bg-amber-50" },
    { label: "Luka Ringan", value: detail.minor_injured, icon: HeartPulse, color: "text-blue-500 bg-blue-50" },
  ];

  return (
    <div className="stat-card p-5">
      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        Rincian Korban Jiwa
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-lg border p-3">
            <div className={`rounded-md p-2 ${item.color}`}>
              <item.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{formatNumber(item.value)}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HouseDamageCard({ detail }: { detail: DashboardData["house_damage_detail"] }) {
  const total = detail.heavy + detail.moderate + detail.light;
  const items = [
    { label: "Berat", value: detail.heavy, color: "#EF4444", percent: total > 0 ? (detail.heavy / total) * 100 : 0 },
    { label: "Sedang", value: detail.moderate, color: "#F59E0B", percent: total > 0 ? (detail.moderate / total) * 100 : 0 },
    { label: "Ringan", value: detail.light, color: "#3B82F6", percent: total > 0 ? (detail.light / total) * 100 : 0 },
  ];

  return (
    <div className="stat-card p-5">
      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <Home className="h-4 w-4 text-primary" />
        Kerusakan Rumah
      </h3>
      <p className="text-3xl font-extrabold text-foreground mb-4">{formatNumber(total)} <span className="text-sm font-normal text-muted-foreground">unit</span></p>
      {/* Stacked bar */}
      {total > 0 && (
        <div className="flex h-3 w-full rounded-full overflow-hidden mb-3">
          {items.map((item) => (
            <div
              key={item.label}
              style={{ width: `${item.percent}%`, backgroundColor: item.color, transition: "width 0.8s ease" }}
            />
          ))}
        </div>
      )}
      <div className="flex justify-between text-xs text-muted-foreground">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}: <span className="font-semibold text-foreground">{formatNumber(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusOverview({ byStatus }: { byStatus: Record<string, number> }) {
  const data = Object.entries(byStatus).map(([status, total]) => ({
    name: statusLabel[status] || status,
    value: total,
  }));

  const statusBarColors: Record<string, string> = {
    Draft: "#9CA3AF",
    Terkirim: "#3B82F6",
    Terverifikasi: "#10B981",
    Monitoring: "#F59E0B",
    Selesai: "#8B5CF6",
  };

  return (
    <div className="stat-card p-5">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        Status Laporan
      </h3>
      <div className="space-y-2.5">
        {data.map((item) => {
          const maxVal = Math.max(...data.map((d) => d.value), 1);
          const percent = (item.value / maxVal) * 100;
          const color = statusBarColors[item.name] || "#6B7280";
          return (
            <div key={item.name}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-semibold text-foreground">{item.value}</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{ width: `${percent}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentEventsTable({ events }: { events: DashboardData["recent_events"] }) {
  return (
    <div className="stat-card p-5">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        Kejadian Terbaru
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2 pr-4 font-medium">Jenis Bencana</th>
              <th className="pb-2 pr-4 font-medium">Lokasi</th>
              <th className="pb-2 pr-4 font-medium">Waktu</th>
              <th className="pb-2 pr-4 font-medium">Status</th>
              <th className="pb-2 font-medium">Sumber Data</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  Belum ada data kejadian.
                </td>
              </tr>
            )}
            {events.map((e) => (
              <tr key={e.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                <td className="py-2.5 pr-4 font-medium text-foreground">{e.disaster_type}</td>
                <td className="py-2.5 pr-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    {e.location || "-"}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-muted-foreground text-xs whitespace-nowrap">{formatDate(e.waktu_kejadian)}</td>
                <td className="py-2.5 pr-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[e.status] || "bg-gray-100 text-gray-600"}`}>
                    {statusLabel[e.status] || e.status}
                  </span>
                </td>
                <td className="py-2.5">
                  {e.has_field_assessment ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5" /> Lapangan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                      <AlertCircle className="h-3.5 w-3.5" /> Awal
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* Custom tooltip for recharts */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card p-3 shadow-lg text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted-foreground">
          {p.name || "Kejadian"}: <span className="font-semibold text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ──────────────── Main Page ──────────────── */

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardData()
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Gagal memuat data dashboard.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-destructive">
        <AlertTriangle className="h-8 w-8" />
        <p className="text-sm">{error || "Data tidak tersedia."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Activity className="h-7 w-7 text-primary" />
            Dashboard Command Center
          </h1>
          <p className="page-subtitle">Pusat Pengendalian Operasi Penanggulangan Bencana — BPBD Prov. Sulawesi Tengah</p>
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Terakhir diperbarui: {formatDate(new Date().toISOString())}
        </div>
      </div>

      {/* ─── Row 1: Big Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <BigStatCard
          title="Total Kejadian"
          value={data.stats.total_disaster}
          icon={AlertTriangle}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          subtitle="Bencana yang dilaporkan"
        />
        <BigStatCard
          title="Total Korban"
          value={data.stats.total_victims}
          icon={Users}
          gradient="bg-gradient-to-br from-red-500 to-red-600"
          subtitle={`${data.victims_detail.dead} meninggal, ${data.victims_detail.missing} hilang`}
        />
        <BigStatCard
          title="Pengungsi"
          value={data.stats.total_refugees}
          icon={Tent}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          subtitle={data.refugees_detail.kk > 0 ? `${formatNumber(data.refugees_detail.kk)} KK` : undefined}
        />
        <BigStatCard
          title="Kerusakan Rumah"
          value={data.stats.total_house_damage}
          icon={Home}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          subtitle="Total unit rumah rusak"
        />
      </div>

      {/* ─── Row 2: Verification + Terdampak ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <VerificationBadge verification={data.verification} />
        <div className="stat-card p-5 flex items-center gap-5">
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 flex-shrink-0">
            <TrendingUp className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Masyarakat Terdampak</p>
            <p className="text-2xl font-extrabold text-foreground">{formatNumber(data.stats.total_affected_jiwa)} <span className="text-sm font-normal text-muted-foreground">jiwa</span></p>
            <p className="text-xs text-muted-foreground mt-0.5">{formatNumber(data.stats.total_affected_kk)} KK terdampak</p>
          </div>
        </div>
        <StatusOverview byStatus={data.by_status} />
      </div>

      {/* ─── Row 3: Charts ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart - Jenis Bencana */}
        <div className="stat-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            Distribusi Jenis Bencana
          </h3>
          {data.by_type.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">Belum ada data</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.by_type}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={100}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.by_type.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Area Chart - Tren Bulanan */}
        <div className="stat-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Tren Kejadian Bencana ({new Date().getFullYear()})
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.trend}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="kejadian"
                stroke="hsl(24, 95%, 53%)"
                strokeWidth={2.5}
                fill="url(#trendGrad)"
                dot={{ fill: "hsl(24, 95%, 53%)", r: 4 }}
                activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── Row 4: Victims Detail + House Damage ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <VictimsDetailCard detail={data.victims_detail} />
        <HouseDamageCard detail={data.house_damage_detail} />
      </div>

      {/* ─── Row 5: Recent Events Table ─── */}
      <RecentEventsTable events={data.recent_events} />

      {/* ─── Row 6: Map ─── */}
      {data.map_points.length > 0 && (
        <div className="stat-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Peta Lokasi Bencana
          </h3>
          <DisasterMap
            points={data.map_points}
            center={[-1.43, 121.45]}
            zoom={7}
            className="h-[450px]"
          />
        </div>
      )}
    </div>
  );
}
