# 📘 FRONTEND DOCUMENTATION — KajiCepat (Kaji Cepat Bencana BPBD)

> **Disaster Rapid Assessment System — Frontend Application**
> Dokumentasi lengkap frontend untuk sistem Kaji Cepat Bencana BPBD Provinsi Sulawesi Tengah.
> Terakhir diperbarui: 7 April 2026

---

## 📋 Daftar Isi

1. [Gambaran Umum](#1-gambaran-umum)
2. [Teknologi yang Digunakan](#2-teknologi-yang-digunakan)
3. [Arsitektur Aplikasi](#3-arsitektur-aplikasi)
4. [Struktur Folder Lengkap](#4-struktur-folder-lengkap)
5. [Konfigurasi Project](#5-konfigurasi-project)
6. [Sistem Routing & RBAC](#6-sistem-routing--rbac)
7. [Dual-Layout Architecture](#7-dual-layout-architecture)
8. [Daftar Halaman & Fitur](#8-daftar-halaman--fitur)
9. [State Management](#9-state-management)
10. [API Service Layer](#10-api-service-layer)
11. [Component Library](#11-component-library)
12. [Custom Hooks](#12-custom-hooks)
13. [PWA & Offline Support](#13-pwa--offline-support)
14. [Theming (Dark/Light Mode)](#14-theming-darklight-mode)
15. [Keamanan Frontend](#15-keamanan-frontend)
16. [Cara Menjalankan](#16-cara-menjalankan)

---

## 1. Gambaran Umum

Frontend **KajiCepat** adalah Single Page Application (SPA) yang dibangun menggunakan **React.js + TypeScript**. Aplikasi ini mengkonsumsi REST API dari backend Express.js dan menyediakan antarmuka untuk seluruh alur penanganan bencana BPBD.

### Fitur Utama
- **Dual-View Architecture**: Layout berbeda untuk Admin (desktop sidebar) dan TRC (mobile bottom nav)
- **PWA Ready**: Service Worker, offline support, installable di mobile
- **Dark/Light Mode**: Tema persisten via localStorage
- **Command Palette**: Quick search/navigation dengan `Cmd+K` / `Ctrl+K`
- **Offline-First**: Queue request saat offline, sync otomatis saat online
- **Haptic Feedback**: Vibrasi untuk aksi penting di mobile (Web Haptics API)
- **Code Splitting**: Lazy loading halaman untuk performa optimal

---

## 2. Teknologi yang Digunakan

### Core Framework
| Teknologi | Versi | Fungsi |
|---|---|---|
| **React** | ^18.3.1 | Library UI utama |
| **TypeScript** | ^5.8.3 | Type safety |
| **Vite** | ^5.4.19 | Build tool & dev server |
| **React Router DOM** | ^6.30.1 | Client-side routing |

### Styling & UI
| Teknologi | Fungsi |
|---|---|
| **TailwindCSS** (^3.4.17) | Utility-first CSS framework |
| **tailwindcss-animate** (^1.0.7) | Animasi CSS via Tailwind |
| **shadcn/ui** (Radix UI) | 45+ komponen UI headless & accessible |
| **Lucide React** (^0.462.0) | Icon library modern (700+ ikon) |
| **class-variance-authority** (^0.7.1) | Variant-based component styling |
| **tailwind-merge** (^2.6.0) | Merge Tailwind classes tanpa konflik |
| **clsx** (^2.1.1) | Conditional class names |

### Data & State
| Teknologi | Fungsi |
|---|---|
| **TanStack React Query** (^5.83.0) | Server state management, caching, refetching |
| **React Hook Form** (^7.61.1) | Form management performant |
| **Zod** (^3.25.76) | Schema validation untuk form |
| **@hookform/resolvers** (^3.10.0) | Zod resolver untuk React Hook Form |

### Peta & Geospasial
| Teknologi | Fungsi |
|---|---|
| **Leaflet** (^1.9.4) | Library peta interaktif |
| **React Leaflet** (^4.2.1) | React wrapper untuk Leaflet |
| **leaflet-draw** (^1.0.4) | Drawing tools (marker, polygon, polyline) |

### Charting & Visualisasi
| Teknologi | Fungsi |
|---|---|
| **Recharts** (^2.15.4) | Chart library untuk dashboard (bar, pie, line) |

### Notifikasi & Dialog
| Teknologi | Fungsi |
|---|---|
| **Sonner** (^1.7.4) | Toast notifications modern |
| **Vaul** (^0.9.9) | Mobile-friendly drawer component |
| **cmdk** (^1.1.1) | Command palette component |

### Utilitas
| Teknologi | Fungsi |
|---|---|
| **date-fns** (^3.6.0) | Manipulasi tanggal |
| **embla-carousel-react** (^8.6.0) | Carousel/slider |
| **react-day-picker** (^8.10.1) | Date picker |
| **react-resizable-panels** (^2.1.9) | Resizable panel layouts |
| **next-themes** (^0.3.0) | Theme management |
| **input-otp** (^1.4.2) | OTP input component |

### Testing
| Teknologi | Fungsi |
|---|---|
| **Vitest** (^3.2.4) | Unit test runner |
| **@testing-library/react** (^16.0.0) | React testing utilities |
| **@testing-library/jest-dom** (^6.6.0) | DOM assertion matchers |
| **jsdom** (^20.0.3) | DOM environment untuk testing |

### Development Tools
| Teknologi | Fungsi |
|---|---|
| **ESLint** (^9.32.0) | Linting JavaScript/TypeScript |
| **@vitejs/plugin-react-swc** (^3.11.0) | SWC compiler untuk fast refresh |
| **PostCSS** (^8.5.6) | CSS processor |
| **Autoprefixer** (^10.4.21) | Auto CSS vendor prefixes |

---

## 3. Arsitektur Aplikasi

### Arsitektur Umum

```
┌─────────────────────────────────────────────────────────────┐
│                       BROWSER                                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                   Service Worker (sw.js)              │    │
│  │         Cache API responses + Queue offline writes    │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                    React Application                   │    │
│  │                                                        │    │
│  │  ┌────────────────────────────────────────────────┐   │    │
│  │  │          Providers (App Root)                    │   │    │
│  │  │  QueryClient → Tooltip → Toast → BrowserRouter │   │    │
│  │  │            → AuthProvider → ThemeProvider       │   │    │
│  │  └───────────────────┬────────────────────────────┘   │    │
│  │                      │                                 │    │
│  │  ┌───────────────────▼────────────────────────────┐   │    │
│  │  │            AppLayout (Layout Router)             │   │    │
│  │  │                                                  │   │    │
│  │  │    Role === "TRC"         Role !== "TRC"        │   │    │
│  │  │         │                       │                │   │    │
│  │  │  ┌──────▼──────┐    ┌──────────▼──────────┐    │   │    │
│  │  │  │ MobileLayout│    │    AdminLayout       │    │   │    │
│  │  │  │ (Bottom Nav)│    │ (Sidebar + Header)   │    │   │    │
│  │  │  └──────┬──────┘    └──────────┬──────────┘    │   │    │
│  │  │         │                      │                │   │    │
│  │  │         └──────────┬───────────┘                │   │    │
│  │  │                    │                             │   │    │
│  │  │         ┌──────────▼──────────┐                 │   │    │
│  │  │         │   <Outlet /> Pages   │                 │   │    │
│  │  │         │  (Lazy Loaded)       │                 │   │    │
│  │  │         └─────────────────────┘                 │   │    │
│  │  └────────────────────────────────────────────────┘   │    │
│  └──────────────────────────────────────────────────────┘    │
│                          │                                    │
│                  ┌───────▼───────┐                            │
│                  │  apiService   │                            │
│                  │  (fetch API)  │                            │
│                  └───────┬───────┘                            │
│                          │                                    │
└──────────────────────────┼────────────────────────────────────┘
                           │ HTTP (Vite Proxy)
                ┌──────────▼──────────┐
                │  Backend Express.js  │
                │  localhost:5000      │
                └─────────────────────┘
```

### Alur Data

```
User Interaction
  → React Component (Page)
    → apiService.ts (fetch wrapper)
      → Vite Proxy (/api/v1 → localhost:5000)
        → Backend Express API
        ← JSON Response
      ← Parsed Data
    ← React Query Cache / State Update
  ← UI Re-render
```

---

## 4. Struktur Folder Lengkap

```
frontend/
├── index.html                    # HTML entry point (SEO, PWA meta, fonts, FOUC prevention)
├── package.json                  # Dependencies & npm scripts
├── vite.config.ts                # Vite configuration (proxy, aliases, plugins)
├── tailwind.config.ts            # TailwindCSS configuration (theme, colors, animations)
├── tsconfig.json                 # TypeScript base config
├── tsconfig.app.json             # TypeScript app config (paths, strict mode)
├── tsconfig.node.json            # TypeScript config untuk Node files
├── postcss.config.js             # PostCSS plugins (tailwindcss, autoprefixer)
├── eslint.config.js              # ESLint flat config
├── vitest.config.ts              # Vitest test config
├── components.json               # shadcn/ui configuration
│
├── public/                       # Static assets (served as-is)
│   ├── favicon.ico               # Favicon
│   ├── manifest.json             # PWA manifest (name, icons, display mode)
│   ├── sw.js                     # Service Worker (caching, offline sync, background sync)
│   ├── robots.txt                # SEO robots config
│   ├── placeholder.svg           # Placeholder image
│   └── icons/                    # PWA icons (192x192, 512x512)
│
├── dist/                         # Production build output (auto-generated)
│
└── src/                          # Source code
    ├── main.tsx                  # React entry point (render, SW registration)
    ├── App.tsx                   # Root component (providers, router, routes)
    ├── App.css                   # Global CSS overrides
    ├── index.css                 # Tailwind directives + CSS variables (theme tokens)
    ├── vite-env.d.ts             # Vite type declarations
    │
    ├── config/                   # Configuration
    │   └── rbac.ts               # RBAC — Role-Based Access Control & menu config
    │
    ├── context/                  # React Context Providers
    │   ├── AuthContext.tsx        # Authentication state (user, token, login/logout)
    │   └── ThemeContext.tsx       # Dark/Light mode state (persisted via localStorage)
    │
    ├── layouts/                  # Layout shells (Dual-View Architecture)
    │   ├── AppLayout.tsx         # Layout router — selects Admin vs Mobile by role
    │   ├── AdminLayout.tsx       # Desktop layout (sidebar, header, breadcrumbs)
    │   └── MobileLayout.tsx      # Mobile layout (compact header, bottom nav, haptic)
    │
    ├── services/                 # API communication layer
    │   └── apiService.ts         # Centralized fetch wrapper (auth, offline, all endpoints)
    │
    ├── hooks/                    # Custom React hooks
    │   ├── use-mobile.tsx        # Detect mobile viewport
    │   ├── use-toast.ts          # Toast notification hook
    │   ├── useCommandPalette.ts  # Cmd+K / Ctrl+K command palette state
    │   ├── useDoubleSubmitGuard.ts # Prevent double form submissions
    │   ├── useHapticFeedback.ts  # Web Haptics API wrapper (vibration patterns)
    │   └── useNetworkStatus.ts   # Online/offline status + pending sync count
    │
    ├── lib/                      # Utility libraries
    │   ├── utils.ts              # cn() — Tailwind class merge helper
    │   ├── offlineDB.ts          # IndexedDB for PWA offline queue & API cache
    │   └── sanitize.ts           # XSS prevention (sanitizeHTML, sanitizeInput, etc.)
    │
    ├── components/               # Shared components
    │   ├── AppSidebar.tsx        # Admin sidebar navigation (collapsible, with logo)
    │   ├── CommandPalette.tsx    # Cmd+K search & quick navigation dialog
    │   ├── DisasterMap.tsx       # Leaflet map embed wrapper
    │   ├── NavLink.tsx           # Styled navigation link
    │   ├── NetworkStatusBar.tsx  # Online/offline status bar with sync indicator
    │   ├── SkeletonLoaders.tsx   # Loading skeleton variants (cards, tables, charts)
    │   ├── StatCard.tsx          # Dashboard statistic card
    │   ├── StatusBadge.tsx       # Status badge (VERIFIED, PENDING, DRAFT, etc.)
    │   └── ui/                   # shadcn/ui components (45+ components)
    │       ├── accordion.tsx
    │       ├── alert-dialog.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── breadcrumb.tsx
    │       ├── button.tsx
    │       ├── calendar.tsx
    │       ├── card.tsx
    │       ├── carousel.tsx
    │       ├── chart.tsx
    │       ├── checkbox.tsx
    │       ├── collapsible.tsx
    │       ├── command.tsx        # cmdk command menu
    │       ├── context-menu.tsx
    │       ├── dialog.tsx
    │       ├── drawer.tsx         # mobile drawer (vaul)
    │       ├── dropdown-menu.tsx
    │       ├── form.tsx           # react-hook-form integration
    │       ├── hover-card.tsx
    │       ├── input-otp.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── menubar.tsx
    │       ├── navigation-menu.tsx
    │       ├── pagination.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── radio-group.tsx
    │       ├── resizable.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── sidebar.tsx        # collapsible sidebar system
    │       ├── skeleton.tsx
    │       ├── slider.tsx
    │       ├── sonner.tsx         # toast notification wrapper
    │       ├── switch.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       ├── toast.tsx
    │       ├── toaster.tsx
    │       ├── toggle-group.tsx
    │       ├── toggle.tsx
    │       ├── tooltip.tsx
    │       └── use-toast.ts
    │
    ├── pages/                    # Page components (route targets)
    │   ├── LoginPage.tsx         # 🔐 Halaman login
    │   ├── DashboardPage.tsx     # 📊 Dashboard Command Center
    │   ├── ProfilePage.tsx       # 👤 Profil user
    │   ├── KajiCepatPage.tsx     # ⚡ Kaji Cepat Awal (list)
    │   ├── KajiCepatFormPage.tsx # ⚡ Form Kaji Cepat (create/edit)
    │   ├── TeamAssignmentPage.tsx # 🚗 Penugasan Tim TRC
    │   ├── FieldAssessmentPage.tsx # 📋 Kaji Cepat Lapangan (Juklak)
    │   ├── ImpactPage.tsx        # 📈 Data Dampak Bencana
    │   ├── EmergencyNeedsPage.tsx # 🆘 Kebutuhan Mendesak
    │   ├── DisasterMapPage.tsx   # 🗺️ Peta Bencana (read-only)
    │   ├── CollaborativeMapPage.tsx # 🗺️ Peta Kolaboratif (draw tools)
    │   ├── PublicMapPage.tsx     # 🌐 Peta publik (tanpa login)
    │   ├── GenerateReportsPage.tsx # 📄 Download Laporan DOCX/PDF
    │   ├── ReportsPage.tsx       # 📋 Laporan bencana
    │   ├── ReportDetailPage.tsx  # 📋 Detail laporan
    │   ├── VerificationPage.tsx  # ✅ Verifikasi laporan
    │   ├── UsersPage.tsx         # 👥 Manajemen User (ADMIN)
    │   ├── MasterDataPage.tsx    # 📦 Data Master (ADMIN)
    │   ├── Index.tsx             # Landing / redirect
    │   ├── ForbiddenPage.tsx     # 🚫 403 Forbidden
    │   ├── NotFound.tsx          # 🔍 404 Not Found
    │   │
    │   ├── admin/                # Admin-only pages
    │   │   ├── FeedsPage.tsx     # 📰 Feed & Moderasi
    │   │   └── ResourceTrackingPage.tsx  # 📦 Tracking Logistik
    │   │
    │   └── trc/                  # TRC-only pages
    │       ├── GamificationPage.tsx  # 🏆 Jam Terbang / Gamification
    │       └── DigitalCVPage.tsx     # 🪪 CV Digital Relawan
    │
    ├── types/                    # TypeScript type declarations
    │   └── leaflet-draw.d.ts     # Type definitions untuk leaflet-draw
    │
    ├── dummy-data/               # Data dummy untuk development
    │   ├── assessments.ts        # Mock data assessment
    │   ├── dashboard.ts          # Mock data dashboard
    │   ├── feedsMockData.ts      # Mock data feeds
    │   └── reports.ts            # Mock data reports
    │
    └── test/                     # Test files
        ├── setup.ts              # Test setup (jsdom)
        └── example.test.ts       # Example test
```

---

## 5. Konfigurasi Project

### Vite Configuration (`vite.config.ts`)

```typescript
// Key configurations:
{
  server: {
    port: 5173,           // Dev server port
    proxy: {
      "/api/v1": "http://localhost:5000",   // Proxy API ke backend
      "/uploads": "http://localhost:5000",  // Proxy file uploads
    },
  },
  resolve: {
    alias: { "@": "./src" },  // Import alias: @/components, @/hooks, dll
  },
  plugins: [react()],  // SWC-based React plugin (fast refresh)
}
```

### TailwindCSS Configuration

- **Dark mode**: Class-based (`darkMode: ["class"]`)
- **Custom colors**: Menggunakan CSS variables HSL → mendukung dark/light switch
- **Extended colors**: `status.verified`, `status.rejected`, `status.monitoring`, `status.assigned`, `status.new`
- **Sidebar theming**: Custom sidebar color tokens
- **Animation**: Accordion animations via `tailwindcss-animate`

### Path Alias

Semua import menggunakan alias `@/` yang mengarah ke `src/`:
```typescript
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
```

---

## 6. Sistem Routing & RBAC

### Role-Based Access Control (RBAC)

Konfigurasi RBAC terpusat di `src/config/rbac.ts` — **single source of truth** untuk:
- Menu visibility (sidebar & bottom nav)
- Route access permission
- Layout selection

#### 4 Role yang Didukung

| Role | Layout | Deskripsi |
|---|---|---|
| **ADMIN** | Desktop (Sidebar) | Administrator sistem — akses penuh |
| **PUSDALOPS** | Desktop (Sidebar) | Pusat pengendalian — kelola kaji cepat awal |
| **TRC** | Mobile (Bottom Nav) | Tim lapangan — kaji cepat lapangan |
| **PIMPINAN** | Desktop (Sidebar) | Pejabat — view-only dashboard & laporan |

#### Akses Menu per Role

| Menu | ADMIN | PUSDALOPS | TRC | PIMPINAN |
|---|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Kaji Cepat (Awal) | ✅ | ✅ | ❌ | ❌ |
| Penugasan Tim | ✅ | ✅ | ❌ | ✅ |
| Kaji Cepat Lapangan | ✅ | ❌ | ✅ | ❌ |
| Data Dampak Bencana | ✅ | ✅ | ✅ | ✅ |
| Kebutuhan Mendesak | ✅ | ✅ | ✅ | ❌ |
| Laporan | ✅ | ✅ | ✅ | ✅ |
| Peta Kolaboratif | ✅ | ✅ | ✅ | ❌ |
| Feed & Moderasi | ✅ | ❌ | ❌ | ❌ |
| Tracking Logistik | ✅ | ❌ | ❌ | ❌ |
| Manajemen User | ✅ | ❌ | ❌ | ❌ |
| Data Master | ✅ | ❌ | ❌ | ❌ |
| Jam Terbang | ❌ | ❌ | ✅ | ❌ |
| CV Digital | ❌ | ❌ | ✅ | ❌ |

### Route Protection

Routing menggunakan dua layer proteksi:

```
<ProtectedRoute>          →  Cek apakah user sudah login (ada token)
  <RoleRoute>             →  Cek apakah role user punya akses ke URL ini
    <Page Component />
  </RoleRoute>
</ProtectedRoute>
```

- Jika belum login → redirect ke `/login`
- Jika tidak punya akses → tampil `ForbiddenPage` (403)

### Daftar Route

| Path | Component | Auth | Guard |
|---|---|:---:|---|
| `/login` | LoginPage | ❌ | Redirect ke `/` jika sudah login |
| `/` | DashboardPage | ✅ | Semua role |
| `/profile` | ProfilePage | ✅ | Semua role |
| `/kaji-cepat` | KajiCepatPage | ✅ | ADMIN, PUSDALOPS |
| `/kaji-cepat/new` | KajiCepatFormPage | ✅ | ADMIN, PUSDALOPS |
| `/kaji-cepat/:id/edit` | KajiCepatFormPage | ✅ | ADMIN, PUSDALOPS |
| `/team-assignment` | TeamAssignmentPage | ✅ | ADMIN, PUSDALOPS, PIMPINAN |
| `/field-assessment` | FieldAssessmentPage | ✅ | ADMIN, TRC |
| `/impact` | ImpactPage | ✅ | ADMIN, PUSDALOPS, TRC, PIMPINAN |
| `/emergency-needs` | EmergencyNeedsPage | ✅ | ADMIN, PUSDALOPS, TRC |
| `/disaster-map` | DisasterMapPage | ✅ | — |
| `/collaborative-map` | CollaborativeMapPage | ✅ | ADMIN, PUSDALOPS, TRC |
| `/generate-reports` | GenerateReportsPage | ✅ | ADMIN, PUSDALOPS, TRC, PIMPINAN |
| `/users` | UsersPage | ✅ | ADMIN |
| `/master-data` | MasterDataPage | ✅ | ADMIN |
| `/feeds` | FeedsPage | ✅ | ADMIN |
| `/resource-tracking` | ResourceTrackingPage | ✅ | ADMIN |
| `/gamification` | GamificationPage | ✅ | TRC |
| `/digital-cv` | DigitalCVPage | ✅ | TRC |
| `/public-map/:assessmentId/:slug?` | PublicMapPage | ❌ | Publik (no auth) |
| `*` | NotFound | ❌ | 404 page |

---

## 7. Dual-Layout Architecture

Sistem menggunakan **dua layout berbeda** berdasarkan role user, memberikan UX optimal untuk setiap jenis pengguna.

### AdminLayout (Desktop-First)
**Digunakan oleh**: ADMIN, PUSDALOPS, PIMPINAN

```
┌───────────────────────────────────────────────────┐
│                   HEADER BAR                       │
│  [☰ Sidebar Toggle] [Breadcrumbs]    [🔍] [🌙] [🔔] [Avatar ▼] │
├────────────┬──────────────────────────────────────┤
│            │                                      │
│  SIDEBAR   │          PAGE CONTENT                │
│            │          (<Outlet />)                 │
│  Dashboard │                                      │
│  Kaji Cepat│          Lazy-loaded                 │
│  Tim       │          with Suspense               │
│  Lapangan  │          fallback                    │
│  Dampak    │                                      │
│  ...       │                                      │
│            │                                      │
│  [Collapse]│                                      │
│            │                                      │
└────────────┴──────────────────────────────────────┘
```

**Fitur:**
- Collapsible sidebar (AppSidebar + SidebarProvider)
- Header dengan breadcrumbs, search (Cmd+K), theme toggle, notifikasi, user dropdown
- Glassmorphism effect pada header
- Animasi fade-in pada konten halaman

### MobileLayout (Mobile-First)
**Digunakan oleh**: TRC (Tim Reaksi Cepat)

```
┌───────────────────────────┐
│    COMPACT HEADER          │
│ [KC Logo] TRC BPBD  [🌙][🔔][☰] │
├───────────────────────────┤
│                           │
│      PAGE CONTENT         │
│      (<Outlet />)         │
│                           │
│      Optimized for        │
│      touch interaction    │
│      & slow networks      │
│                           │
│                           │
├───────────────────────────┤
│  BOTTOM NAVIGATION (Glass) │
│ [📊] [📋] [🗺️] [📄] [👤]  │
│ Dash  Kaji  Peta  Lap  Profil│
└───────────────────────────┘
```

**Fitur:**
- Compact header dengan logo, theme toggle, notifikasi, hamburger menu
- Bottom navigation bar dengan glassmorphism
- Active tab indicator pill (animasi)
- Haptic feedback pada navigasi (`navigator.vibrate()`)
- Safe area padding untuk notch devices (iOS)
- Padding bottom 24px untuk menghindari overlap dengan bottom nav

### Bottom Navigation Items (TRC Mobile)

| Icon | Label | Path |
|---|---|---|
| 📊 | Dashboard | `/` |
| 📋 | Kaji Cepat | `/field-assessment` |
| 🗺️ | Peta | `/collaborative-map` |
| 📄 | Laporan | `/generate-reports` |
| 👤 | Profil | `/profile` |

---

## 8. Daftar Halaman & Fitur

### 🔐 LoginPage (`/login`)
- Form login email + password
- Validasi input
- Call `POST /api/v1/auth/login`
- Simpan token & user ke localStorage
- Redirect ke Dashboard setelah sukses

### 📊 DashboardPage (`/`)
- **Statistik utama**: Total bencana, korban, pengungsi, kerusakan rumah
- **Grafik tren bulanan**: Bar chart 12 bulan (Recharts)
- **Distribusi jenis bencana**: Pie chart dengan color palette
- **Kejadian terbaru**: Tabel 5 kejadian terakhir
- **Peta titik bencana**: Mini map dengan markers
- **Status distribusi**: DRAFT / SENT / FINAL
- **Verification rate**: Persentase data terverifikasi lapangan
- Data diambil dari `GET /api/v1/dashboard`

### ⚡ KajiCepatPage (`/kaji-cepat`) — Pusdalops/Admin
- List semua rapid assessment
- Filter berdasarkan status (DRAFT, SENT, FINAL)
- Aksi: Buat baru, Edit, Hapus
- Preview dan kirim pesan WhatsApp
- Log pengiriman WA

### ⚡ KajiCepatFormPage (`/kaji-cepat/new`, `/kaji-cepat/:id/edit`)
- Form multi-section untuk kaji cepat awal
- Data per desa: terdampak, pengungsi, korban jiwa
- Langkah penanganan (dynamic list)
- Kebutuhan mendesak (dari master data need_items)
- Situasi akhir, sumber informasi
- Penerima laporan WA
- Upload foto dokumentasi
- Pilih jenis bencana & wilayah (cascading dropdown EMSIFA)

### 🚗 TeamAssignmentPage (`/team-assignment`)
- CRUD penugasan tim TRC
- Form: nama tim, ketua, anggota (dynamic), kendaraan, waktu
- Data surat tugas (nomor, tanggal)
- Download Surat Tugas DOCX/PDF

### 📋 FieldAssessmentPage (`/field-assessment`)
- Form kaji cepat lapangan (Juklak format)
- Sections: Pendahuluan, penduduk terdampak, korban, pengungsi, kerusakan, upaya darurat
- Kelompok rentan & kelompok khusus
- Sektor kebutuhan (12 sektor Juklak BNPB)
- Tim TRC (anggota dari surat tugas)
- Simpan sebagai JSONB `detail` column

### 📈 ImpactPage (`/impact`)
- Rekap dampak bencana dari semua assessment
- Tabel: korban (meninggal, hilang, luka), kerusakan rumah, pengungsi
- Aggregated data per assessment

### 🆘 EmergencyNeedsPage (`/emergency-needs`)
- Input kebutuhan darurat per assessment
- Pilih dari master data need_items (dinamis)
- Upsert — update jika sudah ada

### 🗺️ CollaborativeMapPage (`/collaborative-map`)
- Peta interaktif Leaflet
- Drawing tools: marker, polygon, polyline
- Upload foto per objek peta
- Kategori objek: lokasi bencana, pengungsian, shelter, dll
- Data disimpan sebagai JSONB geometry

### 🗺️ DisasterMapPage (`/disaster-map`)
- Peta bencana read-only
- Markers dari data rapid assessment

### 🌐 PublicMapPage (`/public-map/:assessmentId/:slug?`)
- Peta publik (tanpa login)
- Bisa diakses via link yang dibagikan
- Menampilkan objek peta per assessment

### 📄 GenerateReportsPage (`/generate-reports`)
- List kaji cepat lapangan yang bisa di-download
- Download DOCX (format Juklak resmi)
- Download PDF (LibreOffice conversion / Puppeteer fallback)
- Download Surat Tugas DOCX/PDF

### 👥 UsersPage (`/users`) — ADMIN only
- CRUD pengguna sistem
- Set role (ADMIN, PUSDALOPS, TRC, PIMPINAN)
- Soft delete (nonaktifkan user)

### 📦 MasterDataPage (`/master-data`) — ADMIN only
- Tab-based CRUD untuk:
  - Jenis Bencana
  - Instansi/Lembaga
  - Wilayah
  - Item Kebutuhan (nama + satuan)
- Sinkronisasi data wilayah dari EMSIFA API

### 👤 ProfilePage (`/profile`)
- Edit nama, telepon, instansi
- Ganti password (current + new password)

### 📰 FeedsPage (`/feeds`) — ADMIN only
- Moderasi feed/posting
- Hapus konten yang tidak layak

### 📦 ResourceTrackingPage (`/resource-tracking`) — ADMIN only
- Tracking logistik: Needs vs Fulfilled
- Visual progress bar per item kebutuhan

### 🏆 GamificationPage (`/gamification`) — TRC only
- Jam terbang relawan
- Reputation system (placeholder)

### 🪪 DigitalCVPage (`/digital-cv`) — TRC only
- CV digital relawan
- Riwayat penugasan & assessment

---

## 9. State Management

### Authentication State — `AuthContext`

```typescript
interface AuthContextType {
  user: User | null;           // Data user yang login
  token: string | null;        // JWT token
  isAuthenticated: boolean;    // Apakah sudah login
  login: (email, password) => Promise<void>;
  logout: () => void;
  hasAccess: (path) => boolean; // Cek akses route
}
```

- **Persisted**: Token & user data disimpan di `localStorage`
  - Key: `bpbd_token`, `bpbd_user`
- **Auto-logout**: Jika backend return 401, auto-clear token & redirect ke `/login`

### Theme State — `ThemeContext`

```typescript
interface ThemeContextType {
  theme: "light" | "dark";      // Tema aktif (resolved)
  preference: Theme;            // Preferensi user (bisa "system")
  setPreference: (t) => void;
  toggle: () => void;           // Quick toggle light ↔ dark
}
```

- **Persisted**: `localStorage` key `bpbd_theme`
- **System mode**: Mengikuti `prefers-color-scheme` jika preference = "system"
- **FOUC Prevention**: Script di `index.html` apply theme sebelum React render

### Server State — TanStack React Query

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,     // Cache 2 menit
      retry: 1,                       // 1x retry on fail
      refetchOnWindowFocus: false,    // Tidak auto-refetch
    },
  },
});
```

---

## 10. API Service Layer

File `src/services/apiService.ts` adalah **centralized API wrapper** yang menangani:

### Core Features
1. **Auto-attach JWT token** dari localStorage ke header `Authorization: Bearer <token>`
2. **Proxy via Vite** — semua request ke `/api/v1/*` di-proxy ke `http://localhost:5000`
3. **Auto-logout** — jika response 401, clear token & redirect ke `/login`
4. **Error handling** — throw Error dengan `message`, `status`, dan `errors` dari backend
5. **FormData support** — skip `Content-Type: application/json` untuk file upload
6. **Offline queue** — queue POST/PUT requests ke IndexedDB saat offline

### API Functions yang Tersedia

| Modul | Functions |
|---|---|
| **Auth** | `login`, `getProfile`, `updateProfile`, `changePassword` |
| **Users** | `getUsers`, `getUserById`, `createUser`, `updateUser`, `deleteUser` |
| **Disaster Reports** | `getDisasterReports`, `getDisasterReportById`, `createDisasterReport`, `verifyReport` |
| **Master Data** | `getMasterData`, `getDisasterTypes`, `createDisasterType`, `updateDisasterType`, `deleteDisasterType`, `getAgencies`, `createAgency`, `updateAgency`, `deleteAgency`, `getRegions`, `createRegion`, `updateRegion`, `deleteRegion`, `getNeedItems`, `createNeedItem`, `updateNeedItem`, `deleteNeedItem` |
| **Wilayah** | `getEmsifaProvinces`, `getEmsifaRegencies`, `getEmsifaDistricts`, `getEmsifaVillages`, `syncAllEmsifaSulteng` |
| **Team Assignments** | `getTeamAssignments`, `getTeamAssignmentById`, `createTeamAssignment`, `updateTeamAssignment`, `deleteTeamAssignment` |
| **Rapid Assessment** | `getRapidAssessments`, `getRapidAssessmentsDropdown`, `getRapidAssessmentById`, `createRapidAssessment`, `updateRapidAssessment`, `deleteRapidAssessment`, `updateRapidAssessmentStatus`, `uploadAssessmentPhotos` |
| **WhatsApp** | `generateWAMessage`, `sendWA`, `resendWA`, `getWALogs` |
| **Field Assessment** | `getAssessments`, `submitFieldAssessment`, `getJuklakAssessments`, `getJuklakAssessment`, `createJuklakAssessment`, `updateJuklakAssessment`, `deleteJuklakAssessment` |
| **Impact & Needs** | `getDisasterImpact`, `getEmergencyNeeds`, `submitEmergencyNeeds` |
| **Map** | `getDisasterMapData`, `getMapObjects`, `getMapObjectsByAssessment`, `getPublicMapObjects`, `createMapObject`, `updateMapObject`, `deleteMapObject`, `uploadMapPhotos` |
| **Dashboard** | `getDashboardData` |
| **Reports** | `downloadReportDocx`, `downloadReportPdf` |
| **Surat Tugas** | `downloadSuratTugasDocx`, `downloadSuratTugasPdf` |

### Offline Request Flow

```
User submit form saat OFFLINE
  │
  ├── Cek navigator.onLine === false ?
  │     ├── Ya: Simpan request ke IndexedDB (pending_sync store)
  │     │   ├── Register background sync via Service Worker
  │     │   └── Return { success: true, _offline: true, _pendingCount: N }
  │     │
  │     └── Tidak: Kirim request normal via fetch()
  │
  └── Saat kembali ONLINE:
      ├── Event "online" → ServiceWorker.postMessage("TRIGGER_SYNC")
      ├── SW replay semua pending requests dari IndexedDB
      ├── SW report: { type: "SYNC_COMPLETE", syncedCount, failedCount }
      └── UI update NetworkStatusBar
```

---

## 11. Component Library

### Custom Components

| Component | File | Fungsi |
|---|---|---|
| **AppSidebar** | `AppSidebar.tsx` | Navigasi sidebar admin (collapsible, logo, menu items berdasarkan role) |
| **CommandPalette** | `CommandPalette.tsx` | Dialog pencarian + quick navigation (Cmd+K), menampilkan menu sesuai role |
| **DisasterMap** | `DisasterMap.tsx` | Wrapper Leaflet map untuk embed di halaman |
| **NavLink** | `NavLink.tsx` | Link navigasi dengan active state styling |
| **NetworkStatusBar** | `NetworkStatusBar.tsx` | Banner offline warning + jumlah request pending + status sync |
| **SkeletonLoaders** | `SkeletonLoaders.tsx` | 6+ varian skeleton loading (DashboardSkeleton, TableSkeleton, ChartSkeleton, dll) |
| **StatCard** | `StatCard.tsx` | Card statistik dashboard (icon, label, value) |
| **StatusBadge** | `StatusBadge.tsx` | Badge status berwarna (VERIFIED/green, PENDING/yellow, DRAFT/gray, dll) |

### shadcn/ui Components (45+ Komponen)

Semua komponen shadcn/ui tersedia di `src/components/ui/`:

**Layout**: Card, Separator, Resizable, Scroll Area, Sheet, Sidebar
**Form**: Button, Input, Textarea, Select, Checkbox, Radio Group, Switch, Slider, Calendar, Form, Label
**Overlay**: Dialog, Alert Dialog, Drawer, Popover, Hover Card, Tooltip, Context Menu, Dropdown Menu
**Navigation**: Navigation Menu, Menubar, Tabs, Breadcrumb, Pagination, Command
**Data Display**: Table, Badge, Avatar, Progress, Skeleton, Carousel, Chart, Accordion, Collapsible
**Feedback**: Toast, Toaster, Sonner, Toggle, Toggle Group

---

## 12. Custom Hooks

| Hook | File | Fungsi |
|---|---|---|
| `useCommandPalette` | `useCommandPalette.ts` | State & keyboard shortcut (Cmd+K) untuk command palette |
| `useDoubleSubmitGuard` | `useDoubleSubmitGuard.ts` | Prevent double-click pada form submission. Wraps async function dengan `isSubmitting` state |
| `useHapticFeedback` | `useHapticFeedback.ts` | Web Haptics API — preset pattern: `light`, `medium`, `success`, `error`, `warning` |
| `useNetworkStatus` | `useNetworkStatus.ts` | Monitor online/offline, pending request count, sync status, last sync result |
| `useMobile` | `use-mobile.tsx` | Detect viewport mobile (`< 768px`) |
| `useToast` | `use-toast.ts` | Toast notification state management |

---

## 13. PWA & Offline Support

### Progressive Web App (PWA)

Frontend sepenuhnya PWA-ready:

- **manifest.json**: App name, icons, display mode (`standalone`), orientation
- **Service Worker** (`sw.js`): Registrasi di `main.tsx`, handles:
  - Cache API responses
  - Queue offline writes (IndexedDB)
  - Background sync saat kembali online
  - Auto-activate new versions (SKIP_WAITING)
- **App Icons**: 192x192 dan 512x512 PNG
- **Apple Meta Tags**: `apple-touch-icon`, `apple-mobile-web-app-capable`

### IndexedDB Offline Storage (`offlineDB.ts`)

**Database**: `bpbd_offline_db` (version 1)

| Store | Key | Fungsi |
|---|---|---|
| `pending_sync` | auto-increment ID | Queue POST/PUT requests saat offline |
| `api_cache` | URL string | Cache GET responses untuk offline reads |

**Operations yang tersedia:**
- `saveOfflineRequest(url, method, body, headers)` — simpan request ke queue
- `getAllPendingRequests()` — ambil semua request pending (sorted by timestamp)
- `markAsSynced(id)` — hapus request yang berhasil sync
- `markAsFailed(id, error)` — tandai request gagal
- `getPendingCount()` — jumlah request yang belum sync
- `cacheApiResponse(url, data)` — cache GET response
- `getCachedResponse(url)` — ambil cached response
- `clearApiCache()` — bersihkan semua cache

---

## 14. Theming (Dark/Light Mode)

### Mekanisme Theme

```
┌────────────────────┐
│   ThemeContext      │
│                    │
│   preference:      │    ┌─────────────────────┐
│   "light"|"dark"|  │───▶│ Apply class "dark"   │
│   "system"         │    │ to <html> element    │
│                    │    └─────────────────────┘
│   Persisted:       │              │
│   localStorage     │    ┌─────────▼───────────┐
│   key: bpbd_theme  │    │ CSS Variables (HSL)  │
│                    │    │ in index.css         │
└────────────────────┘    │                     │
                          │ --background        │
                          │ --foreground        │
                          │ --primary           │
                          │ --card              │
                          │ --sidebar-*         │
                          │ --status-*          │
                          └─────────────────────┘
                                    │
                          ┌─────────▼───────────┐
                          │ Tailwind reads from  │
                          │ hsl(var(--xxx))      │
                          │ in tailwind.config   │
                          └─────────────────────┘
```

### FOUC Prevention
Script inline di `index.html` membaca `localStorage(bpbd_theme)` **sebelum** React render, untuk menghindari flash of unstyled content:
```javascript
var t = localStorage.getItem('bpbd_theme');
var dark = t === 'dark' || (t !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
if (dark) document.documentElement.classList.add('dark');
```

---

## 15. Keamanan Frontend

### XSS Prevention
- **sanitize.ts** menyediakan:
  - `sanitizeHTML(input)` — strip `<script>`, event handlers, `javascript:`, `data:`, iframe, dll
  - `sanitizeInput(input)` — escape HTML entities (`<`, `>`, `&`, `"`, `'`)
  - `sanitizeNumber(input, min, max)` — validasi & clamp angka
  - `sanitizeEmail(input)` — validasi format email

### Token Management
- JWT token disimpan di `localStorage` (key: `bpbd_token`)
- Auto-attached ke setiap API request via `Authorization: Bearer` header
- Auto-clear + redirect ke login jika backend return 401

### Double Submit Prevention
- Hook `useDoubleSubmitGuard` disable button saat form sedang disubmit
- Mencegah duplikasi data dari double-click

### CORS
- Vite dev proxy menghindari masalah CORS saat development
- Production: backend sudah mengatur CORS origin

---

## 16. Cara Menjalankan

### Prasyarat
- Node.js (LTS)
- Backend sudah berjalan di `http://localhost:5000`

### Instalasi
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev            # Start Vite dev server di port 5173
```
Akses di browser: `http://localhost:5173`

### Production Build
```bash
npm run build          # Build ke folder dist/
npm run preview        # Preview production build
```

### Testing
```bash
npm test               # Run unit tests (Vitest)
npm run test:watch     # Watch mode
```

### Linting
```bash
npm run lint           # ESLint check
```

### NPM Scripts

| Script | Fungsi |
|---|---|
| `npm run dev` | Start Vite dev server (HMR, proxy) |
| `npm run build` | Production build (optimized) |
| `npm run build:dev` | Development build |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint dengan ESLint |
| `npm test` | Run unit tests |
| `npm run test:watch` | Tests in watch mode |

---

## 📌 Catatan Penting

1. **Dual-View Architecture**: TRC mendapat layout mobile-first (Bottom Nav), sementara ADMIN/PUSDALOPS/PIMPINAN mendapat layout desktop (Sidebar). Ini ditentukan otomatis oleh `getLayoutForRole()` di RBAC config.

2. **Code Splitting**: Semua halaman kecuali Login, Dashboard, Forbidden, dan NotFound di-lazy load menggunakan `React.lazy()` + `Suspense`. Ini mempercepat initial load time.

3. **Offline-First Architecture**: Saat TRC di daerah bencana tanpa sinyal, form submission di-queue ke IndexedDB dan otomatis di-sync saat kembali online via Service Worker.

4. **Vite Proxy**: Semua request ke `/api/v1/*` dan `/uploads/*` di-proxy ke backend `localhost:5000`. Ini menghindari CORS issue saat development.

5. **shadcn/ui**: Komponen UI bukan library NPM biasa — file-file nya di-copy langsung ke `src/components/ui/` dan bisa di-customize sepenuhnya.

6. **TanStack React Query**: Digunakan untuk server state management — handles caching (2 menit), retry, loading/error states. Menggantikan manual `useEffect` + `useState` untuk data fetching.

7. **Command Palette**: Admin bisa menekan `Cmd+K` (Mac) atau `Ctrl+K` (Windows) untuk membuka quick search & navigation dialog, mirip VS Code.

8. **Haptic Feedback**: Pada mobile TRC layout, navigasi dan aksi penting memanfaatkan `navigator.vibrate()` untuk memberikan feedback fisik seperti native app.

---

> 📝 *Dokumentasi ini dibuat otomatis berdasarkan analisis kode sumber frontend KajiCepat.*
