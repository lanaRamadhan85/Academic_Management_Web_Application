# Sistem Akademik 

Aplikasi anajemen akademik berbasis web untuk mengelola data mahasiswa, mata kuliah, dan nilai secara efisien. Dibangun dengan **pure HTML, CSS, dan JavaScript** tanpa framework — menggunakan arsitektur **OOP (Class-based)**.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## Fitur Utama

### Autentikasi
- Halaman login dengan animasi partikel di background
- Proteksi halaman dashboard (redirect jika belum login)
- Logout dengan konfirmasi

### Dashboard
- **Statistik ringkasan** — Total Mahasiswa, Rata-rata IPK, Total Mata Kuliah, Total SKS
- **Tabel mahasiswa terbaru** — Menampilkan 5 mahasiswa terakhir

### Manajemen Mahasiswa
- Tambah, edit, dan hapus data mahasiswa (Nama, NIM, Semester)
- Pencarian mahasiswa secara real-time
- Konfirmasi hapus via modal dialog
- Validasi NIM unik

### Manajemen Mata Kuliah
- Input mata kuliah per mahasiswa (Nama MK, SKS, Semester)
- **Sistem bobot nilai** — Tugas (35%), UTS (30%), UAS (35%) dengan bobot yang bisa dikustomisasi
- **Preview Nilai Akhir secara real-time** saat menginput nilai
- Kalkulasi otomatis: Nilai Akhir → Grade (A/B/C/D/E) → Bobot Angka → Nilai Mutu
- Tambah, edit, dan hapus mata kuliah

### Perhitungan Akademik
- **IPS** (Indeks Prestasi Semester) — per semester
- **IPK** (Indeks Prestasi Kumulatif) — seluruh semester
- Total SKS kumulatif dan per semester

### Export Data
- **Export ke PDF** — menggunakan jsPDF + AutoTable, format tabel profesional
- **Export ke Excel** — menggunakan SheetJS (xlsx), multi-sheet per mahasiswa

### UI/UX
- **Dark theme** modern dengan design tokens (CSS Custom Properties)
- **Responsive design** — mendukung desktop dan mobile
- Sidebar navigasi dengan mobile hamburger menu
- Toast notification untuk feedback aksi (sukses/error/info)
- Modal konfirmasi untuk aksi destruktif
- Animasi dan transisi halus
- Ikon modern menggunakan [Iconify](https://iconify.design/) (Lucide icon set)
- Font [Inter](https://fonts.google.com/specimen/Inter) dari Google Fonts

---

## Arsitektur

Aplikasi menggunakan arsitektur **OOP (Object-Oriented Programming)** dengan 3 class utama:

```
┌─────────────────────────────────────────────────┐
│                  AkademikApp                    │
│  (Controller utama: state, UI, event handling)  │
│                                                 │
│  ┌───────────────┐    ┌──────────────────────┐  │
│  │   Mahasiswa    │───▶│    MataKuliah[]      │  │
│  │  nama, nim,    │    │  nama, sks, semester │  │
│  │  semester,     │    │  nilaiTugas/UTS/UAS  │  │
│  │  mataKuliah[]  │    │  bobotTugas/UTS/UAS  │  │
│  └───────────────┘    └──────────────────────┘  │
└─────────────────────────────────────────────────┘
```

| Class | Tanggung Jawab |
|-------|----------------|
| `MataKuliah` | Menyimpan data MK, menghitung Nilai Akhir, Grade, Bobot, dan Nilai Mutu |
| `Mahasiswa` | Menyimpan data mahasiswa beserta daftar MK, menghitung IPS & IPK |
| `AkademikApp` | Controller utama — mengelola state, event, navigasi, render UI, export |

---

## Struktur File

```
sistem-akademik/
├── login.html       # Halaman login admin
├── dashboard.html   # Halaman utama (dashboard, mahasiswa, MK, export)
├── style.css        # Seluruh styling (1400+ baris, dark theme)
├── script.js        # Seluruh logika aplikasi (1400+ baris, OOP)
└── README.md        # Dokumentasi
```

---

## Cara Menjalankan

1. **Clone** repository ini:
   ```bash
   git clone https://github.com/username/sistem-akademik.git
   cd sistem-akademik
   ```

2. **Buka** `login.html` di browser — bisa langsung double-click atau gunakan Live Server.

3. **Login** dengan kredensial demo:
   | Username | Password |
   |----------|----------|
   | `admin` | `admin123` |

> **Catatan:** Tidak memerlukan server backend. Semua data disimpan di **localStorage** browser.

---

## Penyimpanan Data

Aplikasi menggunakan **localStorage** untuk persistensi data:

- Data mahasiswa dan mata kuliah disimpan secara otomatis setiap kali ada perubahan
- Data bertahan meskipun browser ditutup
- Data bersifat lokal per browser (tidak tersinkronisasi antar perangkat)

---

## Teknologi

| Kategori | Teknologi |
|----------|-----------|
| Markup | HTML5 Semantic |
| Styling | Vanilla CSS (Custom Properties, Flexbox, Grid) |
| Logic | Vanilla JavaScript ES6+ (Class-based OOP) |
| Icons | [Iconify](https://iconify.design/) — Lucide icon set |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts) |
| PDF Export | [jsPDF](https://github.com/parallax/jsPDF) + [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) |
| Excel Export | [SheetJS](https://sheetjs.com/) (xlsx) |

---

## Halaman

| Halaman | Deskripsi |
|---------|-----------|
| **Login** | Form login dengan animasi partikel |
| **Dashboard** | Ringkasan statistik dan tabel mahasiswa terbaru |
| **Mahasiswa** | CRUD data mahasiswa dengan pencarian |
| **Mata Kuliah** | Input nilai per mahasiswa dengan preview otomatis |
| **Export** | Export data ke PDF atau Excel |

---

## Lisensi

Proyek ini dibuat untuk keperluan pembelajaran dan pengembangan.

---

<p align="center">
  Dibuat menggunakan HTML, CSS & JavaScript
</p>
