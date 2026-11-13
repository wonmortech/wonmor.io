---
title: Fam bilan tanishing — oʻz serveringizdagi bug yozib olish vositasi
description: Fam xato haqida xabardan oldin brauzerda nima boʻlganini — bosishlar, tarmoq soʻrovlari, konsolni — yozib oladi va uni siz boshqaradigan serverda saqlaydi. U fam.dtwin.uz manzilida ishlamoqda.
date: 2026-11-11
category: product
product: fam
links:
  - { label: Mahsulot, text: fam.dtwin.uz, href: "https://fam.dtwin.uz", kind: external }
  - { label: Umumiy maʼlumot, text: Fam, href: "/uz/products/fam/", kind: internal }
source:
  - "dtwinuz/fam"
  - "dtwinuz/dtwin #330"
---

Yaxshi xato hisobotida biror narsa buzilishidan oldingi lahzalarda foydalanuvchi nima qilgani, sahifa nima yuborgani va konsol nima deganini koʻrish mumkin. Bulutdagi bug yozib olish vositalari buni yaxshi qiladi, lekin yozuvlarni boshqa birovning serverida saqlaydi va faqat bulutdagi issue trackerʼlarga ulanadi. Bizga oʻz serverimizda ishlaydigan va self-managed Jira hamda GitLab bilan gaplasha oladigan vosita kerak edi. Fam 2026-yil 11-noyabrda boshlandi va oʻsha kuniyoq fam.dtwin.uz manzilida ishga tushdi.

## Qanday yozib oladi

- **Aylanma bufer.** Yozib olish rrweb asosida qurilgan va sessiyaning faqat oxirgi qismini xotirada saqlaydi. Kimdir hisobot yubormaguncha hech narsa yuklanmaydi.
- **Ikki yoʻl.** JavaScript SDK (gzip bilan taxminan 51 KB) istalgan veb-ilovaga qoʻshiladi, Manifest V3 brauzer kengaytmasi esa oʻzgartira olmaydigan saytlarda ishlaydi.
- **Avval niqob.** Shaxsiy maʼlumotlar sahifadan chiqishidan oldin brauzerning oʻzida niqoblanadi — telefon raqamlari va shaxsni tasdiqlovchi hujjatlar kabi narsalar uchun tayyor shablonlar bor.

Hisobotlar veb-koʻruvchida ochiladi: unda takroriy koʻrinish tarmoq soʻrovlari va konsol chiqishi bilan yonma-yon turadi.

## Hisobotlar qayerga boradi

Server — npm bogʻliqliklarisiz bitta Node 24 jarayoni, maʼlumotlarni oʻrnatilgan SQLite modulida saqlaydi. Hisobot Jira Server yoki Data Center, self-managed GitLabʼda issue boʻlishi, Telegramʼga yuborilishi yoki HMAC bilan imzolangan webhook sifatida istalgan manzilga joʻnatilishi mumkin.

Fam sakkiz tooldan iborat MCP endpointʼini ham taqdim etadi. Xato ustida ishlayotgan AI agent skrinshot oʻrniga hisobotni, takroriy koʻrinish hodisalarini va xato bergan soʻrovlarni toʻgʻridan-toʻgʻri oʻqiy oladi.

## Hali tekshirilmoqda

Kengaytmadagi tab videosini yozish va SDKʼdagi ekranni yozish uchun haqiqiy brauzer sessiyasi kerak — ular hali qoʻlda tekshirilmoqda.
