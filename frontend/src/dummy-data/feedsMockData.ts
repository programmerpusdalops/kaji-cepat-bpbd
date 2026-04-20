/**
 * feedsMockData — Mock data for Feeds & Moderation and Resource Tracking
 *
 * TODO: Replace with real API calls when backend endpoints are ready.
 */

export interface FeedPost {
  id: number;
  author: {
    name: string;
    role: string;
    avatar: string; // initial letter
  };
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  comments: number;
  isHidden: boolean;
  isFlagged: boolean;
}

export interface VolunteerActivity {
  id: number;
  userName: string;
  role: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface ResourceItem {
  id: number;
  disasterEvent: string;
  name: string;
  unit: string;
  needed: number;
  fulfilled: number;
  lastUpdated: string;
}

// ── Mock Feed Posts ──

export const mockFeedPosts: FeedPost[] = [
  {
    id: 1,
    author: { name: "Admin BPBD", role: "ADMIN", avatar: "A" },
    content: "🚨 PERINGATAN: Potensi banjir tinggi di wilayah Palu Selatan akibat curah hujan tinggi. Tim TRC harap siaga. Posko darurat sudah disiapkan di Kelurahan Tatura.",
    createdAt: "2026-04-06T08:30:00Z",
    likes: 24,
    comments: 8,
    isHidden: false,
    isFlagged: false,
  },
  {
    id: 2,
    author: { name: "Pusdalops Sulteng", role: "PUSDALOPS", avatar: "P" },
    content: "Update situasi: Banjir bandang di Kec. Dolo Selatan mulai surut. Akses jalan sudah bisa dilalui kendaraan roda 4. Evakuasi warga terdampak masih berlangsung.",
    createdAt: "2026-04-05T14:15:00Z",
    likes: 18,
    comments: 5,
    isHidden: false,
    isFlagged: false,
  },
  {
    id: 3,
    author: { name: "TRC Tim Alpha", role: "TRC", avatar: "T" },
    content: "Laporan lapangan: Longsor di Desa Kulawi, 3 rumah tertimbun. Tim sudah di lokasi, evakuasi manual menggunakan peralatan seadanya. Butuh alat berat segera.",
    createdAt: "2026-04-04T16:45:00Z",
    likes: 31,
    comments: 12,
    isHidden: false,
    isFlagged: false,
  },
  {
    id: 4,
    author: { name: "Relawan Mandiri", role: "TRC", avatar: "R" },
    content: "Konten ini telah disembunyikan karena melanggar ketentuan.",
    createdAt: "2026-04-03T10:00:00Z",
    likes: 2,
    comments: 1,
    isHidden: true,
    isFlagged: true,
  },
];

// ── Mock Volunteer Activities ──

export const mockActivities: VolunteerActivity[] = [
  { id: 1, userName: "Ahmad Rizki", role: "TRC", action: "Mengirim", target: "Laporan Kaji Cepat Banjir Palu", timestamp: "2026-04-06T09:12:00Z" },
  { id: 2, userName: "Siti Nurhaliza", role: "TRC", action: "Menyelesaikan", target: "Assessment Lap. Gempa Donggala", timestamp: "2026-04-06T08:45:00Z" },
  { id: 3, userName: "Budi Santoso", role: "PUSDALOPS", action: "Memverifikasi", target: "Laporan Tanah Longsor Kulawi", timestamp: "2026-04-05T17:30:00Z" },
  { id: 4, userName: "Dewi Kartika", role: "TRC", action: "Mengupload", target: "12 foto dokumentasi banjir", timestamp: "2026-04-05T15:20:00Z" },
  { id: 5, userName: "Eko Prasetyo", role: "TRC", action: "Memperbarui", target: "Peta kolaboratif area terdampak", timestamp: "2026-04-05T14:00:00Z" },
  { id: 6, userName: "Fajar Hidayat", role: "TRC", action: "Membuat", target: "Penugasan Tim Bravo ke Sigi", timestamp: "2026-04-04T11:30:00Z" },
];

// ── Mock Resource Items ──

export const mockResources: ResourceItem[] = [
  { id: 1, disasterEvent: "Banjir Palu Selatan", name: "Makanan Siap Saji", unit: "paket", needed: 500, fulfilled: 320, lastUpdated: "2026-04-06T10:00:00Z" },
  { id: 2, disasterEvent: "Banjir Palu Selatan", name: "Air Bersih", unit: "liter", needed: 2000, fulfilled: 1450, lastUpdated: "2026-04-06T09:30:00Z" },
  { id: 3, disasterEvent: "Banjir Palu Selatan", name: "Tenda Pengungsian", unit: "unit", needed: 50, fulfilled: 35, lastUpdated: "2026-04-05T16:00:00Z" },
  { id: 4, disasterEvent: "Banjir Palu Selatan", name: "Selimut", unit: "lembar", needed: 300, fulfilled: 180, lastUpdated: "2026-04-05T14:00:00Z" },
  { id: 5, disasterEvent: "Banjir Palu Selatan", name: "Obat-obatan", unit: "paket", needed: 100, fulfilled: 75, lastUpdated: "2026-04-06T08:00:00Z" },
  { id: 6, disasterEvent: "Longsor Kulawi", name: "Alat Berat", unit: "unit", needed: 3, fulfilled: 1, lastUpdated: "2026-04-04T12:00:00Z" },
  { id: 7, disasterEvent: "Longsor Kulawi", name: "Tenda Darurat", unit: "unit", needed: 20, fulfilled: 8, lastUpdated: "2026-04-04T10:00:00Z" },
  { id: 8, disasterEvent: "Longsor Kulawi", name: "Makanan Siap Saji", unit: "paket", needed: 200, fulfilled: 60, lastUpdated: "2026-04-04T09:00:00Z" },
];
