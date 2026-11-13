---
title: Introducing bitg
description: bitg is a Windows keyboard that turns Uzbek typed the old way into the 2026 Latin alphabet as you type, in any application. Version 0.1.0 is out.
date: 2026-11-12
category: announcements
product: bitg
featured: true
links:
  - { label: Release notes, text: v0.1.0, href: "https://github.com/dtwinuz/bitg/releases/tag/v0.1.0", kind: external }
  - { label: Source, text: GitHub, href: "https://github.com/dtwinuz/bitg", kind: external }
source:
  - "https://github.com/dtwinuz/bitg/releases/tag/v0.1.0"
---

Uzbek is moving to a new Latin alphabet in 2026, with letters such as ö, ğ, ş and ç. Most people will keep typing the way they always have. bitg lets them: you type `o‘` or `sh`, and when the word ends it becomes `ö` or `ş`. Version 0.1.0 was released on November 12, 2026.

## How it works

bitg is an input method for the Windows Text Services Framework, so it works in any application that accepts text — messengers, documents, browsers, spreadsheets. Each word is checked on its own: English words, links and email addresses are left alone, and one Backspace restores the original word if the conversion was not wanted.

The release also includes a command-line tool. `bitg file` converts `.docx` and `.xlsx` documents, `bitg diff` and `--dry-run` show changes before applying them, and `bitg cyr` handles Cyrillic. In the tray app, Ctrl+Shift+Y converts the current selection.

## Getting Telegram right

Telegram Desktop is built on Qt, and Qt behaves differently from native Windows controls. Three bugs had to be found there: bitg's own Backspaces were mistaken for the user undoing a conversion, keys typed during a retype arrived out of order, and Qt dropped the marker bitg used to recognise its own keystrokes. Each now has a fix and a test. The end-to-end suite — 59 cases, including a Qt application that follows the same path as Telegram — passes in CI.

## How accurate it is

On a public evaluation set, bitg converts 98.87% of words correctly. An earlier figure of 99.17% was inflated by overlap between the evaluation set and the word list bitg is built from; we removed the overlap and report the lower number. The evaluation set is published in the repository under CC BY 4.0, so anyone can rerun it.
