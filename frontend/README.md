# Frontend Sistem Kaji Cepat Bencana BPBD

Ini adalah repositori frontend untuk proyek **Disaster Rapid Assessment System (Kaji Cepat Bencana BPBD)**.
Frontend ini dibangun menggunakan teknologi web modern untuk menyajikan dashboard yang responsif, interaktif, dan mudah digunakan.

## Teknologi Utama

- **React 18**
- **Vite**
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI** & Radix Primitives
- **React Router**
- **React Query** (TanStack Query)
- **React Leaflet** (Map Visualization)

## Cara Instalasasi & Menjalankan Development Server

Pastikan Anda telah menginstal `Node.js` (versi 18+ direkomendasikan).

```sh
# 1. Install dependencies
npm install

# 2. Jalankan development server
npm run dev
```

Secara default, aplikasi akan berjalan di `http://localhost:8080`.

## Konfigurasi API Backend

Aplikasi ini menggunakan proxy (dikonfigurasi di `vite.config.ts`) untuk menghindari masalah CORS saat development.
Semua request ke `/api/v1/*` akan di-proxy ke `http://localhost:5000`.
Pastikan Backend Service Node.js / Express berjalan pada port tersebut.

## Struktur Direktori Utama

- `/src/components` — Komponen UI re-usable (termasuk komponen shadcn).
- `/src/pages` — Komponen halaman (views) yang dirender berdasarkan route.
- `/src/context` — React Context, seperti `AuthContext`.
- `/src/services` — Service layer untuk memanggil API backend.
- `/src/config` — Konfigurasi statis seperti RBAC rules.
- `/src/layouts` — Layout utama aplikasi (Sidebar, Navbar).

## Role-Based Access Control (RBAC)

Aplikasi memiliki role system yang mengatur visibilitas menu di sidebar dan proteksi rute halaman:
- **ADMIN**: Akses penuh (Manajemen User, Master Data, dll).
- **PUSDALOPS**: Operator pusdalops untuk pelaporan dan verifikasi.
- **TRC**: Tim Reaksi Cepat untuk pengisian form kaji cepat lapangan.
- **PIMPINAN**: Dashboard monitoring dan laporan eksekutif.

Pengaturan RBAC dapat ditemukan di `/src/config/rbac.ts`.
