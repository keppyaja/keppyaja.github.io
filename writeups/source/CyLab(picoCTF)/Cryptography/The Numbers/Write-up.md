# picoCTF - The Numbers Challenge Write-Up

## Challenge Information

**Challenge Name:** The Numbers  
**Category:** Cryptography  
**Difficulty:** Easy  
**Source:** https://sukepaja18.medium.com/picoctf-the-numbers-b402fbcc43f6

## Challenge Description

The challenge provides a mysterious hint: "The numbers… what do they mean?"

A PNG file is provided containing a series of numbers that need to be decoded.

## Understanding Letter Number Code

Letter Number Code is a simple substitution cipher where each letter is replaced by its position in the alphabet:

- A = 1
- B = 2
- C = 3
- ... and so on
- Z = 26

This is also known as **A1Z26 encoding** or **Alphanumeric Code**.

### Key Characteristics:
- Numbers directly correspond to letter positions (1-26)
- Spaces or separators between numbers indicate letter boundaries
- Case typically doesn't matter (can be uppercase or lowercase)
- Non-alphabetic characters are generally not encoded

## Solution

The cipher text from the image is a sequence of numbers that represent letters in alphabetical order.

### Method 1: Manual Decryption
Decode each number to its corresponding letter:

```
20 8 5 = T H E
14 21 13 2 5 18 19 = N U M B E R S
13 1 19 15 14 = M A S O N
```

### Method 2: Python Script

```python
def decode_letter_number(cipher_text):
    """
    Decode Letter Number Code (A1Z26)
    Input: numbers separated by spaces
    Output: decoded message
    """
    numbers = cipher_text.split()
    result = ""
    
    for num in numbers:
        num = int(num)
        if 1 <= num <= 26:
            result += chr(ord('A') + num - 1)
    
    return result

# Example
cipher = "20 8 5 14 21 13 2 5 18 19 13 1 19 15 14"
plaintext = decode_letter_number(cipher)
print(plaintext)  # Output: THENUMBERSMASON
```

### Method 3: Online Tools
Use [CyberChef](https://gchq.github.io/CyberChef/):

1. Navigate to CyberChef
2. Paste the number sequence
3. Search for and apply the "From A1Z26" recipe
4. The decoded message will appear instantly

## Decrypted Message

After decoding the numbers:

```
PICOCTFTHENUMBERSMASON
```

Breaking it down:
- PICOCTF (the flag format)
- THENUMBERSMASON (the decoded message)

## Flag

```
PICOCTF{THENUMBERSMASON}
```

## Key Takeaways

1. **Simple substitution ciphers** - Letter Number Code is one of the most basic encryption methods
2. **Recognize patterns** - Numbers in sequences often indicate Letter Number Code
3. **Alphabet position mapping** - Understanding the A-Z to 1-26 mapping is essential
4. **Challenge hints** - The title "The Numbers" is a direct hint to what you're dealing with
5. **Cryptanalysis** - Even without knowing the cipher type beforehand, frequency analysis or trial-and-error with common cipher types can reveal the solution

## Related Challenges

- ROT13 ciphers (like MOD 26 and 13)
- Caesar Cipher
- Other simple substitution ciphers
