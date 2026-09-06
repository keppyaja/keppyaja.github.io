# picoCTF - Custom Encryption Write-Up

## Challenge Overview

- **Challenge Name**: Custom Encryption
- **Category**: Cryptography
- **Difficulty**: Medium
- **Description**: Analyze a custom encryption implementation and write a decryption function to decode the encrypted flag.

## Challenge Details

We are given two files:
1. `custom_encryption.py` - The source code containing encryption functions
2. `enc_flag` - The encrypted flag

## Analysis of Encryption Functions

### 1. Generator Function
```python
def generator(g, x, p):
    return pow(g, x) % p
```
Uses modular exponentiation, similar to the Diffie-Hellman key exchange protocol.

### 2. Encrypt Function
```python
def encrypt(plaintext, key):
    cipher = []
    for char in plaintext:
        cipher.append((ord(char) * key * 311))
    return cipher
```
- Multiplies each character's ASCII value by the key and 311
- Returns a list of encrypted values

### 3. Is_Prime Function
```python
def is_prime(p):
    v = 0
    for i in range(2, p + 1):
        if p % i == 0:
            v = v + 1
    if v > 1:
        return False
    else:
        return True
```
Validates whether a number `p` is prime.

### 4. Dynamic XOR Encrypt
```python
def dynamic_xor_encrypt(plaintext, text_key):
    cipher_text = ""
    key_length = len(text_key)
    for i, char in enumerate(plaintext[::-1]):
        key_char = text_key[i % key_length]
        encrypted_char = chr(ord(char) ^ ord(key_char))
        cipher_text += encrypted_char
    return cipher_text
```
- XOR encryption using Vigenere-style key
- Processes the plaintext in reverse order
- Uses modulo wrapping for the key

## Solution

### Decryption Strategy

To decrypt, we need to reverse each encryption operation:

### 1. Mathematical Decrypt Function
```python
def decrypt_mathematical(cipher_value, key):
    """Reverse the operation: cipher = ord(char) * key * 311"""
    if cipher_value == 0:
        return chr(0)  # Null character
    
    # cipher_value = ord(char) * key * 311
    # ord(char) = cipher_value / (key * 311)
    original_ord = cipher_value // (key * 311)
    
    # Validate exact division
    if cipher_value % (key * 311) == 0 and 0 <= original_ord <= 127:
        return chr(original_ord)
    else:
        return None
```

### 2. Dynamic XOR Decrypt Function
```python
def dynamic_xor_decrypt(cipher_text, text_key):
    """Reverse the XOR encryption"""
    plaintext = ""
    key_length = len(text_key)
    
    for i, char in enumerate(cipher_text):
        key_char = text_key[i % key_length]
        decrypted_char = chr(ord(char) ^ ord(key_char))
        plaintext += decrypted_char
    
    return plaintext
```

### Complete Solver Script

```python
def generator(g, x, p):
    return pow(g, x) % p

def decrypt_mathematical(cipher_value, key):
    """Reverse the encrypt operation"""
    if cipher_value == 0:
        return chr(0)
    
    original_ord = cipher_value // (key * 311)
    
    if cipher_value % (key * 311) == 0 and 0 <= original_ord <= 127:
        return chr(original_ord)
    else:
        return None

def dynamic_xor_decrypt(cipher_text, text_key):
    """Reverse XOR encryption"""
    plaintext = ""
    key_length = len(text_key)
    
    for i, char in enumerate(cipher_text):
        key_char = text_key[i % key_length]
        decrypted_char = chr(ord(char) ^ ord(key_char))
        plaintext += decrypted_char
    
    return plaintext

# Load and decrypt the flag
# ... (load enc_flag and apply decryption functions)
```

## Flag

```
picoCTF{custom_d2cr0pt6d_8b41f976}
```

## Key Takeaways

1. **Understand the encryption**: Carefully analyze each encryption function to determine how to reverse it
2. **Mathematical operations are reversible**: Division reverses multiplication
3. **XOR is symmetric**: XORing with the same key twice returns the original value
4. **Vigenere-style encryption**: Using a repeating key with modulo arithmetic
5. **Validation is important**: Check that decrypted values are valid (ASCII ranges, exact division)

---

*Write-up based on: https://sukepaja18.medium.com/picoctf-custom-encryption-8dd7e705bdff*
