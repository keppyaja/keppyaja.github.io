# picoCTF - Mod 26 Challenge Write-Up

## Challenge Information

**Challenge Name:** Mod 26  
**Category:** Cryptography  
**Difficulty:** Easy  
**Source:** https://sukepaja18.medium.com/picoctf-mod-26-5a1037512753

## Challenge Description

The challenge provides a cryptic string that appears to be encrypted:

```
cvpbPGS{arkg_gvzr_V'yy_gel_2_ebhaqf_bs_ebg13_jdJBFOXJ}
```

The hint mentions ROT13, which is a classic Caesar Cipher encryption technique.

## Understanding ROT13

ROT13 is a simple substitution cipher that rotates each letter by 13 positions in the alphabet. It's a form of the Caesar Cipher and has the following characteristics:

- **Encryption Formula:** `(c + 13) % 26`
- **Decryption Formula:** `(c - 13) % 26`

Where `c` represents the ASCII/position value of the character to be transformed.

Key points:
- It works on letters (both uppercase and lowercase)
- Numbers and special characters typically remain unchanged
- Applying ROT13 twice returns the original text (since 13 + 13 = 26)

## Solution

To decrypt the flag, we need to apply the ROT13 decryption to the given ciphertext.

### Method 1: Online Tools
The simplest approach is to use an online tool like [CyberChef](https://gchq.github.io/CyberChef/):

1. Navigate to CyberChef
2. Paste the encrypted string: `cvpbPGS{arkg_gvzr_V'yy_gel_2_ebhaqf_bs_ebg13_jdJBFOXJ}`
3. Search for and select the "ROT13" recipe
4. The decrypted output will appear instantly

### Method 2: Manual Decryption
If implementing manually in Python:

```python
import codecs

ciphertext = "cvpbPGS{arkg_gvzr_V'yy_gel_2_ebhaqf_bs_ebg13_jdJBFOXJ}"
plaintext = codecs.encode(ciphertext, 'rot_13')
print(plaintext)
```

Or using a simple loop:

```python
def rot13_decrypt(text):
    result = ""
    for char in text:
        if 'a' <= char <= 'z':
            result += chr((ord(char) - ord('a') + 13) % 26 + ord('a'))
        elif 'A' <= char <= 'Z':
            result += chr((ord(char) - ord('A') + 13) % 26 + ord('A'))
        else:
            result += char
    return result

ciphertext = "cvpbPGS{arkg_gvzr_V'yy_gel_2_ebhaqf_bs_ebg13_jdJBFOXJ}"
print(rot13_decrypt(ciphertext))
```

## Flag

After applying ROT13 decryption:

```
picoCTF{next_time_I'll_try_2_rounds_of_rot13_wqWOSBKW}
```

## Key Takeaways

1. **ROT13 is a symmetric cipher** - applying it twice returns the original text
2. **Caesar Cipher weakness** - simple substitution ciphers are vulnerable to brute force (only 25 possible shifts)
3. **The flag itself is humorous** - it suggests the creator considered using ROT13 twice for "security" (which wouldn't help since 2 × 13 = 26)
4. **Always look for hints** - the challenge description mentions ROT13, which is the key to solving it

