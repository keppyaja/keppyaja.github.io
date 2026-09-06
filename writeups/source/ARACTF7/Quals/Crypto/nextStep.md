# Write-Up: next step

**Kategori:** Cryptography
**Poin:** 100
**Author:** hyall

---

## Observasi Awal
Tantangan ini mengharuskan kita untuk melakukan koneksi ke *server* menggunakan perintah `nc chall-ctf.ara-its.id 7969`. Berdasarkan skrip Python yang diberikan pada lampiran, terdapat dua opsi utama:
* Jika memilih Opsi 2, *server* akan memberikan nilai IV (*Initialization Vector*) dan CT (*Ciphertext*). CT tersebut merupakan hasil operasi XOR dan pemanggilan fungsi `stream_encrypt`.
* Jika memilih Opsi 1, kita diizinkan untuk melakukan tes atau mencoba enkripsi dengan memberikan masukan IV dan *message* secara manual.

## Solusi dan Analisis
Karena enkripsi ini memanfaatkan operasi XOR, kita dapat memanfaatkan input berupa 16 *bytes* bernilai 0 (`00000000000000000000000000000000`) untuk secara langsung mendapatkan nilai `AES(Key, IV)` (atau *Keystream*).

Berikut adalah langkah-langkah eksploitasinya:
1.  **Ambil Data Flag:** Pilih Opsi 2 untuk mendapatkan `initial_IV` dan `full_ciphertext`.
2.  **Identifikasi Blok IV:** * IV untuk blok pertama dari *flag* adalah `initial_IV`.
    * IV untuk blok kedua dari *flag* adalah hasil *ciphertext* dari blok pertama (CT_1).
    * IV untuk blok ketiga adalah CT_2, dan begitu seterusnya.
3.  **Minta Keystream ke Server:** * Pergi ke Opsi 1, lalu masukkan IV blok pertama dan pesan berisi angka nol (`00...00`). Simpan hasilnya sebagai `Keystream_1`.
    * Ulangi langkah ini dengan memasukkan `CT_1` sebagai IV untuk mendapatkan `Keystream_2`, dan seterusnya.
4.  **Dekripsi Manual:** * Lakukan operasi XOR antara `CT_1` dengan `Keystream_1` untuk mendapatkan teks asli blok pertama.
    * Lakukan XOR antara `CT_2` dengan `Keystream_2` untuk mendapatkan teks asli blok kedua.
5.  **Gabungkan:** Satukan seluruh potongan teks hasil dekripsi tersebut untuk menyusun *flag* secara utuh.

## Solver Script
```python
from pwn import *

#Helper to XOR two byte strings
def xor(a, b):
    return bytes (x^y for x, y in zip(a, b))

def solve():
    r = remote('chall-ctf.ara-its.id', 7969)
    r.sendlineafter (b">> ", b"2")
    r.recvuntil(b"IV: ")
    initial_iv = bytes.fromhex(r.recvline().strip().decode())
    r.recvuntil(b"CT: ")
    full_ct = bytes.fromhex(r.recvline().strip().decode())
    
    ct_blocks = [full_ct[i:i+16] for i in range(0, len (full_ct), 16)]
    flag_blocks = []
    current_iv = initial_iv
    
    for ct_block in ct_blocks:
        r.sendlineafter(b">> ", b"1")
        r.sendlineafter (b"IV (hex): ", current_iv.hex().encode())
        r.sendlineafter (b"Msg (hex): ", ("00" * 16).encode())
        r.recvuntil(b"CT: ")
        keystream = bytes.fromhex(r.recvline().strip().decode())
        
        pt_block = xor(ct_block, keystream)
        flag_blocks.append(pt_block)
        current_iv = ct_block
        
    full_flag = b"".join(flag_blocks)
    print (f"Decrypted Flag: {full_flag.decode(errors='ignore')}")
    r.close()

if __name__ == '__main__':
    solve()
```

## Flag
`ARA7{a9055fb26edf78ccd6368858b118ff29de264480b211d2812ff111c49d7080aa}`