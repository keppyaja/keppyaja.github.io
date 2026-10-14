# Skipped | Cybersecurity Portfolio

Website portofolio pribadi **Tsaqif Fawwaz** (Skipped), seorang cybersecurity enthusiast, CTF player, dan programmer. Website ini menampilkan profil, kompetensi teknis, proyek, aktivitas CTF, serta kumpulan write-up keamanan siber dengan tema penggemar **Zenless Zone Zero** dan **Ye Shunguang** (Physical / Honed Edge / Attack, Yunkui Summit) sebagai karakter sorotan: permukaan hitam, kuning khas, strip hazard diagonal, dan panel bersudut potong.

> Situs penggemar tidak resmi. Zenless Zone Zero dan Ye Shunguang adalah milik HoYoverse. Seluruh ilustrasi (lambang tebasan dan lingkaran Ether Veil) dibuat sendiri dengan SVG/CSS; tidak ada artwork resmi yang dipakai.

![Portfolio Preview](assets/images/profile.webp)

## Tentang Website

Portofolio ini dibuat sebagai ruang dokumentasi untuk:

- Memperkenalkan latar belakang dan minat di bidang keamanan siber.
- Menampilkan kemampuan kriptografi, binary exploitation, web exploitation, reverse engineering, dan competitive programming.
- Mendokumentasikan solusi tantangan CTF dari CyLab/picoCTF dan ARACTF.
- Menampilkan proyek pengembangan web, backend, chatbot, dan pemecahan algoritma.
- Menyajikan statistik progres CyLab dan Codeforces secara informatif.

## Fitur

- **Hero bertema ZZZ** dengan *agent file* Ye Shunguang dan cuplikan analisis RSA Weak Key yang terhubung ke catatan lengkap.
- **Tentang** berisi profil, foto, dan fokus keahlian.
- **Fokus & perangkat** berupa indeks ringkas bidang dan teknologi yang digunakan.
- **Project showcase** dengan deskripsi dan studi kasus proyek.
- **Arsip write-up** dengan pencarian, filter kategori/kompetisi, dan pagination enam catatan per halaman. Tanpa JavaScript, seluruh tautan tetap tersedia.
- **Live-style statistics** untuk progres CyLab dan Codeforces.
- **Responsive layout** untuk desktop, tablet, dan perangkat mobile.
- **Contact section** untuk mengirimkan pesan atau memulai koneksi.
- Tipografi **Barlow Condensed** (judul), **IBM Plex Sans / Mono** (isi dan kode), tanpa scanline, glow, binary rain, atau animasi mengetik berulang.
- Navigasi keyboard, indikator fokus, dan dukungan preferensi reduced motion.
- Form kontak menggunakan FormSubmit; nama, email, dan pesan diteruskan ke layanan tersebut.

## Proyek Unggulan

### WebMusyKom: Sistem E-Voting Musyawarah Komisariat

Backend REST API untuk sistem e-voting yang berfokus pada keamanan, anonimitas, dan integritas proses pemilihan. Proyek ini menggunakan Node.js, Express.js, MySQL, JWT, Bcrypt, Helmet, CORS, rate limiting, dan Docker.

### Multi-Platform Local AI Chatbot

Ekosistem chatbot modular yang menghubungkan model AI lokal dengan Discord dan WhatsApp. Fitur yang ditampilkan meliputi integrasi media, pembuatan stiker, broadcast dengan rate limiting, slash commands, serta pemrosesan pesan berukuran panjang.

### Perpusri: Digital Library System

Platform repositori riset online untuk mengelola buku, jurnal, artikel, skripsi, tesis, dan disertasi. Aplikasi ini menyediakan pencarian multi-kriteria, unggah dokumen, profil publikasi, forum, voting, dashboard admin, validasi input, dan penyimpanan demo berbasis browser `localStorage`.

### CTF Write-ups

Arsip dokumentasi dan analisis tantangan keamanan siber, termasuk:

- Cryptography
- Binary Exploitation
- Web Exploitation
- Reverse Engineering
- Forensics
- General Skills

Buka arsip melalui menu **Write-ups** atau [writeups/index.html](writeups/index.html).

## Teknologi

- HTML5
- CSS3
- Vanilla JavaScript
- Font Awesome
- Google Fonts: Barlow Condensed, IBM Plex Sans, dan IBM Plex Mono
- Marked.js untuk rendering Markdown
- DOMPurify untuk sanitasi konten Markdown
- Chart.js untuk visualisasi pada studi kasus proyek
- Browser Fetch API

## Struktur Folder

```text
.
├── index.html                 # Halaman utama portofolio
├── assets/
│   ├── css/style.css          # Sistem visual portofolio dan halaman catatan
│   ├── images/                # Foto profil, favicon, dan aset gambar
│   └── js/
│       └── writeups.js        # Pencarian, filter, dan pagination arsip
└── writeups/
    ├── index.html             # Halaman arsip write-up
    ├── *.html                 # Halaman write-up yang sudah dirender
    └── source/                # Sumber Markdown dan materi asli
```

## Menjalankan Secara Lokal

Website ini tidak memerlukan proses build atau framework frontend.

### Opsi 1: Python HTTP server

Pastikan Python 3 sudah terpasang, kemudian jalankan dari root repository:

```bash
python -m http.server 8000
```

Buka [http://localhost:8000](http://localhost:8000) di browser.

### Opsi 2: VS Code Live Server

Buka folder repository di VS Code, lalu jalankan `index.html` menggunakan ekstensi **Live Server**.

> Server lokal disarankan untuk menghindari pembatasan browser saat membuka halaman langsung melalui `file://`.

## Catatan Dependensi

Beberapa aset frontend dimuat melalui CDN:

- Font Awesome 6.4.0
- Google Fonts
- Marked.js
- DOMPurify

Karena itu, koneksi internet diperlukan saat pertama kali memuat resource tersebut. Konten write-up lokal tetap tersedia di dalam repository.

## Status Proyek

Website ini merupakan static portfolio yang aktif dikembangkan. Data statistik dan isi proyek dapat diperbarui tanpa mengubah struktur utama halaman.

## Lisensi

Belum ada lisensi open-source yang ditentukan untuk repository ini. Hubungi pemilik repository sebelum menggunakan ulang aset, tulisan, atau materi di dalamnya.
