# picoCTF — Mind your Ps and Qs Write-Up

| Field | Detail |
|---|---|
| **Challenge Name** | Mind your Ps and Qs |
| **Category** | Cryptography |
| **Difficulty** | Easy |
| **Source File** | `values.txt` |

---

## Deskripsi

> *"Bits are expensive, I used only a little bit over 100 to save money."*

Challenge ini memberikan parameter RSA berupa ciphertext `c`, modulus `n`, dan public exponent `e`. Petunjuk yang diberikan mengarah pada ukuran modulus yang sangat kecil sehingga dapat difaktorkan secara langsung.

---

## Parameter yang Diberikan

```text
c = 15341890103764929939105506004034128738090325640037083301857608662849501626260517

n = 948406957756830799684818171639547165784816468744946013083947881743680617123566349

e = 65537
```

---

## Analisis

### Kerentanan: Modulus RSA Terlalu Kecil

Keamanan RSA bergantung pada sulitnya memfaktorkan modulus:

```text
n = p × q
```

Pada implementasi RSA modern, ukuran modulus umumnya minimal 2048-bit sehingga faktorisasi menjadi tidak praktis.

Namun pada challenge ini, nilai `n` hanya sekitar 256-bit. Dengan ukuran sekecil ini, faktor prima penyusunnya dapat ditemukan dengan mudah menggunakan tool seperti:

- FactorDB
- YAFU
- msieve

Begitu nilai `p` dan `q` diketahui, seluruh kunci privat dapat direkonstruksi.

### Mengapa Ini Berbahaya?

| Ukuran Modulus | Tingkat Keamanan |
|---|---|
| 256-bit | ❌ Mudah difaktorkan |
| 1024-bit | ⚠️ Tidak lagi direkomendasikan |
| 2048-bit | ✅ Standar modern |
| 4096-bit | ✅ Sangat kuat |

Karena `n` sangat kecil, serangan tidak memerlukan teknik RSA lanjutan. Faktorisasi langsung sudah cukup untuk memperoleh plaintext.

---

## Solusi

### Langkah-Langkah

```text
1. Faktorkan n menjadi p dan q
2. Hitung φ(n) = (p−1)(q−1)
3. Cari private exponent:
      d = e⁻¹ mod φ(n)
4. Dekripsi ciphertext:
      m = c^d mod n
5. Konversi hasil ke bytes
6. Balik urutan string karena output tersimpan terbalik
```

### Hasil Faktorisasi

```text
p = 1891771437429478964908181306574287207137
q = 501332739776173570344039681219489434626477
```

### Exploit Script

```python
from Crypto.Util.number import inverse, long_to_bytes

c = 15341890103764929939105506004034128738090325640037083301857608662849501626260517
n = 948406957756830799684818171639547165784816468744946013083947881743680617123566349
e = 65537

p = 1891771437429478964908181306574287207137
q = 501332739776173570344039681219489434626477

phi = (p - 1) * (q - 1)
d = inverse(e, phi)

m = pow(c, d, n)

decrypted = long_to_bytes(m)
print("Decoded bytes:", decrypted)
```

### Output

```text
b'}19ea7cd1_do0g_0n_N_11ams{FTCocip'
```

Output terlihat terbalik. Membalik string menghasilkan:

```python
flag = b"}19ea7cd1_do0g_0n_N_11ams{FTCocip"[::-1]
print(flag.decode())
```

### Output Akhir

```text
picoCTF{sma11_N_n0_g0od_1dc7ae91}
```

---

## Flag

```text
picoCTF{sma11_N_n0_g0od_1dc7ae91}
```

> Nama flag secara langsung menggambarkan kelemahan challenge ini: modulus `N` yang terlalu kecil sehingga tidak aman.

---

## Diagram Serangan

```text
Public Key:
    (n, e)

          |
          v

   Faktorkan n
      n = p × q

          |
          v

 Hitung φ(n)

          |
          v

 Cari d = e⁻¹ mod φ(n)

          |
          v

 Dekripsi:
   m = c^d mod n

          |
          v

   Konversi ke bytes
   & balik string

          |
          v

         FLAG
```

---

## Key Takeaways

1. **Ukuran modulus RSA sangat penting** — Jika `n` terlalu kecil, faktorisasi menjadi mudah dilakukan.

2. **Keamanan RSA bergantung pada kesulitan faktorisasi** — Mengetahui `p` dan `q` berarti mengetahui seluruh kunci privat.

3. **Public exponent yang aman tidak cukup** — Walaupun `e = 65537` merupakan nilai standar, RSA tetap runtuh jika `n` terlalu kecil.

4. **Gunakan ukuran kunci modern** — Minimal 2048-bit untuk penggunaan praktis saat ini.

---

## Tools yang Digunakan

- **FactorDB** — Untuk menemukan faktor prima modulus.
- **Python** — Untuk menghitung private key dan melakukan dekripsi RSA.
- **PyCryptodome** — `inverse()` dan `long_to_bytes()`.
