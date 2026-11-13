---
title: dtwin.uz ochildi — Claude uchun MCP server bilan
description: Kunlik namozlar atrofida qurilgan shaxsiy rejalashtiruvchi dtwin endi dtwin.uz manzilida ishlamoqda. Unda MCP server bor — Claude rejalaringizni oʻqiy oladi va ularga qoʻshimcha kirita oladi.
date: 2026-10-26
category: announcements
product: dtwin
links:
  - { label: Mahsulot, text: dtwin.uz, href: "https://dtwin.uz", kind: external }
  - { label: Taqdimot, text: dtwin.uz/overview, href: "https://dtwin.uz/overview/", kind: external }
source:
  - "https://dtwin.uz"
  - "dtwinuz/dtwin #16"
---

2026-yil 26-oktabrda dtwin.uz ishga tushdi. dtwin — shaxsiy rejalashtiruvchi, odat trekeri va daftar. Unda kun hijriy taqvimdagidek — Shomdan Shomgacha davom etadi, besh vaqt namoz esa qolgan hamma narsaning tayanchi. Google, GitHub yoki Telegram orqali kirish mumkin; vebda, Telegram botida yoki Telegram Mini App sifatida, oʻzbek (lotin va kirill), rus yoki ingliz tilida foydalanasiz.

## Claude undan foydalana oladi

dtwinʼning `dtwin.uz/mcp` manzilida oʻz MCP serveri bor. U dinamik klient roʻyxatdan oʻtkazish bilan OAuth 2.1 ni qoʻllaydi, shuning uchun uni claude.ai ga hech qanday kalit koʻchirmasdan konnektor sifatida qoʻshish mumkin; Claude Code esa shaxsiy kirish kaliti bilan ulanadi. Ishga tushgan kuni konnektorda oʻqish uchun oltita va yozish uchun toʻrtta tool bor edi — Claudeʼdan kuningiz qanday ekanini soʻrash va vazifani keyingi boʻsh vaqtga qoʻydirish uchun yetarli.

Ibodat maʼlumotlari shaxsiy hisoblanadi. Namoz reytinglari, streak musobaqalari yoki lentalar yoʻq.

## Bir kunda, parallel qurilgan

Oʻsha kuni 54 ta taklifdan iborat tadqiqot roʻyxati asosida hayotni boshqarish uchun katta funksiyalar toʻplamini qurdik. Sakkizta agent parallel ishladi — har biri oʻz git worktreeʼsi va oʻz maʼlumotlar bazasida: odatlar, ibodat, oʻsish, tana, moliya, yaqinlar, fikr va platforma. Ularning branchʼlari bitta integratsiyada, bitta migratsiya bilan birlashtirildi. Yangi zaxira nusxasi olingandan keyin oʻsha kechqurun prodga chiqdi.

Yarim tungacha yana qoʻshildi: bildirishnomalar sonini cheklaydigan nazoratchi, Bomdoddan keyingi ertalabki brif, Shomdagi kun yakuni, maqsadlar va sarhisoblar, dorilar va qabullar uchun tibbiyot moduli hamda muddati tugashini eslatadigan shaxsiy hujjatlar boʻlimi. Ertasi kuni MCP serverdagi toollar soni 91 taga yetdi.
