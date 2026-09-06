# picoCTF - Flag Hunters Write-Up

## Challenge Information
| Attribute | Detail |
|---|---|
|Challenge Name|Flag Hunters|
|Category|Reverse Engineering|
|Difficulty|Easy|
|Points|75|
|Source|`lyric-reader.py`|

## Challenge Description

Lyrics jump from verses to the refrain kind of like a subroutine call. There's a hidden refrain this program doesn't print by default. Can you get it to print it? There might be something in it for you.

## Understanding the Program

`reader()` treats the song as a flat array of lines (`song_lines`) with an
instruction pointer `lip`. Each pass through the main loop takes
`song_lines[lip]`, **splits it on `;`**, and processes each resulting token:

- `REFRAIN` → saves a return address into the line at `refrain_return`
  (formatted as `RETURN <lip+1>`), then jumps `lip` to the `[REFRAIN]` label.
  This is a classic call instruction.
- `RETURN N` (matched with `re.match(r"RETURN [0-9]+", line)`) → sets
  `lip = N`. This is an unchecked, attacker-reachable jump.
- `CROWD...` → calls `input()`, then **overwrites `song_lines[lip]`** with
  `'Crowd: ' + crowd`, using no filtering at all.
- Anything else → printed as a lyric, `lip` advances by one.

The dangerous combination is:

1. `CROWD` writes raw, unsanitized user input directly back into the
   program's own instruction array.
2. The refrain is called **multiple times** over the course of the song
   (once after every verse), so the line that `CROWD` overwrote gets
   *re-executed* — and re-split on `;` — the next time the refrain runs.
3. Because the split happens on the *current* content of the line, any `;`
   we put in our input turns our answer into new "instructions" that the
   interpreter will happily execute, including an unchecked `RETURN N`
   jump.

In short: the `CROWD` prompt is a self-modifying-code injection point. Input
containing `;RETURN 0` gets stored, and the next time the refrain plays,
the interpreter parses it as two instructions — print `Crowd: `, then jump
straight to line 0, the very first line of the song (the hidden
`secret_intro` containing the flag).

## Solution

### Step 1 — Connect to the challenge

```
nc verbal-sleep.picoctf.net 61812
```

### Step 2 — Let it play until the first `Crowd:` prompt

The program prints the first verse and the refrain, then pauses waiting for
crowd participation:

```
...
We're chasing that victory, and we'll never quit.
Crowd:
```

### Step 3 — Send the injection payload

Instead of singing along, submit:

```
;RETURN 0
```

This does nothing visible immediately (the CROWD instruction just gets
overwritten to `Crowd: ;RETURN 0` and execution returns normally to the next
verse) — this is expected. The payload doesn't fire until the **next** time
`REFRAIN` is called.

### Step 4 — Let the song continue

When the second verse finishes and calls `REFRAIN;` again, the interpreter
re-plays the refrain and re-reaches the now-modified line. It splits it on
`;`, prints the harmless `Crowd: ` token, then hits `RETURN 0` and jumps the
instruction pointer to line 0 — the start of the hidden `secret_intro` —
printing:

```
Pico warriors rising, puzzles laid bare,
Solving each challenge with precision and flair.
With unity and skill, flags we deliver,
The ether's ours to conquer, picoCTF{...}
```

I verified this control-flow hijack end-to-end against a local copy of the
script (with a placeholder flag) before running it against the real
instance, confirming that a single `;RETURN 0` answer at the first `Crowd:`
prompt is sufficient — no second input is ever requested, since the
overwritten line no longer matches the `CROWD` pattern on replay.

## Flag

```
picoCTF{70637h3r_f0r3v3r_a5202532}
```

## Key Takeaways

1. **Never trust unsanitized input, especially when it's written back into
   code/data that will be re-parsed** — this challenge is a miniature,
   readable example of the same class of bug as SQL injection or template
   injection: user data crossing into the "code" channel.
2. **Self-modifying interpreters are dangerous** — overwriting
   `song_lines[lip]` with raw input turned a harmless "singalong" prompt
   into an arbitrary jump primitive the moment the same line was executed
   twice.
3. **Delimiters are attack surface** — the `;` splitting logic meant to
   separate lyric commands became the injection vector once user input
   could introduce its own `;` characters.
4. **Read the whole program, not just the entry point** — the flag lived in
   `secret_intro`, before the declared `startLabel`. Static analysis of the
   full script (not just the printed output) revealed data the "front door"
   execution path never exposes.
5. **Undefined states are your friend during exploitation** — as Hint 1
   suggests, getting the interpreter into a state its author didn't design
   for (Ctrl-C, malformed input, re-executed lines) is often exactly how you
   find the bug.
