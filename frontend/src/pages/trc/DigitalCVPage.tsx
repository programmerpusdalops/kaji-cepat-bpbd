/**
 * DigitalCVPage — Shareable Volunteer Portfolio
 *
 * TODO: Replace mock data with real API calls to /api/v1/volunteer-cv
 * Features: Profile header, skills, deployment timeline,
 * print-friendly CSS, export/share UI placeholders
 */

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  IdCard, Download, Share2, MapPin, Calendar, Clock,
  Award, Shield, Star, CheckCircle, Printer, ExternalLink,
  Briefcase, Zap, Target
} from "lucide-react";
import { toast } from "sonner";

// ── Mock Data ──
const cvData = {
  joinDate: "2024-03-15",
  totalDeployments: 24,
  totalHours: 128,
  totalPoints: 2450,
  level: 3,
  levelName: "Relawan Terampil",
  skills: [
    "Kaji Cepat Bencana",
    "Evakuasi & SAR",
    "Pemetaan GIS",
    "Pertolongan Pertama",
    "Komunikasi Radio",
    "Manajemen Posko",
  ],
  certifications: [
    { name: "Sertifikasi Dasar Penanggulangan Bencana", issuer: "BNPB", year: 2024 },
    { name: "First Aid & CPR", issuer: "PMI Sulteng", year: 2024 },
    { name: "GIS Mapping for Disaster Response", issuer: "AHA Centre", year: 2025 },
  ],
  deployments: [
    { id: 1, title: "Banjir Palu Selatan", role: "Anggota TRC", date: "2026-04-05", duration: "8 jam", type: "Banjir" },
    { id: 2, title: "Longsor Kulawi", role: "Ketua Tim", date: "2026-04-02", duration: "12 jam", type: "Longsor" },
    { id: 3, title: "Gempa Donggala M5.2", role: "Anggota TRC", date: "2026-03-28", duration: "10 jam", type: "Gempa" },
    { id: 4, title: "Banjir Bandang Sigi", role: "Mapper GIS", date: "2026-03-20", duration: "6 jam", type: "Banjir" },
    { id: 5, title: "Relokasi Warga Parigi", role: "Anggota TRC", date: "2026-03-15", duration: "4 jam", type: "Relokasi" },
    { id: 6, title: "Gempa Palu M4.8", role: "Anggota TRC", date: "2026-02-20", duration: "5 jam", type: "Gempa" },
  ],
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

const typeColors: Record<string, string> = {
  Banjir: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Longsor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Gempa: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Pemetaan: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Relokasi: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function DigitalCVPage() {
  const { user } = useAuth();

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    // TODO: Generate shareable link
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link CV berhasil disalin ke clipboard");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <IdCard className="h-7 w-7 text-primary" />
            CV Digital Relawan
          </h1>
          <p className="page-subtitle">Portfolio profesional sebagai relawan BPBD</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Cetak</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Bagikan</span>
          </Button>
        </div>
      </div>

      {/* ── Profile Card ── */}
      <div className="stat-card overflow-hidden print:shadow-none print:border">
        <div className="h-28 bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40 relative">
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
            <div className="h-24 w-24 rounded-2xl border-4 border-card bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-xl">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="pb-1 flex-1">
              <h2 className="text-2xl font-bold text-foreground">{user?.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold">
                  <Shield className="h-3 w-3" />
                  Tim Reaksi Cepat
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold">
                  <Star className="h-3 w-3" />
                  {cvData.levelName}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                Bergabung sejak {formatDate(cvData.joinDate)}
                <span className="mx-1">•</span>
                <MapPin className="h-3 w-3" />
                BPBD Provinsi Sulawesi Tengah
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-lg font-bold">{cvData.totalDeployments}</p>
                <p className="text-[10px] text-muted-foreground">Penugasan</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-lg font-bold">{cvData.totalHours}</p>
                <p className="text-[10px] text-muted-foreground">Jam Terbang</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <Zap className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-lg font-bold">{cvData.totalPoints.toLocaleString("id-ID")}</p>
                <p className="text-[10px] text-muted-foreground">Total XP</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <Award className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-lg font-bold">Lv.{cvData.level}</p>
                <p className="text-[10px] text-muted-foreground">{cvData.levelName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Skills & Certifications ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Skills */}
        <div className="stat-card p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Keahlian
          </h3>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.map(skill => (
              <span key={skill} className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="stat-card p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Sertifikasi
          </h3>
          <div className="space-y-3">
            {cvData.certifications.map((cert, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{cert.name}</p>
                  <p className="text-[11px] text-muted-foreground">{cert.issuer} • {cert.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Deployment History Timeline ── */}
      <div className="stat-card p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Riwayat Penugasan
        </h3>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            {cvData.deployments.map(dep => (
              <div key={dep.id} className="flex gap-4 relative">
                {/* Dot */}
                <div className="relative z-10 h-10 w-10 rounded-full bg-card border-2 border-primary flex items-center justify-center shrink-0">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">{dep.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{dep.role}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[dep.type] || "bg-gray-100 text-gray-600"}`}>
                      {dep.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />{formatDate(dep.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />{dep.duration}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-muted-foreground print:mt-8">
        <p>CV Digital ini dihasilkan oleh Sistem KajiCepat BPBD Sulawesi Tengah</p>
        <p className="mt-1">Dicetak pada {formatDate(new Date().toISOString())}</p>
      </div>
    </div>
  );
}
