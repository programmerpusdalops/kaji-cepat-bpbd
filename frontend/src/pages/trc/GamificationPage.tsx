/**
 * GamificationPage — TRC Reputation & Flight Hours Dashboard
 *
 * TODO: Replace mock data with real API calls to /api/v1/gamification
 * Features: Points display, level badge, mission history,
 * leaderboard, deployment stats
 */

import {
  Trophy, Star, Clock, Target, Flame, Medal,
  TrendingUp, Users, MapPin, Shield, Award, Zap
} from "lucide-react";

// ── Mock Data ──
const myStats = {
  totalPoints: 2450,
  level: 3,
  levelName: "Relawan Terampil",
  nextLevel: 3000,
  flightHours: 128,
  totalDeployments: 24,
  currentStreak: 5,
  rank: 4,
  totalMembers: 32,
};

const levelColors: Record<number, string> = {
  1: "from-gray-400 to-gray-500",
  2: "from-green-400 to-green-600",
  3: "from-blue-400 to-blue-600",
  4: "from-purple-400 to-purple-600",
  5: "from-amber-400 to-amber-600",
};

const levelNames: Record<number, string> = {
  1: "Relawan Pemula",
  2: "Relawan Aktif",
  3: "Relawan Terampil",
  4: "Relawan Senior",
  5: "Relawan Pakar",
};

const missions = [
  { id: 1, title: "Kaji Cepat Banjir Palu Selatan", type: "Banjir", date: "2026-04-05", points: 150, hours: 8 },
  { id: 2, title: "Evakuasi Longsor Kulawi", type: "Longsor", date: "2026-04-02", points: 200, hours: 12 },
  { id: 3, title: "Assessment Gempa Donggala", type: "Gempa", date: "2026-03-28", points: 180, hours: 10 },
  { id: 4, title: "Monitoring Banjir Sigi", type: "Banjir", date: "2026-03-20", points: 120, hours: 6 },
  { id: 5, title: "Pemetaan Area Terdampak Palu", type: "Pemetaan", date: "2026-03-15", points: 100, hours: 4 },
];

const leaderboard = [
  { rank: 1, name: "Ahmad Rizki", points: 4200, level: 5, deployments: 42 },
  { rank: 2, name: "Siti Nurhaliza", points: 3800, level: 4, deployments: 38 },
  { rank: 3, name: "Budi Santoso", points: 3100, level: 4, deployments: 30 },
  { rank: 4, name: "Anda", points: 2450, level: 3, deployments: 24, isMe: true },
  { rank: 5, name: "Dewi Kartika", points: 2200, level: 3, deployments: 22 },
];

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

export default function GamificationPage() {
  const progressPercent = (myStats.totalPoints / myStats.nextLevel) * 100;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="page-header text-center">
        <h1 className="page-title flex items-center justify-center gap-2">
          <Trophy className="h-7 w-7 text-primary" />
          Jam Terbang & Reputasi
        </h1>
        <p className="page-subtitle">Pantau kontribusi dan pencapaian Anda sebagai relawan TRC</p>
      </div>

      {/* ── Level Card ── */}
      <div className="stat-card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-5">
          <Trophy className="h-40 w-40" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          {/* Level Badge */}
          <div className={`h-24 w-24 rounded-2xl bg-gradient-to-br ${levelColors[myStats.level] || levelColors[1]} flex flex-col items-center justify-center text-white shadow-lg shrink-0`}>
            <Star className="h-8 w-8 mb-1" />
            <span className="text-2xl font-black">Lv.{myStats.level}</span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-foreground">{myStats.levelName}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {myStats.totalPoints.toLocaleString("id-ID")} / {myStats.nextLevel.toLocaleString("id-ID")} XP ke level berikutnya
            </p>
            {/* Progress Bar */}
            <div className="mt-3 h-3 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${levelColors[myStats.level] || levelColors[1]} transition-all duration-1000 ease-out`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {(myStats.nextLevel - myStats.totalPoints).toLocaleString("id-ID")} XP lagi untuk <span className="font-medium">{levelNames[(myStats.level + 1)] || "Level Maksimum"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <div className="stat-card p-4 text-center">
          <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{myStats.flightHours}</p>
          <p className="text-xs text-muted-foreground">Jam Terbang</p>
        </div>
        <div className="stat-card p-4 text-center">
          <Target className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{myStats.totalDeployments}</p>
          <p className="text-xs text-muted-foreground">Total Penugasan</p>
        </div>
        <div className="stat-card p-4 text-center">
          <Flame className="h-6 w-6 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{myStats.currentStreak}</p>
          <p className="text-xs text-muted-foreground">Streak Aktif</p>
        </div>
        <div className="stat-card p-4 text-center">
          <Medal className="h-6 w-6 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">#{myStats.rank}</p>
          <p className="text-xs text-muted-foreground">dari {myStats.totalMembers} TRC</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Mission History ── */}
        <div className="stat-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Riwayat Misi Terakhir
          </h3>
          <div className="space-y-3">
            {missions.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>{m.type}</span>
                    <span>{formatDate(m.date)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">+{m.points} XP</p>
                  <p className="text-xs text-muted-foreground">{m.hours} jam</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Leaderboard ── */}
        <div className="stat-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Papan Peringkat TRC
          </h3>
          <div className="space-y-2">
            {leaderboard.map(entry => (
              <div
                key={entry.rank}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  (entry as any).isMe
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted/50"
                }`}
              >
                {/* Rank */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  entry.rank === 1 ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white" :
                  entry.rank === 2 ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white" :
                  entry.rank === 3 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {entry.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${(entry as any).isMe ? "text-primary" : ""}`}>
                    {entry.name}
                    {(entry as any).isMe && <span className="text-[10px] ml-1 text-primary/70">(Anda)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{entry.deployments} penugasan</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{entry.points.toLocaleString("id-ID")}</p>
                  <p className="text-[10px] text-muted-foreground">XP</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
