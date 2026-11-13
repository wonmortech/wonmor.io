---
title: "Uchta yangi tajriba: shop, gym va med"
description: Bir kunda dtwin subdomenlarida uchta frontend prototip ishga tushdi — Instagramʼdagi kiyim doʻkonlari uchun marketplace, mashgʻulot trekeri va umumiy tibbiyotni oʻrganish uchun qoʻllanma.
date: 2026-10-30
category: product
links:
  - { label: Sinab koʻring, text: shop.dtwin.uz, href: "https://shop.dtwin.uz", kind: external }
  - { label: Sinab koʻring, text: gym.dtwin.uz, href: "https://gym.dtwin.uz", kind: external }
  - { label: Sinab koʻring, text: med.dtwin.uz, href: "https://med.dtwin.uz", kind: external }
source:
  - "https://github.com/dtwinuz/gym-dtwin"
  - "dtwinuz/dtwin #163"
---

2026-yil 30-oktabrda dtwin.uz yonida uchta yangi sayt paydo boʻldi. Ular tayyor mahsulot emas, tajriba: har biri React 19 va TypeScriptʼda yozilgan frontend, brauzerda saqlanadigan namunaviy maʼlumotlar bilan ishlaydi, backend hali yoʻq. Ularni koʻproq narsa qurishdan oldin gʻoyalar haqiqiy odamlar oldida oʻzini oqlashini koʻrish uchun internetga chiqardik.

## Uchalasi

- **shop.dtwin.uz** — Instagram orqali sotadigan kiyim doʻkonlari uchun marketplace prototipi, interfeysida three.js sahnalari bor.
- **gym.dtwin.uz** — mashgʻulot trekeri. Unda toʻrtta boshlangʻich reja, 29 ta mashqdan iborat kutubxona, 90 soniyalik dam olish taymeri bilan setlarni yozib borish, shaxsiy rekordlar, mashgʻulotlar xaritasi, Epley formulasi boʻyicha bir martalik maksimum bahosi va tana vaznini kuzatish bor. Tuzilishi ochiq kodli openGym loyihasiga asoslangan; openGymʼning kodi yoki mediasi koʻchirilmagan.
- **med.dtwin.uz** — umumiy tibbiyotni oʻrganish uchun qoʻllanma: beshta mutaxassislik boʻyicha 11 ta mavzu, klinik standartlar, dozalar ataylab kiritilmagan farmakologiya boʻlimi, sinov imtihonlari va qidiruv. Kontent namunaviy material, tibbiy maslahat emas.

gym va med oʻzbek, rus va ingliz tillarida ishlaydi.

## Har biri bilan nima keladi

Har bir saytning bosh sahifasida ikkita qisqa taqdimotga havola bor: biri gʻoya ortidagi tadqiqot, ikkinchisi konsepsiya haqida, ikkalasi ham 3D sahna bilan tugaydi. Ular prototipga qarayotgan har bir kishi u nima uchun borligini va qayerga borishi mumkinligini koʻrishi uchun qoʻyilgan.

gym loyihasi GitHubʼda ochiq. Uchala sayt ham dtwin.uz bilan bitta edgeʼda kichik statik konteynerlar sifatida ishlaydi.
