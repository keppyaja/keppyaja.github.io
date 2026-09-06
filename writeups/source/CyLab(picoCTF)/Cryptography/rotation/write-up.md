# picoCTF - Rotation Write-Up

## Challenge Overview

- **Challenge Name**: rotation
- **Category**: Cryptography
- **Difficulty**: Medium
- **Description**: Decrypt an encrypted file to find the flag
- **Hint**: "Sometimes rotation is right"

## Challenge Details

We are given an encrypted text file (`encrypted.txt`) containing the encrypted flag. Based on the challenge title and hint, we need to identify and decrypt the encryption method.

## Analysis

The hint "Sometimes rotation is right" and the challenge name "rotation" indicate that this is a **Caesar Cipher** encryption. The Caesar Cipher is one of the simplest and most well-known encryption techniques, where each letter in the plaintext is shifted a certain number of places down or up the alphabet.

### Caesar Cipher Overview

- **Encryption**: Each character is shifted by a fixed number of positions (the key)
- **Decryption**: Shift back by the same number of positions
- **Example**: With shift of 3: A→D, B→E, C→F, etc.

## Solution Approaches

### Method 1: Online Tool (Easiest)

Use an online Caesar Cipher decoder like [dcode.fr/caesar-cipher](https://www.dcode.fr/caesar-cipher):

1. Copy the encrypted text from `encrypted.txt`
2. Visit dcode.fr/caesar-cipher
3. Paste the encrypted text
4. The tool will automatically try all 26 possible rotations
5. Look for readable output - one rotation should reveal the flag

### Method 2: Brute-Force Python Script

If you prefer to write your own solution:

```python
def caesar_decrypt_bruteforce(encrypted_text):
    """Try all 26 possible Caesar Cipher rotations"""
    results = []
    
    for shift in range(26):
        decrypted = ""
        for char in encrypted_text:
            if char.isalpha():
                # Shift character
                if char.isupper():
                    decrypted += chr((ord(char) - ord('A') - shift) % 26 + ord('A'))
                else:
                    decrypted += chr((ord(char) - ord('a') - shift) % 26 + ord('a'))
            else:
                # Keep non-alphabetic characters as-is
                decrypted += char
        
        results.append((shift, decrypted))
    
    return results

# Read encrypted file
with open('encrypted.txt', 'r') as f:
    encrypted_text = f.read().strip()

# Brute-force all rotations
results = caesar_decrypt_bruteforce(encrypted_text)

# Display all results
for shift, decrypted_text in results:
    print(f"Shift {shift}: {decrypted_text}")
```

### Method 3: C++ Implementation

As mentioned in the original writeup, a C++ solution is also possible:

```cpp
#include <iostream>
#include <fstream>
#include <string>
#include <cctype>

using namespace std;

string caesarDecrypt(string text, int shift) {
    string result = "";
    for (char c : text) {
        if (isalpha(c)) {
            char base = isupper(c) ? 'A' : 'a';
            result += (char)((c - base - shift + 26) % 26 + base);
        } else {
            result += c;
        }
    }
    return result;
}

int main() {
    ifstream file("encrypted.txt");
    string encrypted;
    getline(file, encrypted);
    
    for (int shift = 0; shift < 26; shift++) {
        cout << "Shift " << shift << ": " << caesarDecrypt(encrypted, shift) << endl;
    }
    
    return 0;
}
```

## Flag

```
picoCTF{r0tat1on_d3crypt3d_a4b7d759}
```

## Key Takeaways

1. **Caesar Cipher is weak**: With only 26 possible keys, brute-force is trivial
2. **Hints matter**: The hint "Sometimes rotation is right" directly points to the Caesar Cipher technique
3. **Multiple solution methods**: Online tools, Python, C++, or any language can solve this
4. **Automation over manual testing**: Brute-forcing all possibilities is faster than manual trial
5. **CTF context clues**: Challenge titles and hints often reveal the encryption technique

## References

- Caesar Cipher: https://en.wikipedia.org/wiki/Caesar_cipher
- dcode.fr/caesar-cipher: https://www.dcode.fr/caesar-cipher
- picoCTF Challenge: https://artifacts.picoctf.net/c/389/encrypted.txt

---

*Write-up based on: https://sukepaja18.medium.com/picoctf-rotation-28228eaea94a*
