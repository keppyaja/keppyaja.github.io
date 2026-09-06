# picoCTF — RSA Weak Key Write-Up

| Field | Detail |
|---|---|
| **Challenge Name** | RSA Weak Key (N is Even) |
| **Category** | Cryptography |
| **Difficulty** | Easy |

---

## Deskripsi

> *"This service provides you an encrypted flag. Can you decrypt it with just N & e?"*

---

## Parameter yang Diberikan

```
N = 15167632548023416384742651530280884833671094094186392803220322775337334253100742696621107926820098032145452887101723269534953779112178495798443374220368054
e = 65537
c = 15074949617297090298557221567594161170257411928961935705029682164818563940970065212001889944228177486468093875558585722632304386393166084203797143317652145
```

---

## Analisis

### Kerentanan Kritis: N adalah Bilangan Genap

RSA yang aman mengharuskan `N = p × q` di mana **p dan q adalah dua bilangan prima besar**. Karena semua bilangan prima (kecuali 2) adalah ganjil, hasilnya `N` **harus selalu ganjil**.

Namun, pada soal ini:

```
N % 2 == 0  →  N adalah GENAP!
```

Ini berarti salah satu faktornya adalah `p = 2`, sehingga:

```
q = N / 2
```

Dengan mengetahui `p` dan `q`, kita bisa menghitung kunci privat `d` dan mendekripsi ciphertext.

---

## Solusi

### Langkah-Langkah

```
1. Cek apakah N genap → Ya! → p = 2
2. Hitung q = N / p
3. Hitung phi(N) = (p-1) × (q-1)
4. Hitung d = e⁻¹ mod phi(N)   ← kunci privat
5. Dekripsi: m = c^d mod N
6. Konversi integer m ke bytes → flag
```

### Exploit Script

```python
from sympy import mod_inverse

N = 15167632548023416384742651530280884833671094094186392803220322775337334253100742696621107926820098032145452887101723269534953779112178495798443374220368054
e = 65537
c = 15074949617297090298557221567594161170257411928961935705029682164818563940970065212001889944228177486468093875558585722632304386393166084203797143317652145

# Step 1 & 2: Faktorkan N — genap berarti p = 2
p = 2
q = N // p
assert p * q == N

# Step 3: Hitung phi(N)
phi = (p - 1) * (q - 1)

# Step 4: Hitung kunci privat d
d = mod_inverse(e, phi)

# Step 5: Dekripsi
m = pow(c, d, N)

# Step 6: Integer → bytes → string
flag = m.to_bytes((m.bit_length() + 7) // 8, byteorder='big').decode()
print(f"Flag: {flag}")
```

### Output

```
p     = 2
q     = 7583816274011708192371325765140442416835547047093196401610161387668667126550371348310553963410049016072726443550861634767476889556089247899221687110184027
phi   = 7583816274011708192371325765140442416835547047093196401610161387668667126550371348310553963410049016072726443550861634767476889556089247899221687110184026
d     = 6012248933160692598728116963755387433192054600893756385584594123284759284481302070171401524679684860141211454615386226039932088343625325600072660870908361

Flag: picoCTF{tw0_1$_pr!m3de643ad5}
```

---

## Flag

```
picoCTF{tw0_1$_pr!m3de643ad5}
```

> **Nama flag pun menjadi hintan:** *"two is prime"* — merujuk pada fakta bahwa `p = 2` (bilangan prima terkecil dan satu-satunya yang genap).

---

## Key Takeaways

1. **RSA membutuhkan dua prima besar** — jika `N` genap, maka `p = 2`, dan seluruh keamanan runtuh secara instan.

2. **Ukuran bit bukan segalanya** — `N` di sini berukuran 513-bit, terlihat besar, namun karena mudah difaktorkan, tidak ada keamanan sama sekali.

3. **Selalu validasi parameter** — implementasi RSA yang baik harus memastikan `p` dan `q` adalah bilangan prima besar yang dipilih secara acak, serta `N` harus ganjil.

4. **Pembuktian kekuatan RSA ada pada sulitnya faktorisasi** — begitu faktorisasi mudah dilakukan (seperti di sini), enkripsi RSA menjadi tidak berguna.

---

## Tools yang Digunakan

- **Python** — `sympy` (untuk `mod_inverse`), aritmetika bawaan Python (untuk `pow` modular)