---
title: "operobot: Oʻzbekiston qoidalari uchun qurilgan chiquvchi qoʻngʻiroq yordamchisi"
description: operobot kontaktlar roʻyxatiga qoʻngʻiroq qiladi, qiziqqanlarni jonli operatorga ulaydi va Oʻzbekistondagi qoʻngʻiroq qoidalariga kod darajasida amal qiladi. Koʻp tenantli demo uni shaxsiy sandboxʼda sinab koʻrish imkonini beradi.
date: 2026-11-04
category: product
product: operobot
links:
  - { label: Demo, text: operobot2.dtwin.uz, href: "https://operobot2.dtwin.uz", kind: external }
  - { label: Sayt, text: operobot.dtwin.uz, href: "https://operobot.dtwin.uz", kind: external }
  - { label: Manba kod, text: GitHub, href: "https://github.com/dtwinuz/operobot2", kind: external }
source:
  - "https://github.com/dtwinuz/operobot2"
  - "dtwinuz/dtwin #312"
  - "dtwinuz/dtwin #315"
---

Chiquvchi qoʻngʻiroqlar oddiy koʻrinadi: roʻyxatni olasiz, har bir raqamga qoʻngʻiroq qilasiz, xabarni eshittirasiz, qiziqqanlarni odamga ulaysiz. Oʻzbekistonda buning oʻz qoidalari bor va biz bu qoidalar qoʻllanmada emas, kodda boʻlishini xohladik. operobot 2026-yil 4-noyabrda boshlandi.

## Qoidalar kodda

- **Ish vaqti.** 2026-yil 1-noyabrdan reklama qoʻngʻiroqlari faqat 09:00 dan 18:00 gacha qilinishi mumkin. operobot qoʻngʻiroq navbati bu oraliqdan tashqarida raqam termaydi; buni faqat demo rejimi chetlab oʻta oladi.
- **Mahalliy raqam.** +998 raqami koʻrsatilgan, lekin xalqaro yoʻnalish orqali kelgan qoʻngʻiroqlar bloklanadi, shuning uchun operobot faqat mahalliy telefon liniyasidan foydalanishga moʻljallangan.
- **Maʼlumot mamlakatda qoladi.** Maʼlumotlarni lokalizatsiya qilish qonuni sababli tizim Oʻzbekistondagi serverlarda ishlashga moʻljallangan.

## Nima qiladi

Dialer Asteriskʼni uning REST interfeysi orqali boshqaradi. Kontaktlar roʻyxati jadvaldan olinadi; 1 tugmasini bosgan odam operatorga ulanadi. Shu yadro atrofida oʻsha kuni AI ovozli agent (nutqni tanish, til modeli va nutq sintezi bitta zanjirda), har bir qoʻngʻiroqning qisqa AI xulosasi, qoʻngʻiroq transkriptlari, lidlar uchun Kanban doskasi, keyingi SMS va eslatmalar, qoʻngʻiroq qilish uchun eng qulay soatlar hisoboti va AI agentlar uchun MCP toolʼlari qoʻshildi.

## Sinab koʻring

2026-yil 5-noyabrda koʻp tenantli versiya operobot2.dtwin.uz manzilida demo sifatida ishga tushdi. Har bir tashrif buyuruvchi 24 soatdan keyin oʻchiriladigan shaxsiy sandbox tashkilot oladi. Tenantlar maʼlumotlari PostgreSQLʼdagi row-level security bilan ajratilgan, demodagi qoʻngʻiroqlar esa simulyatsiya qilinadi. Haqiqiy tashkilotda 09:00–18:00 qulfi amal qiladi va ulangan dialer talab qilinadi.

operobot hali jonli telefon liniyasida ishlatilmagan. Bu, haqiqiy ovoz yozuvlari va narxlar — keyingi qadamlar.
