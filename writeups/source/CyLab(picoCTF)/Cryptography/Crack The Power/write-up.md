# picoCTF — Crack The Power Write-Up

| Field | Detail |
|---|---|
| **Challenge Name** | Small e |
| **Category** | Cryptography |
| **Difficulty** | Medium |
| **Source File** | `message.txt` |

---

## Deskripsi

> *"The modulus is built from primes large enough that factoring them isn't an option, at least not today. See if you can make sense of the numbers and reveal the flag."*

**Hints yang diberikan:**
1. Ketika nilai tertentu dalam setup enkripsi lebih kecil dari biasanya, ada jalan pintas yang tidak terduga untuk memulihkan plaintext.
2. Pertimbangkan apakah kamu bisa membalik enkripsi **tanpa memfaktorkan `n`**.
3. Baca lebih lanjut tentang [Coppersmith's Attack](https://en.wikipedia.org/wiki/Coppersmith%27s_attack).

---

## Parameter yang Diberikan

```
n = 340226612280453880490912927616922654745871244089289366256789212515896004497250...
    (4095-bit modulus — sangat besar, tidak bisa difaktorkan)

e = 20         ← sangat kecil!

c = 640637430810406857500566702096274080396661344326148989819149855637707275983...
```

---

## Analisis

### Kerentanan: Eksponen Publik `e` yang Sangat Kecil

Dalam RSA standar, enkripsi bekerja seperti ini:

```
c = m^e mod n
```

Agar RSA aman, perlu ada reduksi modular — artinya `m^e` harus **melampaui n** sehingga operasi mod n benar-benar mengubah nilainya.

Namun jika **`e` sangat kecil** dan **pesan `m` juga relatif kecil**, maka:

```
m^e < n   →   tidak ada reduksi modular!
c = m^e mod n = m^e   (murni, tanpa mod)
```

Dengan kata lain, `c` hanyalah `m` dipangkatkan 20, **bukan** operasi RSA yang sesungguhnya. Untuk mendekripsi, kita cukup menghitung **akar ke-20 dari `c`** secara integer.

### Kenapa `e = 20` Berbahaya?

| Nilai `e` | Keamanan |
|---|---|
| `e = 65537` | ✅ Standar & aman |
| `e = 3` | ⚠️ Rentan jika m kecil |
| `e = 20` | ❌ Sangat rentan jika m^e < n |

Karena flag picoCTF relatif pendek (< 60 karakter), nilai `m` jauh lebih kecil dari `n` (4095-bit), sehingga `m^20` tidak pernah melewati nilai `n`.

---

## Solusi

### Langkah-Langkah

```
1. Amati bahwa e = 20 (sangat kecil)
2. Coba hitung akar integer ke-20 dari c
3. Jika hasilnya tepat (exact), berarti m^e tidak pernah ter-reduce oleh mod n
4. Konversi integer m ke bytes → flag
```

### Exploit Script

```python
import sympy

n = 340226612280453880490912927616922654745871244089289366256789212515896004497250888584335811193830299831152937221710730524607657274800439820657259458335845939604931208401645166794422421061753256418606981891166292142312310415412822538932571250257863289381608926058569443787372767929674420189682140643934828208884862456000947387644814288954199430403778409100671478459624487135877196949510819070843489062177812610169137985121981686847113760741151147789395635551162493262500781469414674715294121266223065415289341718811129151397178263070097355368724306157335976262867024266322656022224190318373194930817027553444120202292747938671524024999221893702460945171052909676860508777477633202757108535727508915761012307312590775794562319046042072447802326462685809774970879511380747691257281474551283000843537035593404036052654969917069297984148223213335741086514064256735270274423335098606567685634207561183967667312482624845887343588501669563704153809977521324544338273705452304166553609342275320152815696737710312761215921474738505250301661262646544496431458447294223499494555443767746404864888997183239119346466619148212371671931706071305354788570231263917420073144154793116214641438554148643280191881422603579089810874350592019963992600316667
e = 20
c = 640637430810406857500566702096274080396661344326148989819149855637707275983472899892750444419300234079892653333362989506852801685008762251130872832744197646466858521890159108234060530632218545536493488645992429077472502031329127700427356736726536701719062158231800255112161983427364020254609533473401843023952968018844806862896943490893119371703331960982414876010742030933003301879372695333343200500711596801923272711473735596859184517981485041587840922031361580523565471754589502606896163103556972744430028454860323232448424368114835718966903896081921822322495308942627206587827869758822635827159743949522778872267782737023325775825987938515587028997868106842378444561485725423380868087876415156656531868887461098120850401515409014096099316919268977722048391610017964961835883458482549333972161386084047586325153495747282557560791442172961910916373381462229380156133838381633915942059818808997063047255803431866226725960708286498794535426919185922421000300087374455173022674406631175145902138929540939977920690014479484669993159370314372551152369559506116674980314595547354085609712390963374849992524368048463233368412763016667750045491935391770001

# Coba hitung akar integer ke-e dari c
m, exact = sympy.integer_nthroot(c, e)

if exact:
    flag = m.to_bytes((m.bit_length() + 7) // 8, byteorder='big').decode()
    print(f"Exact root found! m^{e} == c (tanpa reduksi modular)")
    print(f"Flag: {flag}")
else:
    print("Tidak exact — perlu metode lain (Coppersmith)")
```

### Output

```
Exact root found! m^20 == c (tanpa reduksi modular)
Flag: picoCTF{t1ny_e_9b88056f}
```

---

## Flag

```
picoCTF{t1ny_e_9b88056f}
```

> **Nama flag sekaligus petunjuknya:** *"tiny e"* — eksponen publik yang terlalu kecil adalah kelemahan utama di sini.

---

## Diagram Serangan

```
Enkripsi normal RSA:          Enkripsi yang lemah (e kecil, m kecil):
  c = m^e mod n                  c = m^e   (tidak ada reduksi!)
  
Dekripsi normal:              Serangan akar integer:
  m = c^d mod n                  m = c^(1/e)   ← hitung langsung!
  (butuh kunci privat d)         (tidak butuh d, tidak butuh faktorisasi n)
```

---

## Key Takeaways

1. **`e` harus cukup besar** — Nilai standar `e = 65537` dipilih karena efisien namun cukup besar untuk mencegah serangan akar integer.

2. **Reduksi modular adalah jantung keamanan RSA** — Jika `m^e` tidak melewati `n`, operasi `mod n` tidak mengubah apapun, dan enkripsi menjadi sekadar perpangkatan biasa.

3. **Ukuran `n` yang besar tidak menjamin keamanan** — `n` berukuran 4095-bit, tetapi tetap dibobol karena kelemahannya bukan pada `n`, melainkan pada `e`.

4. **Coppersmith's Attack** — Untuk kasus yang lebih kompleks di mana `m^e` sedikit melewati `n` (namun masih bisa dimanipulasi), teknik Coppersmith menggunakan LLL lattice reduction untuk menemukan akar polinomial modular kecil.

---

## Tools yang Digunakan

- **Python** — `sympy.integer_nthroot` untuk menghitung akar integer secara tepat