---
title: bitg.uz is live
description: bitg now has its own domain, with downloads, an in-browser converter that never sends your text anywhere, and pages that explain the 2026 Uzbek alphabet.
date: 2026-11-12
category: product
product: bitg
links:
  - { label: Site, text: bitg.uz, href: "https://bitg.uz", kind: external }
  - { label: Product, text: bitg, href: "/products/bitg/", kind: internal }
source:
  - "https://bitg.uz"
  - "dtwinuz/dtwin #333"
  - "https://github.com/dtwinuz/bitg"
---

On November 12, 2026, bitg.uz became the home of bitg, our keyboard for the 2026 Uzbek Latin alphabet. The old address and the `www` name now redirect to it.

## What you can do there

- **Download.** The installers on bitg.uz are the same files attached to the GitHub release, published with their SHA-256 checksums. For a few hours on launch day the site served an older local build; we caught it, replaced it with the release asset, and made the release download a required step of every site deploy.
- **Try it in the browser.** The bitg core runs inside the page, compiled to WebAssembly. You can paste text and convert it between the old and new spellings, or from Cyrillic. The text stays in your browser — nothing is sent to a server.
- **Read about the alphabet.** Fifteen pages explain the new letters, how bitg handles them and how to install it. They are generated from plain files by a small script with no dependencies, which also writes the sitemap, the language alternates and a real 404 page. Every example on these pages was checked against the actual bitg core, not written by hand.

## How it is hosted

bitg.uz is a static site on the same edge as dtwin.uz, behind Caddy with automatic certificates. Each deploy builds the pages from a clean checkout of `main` and notifies search engines of the changed URLs through IndexNow.

The source for the site lives in the bitg repository, next to the keyboard itself.
