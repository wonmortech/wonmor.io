---
title: bitg Linuxʼga keldi
description: bitg 0.2.0 ikkita Debian paketini qoʻshadi — biri IBus, biri Fcitx5 uchun. Ikkalasi ham Windows klaviaturasi bilan bir xil Rust yadrosida qurilgan.
date: 2026-11-12
category: product
product: bitg
links:
  - { label: Reliz qaydlari, text: v0.2.0, href: "https://github.com/dtwinuz/bitg/releases/tag/v0.2.0", kind: external }
  - { label: Yuklab olish, text: bitg.uz, href: "https://bitg.uz", kind: download }
source:
  - "https://github.com/dtwinuz/bitg/releases/tag/v0.2.0"
  - "https://github.com/dtwinuz/bitg/pull/2"
---

2026-yil 12-noyabrda chiqqan bitg 0.2.0 — Windowsʼdan tashqarida ishlaydigan birinchi versiya. Windows oʻrnatuvchisi yonida ikkita Debian paketi bor:

- `bitg_0.2.0_amd64.deb` — IBus uchun engine, Ubuntu 22.04+ va Debian 12+ da ishlaydi.
- `fcitx5-bitg_0.2.0_amd64.deb` — KDE ish stollari uchun Fcitx5 addon.

Har bir paket bilan `.sha256` fayli keladi. Bu relizdagi Windows kodi 0.1.0 bilan bir xil.

## Bitta yadro, yupqa qobiqlar

Oʻgirish mantigʻi Linux uchun qaytadan yozilmadi. U C interfeysini taqdim etadigan Rust crateʼida yashaydi, Linux qobiqlari esa uning ustidagi yupqa oʻram: IBus engine C tilida, Fcitx5 addon C++ tilida yozilgan. Yadrodagi tuzatish bir vaqtning oʻzida barcha platformalarga yetib boradi.

## Qanday sinaladi

Har bir pull requestʼda alohida Linux workflow ishlaydi. U haqiqiy `ibus-daemon`ni ishga tushiradi, unga matn teradi va natijani tekshiradi — sakkizta end-to-end holat, hammasi oʻtadi. Shuningdek, paketlarni `lintian` bilan tekshiradi, oʻrnatib-oʻchiradi va Fcitx5 addon barcha simvollarini topa olishini tasdiqlaydi.

Ikki muammo eng koʻp vaqt oldi. Pythonʼdagi IBus bus obyekti singleton, shuning uchun test uni yaratishdan oldin D-Bus socketini kutishi kerak — aks holda u hech narsaga ulanmaydi. GObject bogʻlamasi esa tugma qiymatini butun son emas, satr sifatida kutadi.

## Hali nima qilinmagan

Fcitx5 paketi build tekshiruvlaridan oʻtadi, lekin chiqqan paytida haqiqiy dasturda hali matn terilmagan edi — shuning uchun uni sinov paketi deb belgiladik. RPM va Flatpak paketlari rejada, hali yigʻilmagan.
