---
title: Bitta yuklab olishni ham uzmaydigan deploylar
description: dtwin edgeʼidagi statik saytlar endi uzilishsiz yangilanadi. 76 soniyalik yuklab olish deploy davomida ham toʻxtamadi.
date: 2026-11-13
category: engineering
links:
  - { label: Ishlatiladi, text: bitg.uz, href: "https://bitg.uz", kind: external }
  - { label: Ishlatiladi, text: dtwin.uz, href: "https://dtwin.uz", kind: external }
source:
  - "dtwinuz/dtwin #335"
  - "dtwinuz/bitg #40"
---

Shu haftagacha dtwin edgeʼida statik saytni deploy qilish papkani joyida almashtirishni anglatardi. Qisqa bir lahzada soʻrov yarim nusxalangan papkaga tushib qolishi, uzoq yuklab olish esa uzilishi mumkin edi.

## Yangi reliz jarayoni

Endi har bir deploy commit nomi bilan atalgan alohida papkaga yuklanadi: `releases/<sha>`. Yuklash tugagach, `current` symlinkʼi bitta atomar amal bilan unga oʻtkaziladi, Caddy konfiguratsiyasi tekshiriladi va Caddy ohista qayta yuklanadi. Joʻnatilayotgan fayllar uzatish tugaguncha eski papkadan ochiq qoladi.

## Sinov

Buni isbotlash uchun reliz paketini ataylab sekin, 76 soniya davom etadigan qilib yuklab olishni boshladik va uning oʻrtasida deploy qildik. Yuklab olish butun holda tugadi, yangi soʻrovlar esa allaqachon yangi relizdan berilayotgan edi.

## Orqaga qaytarish

Orqaga qaytish — xuddi shu amalning teskarisi: `current`ni oldingi relizga yoʻnaltirish va qayta yuklash. Eski relizlar diskda saqlanadi, qayta yigʻish shart emas.

Caddyʼning `grace_period` sozlamasidan ataylab voz kechdik: u vaqt tugagach ochiq ulanishlarni majburan yopadi — sekin yuklab olishlarni aynan shu narsa uzadi.
