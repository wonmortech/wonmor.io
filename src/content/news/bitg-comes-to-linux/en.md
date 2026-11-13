---
title: bitg comes to Linux
description: bitg 0.2.0 adds two Debian packages, one for IBus and one for Fcitx5, built on the same Rust core as the Windows keyboard.
date: 2026-11-12
category: product
product: bitg
links:
  - { label: Release notes, text: v0.2.0, href: "https://github.com/dtwinuz/bitg/releases/tag/v0.2.0", kind: external }
  - { label: Download, text: bitg.uz, href: "https://bitg.uz", kind: download }
source:
  - "https://github.com/dtwinuz/bitg/releases/tag/v0.2.0"
  - "https://github.com/dtwinuz/bitg/pull/2"
---

bitg 0.2.0, released on November 12, 2026, is the first version that runs outside Windows. It ships two Debian packages alongside the Windows installer:

- `bitg_0.2.0_amd64.deb` — an engine for IBus, for Ubuntu 22.04+ and Debian 12+.
- `fcitx5-bitg_0.2.0_amd64.deb` — an addon for Fcitx5, for KDE desktops.

Each package comes with a `.sha256` file. The Windows code in this release is identical to 0.1.0.

## One core, thin frontends

The conversion logic did not get rewritten for Linux. It lives in a Rust crate that exposes a C interface, and the Linux frontends are thin wrappers around it: the IBus engine is written in C, the Fcitx5 addon in C++. A fix to the core reaches every platform at once.

## How it is tested

A dedicated Linux workflow runs on every pull request. It starts a real `ibus-daemon`, types into it and checks the output — eight end-to-end cases, all passing. It also runs `lintian` on the packages, installs and removes them, and verifies that the Fcitx5 addon resolves all of its symbols.

Two problems took most of the time. The IBus bus object in Python is a singleton, so the test has to wait for the D-Bus socket before creating it; otherwise it binds to nothing. And the GObject binding for key values expects a string, not an integer.

## What is not done yet

The Fcitx5 package passes its build checks but had not yet been used to type in a real application when it shipped, so we marked it as a test package. RPM and Flatpak packages are planned, not built.
