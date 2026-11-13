---
title: bitg bilan tanishing
description: bitg — eskicha yozilgan oʻzbekcha matnni har qanday dasturda, yozish jarayonida 2026-yilgi lotin alifbosiga oʻgiradigan Windows klaviaturasi. 0.1.0 versiyasi chiqdi.
date: 2026-11-12
category: announcements
product: bitg
featured: true
links:
  - { label: Reliz qaydlari, text: v0.1.0, href: "https://github.com/dtwinuz/bitg/releases/tag/v0.1.0", kind: external }
  - { label: Manba kod, text: GitHub, href: "https://github.com/dtwinuz/bitg", kind: external }
source:
  - "https://github.com/dtwinuz/bitg/releases/tag/v0.1.0"
---

Oʻzbek tili 2026-yilda ö, ğ, ş va ç kabi harflari bor yangi lotin alifbosiga oʻtmoqda. Koʻpchilik esa odatdagidek yozishda davom etadi. bitg aynan shunga imkon beradi: siz `o‘` yoki `sh` deb yozasiz, soʻz tugashi bilan u `ö` yoki `ş` boʻladi. 0.1.0 versiyasi 2026-yil 12-noyabrda chiqdi.

## Qanday ishlaydi

bitg — Windows Text Services Framework uchun kiritish usuli, shuning uchun u matn qabul qiladigan har qanday dasturda ishlaydi: messenjer, hujjat, brauzer, jadval. Har bir soʻz alohida tekshiriladi: inglizcha soʻzlar, havolalar va pochta manzillariga tegilmaydi, oʻgirish kerak boʻlmasa, bitta Backspace asl soʻzni qaytaradi.

Relizda buyruq qatori vositasi ham bor. `bitg file` `.docx` va `.xlsx` hujjatlarini oʻgiradi, `bitg diff` va `--dry-run` oʻzgarishlarni qoʻllashdan oldin koʻrsatadi, `bitg cyr` kirillchani oʻgiradi. Tray ilovasida Ctrl+Shift+Y belgilangan matnni oʻgiradi.

## Telegram bilan toʻgʻri ishlash

Telegram Desktop Qt asosida qurilgan, Qt esa Windowsʼning oddiy boshqaruv elementlaridan boshqacha ishlaydi. U yerda uchta xatoni topishga toʻgʻri keldi: bitgʼning oʻz Backspaceʼlari foydalanuvchi oʻgirishni bekor qilyapti deb tushunilardi, qayta yozish paytida bosilgan tugmalar tartibsiz kelardi, Qt esa bitg oʻz tugma bosishlarini tanib olish uchun qoʻygan belgini tashlab yuborardi. Har biri uchun endi tuzatish va test bor. End-to-end toʻplami — 59 ta holat, jumladan Telegram bilan bir xil yoʻldan oʻtadigan Qt ilovasi — CIʼda oʻtadi.

## Qanchalik aniq

Ochiq baholash toʻplamida bitg soʻzlarning 98,87% ini toʻgʻri oʻgiradi. Avvalgi 99,17% koʻrsatkichi baholash toʻplami bilan bitg qurilgan soʻzlar roʻyxati orasidagi kesishma tufayli oshib ketgan edi; kesishmani olib tashlab, pastroq raqamni eʼlon qilamiz. Baholash toʻplami repozitoriyda CC BY 4.0 litsenziyasi bilan eʼlon qilingan — uni istalgan kishi qayta yurgiza oladi.
