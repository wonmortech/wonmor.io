---
title: Telegram widgetlari endi dtwin ichida
description: dtwin boti endi chatga jonli HTML widgetlar yuboradi — ular Telegram Bot API 10.4 da qoʻshilgan widgetlar asosida qurilgan. Dastlabki ikkitasi — /osmon va /tasbih.
date: 2026-11-10
category: product
product: dtwin
links:
  - { label: Mahsulot, text: dtwin.uz, href: "https://dtwin.uz", kind: external }
  - { label: Hujjatlar, text: Telegram widgetlari, href: "https://core.telegram.org/bots/widgets", kind: external }
source:
  - "dtwinuz/dtwin #327"
  - "dtwinuz/dtwin #329"
  - "https://core.telegram.org/bots/widgets"
---

Telegram Bot API 10.4 botga kichik HTML sahifani xabar sifatida yuborish imkonini beradi — chatda oʻzini chizadigan va keyin yangilanishi mumkin boʻlgan widget. 2026-yil 10-noyabrda dtwin boti ulardan ikkitasini yubora boshladi:

- **/osmon** — osmon manzarasi.
- **/tasbih** — suhbatning ichida turadigan zikr hisoblagichi.

Ikkalasi ham dtwinʼning oʻz ranglari, burchak radiuslari va shriftidan foydalanadi, shuning uchun widget umumiy karta emas, mahsulotning bir qismidek koʻrinadi. Widget yuborish ham, uning maʼlumotlarini yangilash ham shaxsiy chatlarda ishlashini prodda tasdiqladik.

## Cheklovlar ichida ishlash

Widgetlar ataylab kichik qilingan. HTML zlib bilan siqilgandan keyin 4096 baytga, holat esa 1024 baytga sigʻishi kerak. Widgetda tarmoqqa kirish, matn kiritish va rasm yoʻq.

Hujjatlarda unchalik koʻzga tashlanmaydigan yana bir cheklov bor. Agar bir vaqtda oʻn oltitadan ortiq “ogʻir” quti chizilayotgan boʻlsa — shaffofligi birdan past, filtri yoki xiralashgan soyasi bor har qanday element, psevdoelementlar ham — Telegram widgetni toʻxtatadi. Kataklar roʻyxatini shaffof holatdan animatsiya qilishning oʻzi bunga yetarli. Endi faqat `transform` bilan animatsiya qilamiz.

## Qanday sinaymiz

Brauzerdagi koʻrinish yetarli emas. Har bir widget chiqishidan oldin Telegramʼning rasmiy widget sandboxʼida yurgiziladi: u widget toʻxtagan-toʻxtamaganini, ogʻir qutilarning eng yuqori sonini va yakuniy balandlikni koʻrsatadi. Sandboxʼda bosishlarni ham takrorlaymiz, chunki baʼzi muammolar faqat harakatdan keyin chiqadi.

Bitta xato oʻz kodimizdan chiqdi. Kartada koʻrsatiladigan qisqa ID UUIDv7 ning birinchi sakkiz belgisi edi — bular esa vaqt belgisi, shuning uchun bir daqiqada yaratilgan yozuvlar toʻqnashar va bosish notoʻgʻri qatorga tushishi mumkin edi. Oʻsha kechqurun chiqqan tuzatish endi oxirgi sakkiz belgini oladi.
