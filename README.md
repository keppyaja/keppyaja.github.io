# Skipped | Cybersecurity Portfolio

Portofolio pribadi **Tsaqif Fawwaz (Skipped)**, seorang cybersecurity enthusiast, CTF player, dan programmer. Situs ini menggabungkan profil, kompetensi teknis, proyek, aktivitas CTF, dan arsip write-up dalam antarmuka bertema cyberpunk yang terinspirasi secara nonresmi oleh **Zenless Zone Zero** dan Ye Shunguang.

> Situs ini adalah situs penggemar tidak resmi. Zenless Zone Zero dan Ye Shunguang adalah milik HoYoverse. Situs tidak berafiliasi dengan HoYoverse dan tidak menggunakan artwork resmi.

## Isi Situs

- **Hero dan agent file** dengan tema Ye Shunguang, Yunkui Summit, Physical, Honed Edge, dan Attack.
- **Tentang**: profil, latar belakang, minat keamanan siber, dan competitive programming.
- **Fokus dan keahlian**: kriptografi, binary exploitation, web exploitation, reverse engineering, Linux, database, dan CTF.
- **Project showcase**: WebMusyKom, local AI chatbot, Perpusri, dan proyek algoritma.
- **Statistik Codeforces** yang diambil dari Codeforces API.
- **Arsip write-up CTF** dari ARACTF7 dan CyLab/picoCTF.
- **Form kontak** yang mengirimkan pesan melalui FormSubmit.

## Fitur Interaksi

- Entry screen dengan animasi pembuka dan status sesi menggunakan `sessionStorage`.
- Smooth scroll untuk anchor internal tanpa mempertahankan hash pada URL.
- Navigasi responsive dengan menu mobile.
- Pencarian, filter kompetisi/kategori, dan pagination pada [writeups/index.html](writeups/index.html).
- Modal studi kasus proyek dengan rendering Markdown yang disanitasi.
- Parallax, tilt, scroll reveal, dan dukungan `prefers-reduced-motion`.
- Audio lokal `assets/audio/theme.mp3` dengan:
  - loop playback,
  - tombol mute/unmute di navbar,
  - pause otomatis saat tab tidak aktif,
  - resume saat tab kembali aktif,
  - penyimpanan posisi dan status playback selama sesi.
- Navigasi internal tanpa reload melalui [assets/js/site-audio.js](assets/js/site-audio.js), sehingga elemen audio tetap dipertahankan saat berpindah halaman internal.

Autoplay audio dapat dibatasi oleh browser. Pada kondisi tersebut, pengguna perlu menekan tombol **Musik** atau melakukan interaksi yang mengizinkan playback.

## Teknologi

- HTML5
- CSS3 dengan custom properties, responsive media queries, dan animasi CSS
- Vanilla JavaScript
- Font Awesome 6.4.0
- Google Fonts: Barlow Condensed, IBM Plex Sans, dan IBM Plex Mono
- Marked.js `15.0.12` untuk rendering Markdown
- DOMPurify `3.2.6` untuk sanitasi HTML hasil Markdown
- Browser Fetch API
- Web Audio/HTMLMedia API
- Page Visibility API
- History API dan `sessionStorage`

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
│       ├── site-audio.js       # Audio global dan navigasi internal
│       └── writeups.js          # Search, filter, dan pagination write-up
└── writeups/
    ├── index.html               # Arsip write-up
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

Server HTTP lokal disarankan daripada membuka file secara langsung melalui `file://`, terutama untuk audio lokal, Fetch API, navigasi internal, dan resource antar-folder.

## Keamanan dan Privasi

- `marked` dan DOMPurify menggunakan versi exact dengan Subresource Integrity (SRI).
- Markdown dibersihkan dengan DOMPurify sebelum dimasukkan ke DOM.
- Tautan eksternal yang dibuka pada tab baru menggunakan `rel="noopener noreferrer"`.
- Audio di-host secara lokal dan tidak menggunakan embed pihak ketiga.
- Statistik Codeforces diambil dari endpoint publik yang sudah ditentukan.
- Form kontak meneruskan nama, email, dan pesan ke FormSubmit melalui HTTPS.

Header keamanan seperti Content Security Policy (CSP), HSTS, dan `frame-ancestors` perlu dikonfigurasi pada hosting atau CDN karena tidak dapat ditetapkan sepenuhnya dari file HTML statis.

## Catatan Konten

Arsip saat ini berisi write-up dari kategori:

- Cryptography
- Binary Exploitation
- Reverse Engineering
- Forensics
- Miscellaneous

Sumber Markdown berada di [writeups/source](writeups/source). Halaman yang sudah dirender dapat dibuka melalui [writeups/index.html](writeups/index.html).

## Status Proyek

Website ini adalah static portfolio yang aktif dikembangkan. Perubahan konten, aset visual, audio, dan write-up dapat dilakukan tanpa pipeline build khusus.

## Lisensi

Repository ini belum memiliki lisensi open-source. Hubungi pemilik repository sebelum menggunakan ulang kode, tulisan, audio, gambar, atau aset lainnya.
