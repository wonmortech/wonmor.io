---
title: "bitg 0.3: Windows, Linux va macOS uchun bitta klaviatura"
description: bitg yozish paytidayoq oʻzbekchani 2026-yilgi lotin alifbosiga oʻgiradi. 0.3 versiyasi shu dvigatelni uchala kompyuter tizimiga olib keladi.
date: 2026-11-12
category: announcements
product: bitg
featured: true
links:
  - { label: Yuklab olish, text: bitg.uz, href: "https://bitg.uz", kind: download }
  - { label: Reliz qaydlari, text: v0.3.0, href: "https://github.com/dtwinuz/bitg/releases/tag/v0.3.0", kind: external }
source:
  - "https://github.com/dtwinuz/bitg/releases/tag/v0.3.0"
---

bitg istalgan ilovada 2026-yilgi lotin alifbosida — ö, ğ, ş, ç va ʼ bilan — oʻzbekcha yozish imkonini beradi va orada uchragan inglizcha soʻzlarni buzmaydi. 2026-yil 12-noyabrda chiqqan 0.3 versiyasi uchala kompyuter operatsion tizimini qamragan birinchi versiya.

## Bitta yadro, uchta interfeys

Oʻgirish dvigateli — C interfeysli bitta Rust kutubxonasi. Har bir operatsion tizim uning ustida yupqa mahalliy qatlam oladi:

- **Windows** — Text Services Framework uchun kiritish usuli, MSI paket orqali oʻrnatiladi.
- **Linux** — ikkita Debian paketi: biri IBus, biri Fcitx5 uchun.
- **macOS** — universal `.pkg` ichidagi InputMethodKit kiritish usuli, hali beta.

## Qanday olish mumkin

Paketlar bitg.uz va GitHub Releasesʼda. Linuxʼda imzolangan apt omboridan, macOSʼda Homebrew tapʼdan oʻrnatish mumkin. Windows uchun winget arizasi koʻrib chiqilmoqda.

## Qanchalik aniq

Ochiq baholash toʻplamida bitg soʻzlarning 98,87% ini toʻgʻri oʻgiradi. Avvalgi 99,17% natija baholash toʻplami bilan bitg qurilgan maʼlumotlar orasidagi ustma-ustlik hisobiga oshib ketgan edi; u olib tashlangach, halol natija 98,87%. Soʻz haqiqatan ikki maʼnoli boʻlsa, bitg taxmin qilmaydi — uni yozilganicha qoldiradi.
