# 📘 BACKEND DOCUMENTATION — KajiCepat (Kaji Cepat Bencana BPBD)

> **Disaster Rapid Assessment System — Backend API**
> Dokumentasi lengkap backend untuk sistem Kaji Cepat Bencana BPBD Provinsi Sulawesi Tengah.
> Terakhir diperbarui: 7 April 2026

---

## 📋 Daftar Isi

1. [Gambaran Umum Sistem](#1-gambaran-umum-sistem)
2. [Teknologi yang Digunakan](#2-teknologi-yang-digunakan)
3. [Arsitektur Aplikasi](#3-arsitektur-aplikasi)
4. [Struktur Folder Lengkap](#4-struktur-folder-lengkap)
5. [Konfigurasi Environment](#5-konfigurasi-environment)
6. [Database & Schema](#6-database--schema)
7. [Sistem Migrasi & Seeding](#7-sistem-migrasi--seeding)
8. [Alur Aplikasi (Application Flow)](#8-alur-aplikasi-application-flow)
9. [Daftar Modul & Fitur](#9-daftar-modul--fitur)
10. [API Endpoints Lengkap](#10-api-endpoints-lengkap)
11. [Sistem Keamanan](#11-sistem-keamanan)
12. [Sistem File Upload](#12-sistem-file-upload)
13. [Integrasi WhatsApp (Fonnte)](#13-integrasi-whatsapp-fonnte)
14. [Sistem Generator Dokumen](#14-sistem-generator-dokumen)
15. [Cara Menjalankan](#15-cara-menjalankan)

---

## 1. Gambaran Umum Sistem

**KajiCepat** adalah sistem backend REST API yang mendukung proses penanganan bencana oleh BPBD (Badan Penanggulangan Bencana Daerah) Provinsi Sulawesi Tengah. Sistem ini menangani seluruh siklus hidup kejadian bencana:

```
Laporan Masuk → Verifikasi → Penugasan Tim TRC → Kaji Cepat Awal → Kaji Cepat Lapangan → Laporan Situasi → Distribusi via WhatsApp
```

Backend ini **hanya menyediakan REST API** dan dikonsumsi oleh frontend React.js.

---

## 2. Teknologi yang Digunakan

### Runtime & Framework
| Teknologi | Versi | Fungsi |
|---|---|---|
| **Node.js** | — | Runtime JavaScript server-side |
| **Express.js** | ^4.21.2 | Web framework utama |

### Database
| Teknologi | Fungsi |
|---|---|
| **PostgreSQL** | Database relasional utama |
| **PostGIS** | Extension PostgreSQL untuk query geospasial (lokasi bencana) |
| **pg** (^8.13.3) | PostgreSQL client untuk Node.js |

### Keamanan
| Library | Fungsi |
|---|---|
| **jsonwebtoken** (^9.0.2) | Autentikasi JWT (JSON Web Token) |
| **bcryptjs** (^2.4.3) | Hashing password dengan salt |
| **helmet** (^8.0.0) | Security headers HTTP |
| **express-rate-limit** (^7.5.0) | Rate limiting (100 request/15 menit) |
| **express-validator** (^7.2.1) | Validasi input request |
| **cors** (^2.8.5) | Cross-Origin Resource Sharing |

### File Upload
| Library | Fungsi |
|---|---|
| **multer** (^1.4.5-lts.1) | Middleware upload file (foto bencana, foto kaji cepat) |

### Generator Dokumen
| Library | Fungsi |
|---|---|
| **docxtemplater** (^3.68.3) | Generate dokumen DOCX dari template Word |
| **pizzip** (^3.2.0) | Manipulasi file ZIP (dibutuhkan docxtemplater) |
| **puppeteer** (^24.40.0) | Generate PDF via headless browser (fallback) |
| **ejs** (^5.0.1) | Template engine HTML untuk fallback PDF |
| **html-to-docx** (^1.8.0) | Konversi HTML ke DOCX |

### Logging & Monitoring
| Library | Fungsi |
|---|---|
| **winston** (^3.17.0) | Sistem logging terstruktur (file + console) |
| **morgan** (^1.10.0) | HTTP request logger |

### Integrasi Eksternal
| Library | Fungsi |
|---|---|
| **axios** (^1.14.0) | HTTP client untuk API eksternal |
| **Fonnte API** | Integrasi pengiriman WhatsApp otomatis |

### Development
| Library | Fungsi |
|---|---|
| **nodemon** (^3.1.9) | Auto-restart server saat development |
| **dotenv** (^16.4.7) | Load environment variables dari `.env` |

---

## 3. Arsitektur Aplikasi

Backend menggunakan **Layered Architecture** dengan pemisahan tanggung jawab yang jelas:

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Frontend React)              │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP Request
┌─────────────────────▼───────────────────────────────────┐
│                   MIDDLEWARE LAYER                        │
│  ┌─────────┐ ┌──────┐ ┌────────┐ ┌──────────┐ ┌──────┐ │
│  │ Helmet  │ │ CORS │ │ Morgan │ │RateLimit │ │ JWT  │ │
│  └─────────┘ └──────┘ └────────┘ └──────────┘ └──────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                    ROUTES LAYER                           │
│         Menentukan endpoint dan validasi input            │
│         (+ Validator menggunakan express-validator)       │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  CONTROLLER LAYER                         │
│          Thin controller — menerima request,              │
│          memanggil service, mengirim response              │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                   SERVICE LAYER                           │
│         Business logic dan transformasi data               │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                 REPOSITORY LAYER                          │
│         Query database (parameterized query)              │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                   PostgreSQL + PostGIS                     │
└─────────────────────────────────────────────────────────┘
```

### Alur Data Request
```
Request → Middleware (Auth, Validator) → Controller → Service → Repository → Database
Response ← Controller ← Service ← Repository ← Database
```

---

## 4. Struktur Folder Lengkap

```
backend/
├── .env                          # Environment variables (tidak di-commit)
├── .env.example                  # Template environment variables
├── .gitignore                    # Ignore node_modules, .env, logs, uploads
├── package.json                  # Dependencies dan npm scripts
├── package-lock.json             # Lock file dependencies
├── test_auth.sh                  # Script test otentikasi (curl)
│
├── logs/                         # Log files (auto-generated oleh Winston)
│   ├── error.log                 # Log khusus error
│   └── combined.log              # Log semua level
│
├── templete/                     # Template dokumen Word resmi
│   ├── format_w.docx             # Template Laporan Kaji Cepat (Juklak)
│   ├── format_st.docx            # Template Surat Tugas (original)
│   └── format_st_template.docx   # Template Surat Tugas (dengan placeholder)
│
├── uploads/                      # Direktori file upload (auto-generated)
│   ├── map-photos/               # Foto objek peta bencana
│   ├── assessments/              # Foto kaji cepat (rapid assessment)
│   ├── reports/                  # Hasil generate laporan DOCX/PDF
│   └── surat-tugas/              # Hasil generate Surat Tugas DOCX/PDF
│
└── src/                          # Source code utama
    ├── server.js                 # Entry point — start server, graceful shutdown
    ├── app.js                    # Express app setup — middleware, routes, error handling
    │
    ├── config/                   # Konfigurasi aplikasi
    │   ├── env.js                # Load & validasi environment variables
    │   └── database.js           # PostgreSQL connection pool & query helper
    │
    ├── middlewares/              # Middleware Express
    │   ├── authMiddleware.js     # JWT authentication & role authorization
    │   ├── errorMiddleware.js    # Centralized error handler & 404 handler
    │   └── uploadMiddleware.js   # Multer config untuk upload foto (map + assessment)
    │
    ├── utils/                    # Utility functions
    │   ├── logger.js             # Winston logger (console + file transport)
    │   └── responseFormatter.js  # Standardized JSON response (success/error/paginated)
    │
    ├── validators/               # (Kosong — validator di-embed per modul)
    │
    ├── database/                 # Database management
    │   ├── migrate.js            # Migration CLI runner
    │   ├── migrationRunner.js    # Migration execution engine (tracks applied migrations)
    │   ├── runSeed.js            # Seed CLI runner
    │   ├── seed.js               # Seed data (roles, disaster types, admin user)
    │   └── migrations/           # Migration files (urut berdasarkan nomor)
    │       ├── 001_create_tables.js                     # Tabel utama + PostGIS
    │       ├── 002_add_is_active_to_users.js            # Kolom is_active pada users
    │       ├── 003_create_master_data_tables.js         # Tabel agencies & regions
    │       ├── 004_create_map_objects.js                # Tabel pemetaan objek bencana
    │       ├── 005_update_map_objects_photos.js         # Update foto map objects
    │       ├── 006_create_need_items_and_team_members.js # Kebutuhan & anggota tim
    │       ├── 007_create_rapid_assessment_tables.js    # Tabel Kaji Cepat Awal (10+ tabel)
    │       ├── 008_migrate_to_rapid_assessments.js      # Migrasi data ke rapid
    │       ├── 009_field_assessment_juklak.js           # Tabel Kaji Cepat Lapangan Juklak
    │       ├── 010_add_surat_tugas_columns.js           # Kolom surat tugas
    │       ├── 011_add_update_type_to_rapid_assessments.js # Tipe update assessment
    │       ├── 012_create_emsifa_regions.js             # Tabel wilayah Indonesia (EMSIFA)
    │       └── 013_add_photos_to_rapid_assessments.js   # Foto rapid assessment
    │
    └── modules/                  # Modul-modul fitur (modular architecture)
        ├── auth/                 # 🔐 Autentikasi
        │   ├── authController.js
        │   ├── authService.js
        │   ├── authRepository.js
        │   ├── authRoutes.js
        │   └── authValidator.js
        │
        ├── users/                # 👤 Manajemen User
        │   ├── userController.js
        │   ├── userService.js
        │   ├── userRepository.js
        │   ├── userRoutes.js
        │   └── userValidator.js
        │
        ├── masterData/           # 📦 Master Data
        │   ├── masterDataController.js
        │   ├── masterDataService.js
        │   ├── masterDataRepository.js
        │   ├── masterDataRoutes.js
        │   └── masterDataValidator.js
        │
        ├── disasters/            # 🌊 Laporan Bencana
        │   ├── disasterController.js
        │   ├── disasterService.js
        │   ├── disasterRepository.js
        │   ├── disasterRoutes.js
        │   └── disasterValidator.js
        │
        ├── teamAssignments/      # 🚗 Penugasan Tim TRC
        │   ├── teamAssignmentController.js
        │   ├── teamAssignmentService.js
        │   ├── teamAssignmentRepository.js
        │   ├── teamAssignmentRoutes.js
        │   └── teamAssignmentValidator.js
        │
        ├── rapidAssessment/      # ⚡ Kaji Cepat Awal (Pusdalops)
        │   ├── rapidAssessmentController.js
        │   ├── rapidAssessmentService.js
        │   ├── rapidAssessmentRepository.js
        │   ├── rapidAssessmentRoutes.js
        │   ├── rapidAssessmentValidator.js
        │   ├── fonnteService.js          # Integrasi WhatsApp Fonnte
        │   └── waMessageGenerator.js     # Generator pesan WA resmi
        │
        ├── fieldAssessments/     # 📋 Kaji Cepat Lapangan (TRC)
        │   ├── fieldAssessmentController.js
        │   ├── fieldAssessmentService.js
        │   ├── fieldAssessmentRepository.js
        │   ├── fieldAssessmentRoutes.js
        │   └── fieldAssessmentValidator.js
        │
        ├── emergencyNeeds/       # 🆘 Kebutuhan Darurat
        │   ├── emergencyNeedsController.js
        │   ├── emergencyNeedsService.js
        │   ├── emergencyNeedsRepository.js
        │   ├── emergencyNeedsRoutes.js
        │   └── emergencyNeedsValidator.js
        │
        ├── mapObjects/           # 🗺️ Pemetaan Objek Bencana
        │   ├── mapObjectController.js
        │   ├── mapObjectService.js
        │   ├── mapObjectRepository.js
        │   ├── mapObjectRoutes.js
        │   └── mapObjectValidator.js
        │
        ├── dashboard/            # 📊 Dashboard Command Center
        │   ├── dashboardController.js
        │   ├── dashboardService.js
        │   └── dashboardRoutes.js
        │
        ├── reportGenerator/      # 📄 Generator Laporan DOCX/PDF
        │   ├── reportGeneratorController.js
        │   ├── reportGeneratorService.js
        │   ├── reportGeneratorRoutes.js
        │   └── templates/
        │       ├── juklak_template.docx
        │       ├── juklak_template.ejs       # Fallback template HTML untuk PDF
        │       └── juklak_template_docx.ejs
        │
        ├── suratTugas/           # 📜 Generator Surat Tugas
        │   ├── suratTugasController.js
        │   ├── suratTugasService.js
        │   └── suratTugasRoutes.js
        │
        └── wilayah/              # 🌍 Data Wilayah Indonesia (EMSIFA)
            ├── wilayahController.js
            ├── wilayahService.js
            ├── wilayahRepository.js
            └── wilayahRoutes.js
```

---

## 5. Konfigurasi Environment

File `.env` mengatur seluruh konfigurasi. Berikut variabel yang digunakan:

```env
# Server
PORT=5000                         # Port Express server
NODE_ENV=development              # development | production

# Database PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bpbd_disaster
DB_USER=postgres
DB_PASSWORD=password

# JWT Authentication
JWT_SECRET=supersecret            # Secret key untuk sign token
JWT_EXPIRE=1d                     # Token berlaku 1 hari

# File Upload
UPLOAD_MAX_SIZE=5242880           # Maksimal 5MB per file
UPLOAD_DIR=uploads

# CORS
CORS_ORIGIN=http://localhost:5173 # URL frontend React (Vite)

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000       # Window 15 menit
RATE_LIMIT_MAX=100                # Maks 100 request per window

# Fonnte WhatsApp API (Opsional)
FONNTE_API_KEY=                   # API key Fonnte untuk kirim WA
FONNTE_TARGET_NUMBERS=            # Nomor tujuan default (comma-separated)
```

---

## 6. Database & Schema

### Entity Relationship Overview

```
┌──────────────┐     ┌────────────────┐     ┌──────────────────┐
│    users     │     │ disaster_types │     │ disaster_reports  │
│──────────────│     │────────────────│     │──────────────────│
│ id           │     │ id             │────▶│ disaster_type_id │
│ name         │     │ name           │     │ report_code      │
│ email        │     └────────────────┘     │ status           │
│ password     │                            │ location (GEOM)  │
│ role         │                            └────────┬─────────┘
│ phone        │                                     │
│ instansi     │         ┌────────────────┐          │
└──────┬───────┘         │ verification   │          │
       │                 │ _logs          │◀─────────┤
       │                 └────────────────┘          │
       │                                             │
       │                 ┌────────────────┐          │
       │                 │ team_          │◀─────────┤
       │                 │ assignments    │          │
       │                 │ ├─team_members │          │
       │                 └────────────────┘          │
       │                                             │
       │    ┌───────────────────────────────┐         │
       │    │ rapid_assessments             │◀────────┘
       │    │ ├─assessment_villages         │
       │    │ ├─assessment_affected         │
       │    │ ├─assessment_refugees         │
       │    │ ├─assessment_casualties       │
       │    │ ├─assessment_steps            │
       │    │ ├─assessment_needs            │
       │    │ ├─assessment_situations       │
       │    │ ├─assessment_sources          │
       │    │ ├─assessment_recipients       │
       │    │ └─wa_send_logs               │
       │    └───────────────────────────────┘
       │
       │    ┌────────────────────────────────┐
       └───▶│ field_assessments (Juklak)     │
            │ ├─victims                      │
            │ ├─house_damage                 │
            │ ├─facility_damage              │
            │ ├─infrastructure_damage        │
            │ └─emergency_needs              │
            │   └─emergency_need_details     │
            └────────────────────────────────┘

┌────────────────┐   ┌────────────────┐
│ map_objects    │   │ need_items     │  (Master Data)
│ (peta bencana) │   │ agencies       │
└────────────────┘   │ regions        │
                     │ provinces      │
                     │ regencies      │
                     │ districts      │
                     │ villages       │
                     └────────────────┘
```

### Tabel Utama (30+ tabel)

| Tabel | Fungsi |
|---|---|
| `users` | Data pengguna sistem (ADMIN/PUSDALOPS/TRC/PIMPINAN) |
| `roles` | Master data role |
| `disaster_types` | Jenis bencana (Banjir, Gempa, Longsor, dll) |
| `disaster_reports` | Laporan kejadian bencana awal |
| `verification_logs` | Log verifikasi laporan |
| `team_assignments` | Penugasan tim TRC ke lokasi |
| `team_members` | Anggota tim TRC per penugasan |
| `rapid_assessments` | Kaji Cepat Awal (dibuat oleh Pusdalops) |
| `assessment_villages` | Desa terdampak per kaji cepat |
| `assessment_affected` | Data penduduk terdampak per desa |
| `assessment_refugees` | Data pengungsi per desa |
| `assessment_casualties` | Data korban jiwa per desa |
| `assessment_steps` | Langkah penanganan yang dilakukan |
| `assessment_needs` | Kebutuhan mendesak |
| `assessment_situations` | Situasi akhir |
| `assessment_sources` | Sumber informasi |
| `assessment_recipients` | Penerima laporan WA |
| `wa_send_logs` | Log pengiriman WhatsApp |
| `field_assessments` | Kaji Cepat Lapangan (Juklak, oleh TRC) |
| `victims` | Korban jiwa per field assessment |
| `house_damage` | Kerusakan rumah |
| `facility_damage` | Kerusakan fasilitas |
| `infrastructure_damage` | Kerusakan infrastruktur |
| `emergency_needs` | Kebutuhan darurat |
| `emergency_need_details` | Detail item kebutuhan darurat |
| `need_items` | Master data item kebutuhan |
| `map_objects` | Objek pemetaan bencana (marker/polygon/polyline) |
| `agencies` | Master data instansi |
| `regions` | Master data wilayah internal |
| `provinces` | Provinsi Indonesia (EMSIFA) |
| `regencies` | Kabupaten/Kota (EMSIFA) |
| `districts` | Kecamatan (EMSIFA) |
| `villages` | Kelurahan/Desa (EMSIFA) |

### PostGIS
- Kolom `location` pada `disaster_reports` dan `field_assessments` menggunakan tipe `GEOMETRY(Point, 4326)`
- Index GIST digunakan untuk query spasial cepat
- Memungkinkan pencarian bencana berdasarkan radius, proximity, dll

---

## 7. Sistem Migrasi & Seeding

### Migrasi
```bash
npm run migrate          # Jalankan semua migration yang belum dijalankan
```
- Migration runner melacak migration yang sudah dijalankan (dalam tabel `migrations`)
- Setiap file migration memiliki method `up()` yang dijalankan dalam transaksi
- Rollback otomatis jika migration gagal

### Seeding
```bash
npm run seed             # Isi data awal (roles, disaster types, admin user)
```
Data seed meliputi:
- **Roles**: ADMIN, PUSDALOPS, TRC, PIMPINAN
- **Disaster Types**: 12 jenis bencana (Banjir, Gempa Bumi, Tanah Longsor, dll)
- **Admin User**: `admin@bpbd.go.id` / `admin123`
- **Need Items**: 12 item kebutuhan darurat (Makanan, Air Bersih, Tenda, dll)

### Setup Awal
```bash
npm run db:setup         # migrate + seed (satu perintah)
```

---

## 8. Alur Aplikasi (Application Flow)

### Alur Utama Penanganan Bencana

```
                    ┌─────────────────────────┐
                    │   1. LAPORAN MASUK       │
                    │   (Pusdalops / Admin)    │
                    │   POST disaster-reports  │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │   2. VERIFIKASI          │
                    │   (Pusdalops / Admin)    │
                    │   POST .../verify        │
                    │   Status → VERIFIED      │
                    └───────────┬─────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                  │
   ┌──────────▼──────────┐ ┌───▼───────────┐ ┌────▼─────────────┐
   │ 3. KAJI CEPAT AWAL  │ │ 4. PENUGASAN  │ │ 5. PEMETAAN      │
   │ (Pusdalops)         │ │ TIM TRC       │ │ MAP OBJECTS      │
   │ POST rapid-         │ │ POST team-    │ │ POST map-objects │
   │ assessments         │ │ assignments   │ │ (marker/polygon) │
   └──────────┬──────────┘ └───┬───────────┘ └──────────────────┘
              │                │
              │     ┌──────────▼──────────┐
              │     │ 5a. SURAT TUGAS     │
              │     │ GET surat-tugas/    │
              │     │ generate/:id        │
              │     │ (Download DOCX/PDF) │
              │     └─────────────────────┘
              │
   ┌──────────▼──────────────────┐
   │ 6. KIRIM WA RESMI          │
   │ POST .../send-wa            │
   │ (via Fonnte API)            │
   │ ke pejabat & stakeholder    │
   └──────────┬──────────────────┘
              │
   ┌──────────▼──────────────────┐
   │ 7. KAJI CEPAT LAPANGAN     │
   │ (Tim TRC di lokasi)         │
   │ POST field-assessments/     │
   │ juklak                      │
   │ Data: korban, kerusakan,    │
   │ pengungsi, infrastruktur    │
   └──────────┬──────────────────┘
              │
   ┌──────────▼──────────────────┐
   │ 8. KEBUTUHAN DARURAT       │
   │ POST emergency-needs        │
   │ Data: makanan, air, tenda,  │
   │ obat, alat berat, dll       │
   └──────────┬──────────────────┘
              │
   ┌──────────▼──────────────────┐
   │ 9. GENERATE LAPORAN        │
   │ GET reports/generate/       │
   │ docx/:id atau pdf/:id       │
   │ (Laporan Kaji Cepat resmi)  │
   └──────────┬──────────────────┘
              │
   ┌──────────▼──────────────────┐
   │ 10. DASHBOARD               │
   │ GET dashboard                │
   │ Agregasi semua data:        │
   │ statistik, tren, peta       │
   └─────────────────────────────┘
```

### Alur Startup Server

```
server.js
  ├── Load app.js (Express setup)
  ├── Test database connection
  ├── Start Express listener (port dari .env)
  └── Register graceful shutdown handlers (SIGTERM, SIGINT)
```

### Alur Request Masuk

```
HTTP Request
  │
  ├── 1. Helmet (security headers)
  ├── 2. CORS (origin validation)
  ├── 3. Rate Limiter (100 req/15min)
  ├── 4. Body Parser (JSON, urlencoded)
  ├── 5. Morgan (HTTP logging)
  │
  ├── 6. Route Matching (/api/v1/...)
  │   ├── authenticate() — verifikasi JWT token
  │   ├── authorize(...roles) — cek role user
  │   ├── validator — validasi input (express-validator)
  │   └── controller → service → repository → database
  │
  ├── 7a. Success → responseFormatter.successResponse()
  └── 7b. Error → errorMiddleware.errorHandler()
```

---

## 9. Daftar Modul & Fitur

### 🔐 Modul Auth (`/api/v1/auth`)
- Login dengan email/password → JWT token
- Register user baru
- Get profil user yang sedang login (`/me`)
- Update profil sendiri
- Ganti password sendiri

### 👤 Modul Users (`/api/v1/users`) — ADMIN only
- CRUD pengguna sistem
- Soft delete (is_active flag)
- Filter berdasarkan role

### 📦 Modul Master Data (`/api/v1/master-data`)
- **Disaster Types**: CRUD jenis bencana
- **Agencies**: CRUD instansi/lembaga
- **Regions**: CRUD data wilayah internal
- **Need Items**: CRUD item kebutuhan darurat (dengan satuan)
- Endpoint gabungan semua master data (`GET /`)

### 🌊 Modul Disaster Reports (`/api/v1/disaster-reports`)
- Buat laporan bencana baru (auto-generate report_code)
- Daftar semua laporan (filter, pagination)
- Detail laporan (termasuk foto & verifikasi)
- Verifikasi laporan (ubah status → VERIFIED/REJECTED)

### 🚗 Modul Team Assignments (`/api/v1/team-assignments`)
- CRUD penugasan tim TRC
- Menyertakan anggota tim (team_members)
- Data surat tugas (nomor, tanggal, dsb)
- Link ke disaster report

### ⚡ Modul Rapid Assessment (`/api/v1/rapid-assessments`)
- **Kaji Cepat Awal** oleh Pusdalops
- CRUD assessment lengkap (10+ sub-tabel terkait)
- Data per desa: terdampak, pengungsi, korban
- Langkah penanganan, kebutuhan, situasi akhir
- Upload foto dokumentasi
- **Generate pesan WhatsApp** format resmi BPBD
- **Kirim via Fonnte API** ke pejabat & stakeholder
- Log pengiriman WA (status tracking)
- Update/resend pesan WA

### 📋 Modul Field Assessment (`/api/v1/field-assessments`)
- **Kaji Cepat Lapangan** oleh Tim TRC
- Data legacy (sub-tabel terpisah: victims, house_damage, dll)
- Data Juklak baru (JSONB detail column — format sesuai Juklak BNPB)
- CRUD assessment Juklak
- Data: korban, pengungsi, kerusakan, infrastruktur, kelompok rentan

### 🆘 Modul Emergency Needs (`/api/v1/emergency-needs`)
- Catat kebutuhan darurat per assessment
- Upsert (insert or update)
- Query per assessment atau per disaster report
- Integrasi dengan master data need_items

### 🗺️ Modul Map Objects (`/api/v1/map-objects`)
- Pemetaan kolaboratif objek bencana di peta
- Support tipe: **marker**, **polygon**, **polyline**
- Geometri disimpan sebagai JSONB
- Upload foto per objek (maks 5 foto)
- Endpoint publik (tanpa auth) untuk embed peta
- Filter per disaster dan per assessment

### 📊 Modul Dashboard (`/api/v1/dashboard`)
- Agregasi data dari rapid + field assessments
- Strategi: field data prioritas, fallback ke rapid data
- Statistik: total bencana, korban, pengungsi, kerusakan rumah
- Detail korban: meninggal, hilang, luka berat, luka ringan
- Distribusi per jenis bencana (dengan color palette)
- Tren bulanan (12 bulan)
- Status distribusi (DRAFT/SENT/FINAL)
- Kejadian terbaru
- Titik peta untuk visualisasi

### 📄 Modul Report Generator (`/api/v1/reports`)
- Generate laporan Kaji Cepat format resmi (Juklak BNPB)
- **DOCX**: Menggunakan docxtemplater + template Word asli
- **PDF**: Strategi 1: DOCX → PDF via LibreOffice; Strategi 2: Puppeteer + EJS (fallback)
- Placeholder lengkap: pendahuluan, korban, pengungsi, kerusakan, kebutuhan, tim TRC

### 📜 Modul Surat Tugas (`/api/v1/surat-tugas`)
- Generate Surat Tugas Tim TRC
- DOCX via docxtemplater + template format_st_template.docx
- PDF via LibreOffice conversion
- Data otomatis dari database (team_assignments)

### 🌍 Modul Wilayah (`/api/v1/wilayah`)
- Data wilayah Indonesia dari EMSIFA API
- Cascading: Provinsi → Kabupaten → Kecamatan → Desa
- Sinkronisasi dari API eksternal ke database lokal
- Digunakan untuk dropdown administrasi di frontend

---

## 10. API Endpoints Lengkap

### Base URL: `/api/v1`

| Method | Endpoint | Auth | Role | Fungsi |
|--------|----------|------|------|--------|
| `GET` | `/health` | ❌ | — | Health check server |
| | | | | |
| **Auth** | | | | |
| `POST` | `/auth/login` | ❌ | — | Login, mendapat JWT |
| `POST` | `/auth/register` | ❌ | — | Register user baru |
| `GET` | `/auth/me` | ✅ | All | Profil user login |
| `PUT` | `/auth/profile` | ✅ | All | Update profil sendiri |
| `PUT` | `/auth/change-password` | ✅ | All | Ganti password |
| | | | | |
| **Users** | | | | |
| `GET` | `/users` | ✅ | ADMIN | List semua user |
| `POST` | `/users` | ✅ | ADMIN | Buat user baru |
| `GET` | `/users/:id` | ✅ | ADMIN | Detail user |
| `PUT` | `/users/:id` | ✅ | ADMIN | Update user |
| `DELETE` | `/users/:id` | ✅ | ADMIN | Soft delete user |
| | | | | |
| **Master Data** | | | | |
| `GET` | `/master-data` | ✅ | All | Semua master data |
| `GET` | `/master-data/disaster-types` | ✅ | All | List jenis bencana |
| `POST` | `/master-data/disaster-types` | ✅ | ADMIN | Tambah jenis bencana |
| `PUT` | `/master-data/disaster-types/:id` | ✅ | ADMIN | Edit jenis bencana |
| `DELETE` | `/master-data/disaster-types/:id` | ✅ | ADMIN | Hapus jenis bencana |
| `GET` | `/master-data/agencies` | ✅ | All | List instansi |
| `POST/PUT/DELETE` | `/master-data/agencies[/:id]` | ✅ | ADMIN | CRUD instansi |
| `GET` | `/master-data/regions` | ✅ | All | List region |
| `POST/PUT/DELETE` | `/master-data/regions[/:id]` | ✅ | ADMIN | CRUD region |
| `GET` | `/master-data/need-items` | ✅ | All | List item kebutuhan |
| `POST/PUT/DELETE` | `/master-data/need-items[/:id]` | ✅ | ADMIN | CRUD need items |
| | | | | |
| **Disaster Reports** | | | | |
| `GET` | `/disaster-reports` | ✅ | All | List laporan |
| `POST` | `/disaster-reports` | ✅ | PUSDALOPS, ADMIN | Buat laporan |
| `GET` | `/disaster-reports/:id` | ✅ | All | Detail laporan |
| `POST` | `/disaster-reports/:id/verify` | ✅ | PUSDALOPS, ADMIN | Verifikasi laporan |
| | | | | |
| **Team Assignments** | | | | |
| `GET` | `/team-assignments` | ✅ | All | List penugasan |
| `GET` | `/team-assignments/:id` | ✅ | All | Detail penugasan |
| `POST` | `/team-assignments` | ✅ | PUSDALOPS, ADMIN | Buat penugasan |
| `PUT` | `/team-assignments/:id` | ✅ | PUSDALOPS, ADMIN | Update penugasan |
| `DELETE` | `/team-assignments/:id` | ✅ | PUSDALOPS, ADMIN | Hapus penugasan |
| | | | | |
| **Rapid Assessments** | | | | |
| `GET` | `/rapid-assessments` | ✅ | All | List kaji cepat awal |
| `GET` | `/rapid-assessments/dropdown` | ✅ | All | Dropdown options |
| `GET` | `/rapid-assessments/:id` | ✅ | All | Detail assessment |
| `POST` | `/rapid-assessments` | ✅ | PUSDALOPS, ADMIN | Buat assessment |
| `PUT` | `/rapid-assessments/:id` | ✅ | PUSDALOPS, ADMIN | Update assessment |
| `PATCH` | `/rapid-assessments/:id/status` | ✅ | PUSDALOPS, ADMIN | Update status |
| `DELETE` | `/rapid-assessments/:id` | ✅ | PUSDALOPS, ADMIN | Hapus assessment |
| `POST` | `/rapid-assessments/upload-photos` | ✅ | PUSDALOPS, ADMIN | Upload foto |
| `POST` | `/rapid-assessments/:id/generate-wa` | ✅ | PUSDALOPS, ADMIN | Preview pesan WA |
| `POST` | `/rapid-assessments/:id/send-wa` | ✅ | PUSDALOPS, ADMIN | Kirim via Fonnte |
| `POST` | `/rapid-assessments/:id/resend-wa` | ✅ | PUSDALOPS, ADMIN | Kirim ulang WA |
| `GET` | `/rapid-assessments/:id/wa-logs` | ✅ | All | Log pengiriman WA |
| | | | | |
| **Field Assessments** | | | | |
| `GET` | `/field-assessments` | ✅ | All | List assessments |
| `GET` | `/field-assessments/:assessment_id` | ✅ | All | Detail per assessment |
| `POST` | `/field-assessments` | ✅ | TRC, ADMIN | Buat assessment |
| `GET` | `/field-assessments/juklak` | ✅ | All | List juklak |
| `GET` | `/field-assessments/juklak/:id` | ✅ | All | Detail juklak |
| `POST` | `/field-assessments/juklak` | ✅ | TRC, ADMIN, PUSDALOPS | Buat juklak |
| `PUT` | `/field-assessments/juklak/:id` | ✅ | TRC, ADMIN, PUSDALOPS | Update juklak |
| `DELETE` | `/field-assessments/juklak/:id` | ✅ | TRC, ADMIN, PUSDALOPS | Hapus juklak |
| | | | | |
| **Emergency Needs** | | | | |
| `GET` | `/emergency-needs` | ✅ | All | List kebutuhan |
| `GET` | `/emergency-needs/assessment/:id` | ✅ | All | Per assessment |
| `GET` | `/emergency-needs/report/:id` | ✅ | All | Per report |
| `POST` | `/emergency-needs` | ✅ | TRC, PUSDALOPS, ADMIN | Upsert kebutuhan |
| | | | | |
| **Map Objects** | | | | |
| `GET` | `/map-objects/public/:disasterId` | ❌ | — | GeoJSON publik |
| `GET` | `/map-objects/public/assessment/:id` | ❌ | — | GeoJSON per assessment |
| `GET` | `/map-objects/:disasterId` | ✅ | All | Objek per bencana |
| `GET` | `/map-objects/assessment/:id` | ✅ | All | Objek per assessment |
| `POST` | `/map-objects` | ✅ | ADMIN, PUSDALOPS, TRC | Buat objek peta |
| `PUT` | `/map-objects/:id` | ✅ | ADMIN, PUSDALOPS, TRC | Update objek |
| `DELETE` | `/map-objects/:id` | ✅ | ADMIN, PUSDALOPS, TRC | Hapus objek |
| `POST` | `/map-objects/:id/photos` | ✅ | ADMIN, PUSDALOPS, TRC | Upload foto objek |
| | | | | |
| **Dashboard** | | | | |
| `GET` | `/dashboard` | ✅ | All | Data dashboard lengkap |
| | | | | |
| **Reports** | | | | |
| `GET` | `/reports/generate/docx/:id` | ✅ | All | Download DOCX Juklak |
| `GET` | `/reports/generate/pdf/:id` | ✅ | All | Download PDF Juklak |
| | | | | |
| **Surat Tugas** | | | | |
| `GET` | `/surat-tugas/generate/:id` | ✅ | All | Download DOCX Surat Tugas |
| `GET` | `/surat-tugas/generate/:id/pdf` | ✅ | All | Download PDF Surat Tugas |
| | | | | |
| **Wilayah** | | | | |
| `GET` | `/wilayah/provinces` | ✅ | All | List provinsi |
| `GET` | `/wilayah/regencies?province_id=` | ✅ | All | List kabupaten |
| `GET` | `/wilayah/districts?regency_id=` | ✅ | All | List kecamatan |
| `GET` | `/wilayah/villages?district_id=` | ✅ | All | List desa |
| `POST` | `/wilayah/sync-all` | ✅ | All | Sinkronisasi dari EMSIFA API |

---

## 11. Sistem Keamanan

### JWT Authentication
- Token dikirim via header: `Authorization: Bearer <token>`
- Token expire dalam 1 hari
- Payload berisi: `id`, `name`, `email`, `role`
- Middleware `authenticate()` memverifikasi setiap request

### Role-Based Access Control (RBAC)
| Role | Deskripsi | Akses |
|---|---|---|
| **ADMIN** | Administrator sistem | Akses penuh ke semua endpoint |
| **PUSDALOPS** | Pusat Pengendalian Operasi | Kelola laporan, verifikasi, kaji cepat awal, kirim WA |
| **TRC** | Tim Reaksi Cepat (Field officer) | Kaji cepat lapangan, kebutuhan darurat |
| **PIMPINAN** | Pejabat struktural | Lihat dashboard, laporan (read-only) |

### Password Security
- Hash menggunakan **bcrypt** dengan salt 10
- Password tidak pernah dikembalikan dalam response API

### Rate Limiting
- 100 request per 15 menit per IP
- Response `429 Too Many Requests` jika melebihi limit

### Security Headers
- **Helmet.js** mengatur headers: CSP, X-Frame-Options, HSTS, dll

### Input Validation
- Setiap endpoint yang menerima input divalidasi dengan **express-validator**
- Validator didefinisikan per modul (contoh: `authValidator.js`, `disasterValidator.js`)

### SQL Injection Protection
- Seluruh query menggunakan **parameterized query** (`$1, $2, ...`)
- Tidak ada string concatenation di query SQL

---

## 12. Sistem File Upload

### Konfigurasi Upload
| Setting | Nilai |
|---|---|
| Max file size | 5MB per file |
| Format allowed | `.jpg`, `.jpeg`, `.png` |
| Max files per request | 5 file |

### Direktori Upload
| Path | Fungsi |
|---|---|
| `uploads/map-photos/` | Foto objek peta bencana |
| `uploads/assessments/` | Foto rapid assessment |
| `uploads/reports/` | Hasil generate DOCX/PDF Juklak |
| `uploads/surat-tugas/` | Hasil generate Surat Tugas |

### Static File Serving
- File upload diakses melalui: `GET /uploads/<subdirectory>/<filename>`
- Served oleh Express static middleware

---

## 13. Integrasi WhatsApp (Fonnte)

Sistem dapat mengirim laporan kaji cepat ke pejabat via WhatsApp menggunakan **Fonnte API**.

### Alur Pengiriman
```
1. Buat/Update Rapid Assessment
2. POST /rapid-assessments/:id/generate-wa  → Preview pesan
3. POST /rapid-assessments/:id/send-wa      → Kirim ke semua penerima
4. GET  /rapid-assessments/:id/wa-logs      → Cek status pengiriman
5. POST /rapid-assessments/:id/resend-wa    → Kirim ulang yang gagal
```

### Format Pesan WA
Pesan WA diformat sebagai laporan resmi BPBD yang mencakup:
- Penerima (10+ pejabat default: Kepala BNPB, Gubernur, dll)
- Jenis bencana, waktu, lokasi
- Kronologis kejadian
- Data terdampak, pengungsi, korban jiwa (per desa)
- Langkah penanganan, kebutuhan mendesak, situasi akhir
- Link titik lokasi & dokumentasi

### Retry Logic
- Maksimal 3 kali retry jika gagal
- Delay antar retry: 2s, 4s, 6s (progressive)
- Delay antar pengiriman bulk: 500ms (anti rate limit)

---

## 14. Sistem Generator Dokumen

### Laporan Kaji Cepat (Juklak)
- Template: `templete/format_w.docx` (format Word asli dari BNPB)
- Library: **docxtemplater** + **pizzip**
- Placeholder: `{{nama_field}}` di dalam dokumen Word
- Output: DOCX file yang mempertahankan formatting asli
- PDF: Konversi via **LibreOffice headless** (utama) atau **Puppeteer + EJS** (fallback)

### Surat Tugas
- Template: `templete/format_st_template.docx`
- Data otomatis dari tabel `team_assignments` + `team_members`
- Mendukung loop tabel (daftar anggota tim)

---

## 15. Cara Menjalankan

### Prasyarat
- Node.js (LTS)
- PostgreSQL dengan extension PostGIS
- (Opsional) LibreOffice untuk generate PDF

### Instalasi
```bash
cd backend
npm install
cp .env.example .env    # Edit sesuai konfigurasi lokal
```

### Setup Database
```bash
npm run db:setup         # Jalankan migrasi + seeding
```

### Development
```bash
npm run dev              # Start dengan nodemon (auto-reload)
```

### Production
```bash
npm start                # Start tanpa nodemon
```

### NPM Scripts
| Script | Fungsi |
|---|---|
| `npm run dev` | Start development server (nodemon) |
| `npm start` | Start production server |
| `npm run migrate` | Jalankan database migration |
| `npm run seed` | Jalankan database seeding |
| `npm run db:setup` | migrate + seed sekaligus |

### Response Format
Semua response API menggunakan format standar:

**Success:**
```json
{
  "success": true,
  "message": "Data berhasil diambil",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": [...]
}
```

**Paginated:**
```json
{
  "success": true,
  "message": "Success",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

---

## 📌 Catatan Penting

1. **Dual Assessment System**: Sistem memiliki 2 jenis kaji cepat:
   - **Rapid Assessment** (Kaji Cepat Awal) — dibuat oleh Pusdalops langsung setelah laporan masuk
   - **Field Assessment** (Kaji Cepat Lapangan/Juklak) — dibuat oleh TRC setelah tiba di lokasi

2. **Dashboard Merge Strategy**: Dashboard menggabungkan data dari kedua assessment. Data field assessment diprioritaskan; jika belum ada, gunakan data rapid assessment.

3. **PostGIS**: Digunakan untuk query geospasial — cari bencana berdasarkan lokasi, radius, dll.

4. **Template Word**: Template DOCX asli (format_w.docx) bisa diedit langsung di Microsoft Word. Placeholder menggunakan format `{{nama_field}}`.

5. **Fonnte API Key**: Harus diisi di `.env` agar fitur kirim WhatsApp berfungsi. Tanpa API key, pesan hanya bisa di-preview.

---

> 📝 *Dokumentasi ini dibuat otomatis berdasarkan analisis kode sumber backend KajiCepat.*
