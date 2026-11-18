# Skipped | Cybersecurity Portfolio

Portofolio pribadi **Tsaqif Fawwaz (Skipped)**, seorang cybersecurity enthusiast, CTF player, dan programmer.

## Isi Situs

- **Hero dan agent file** dengan tema Ye Shunguang, Yunkui Summit, Physical, Honed Edge, dan Attack.
- **Tentang**: profil, latar belakang, minat keamanan siber, dan competitive programming.
- **Fokus dan keahlian**: kriptografi, binary exploitation, web exploitation, reverse engineering, Linux, database, dan CTF.
- **Project showcase**: WebMusyKom, local AI chatbot, Perpusri, dan proyek algoritma.
- **Table of contents** interaktif untuk berpindah ke setiap section utama portfolio.
- **Statistik Codeforces** yang diambil dari Codeforces API.
- **Arsip write-up CTF** dari ARACTF7, Wreck-IT 7.0, dan CyLab/picoCTF.
- **Form kontak** yang mengirimkan pesan melalui FormSubmit.

## Fitur Interaksi

- Entry screen showcase dengan counter progres GSAP yang berjalan bertahap, reveal karakter, orbit, partikel, dan auto-entry setelah animasi selesai.
- Status entry disimpan menggunakan `sessionStorage`, sehingga entry screen tidak ditampilkan berulang kali selama sesi.
- Modal konfirmasi musik custom yang muncul setelah entry selesai; musik tidak berjalan otomatis tanpa persetujuan pengguna.
- Smooth scroll untuk anchor internal, dengan URL bersih tanpa `index.html`.
- Navigasi responsive dengan menu mobile.
- Navigasi internal tanpa reload melalui [assets/js/site-audio.js](assets/js/site-audio.js), termasuk preservasi audio saat berpindah halaman.
- Pencarian, filter kompetisi/kategori, dan pagination pada [writeups/](writeups/).
- Modal studi kasus proyek dengan rendering Markdown yang disanitasi.
- Parallax, pointer tilt, scroll reveal, hover state, marquee loadout, dan dukungan `prefers-reduced-motion` menggunakan GSAP.
- Audio lokal `assets/audio/theme.mp3` dengan:
  - loop playback,
  - tombol mute/unmute di navbar,
  - persetujuan pengguna sebelum musik diputar,
  - pause saat tab tidak aktif tanpa autoplay ulang,
  - penyimpanan posisi dan status playback selama sesi.

## Teknologi

- HTML5
- CSS3 dengan custom properties, responsive media queries, dan animasi CSS
- Vanilla JavaScript dengan History API, Fetch API, Page Visibility API, Web Audio/HTMLMedia API, dan `sessionStorage`
- GSAP `3.12.5`, termasuk ScrollTrigger dan ScrollToPlugin yang dimuat dari CDN
- Font Awesome 6.4.0
- Google Fonts: Barlow Condensed, IBM Plex Sans, dan IBM Plex Mono
- Marked.js `15.0.12` untuk rendering Markdown
- DOMPurify `3.2.6` untuk sanitasi HTML hasil Markdown

## Struktur Folder

```text
.
├── index.html                  # Halaman utama portofolio
├── README.md
├── assets/
│   ├── audio/
│   │   └── theme.mp3           # Musik latar lokal
│   ├── css/
│   │   └── style.css           # Sistem visual seluruh halaman
│   ├── images/
│   │   ├── favicon.svg
│   │   ├── profile.webp
│   │   └── ye-candidate-*.webp
│   └── js/
│       ├── gsap-animations.js  # Entry, scroll, hover, tilt, dan marquee animation
│       ├── site-audio.js       # Audio global dan navigasi internal
│       └── writeups.js          # Search, filter, dan pagination write-up
└── writeups/
    ├── index.html               # Arsip write-up (diakses melalui /writeups/)
    ├── *.html                   # Halaman write-up yang dirender
    └── source/                  # Sumber Markdown dan materi asli
```

## Menjalankan Secara Lokal

Situs ini merupakan static website dan tidak memerlukan proses build atau framework frontend.

### Python HTTP server

Jalankan dari root repository:

```bash
python -m http.server 8000
```

Buka [http://localhost:8000](http://localhost:8000).

### VS Code Live Server

Buka folder repository di VS Code, kemudian jalankan `index.html` menggunakan ekstensi **Live Server**.

Server HTTP lokal disarankan daripada membuka file secara langsung melalui `file://`, terutama untuk audio lokal, Fetch API, navigasi internal, URL bersih, dan resource antar-folder.

## Keamanan dan Privasi

- `marked` dan DOMPurify menggunakan versi exact dengan Subresource Integrity (SRI).
- Markdown dibersihkan dengan DOMPurify sebelum dimasukkan ke DOM.
- Tautan eksternal yang dibuka pada tab baru menggunakan `rel="noopener noreferrer"`.
- Audio di-host secara lokal dan tidak menggunakan embed pihak ketiga. Audio tidak autoplay dan memerlukan persetujuan melalui modal custom.
- Statistik Codeforces diambil dari endpoint publik yang sudah ditentukan.
- Form kontak meneruskan nama, email, dan pesan ke FormSubmit melalui HTTPS.
- URL `index.html` dinormalisasi ke URL direktori menggunakan History API; konfigurasi hosting tetap perlu mendukung fallback `index.html` untuk URL direktori.

Header keamanan seperti Content Security Policy (CSP), HSTS, dan `frame-ancestors` perlu dikonfigurasi pada hosting atau CDN karena tidak dapat ditetapkan sepenuhnya dari file HTML statis.

## Catatan Konten

Arsip saat ini berisi write-up dari kategori:

- Cryptography
- Web Exploitation
- Binary Exploitation
- Reverse Engineering
- Forensics
- Miscellaneous

Sumber Markdown dan dokumen asli berada di [writeups/source](writeups/source). Halaman yang sudah dirender dapat dibuka melalui [writeups/](writeups/).

## Status Proyek

Website ini adalah static portfolio yang aktif dikembangkan. Perubahan konten, aset visual, audio, dan write-up dapat dilakukan tanpa pipeline build khusus.