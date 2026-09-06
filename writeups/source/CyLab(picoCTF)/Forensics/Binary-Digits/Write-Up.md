# picoCTF 2026 - Binary Digits Write-Up

## Informasi Challenge

| Atribut | Detail |
|---|---|
| Nama Challenge | Binary Digits |
| Kategori | Forensics |
| Tingkat Kesulitan | Easy |
| Poin | 100 |
| Files | `digits.bin` |

## Deskripsi Challenge

Deskripsi tantangannya:

```
This file doesn't look like much… just a bunch of 1s and 0s.
But maybe it's not just random noise. Can you recover anything
meaningful from this?
```

Tidak ada hint yang diberikan pada challenge ini — satu-satunya bahan yang tersedia hanyalah file `digits.bin`.

## Memahami Konsepnya

Ketika file `digits.bin` dibuka, isinya hanya berupa satu baris teks yang sangat panjang, terdiri dari karakter `0` dan `1` saja. Ini adalah representasi **binary digits** dalam bentuk teks ASCII (bukan byte biner asli), sehingga setiap 8 karakter `0`/`1` sebenarnya merepresentasikan **1 byte** data.

Pola penyelesaian challenge seperti ini cukup umum di kategori forensics:
1. Cek jenis file terlebih dahulu untuk memastikan bahwa isinya memang teks berisi deretan bit, bukan data biner mentah.
2. Lihat potongan awal dari deretan bit tersebut, lalu ubah menjadi byte untuk mengecek apakah cocok dengan **magic bytes** (tanda tangan) dari suatu format file yang dikenal.
3. Jika cocok, konversi seluruh deretan bit menjadi byte sungguhan, lalu simpan sebagai file dengan ekstensi yang sesuai.

## Analisis

Pengecekan jenis file dengan `file`:

```bash
file digits.bin
```

```
digits.bin: ASCII text, with very long lines (65536), with no line terminators
```

Ini mengonfirmasi bahwa `digits.bin` adalah teks ASCII biasa, bukan data biner mentah — artinya karakter `0` dan `1` di dalamnya perlu dikonversi secara manual menjadi byte.

Melihat 32 bit pertama dari file:

```bash
head -c 32 digits.bin
```

```
11111111 11011000 11111111 11100000
```

Jika 4 byte pertama ini dikonversi ke heksadesimal:

```
11111111 -> FF
11011000 -> D8
11111111 -> FF
11100000 -> E0
```

Hasilnya adalah `FF D8 FF E0` — ini merupakan **magic bytes** standar untuk file **JPEG** (`FF D8 FF` menandakan awal file JPEG, diikuti marker APP0/JFIF `E0`). Dengan kata lain, seluruh deretan bit pada `digits.bin` kemungkinan besar adalah representasi teks dari byte-byte sebuah file gambar JPEG.

## Solusi

### Konversi bit menjadi file JPEG dengan Python

```python
bits = open("digits.bin", "r").read().strip()

data = bytes(
    int(bits[i:i+8], 2)
    for i in range(0, len(bits), 8)
    if len(bits[i:i+8]) == 8
)

with open("recovered.jpg", "wb") as f:
    f.write(data)

print("wrote", len(data), "bytes")
```

Logika script:
1. Membaca seluruh isi `digits.bin` sebagai satu string panjang berisi karakter `0` dan `1`.
2. Memotong string tersebut per 8 karakter, lalu mengonversi tiap potongan menjadi satu byte menggunakan `int(chunk, 2)`.
3. Menggabungkan seluruh byte hasil konversi dan menuliskannya ke file baru `recovered.jpg`.

Alternatif tanpa Python, cukup dengan CyberChef: masukkan isi `digits.bin` ke recipe **"From Binary"**, lalu gunakan fitur render image untuk langsung melihat hasilnya sebagai gambar.

## Verifikasi

Setelah file `recovered.jpg` dihasilkan, jenis filenya diverifikasi kembali dengan `file`:

```bash
file recovered.jpg
```

```
recovered.jpg: JPEG image data, JFIF standard 1.01, aspect ratio,
density 1x1, segment length 16, baseline, precision 8, 800x500, components 3
```

Output ini mengonfirmasi bahwa file benar-benar berhasil dipulihkan menjadi gambar JPEG yang valid berukuran 800x500 piksel. Saat gambar dibuka, isinya menampilkan teks flag yang tertulis langsung pada gambar tersebut.

## Flag

```
picoCTF{h1dd3n_1n_th3_b1n4ry_cc2099d3}
```

## Kesimpulan (Key Takeaways)

1. **Deretan angka `0` dan `1` dalam bentuk teks bisa merepresentasikan byte data apa pun** — termasuk gambar, dokumen, maupun arsip, selama dikonversi kembali dengan pengelompokan 8-bit per byte yang benar.
2. **Magic bytes (file signature) adalah alat identifikasi yang sangat cepat dan andal** — cukup dengan melihat beberapa byte pertama suatu file, kita bisa menebak formatnya tanpa harus membuka file secara penuh.
3. **`FF D8 FF` adalah tanda pengenal universal untuk file JPEG** — mengenali pola ini membuat proses forensik jauh lebih efisien.
4. **Tools seperti `file`, Python, dan CyberChef saling melengkapi** — `file` untuk identifikasi cepat, Python untuk kontrol penuh atas proses konversi, dan CyberChef untuk eksplorasi visual yang cepat tanpa perlu menulis kode.
5. **Challenge forensics seringkali sesederhana "ubah representasi data, lalu lihat isinya"** — kesulitan utamanya bukan pada teknik yang rumit, melainkan pada kejelian mengenali bahwa data yang tampak acak sebenarnya menyimpan struktur file yang dikenal.
