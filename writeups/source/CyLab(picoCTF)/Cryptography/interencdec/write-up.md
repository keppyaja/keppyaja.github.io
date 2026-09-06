# picoCTF - interencdec Write-Up

## Challenge Overview

- **Challenge Name**: interencdec
- **Category**: Cryptography
- **Difficulty**: Easy
- **Description**: Decrypt a file with multiple layers of encryption to find the real meaning/flag

## Challenge Details

We are given an encrypted file (`enc_flag`) containing a string with multiple layers of encryption that need to be unpeeled one by one.

## Analysis

The encrypted content requires decryption through multiple stages:
1. **Base64 Decode** (Layer 1)
2. **Base64 Decode** (Layer 2)
3. **Caesar Cipher Decryption** (Layer 3)

### Layer 1: Initial Base64 Encoding

The original file contains a Base64-encoded string that decodes to:
```
b'd3BqdkpBTXtqaGx6aHlfazNqeTl3YTNrX2kyMDRoa2o2fQ=='
```

### Layer 2: Nested Base64 Encoding

After removing the `b'...'` wrapper and decoding the second Base64 string, we get:
```
wpjvJAM{jhlzhy_k3jy9wa3k_i204hkj6}
```

### Layer 3: Caesar Cipher

The final layer uses Caesar Cipher encryption with a shift of 7.

**How to determine the shift:**
- Looking at the encrypted text: `wpjvJAM{...}`
- The flag format should be: `picoCTF{...}`
- Comparing `w` → `p` and `p` → `i`, we can calculate the shift
- Distance from `w` to `p` (backwards) = 7 shifts

## Solution Methods

### Method 1: CyberChef (Easiest)

Use the online tool [CyberChef](https://gchq.github.io/CyberChef/):

1. Go to CyberChef
2. Paste the encrypted content
3. Add "From Base64" operation (repeat twice for both layers)
4. Add "Caesar Cipher Brute Force" operation
5. Adjust shift value to 7 or let it auto-detect
6. Read the decrypted output

### Method 2: Python Script

```python
import base64

def decode_interencdec(encrypted_file):
    """Decrypt the interencdec challenge"""
    
    # Read the encrypted file
    with open(encrypted_file, 'r') as f:
        content = f.read().strip()
    
    # Layer 1: First Base64 decode
    try:
        layer1 = base64.b64decode(content).decode('utf-8')
        print(f"After Layer 1 (Base64): {layer1}")
    except Exception as e:
        print(f"Error in Layer 1: {e}")
        return None
    
    # Layer 2: Second Base64 decode (remove b'...' wrapper if present)
    try:
        # Remove the b'...' wrapper if it exists
        if layer1.startswith("b'") and layer1.endswith("'"):
            layer1 = layer1[2:-1]
        
        layer2 = base64.b64decode(layer1).decode('utf-8')
        print(f"After Layer 2 (Base64): {layer2}")
    except Exception as e:
        print(f"Error in Layer 2: {e}")
        return None
    
    # Layer 3: Caesar Cipher with shift 19
    def caesar_decrypt(text, shift):
        result = ""
        for char in text:
            if char.isalpha():
                if char.isupper():
                    result += chr((ord(char) - ord('A') - shift) % 26 + ord('A'))
                else:
                    result += chr((ord(char) - ord('a') - shift) % 26 + ord('a'))
            else:
                result += char
        return result
    
    # Try all shifts (brute force)
    print("\nTrying all Caesar Cipher shifts:")
    for shift in range(26):
        decrypted = caesar_decrypt(layer2, shift)
        print(f"Shift {shift}: {decrypted}")
        if "picoCTF" in decrypted:
            print(f"\n✓ Found flag with shift {shift}!")
            return decrypted
    
    return None

# Usage
flag = decode_interencdec('enc_flag')
print(f"\nFinal Flag: {flag}")
```

### Method 3: Bash/Linux

```bash
# Layer 1: First Base64 decode
cat enc_flag | base64 -d > layer1.txt

# Layer 2: Second Base64 decode
cat layer1.txt | tail -c +3 | head -c -2 | base64 -d > layer2.txt

# Layer 3: Caesar Cipher (shift 19)
# Using ROT13 variant with custom shift
cat layer2.txt | tr 'a-z' 'd-za-c' | tr 'A-Z' 'D-ZA-C'
```

### Method 4: Manual Caesar Brute-Force

Use online Caesar cipher tools:
- [dcode.fr/caesar-cipher](https://www.dcode.fr/caesar-cipher)
- Paste the Base64-decoded text
- Try all 26 rotations or let it brute-force automatically

## Decryption Process Example

```
Encrypted (Base64 Layer 1): SGVsbG8gV29ybGQh...
↓
After Base64 Decode 1: d3BqdkpBTXtqaGx6aHlfazNqeTl3YTNrX2kyMDRoa2o2fQ==
↓
After Base64 Decode 2: wpjvJAM{jhlzhy_k3jy9wa3k_i204hkj6}
↓
After Caesar (shift 7): picoCTF{caesar_d3cr9pt3d_b204adc6}
```

## Flag

```
picoCTF{caesar_d3cr9pt3d_b204adc6}
```

## Key Takeaways

1. **Layered Encryption**: This challenge demonstrates multiple encryption layers working together
2. **Base64 Encoding**: Not encryption but encoding - often used to wrap data in text format
3. **Multiple Decryption Methods**: Different tools and languages can solve the same problem
4. **Brute Force for Simple Ciphers**: Caesar cipher has only 26 possibilities, making brute-force trivial
5. **Pattern Recognition**: Looking for the flag format (picoCTF{...}) helps identify the correct decryption
6. **Tool Usage**: CyberChef is excellent for layered encoding/decoding challenges

## Tools Used

- **CyberChef**: https://gchq.github.io/CyberChef/
- **dcode.fr**: https://www.dcode.fr/caesar-cipher
- **Python**: base64, string manipulation
- **Linux**: base64, tr commands

---

*Write-up based on: https://sukepaja18.medium.com/picoctf-interencdec-4a1a4cb3439e*
