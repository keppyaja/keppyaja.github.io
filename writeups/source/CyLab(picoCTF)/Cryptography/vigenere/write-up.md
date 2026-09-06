# picoCTF - Vigenere Write-Up

## Challenge Overview

- **Challenge Name**: Vigenere
- **Category**: Cryptography
- **Difficulty**: Medium
- **Description**: Decrypt an encrypted message using the Vigenere cipher with a provided key
- **Key**: "CYLAB"

## Challenge Details

We are given:
1. An encrypted message: `rgnoDVD{O0NU_WQ3_G1G3O3T3_A1AH3S_f85729e7}`
2. A decryption key: `CYLAB`

## Vigenere Cipher Overview

The **Vigenere Cipher** is a polyalphabetic substitution cipher that extends the Caesar Cipher by using a variable shift instead of a fixed one.

### Key Differences from Caesar Cipher

- **Caesar Cipher**: Fixed shift value (e.g., always shift by 3)
- **Vigenere Cipher**: Shift value changes based on each character of the key, repeated cyclically

### How Vigenere Cipher Works

**Encryption:**
```
Plaintext:  HELLO
Key:        CYLAB (repeated: CYLAB)
Ciphertext: HSJGP

Process:
H + C(shift 2) = J
E + Y(shift 24) = C
L + L(shift 11) = W
L + A(shift 0) = L
O + B(shift 1) = P
```

**Decryption:**
```
Ciphertext: HSJGP
Key:        CYLAB
Plaintext:  HELLO

Process:
H - C(shift 2) = F
S - Y(shift 24) = A
J - L(shift 11) = Y
G - A(shift 0) = G
P - B(shift 1) = O
```

## Solution

### C++ Implementation

```cpp
#include <iostream>
#include <string>
#include <cctype>

using namespace std;

int charToInt(char c) {
    return toupper(c) - 'A';
}

char intToChar(int n, bool isUpper) {
    return (isUpper ? 'A' : 'a') + n;
}

string vigenereDecode(string ciphertext, string key) {
    string plaintext = "";
    int keyLen = key.size();
    int keyIndex = 0;
    
    for (char c : ciphertext) {
        if (isalpha(c)) {
            // Get integer values
            int cVal = charToInt(c);
            int kVal = charToInt(key[keyIndex % keyLen]);
            
            // Decrypt: subtract key value, mod 26 to stay in range
            int pVal = (cVal - kVal + 26) % 26;
            
            // Convert back to character, preserving case
            plaintext += intToChar(pVal, isupper(c));
            
            // Move to next key character (only for letters)
            keyIndex++;
        } else {
            // Keep non-alphabetic characters as-is
            plaintext += c;
        }
    }
    
    return plaintext;
}

int main() {
    string ciphertext = "rgnoDVD{O0NU_WQ3_G1G3O3T3_A1AH3S_f85729e7}";
    string key = "CYLAB";
    
    string plaintext = vigenereDecode(ciphertext, key);
    cout << "Decrypted: " << plaintext << endl;
    
    return 0;
}
```

### Python Implementation

```python
def vigenere_decode(ciphertext, key):
    """Decrypt a Vigenere cipher"""
    plaintext = ""
    key_len = len(key)
    key_index = 0
    
    for char in ciphertext:
        if char.isalpha():
            # Get character values (0-25)
            c_val = ord(char.upper()) - ord('A')
            k_val = ord(key[key_index % key_len].upper()) - ord('A')
            
            # Decrypt: subtract key value
            p_val = (c_val - k_val) % 26
            
            # Convert back, preserving case
            if char.isupper():
                plaintext += chr(p_val + ord('A'))
            else:
                plaintext += chr(p_val + ord('a'))
            
            # Move to next key character
            key_index += 1
        else:
            # Keep non-alphabetic characters
            plaintext += char
    
    return plaintext

# Decrypt the message
ciphertext = "rgnoDVD{O0NU_WQ3_G1G3O3T3_A1AH3S_f85729e7}"
key = "CYLAB"

plaintext = vigenere_decode(ciphertext, key)
print(f"Decrypted: {plaintext}")
```

### Online Tool

You can also use online Vigenere cipher decoders:
- [dcode.fr/vigenere-cipher](https://www.dcode.fr/vigenere-cipher)
- Paste the ciphertext and provide the key "CYLAB"

## Flag

```
picoCTF{D0NT_US3_V1G3N3R3_C1PH3R_d85729g7}
```

## Key Takeaways

1. **Vigenere Cipher is polyalphabetic**: Uses multiple Caesar shifts based on a key
2. **Key-based security**: The strength depends on key length and randomness
3. **Cyclic key repetition**: The key repeats cyclically over the plaintext
4. **Non-alphabetic characters**: Usually remain unchanged in classic Vigenere
5. **Decryption is inverse**: Subtract the key value instead of adding it
6. **Important**: Despite its name, "don't use Vigenere Cipher" for actual security - it's vulnerable to frequency analysis and cryptanalysis

## Algorithm Complexity

- **Time Complexity**: O(n) where n is the length of ciphertext
- **Space Complexity**: O(n) for storing the result

---

*Write-up based on: https://sukepaja18.medium.com/picoctf-vigenere-7d8dc62cd0d9*
