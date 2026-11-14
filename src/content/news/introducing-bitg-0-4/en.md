---
title: "bitg 0.4: your own dictionary, feedback from the app and verified updates"
description: Version 0.4 lets you teach bitg new words, report a wrong conversion without leaving the app, and update in one click with a checked download.
date: 2026-11-13
category: product
product: bitg
links:
  - { label: Download, text: bitg.uz, href: "https://bitg.uz", kind: download }
  - { label: Release notes, text: v0.4.0, href: "https://github.com/dtwinuz/bitg/releases/tag/v0.4.0", kind: external }
source:
  - "https://github.com/dtwinuz/bitg/releases/tag/v0.4.0"
  - "https://github.com/dtwinuz/bitg/blob/v0.4.0/NEWS.md"
---

bitg 0.4.0 was released on November 13, 2026, a day after 0.3. It is the first version that learns from the person typing.

## What is new

- **Personal dictionary.** Teach bitg a word it does not know, for example “shamollash” → “şamollaş”. Suffixed forms follow automatically, and capitalisation stays as you typed it.
- **Keep one letter.** Click the letters of a word to choose which ones stay unconverted: “bogʻcha” → “bogʻça” keeps the gʻ and converts the ch.
- **Feedback from the app.** Report a bug, an idea or a wrongly converted word with one button, with an optional screenshot. No browser opens.
- **Verified updates.** bitg tells you when a new version is out and updates in one click. The installer is downloaded only from the project's GitHub releases and checked against its size and SHA-256 hash before it runs.
- **What's new.** After an update, bitg shows once what changed. It can be turned off in settings.
- **Ubuntu panel indicator.** On Ubuntu, bitg now has an icon and menu in the top panel for switching conversion on and off without restarting apps.

## Fewer wrong conversions

More than 2,000 additional foreign given names and surnames, and 55 brand names and technical terms such as “fintech” and “Semrush”, are now left as written. In short sentences next to code or a brand name, as in “fetch() chaqiruvi”, the Uzbek word is converted again instead of being mistaken for English.

## Outside contributors

0.4.0 is the first release with merged pull requests from people outside the project: regression tests for foreign names, new name and brand lists, suffix tests and the Ubuntu indicator fix. The full list is in the release notes.
