---
title: Gateway bilan tanishing — AI agentlar uchun boshqaruv qatlami
description: Gateway AI agentlar va ichki tizimlar oʻrtasida turadi. Har bir agent oʻz tokeni, ruxsat etilgan toollar roʻyxati va toʻliq audit izini oladi, shaxsiy maʼlumotlar esa modelga yetib borishidan oldin niqoblanadi.
date: 2026-11-02
category: product
product: gateway
featured: true
links:
  - { label: Mahsulot, text: gateway.dtwin.uz, href: "https://gateway.dtwin.uz", kind: external }
  - { label: Umumiy maʼlumot, text: Gateway, href: "/uz/products/gateway/", kind: internal }
source:
  - "https://gateway.dtwin.uz"
  - "dtwinuz/gateway"
  - "dtwinuz/dtwin #306"
---

AI agentlar haqiqiy tizimlarni — issue tracker, kod xostingi, maʼlumotlar bazasini — oʻqiy olganda eng foydali boʻladi. Aynan shu yerda ularga ishonish ham eng qiyin. Gateway — shu tizimlar oldiga qoʻyilgan yagona eshik. U 2026-yil 2-noyabrda gateway.dtwin.uz manzilida ishga tushdi, 0.2.0 versiyasi esa oʻsha kechasiyoq chiqdi.

## Nimani boshqaradi

Gateway HTTP orqali MCP protokolida ishlaydi, shuning uchun masofaviy MCP serverlarni qoʻllaydigan har qanday agent bitta manzil va token bilan ulanadi. Shu manzil ortida:

- **Har agentga bitta token.** Tokenlar faqat xesh koʻrinishida saqlanadi, muddati tugashi va IP manzillar roʻyxati bilan cheklanishi mumkin.
- **Ruxsat roʻyxatlari.** Har bir agent faqat oʻziga ruxsat berilgan toollarni koʻradi, argumentlarni ham toraytirish mumkin — staging bazasi bilan cheklangan agent productionʼni hatto variant sifatida ham koʻrmaydi.
- **Tezlik cheklovi, pauza va toʻxtatish tugmasi.** Har bir agent uchun daqiqasiga soʻrovlar soni cheklanadi; bitta agentni pauzaga qoʻyish yoki barcha agentlarni birdaniga toʻxtatish mumkin.
- **Niqoblash.** Shaxsni tasdiqlovchi raqamlar, telefon, email, karta raqamlari va tokenlar kabi shaxsiy maʼlumotlar javoblarda niqoblanadi — ustun nomi boʻyicha yoki sozlamalarda sinab koʻrish mumkin boʻlgan muntazam ifoda boʻyicha.

## Nimani yozib boradi

Har bir chaqiruv audit jurnaliga yoziladi: soʻrov, niqoblangan javob va administratorning har bir harakati. Admin panel chaqiruvlarni jonli koʻrsatadi, 0.2.0 da esa unda oltita boʻlim bor — umumiy koʻrinish, audit, agentlar, konnektorlar, playground va sozlamalar. Qoidalar Telegramʼga ogohlantirish yuborishi mumkin.

## Yopiq tizimlarga yetib borish

Dastlabki konnektorlar Jira, GitLab va SQL bazalaridan oʻqiydi va ular atayin faqat oʻqish uchun qilingan: SQL soʻrovlari himoya tekshiruvidan oʻtadi, har bir tranzaksiya esa orqaga qaytariladi. Konnektor yopiq tarmoq ichida ishlab, Gatewayʼga bizning Tunnel orqali ulanishi mumkin — shuning uchun ichki tizimlarni internetga ochish shart emas.
