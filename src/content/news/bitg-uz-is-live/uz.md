---
title: bitg.uz ishga tushdi
description: bitgʼning endi oʻz domeni bor — yuklab olish, matningizni hech qayerga yubormaydigan brauzerdagi konvertor va 2026-yilgi oʻzbek alifbosini tushuntiruvchi sahifalar.
date: 2026-11-12
category: product
product: bitg
links:
  - { label: Sayt, text: bitg.uz, href: "https://bitg.uz", kind: external }
  - { label: Mahsulot, text: bitg, href: "/uz/products/bitg/", kind: internal }
source:
  - "https://bitg.uz"
  - "dtwinuz/dtwin #333"
  - "https://github.com/dtwinuz/bitg"
---

2026-yil 12-noyabrda bitg.uz 2026-yilgi oʻzbek lotin alifbosi uchun klaviaturamiz — bitgʼning uyiga aylandi. Eski manzil va `www` nomi endi shu yerga yoʻnaltiriladi.

## U yerda nima qilish mumkin

- **Yuklab olish.** bitg.uz dagi oʻrnatuvchilar GitHub relizidagi fayllarning aynan oʻzi, SHA-256 nazorat yigʻindilari bilan. Ishga tushgan kuni bir necha soat davomida saytda eskiroq lokal yigʻma turgan edi. Buni payqab, reliz fayli bilan almashtirdik va reliz faylini yuklab olishni har bir sayt deployʼining majburiy qadamiga aylantirdik.
- **Brauzerda sinab koʻrish.** bitg yadrosi WebAssemblyʼga kompilyatsiya qilingan va sahifaning ichida ishlaydi. Matnni joylab, eski va yangi imlo oʻrtasida yoki kirillchadan oʻgirish mumkin. Matn brauzeringizda qoladi — serverga hech narsa yuborilmaydi.
- **Alifbo haqida oʻqish.** Oʻn besh sahifa yangi harflarni, bitg ularni qanday ishlashini va uni qanday oʻrnatishni tushuntiradi. Ular oddiy fayllardan bogʻliqliksiz kichik skript orqali yaratiladi; shu skript sitemap, til muqobillari va haqiqiy 404 sahifasini ham yozadi. Sahifalardagi har bir misol qoʻlda yozilmagan — haqiqiy bitg yadrosida tekshirilgan.

## Qanday joylashtirilgan

bitg.uz — dtwin.uz bilan bitta edgeʼda turgan statik sayt, sertifikatlarni avtomatik oladigan Caddy ortida. Har bir deploy sahifalarni `main`ning toza nusxasidan yigʻadi va oʻzgargan manzillar haqida qidiruv tizimlariga IndexNow orqali xabar beradi.

Sayt manba kodi bitg repozitoriysida, klaviaturaning oʻzi bilan yonma-yon turadi.
