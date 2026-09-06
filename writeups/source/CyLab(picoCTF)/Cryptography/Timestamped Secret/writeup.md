# picoCTF — timestamp Write-Up

| Field | Detail |
|---|---|
| **Challenge Name** | timestamp |
| **Category** | Cryptography |
| **Difficulty** | Medium |

---

## Deskripsi

> *"Someone encrypted a message using AES in ECB mode but they weren't very careful with their key. Turns out it's derived from something as simple as the current time! Can you uncover the key and decrypt the flag?"*

---

## File yang Diberikan

| File | Isi |
|---|---|
| `message.txt` | Ciphertext dalam format hex beserta hint waktu enkripsi |
| `encryption.py` | Source code (sebagian disembunyikan) yang menunjukkan cara enkripsi dilakukan |

---

## Analisis

### Kerentanan: Prediktabilitas Kunci (Key Generation)

Melihat `encryption.py`, kunci AES di-generate langsung dari waktu sistem saat itu:

```python
timestamp = int(time.time())
key = sha256(str(timestamp).encode()).digest()[:16]
cipher = AES.new(key, AES.MODE_ECB)
```

Alih-alih menggunakan CSPRNG (seperti `os.urandom`), skrip ini menggunakan `time.time()` — yang **sangat mudah diprediksi**.

### Hint dari `message.txt`

```
Hint: The encryption was done around 1770242615 UTC
Ciphertext (hex): 24823b2b2d104b36ad2078cafc8d98f22488e78df83b29f507d9b910ad51a464
```

Kata **"around"** menandakan bahwa waktu eksekusi yang sesungguhnya mungkin beberapa detik sebelum atau sesudah `1770242615`.

---

## Solusi

### Metode: Brute-Force Timestamp

Karena jendela waktu sangat kecil, kita cukup mengiterasi timestamp di sekitar nilai hint (±100 detik), me-generate kunci untuk setiap detik, lalu mencoba mendekripsi ciphertext.

```python
from hashlib import sha256
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

def solve_timestamp():
    """Brute-force the timestamp challenge"""

    # Data from message.txt
    hint_timestamp = 1770242615
    ciphertext_hex = "24823b2b2d104b36ad2078cafc8d98f22488e78df83b29f507d9b910ad51a464"
    ciphertext = bytes.fromhex(ciphertext_hex)

    print("[*] Starting timestamp brute-force...")

    # Search a window of +/- 100 seconds around the hint
    for offset in range(-100, 100):
        timestamp = hint_timestamp + offset

        # 1. Recreate the key using the exact logic from encryption.py
        key = sha256(str(timestamp).encode()).digest()[:16]

        # 2. Setup the AES cipher in ECB mode
        cipher = AES.new(key, AES.MODE_ECB)

        try:
            # 3. Decrypt and remove the padding
            decrypted = cipher.decrypt(ciphertext)
            plaintext = unpad(decrypted, AES.block_size)

            # 4. Check if the decrypted text looks like our flag
            if b"picoCTF{" in plaintext:
                print(f"\n✓ Found correct timestamp: {timestamp}")
                return plaintext.decode('utf-8')

        except ValueError:
            # If the key is wrong, unpad() raises a ValueError (invalid padding)
            continue

    return "Flag not found in the given window."

# Usage
flag = solve_timestamp()
print(f"Final Flag: {flag}")
```

### Alur Dekripsi

```
Hint Timestamp : 1770242615
        ↓
Test offset -100 → ValueError (padding tidak valid)
Test offset  -99 → ValueError (padding tidak valid)
        ...
        ↓
Test offset +3 (Timestamp: 1770242618) → BERHASIL ✓
        ↓
Derived Key: sha256("1770242618").digest()[:16]
        ↓
AES-ECB Decrypt + Unpad → picoCTF{...}
```

---

## Flag

```
picoCTF{sa3S_sEc9t_fbbd0fb7}
```

---

## Key Takeaways

1. **Insecure Randomness** — Menggunakan `time.time()` atau seed yang dapat diprediksi untuk key generation merusak seluruh sistem enkripsi, meskipun algoritmanya sendiri (AES) secara komputasional aman.

2. **Small Keyspace** — Karena "kunci" direduksi menjadi beberapa ratus kemungkinan detik, brute-force menjadi sangat mudah.

3. **Padding sebagai Oracle** — Dalam scripting, `unpad()` bertindak sebagai filter yang sangat efisien. Kunci yang salah menghasilkan byte acak, menyebabkan validasi padding gagal, sehingga kita bisa dengan efisien melewati tebakan yang salah menggunakan blok `try-except`.

4. **Standar Kriptografi** — Selalu gunakan **CSPRNG** (*Cryptographically Secure Pseudo-Random Number Generator*) seperti `os.urandom` atau modul `secrets` untuk generate kunci kriptografis.

---

## Tools yang Digunakan

- **Python** — `hashlib`, `pycryptodome` (untuk dekripsi AES dan padding)