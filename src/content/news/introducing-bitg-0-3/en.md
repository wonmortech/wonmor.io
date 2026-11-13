---
title: "Introducing bitg 0.3: one keyboard for Windows, Linux and macOS"
description: bitg converts Uzbek to the 2026 Latin alphabet as you type, in any app. Version 0.3 brings the same engine to all three desktop systems.
date: 2026-11-12
category: announcements
product: bitg
featured: true
links:
  - { label: Download, text: bitg.uz, href: "https://bitg.uz", kind: download }
  - { label: Release notes, text: v0.3.0, href: "https://github.com/dtwinuz/bitg/releases/tag/v0.3.0", kind: external }
source:
  - "https://github.com/dtwinuz/bitg/releases/tag/v0.3.0"
---

bitg lets you type Uzbek in the 2026 Latin alphabet — with ö, ğ, ş, ç and ʼ — in any application, without breaking the English words in between. Version 0.3, released on November 12, 2026, is the first to cover all three desktop operating systems.

## One core, three frontends

The conversion engine is a single Rust library with a C interface. Each operating system gets a thin native frontend on top of it:

- **Windows** — an input method for the Text Services Framework, installed from an MSI package.
- **Linux** — two Debian packages, one for IBus and one for Fcitx5.
- **macOS** — an InputMethodKit input method in a universal `.pkg`, still in beta.

## Getting it

Packages are on bitg.uz and on GitHub Releases. On Linux you can install from a signed apt repository; on macOS, from a Homebrew tap. A winget submission for Windows is under review.

## How accurate it is

On a public evaluation set, bitg converts 98.87% of words correctly. An earlier measurement of 99.17% turned out to be inflated by overlap between the evaluation set and the data bitg was built from; after removing the overlap, the honest figure is 98.87%. When a word is genuinely ambiguous, bitg leaves it as typed instead of guessing.
