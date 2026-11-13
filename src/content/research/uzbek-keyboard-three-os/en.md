---
title: Building an Uzbek keyboard for three operating systems
description: "bitg rewrites Uzbek words into the 2026 alphabet as you type, on Windows, Linux and macOS. One Rust core makes the decision; three very different input frameworks decide how hard it is to apply it."
date: 2026-11-12
kind: research
area: language
featured: false
source:
  - "https://github.com/dtwinuz/bitg"
  - "dtwinuz/bitg ARCHITECTURE.md, CHANGELOG.md"
  - "https://github.com/dtwinuz/bitg/pull/2"
  - "https://github.com/dtwinuz/bitg/pull/7"
  - "https://github.com/dtwinuz/bitg/pull/9"
  - "https://github.com/dtwinuz/bitg/pull/30"
  - "https://github.com/dtwinuz/bitg/releases"
reproduce:
  repo: "https://github.com/dtwinuz/bitg"
  commit: "2de5c94"
  note: "The first command converts a mixed sentence with the same core the input methods use; the second runs the test that proves the macOS and Linux shells ask the application for text only when the engine needs it."
  commands:
    - "cargo run -q --release -p bitg-cli -- \"Menga chat yozing. Menga choy yozing.\""
    - "cargo test -p bitg-ime wants_before"
    - "cargo test -p bitg-core"
---

In October 2026 Uzbekistan adopted a law that replaces four letters of its Latin alphabet: oʻ becomes ö, gʻ becomes ğ, sh becomes ş and ch becomes ç. Keyboards do not have these letters, and most people who write Uzbek also write English every day, often in the same message. A find-and-replace breaks *check*, *shell* and *push*.

bitg is our open-source answer: an input method that lets you keep typing `o'zbek shahar` and turns it into `özbek şahar` when you press space, in whatever application you are in, without touching English. On 12 November 2026 we published three releases in one day: v0.1.0 for Windows (01:29 UTC), v0.2.0 adding Linux (12:02 UTC) and v0.3.0 adding a macOS beta (14:23 UTC). This post is about what it took to make one conversion engine behave the same way inside three operating systems that disagree about almost everything.

## One core, one small contract

All language decisions live in `bitg-core`, a Rust crate with no runtime dependencies. It tokenises text, decides whether a word is Uzbek (a corpus lexicon, the SCOWL English list, brand and foreign-name lists, token shape and sentence context) and applies the alphabet rules. The lexicons are compiled into the binary, so nothing is parsed at start-up.

```text
$ bitg "Menga chat yozing. Menga choy yozing."
Menga chat yozing. Menga çoy yozing.
```

The platform layers know nothing about Uzbek. They talk to the core through one call. When a word is finished, `Session::complete_word` returns an `Edit { delete, insert }` that touches only that word. A fuzz target checks the one invariant that matters for safety: `delete` is never larger than the word just typed, so a bug in the language logic cannot eat text the user wrote earlier.

```steps
Keystroke :: The platform shell sees a key or a text change and tracks the current word.
Boundary :: On space or punctuation it hands the finished word to the Rust core.
Decide :: The core returns an Edit that deletes at most that word and inserts the 2026 spelling, or nothing.
Apply :: The shell replaces the word in place, or commits it from a preedit buffer when the app hides its text.
Undo :: Backspace right after a replacement restores the original and remembers it as an exception.
```

Everything difficult in this project is in the last two steps, and it is different on every system.

## Windows: the framework works until the app opts out

On Windows, bitg is a Text Services Framework text service written in Rust. It does not install a keyboard hook. It watches text changes through `ITfTextEditSink` and replaces the finished word inside a TSF edit session, which is the supported, clean path: the application sees an ordinary edit and its own undo history stays intact.

That path assumes the application exposes its text to TSF. Qt applications, including Telegram Desktop, do not. For them bitg falls back to rebuilding the word from key events and sending Backspaces plus the new word with `SendInput`. Getting this right took three separate fixes before v0.1.0:

- **Our own Backspaces looked like the user's.** bitg treats a Backspace right after a conversion as "undo". In Qt, the Backspaces bitg itself injected came back through the same path, so it undid its own work. The fix is a retype counter: bitg expects its own keys back within a 1.5 second window and only then listens for the user again.
- **People type faster than the fallback.** Keys pressed while the correction was still queued arrived in the middle of it. bitg now holds those keys and resends them after the edit, in the order they were typed.
- **Qt drops the tag.** Injected keys carry a marker in `dwExtraInfo` so the service can recognise them. Qt does not pass that field through, so bitg recognises its own keys by order instead.

The Windows end-to-end suite on the v0.1.0 tag ran 59 checks, including a PySide6 window that takes the same input path as Telegram. Two later fixes are worth naming. In v0.3.1 bitg reads the field's input scope (with `ITfContext::GetAppProperty`, falling back to `GetProperty` for applications that report it that way) and stays off in password, PIN and e-mail fields. And after a report that bitg switched itself back to the English keyboard on Windows 11, an activation error is now logged instead of being returned to TSF, which had made Windows drop the input method. That keeps bitg selected; it does not explain why activation failed on that machine, and the issue is still open.

## Linux: two frameworks, one shared shell

For Linux we split the typing logic out of the Windows code into `bitg-ime`, a platform-independent crate with a C ABI. Thin shells sit on top: an IBus engine in C and a Fcitx5 add-on in C++. Both use the same rule. If the application exposes the text around the cursor, the word is replaced in place. If it does not, or says it does and returns nothing, the word is held as underlined preedit text and committed in its converted form at the word boundary. If focus moves away, the preedit is committed unconverted so no text is lost.

Continuous integration runs a real `ibus-daemon` on Ubuntu 22.04 and types through it: eight cases covering direct conversion, English left alone, Cyrillic, Backspace undo and learning, Enter, preedit, preedit surviving a focus change, and a password field. The hardest part was the test harness itself. `IBus.Bus.new()` returns a process-wide singleton, so creating it before the daemon's socket exists leaves the test permanently disconnected; the harness now waits for the D-Bus socket first.

Fcitx5 is built, packaged and link-checked in CI, but it has never been typed into in a real application, so it ships marked as testing.

## macOS: correct offsets, fewer questions

On macOS the shell is an InputMethodKit input method in Swift, over the same `bitg-ime` C ABI, packaged as one universal `.pkg` for Apple silicon and Intel.

Two details mattered. First, units: the engine counts characters as Unicode scalars, while InputMethodKit ranges are UTF-16. Next to an emoji the two disagree, so the Swift side converts the deletion length from the text itself before replacing anything.

Second, cost. Asking a macOS application for the text before the cursor is an inter-process call, and the first version asked on every key. PR #9 added `wants_before`: the engine tells the shell when it actually needs the text, which is at the start of a word, at its end and on undo. For the word `choy` followed by a space, the number of requests dropped from five to two. A property test runs 600 random key sequences against three kinds of application (one that gives text, one that returns empty text, one that gives none) and checks that the output is identical to asking every time. We also broke `wants_before` on purpose in two ways to confirm the test catches it. Linux later adopted the same rule and limits the request to the last 128 characters.

## Limitations

- **macOS has not been tested in real applications.** CI runs a fake text field (13 cases when the beta landed) and installs the package on Apple silicon and Intel runners. On those headless runners, selecting the input source returns error `-50`, so the end-to-end test that drives the real InputMethodKit path is only compiled there; it has to be run by hand on a Mac. Until someone types in Safari, Chrome, Notes, Word and Telegram with it, the Mac build is a beta.
- **Fcitx5 is unverified in real applications**, as above.
- **Qt support on Windows is a fallback.** It reconstructs words from key events, which is inherently more fragile than a TSF edit session. Any application that handles keys in an unusual way can break it in a new way.
- **No phone keyboard yet.** A mobile keyboard built on the same core is planned, not shipped.

What we would keep if we started again is the boundary. The core answers one question, "what should this word become", and every platform shell is judged by whether it applies that answer without touching anything else.
