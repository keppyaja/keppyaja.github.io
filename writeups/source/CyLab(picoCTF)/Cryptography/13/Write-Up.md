# picoCTF - 13 Challenge Write-Up

## Challenge Information

**Challenge Name:** 13  
**Category:** Cryptography  
**Difficulty:** Easy  
**Source:** https://sukepaja18.medium.com/picoctf-13-1ca39bcb98c5

## Challenge Description

The challenge presents an encrypted string and mentions ROT13:

```
cvpbPGS{abg_gbb_onq_bs_n_ceboyrz}
```

Like the MOD 26 challenge, this is another ROT13 encryption problem.

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

To decrypt the flag, we need to apply ROT13 decryption to the given ciphertext.

### Method 1: Online Tools (Recommended)
Use [CyberChef](https://gchq.github.io/CyberChef/):

1. Navigate to CyberChef
2. Paste the encrypted string: `cvpbPGS{abg_gbb_onq_bs_n_ceboyrz}`
3. Search for and select the "ROT13" recipe
4. The decrypted output will appear instantly

### Method 2: Manual Decryption with Python

Using the `codecs` module:

```python
import codecs

ciphertext = "cvpbPGS{abg_gbb_onq_bs_n_ceboyrz}"
plaintext = codecs.encode(ciphertext, 'rot_13')
print(plaintext)
```

Or implementing the algorithm manually:

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

ciphertext = "cvpbPGS{abg_gbb_onq_bs_n_ceboyrz}"
print(rot13_decrypt(ciphertext))
```

## Flag

After applying ROT13 decryption:

```
picoCTF{not_too_bad_of_a_problem}
```

## Key Takeaways

1. **ROT13 is symmetric** - applying it twice returns the original text
2. **Simple substitution ciphers are weak** - only 25 possible shifts to brute force
3. **Hints are crucial** - the challenge description explicitly mentions ROT13
4. **Reuse your tools** - once you understand one ROT13 problem, others become trivial
5. **Challenge naming** - the challenge number "13" is a hint to the shift value used in ROT13
