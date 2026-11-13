---
title: Tunnel bilan tanishing
description: Tunnel oʻz kompyuteringizda ishlayotgan xizmatni tunnel.dtwin.uz ostidagi ochiq HTTPS manzilga chiqaradi — oʻzimiz boshqaradigan infratuzilmada.
date: 2026-11-02
category: product
product: tunnel
links:
  - { label: Mahsulot, text: tunnel.dtwin.uz, href: "https://tunnel.dtwin.uz", kind: external }
  - { label: Umumiy maʼlumot, text: Tunnel, href: "/uz/products/tunnel/", kind: internal }
source:
  - "https://tunnel.dtwin.uz"
  - "dtwinuz/tunnel #10"
  - "dtwinuz/dtwin #303"
---

Oʻz kompyuteringizda ishlayotgan narsani — koʻrib chiqish uchun branchni, webhook qabul qiluvchini yoki demoni — ulashish odatda butun trafikingizni koʻradigan begona tunnel xizmatini anglatadi. Bizga oʻzimizniki kerak edi. Tunnel 2026-yil 2-noyabrda tunnel.dtwin.uz manzilida ishga tushdi.

## Ikki xil foydalanish

- **Doimiy tunnellar.** `tunnel add` va `tunnel up` nomli subdomenni roʻyxatdan oʻtkazadi va uni fonda ulangan holda ushlab turadi.
- **Bir martalik tunnellar.** `tunnel http <port>` Ctrl+C bosilguncha vaqtinchalik manzil ochadi, `tunnel serve` esa papkani eʼlon qiladi.

Har bir kishi shaxsiy kirish kaliti bilan kiradi, kalitsiz ulangan har qanday klientni server rad etadi. Tunnelni IP manzillar roʻyxati bilan cheklash, maʼlum nom kutadigan ilovalar uchun Host sarlavhasini qayta yozish, qulflash yoki pauzaga qoʻyish mumkin. `tunnel doctor` sozlamalarni tekshiradi, `tunnel myip` esa server koʻrayotgan manzilni koʻrsatadi. Go tilida yozilgan kichik lokal inspektor oʻtayotgan soʻrovlarni koʻrsatadi va ularni faqat xotirada saqlaydi.

## Qanday qurilgan

Tunnel frp asosida qurilgan, uning oldida esa kirish, subdomenlarga egalik, pauza va jurnallarni boshqaradigan oʻzimizning gateway turadi. Klientlar — Windows uchun PowerShell skripti, Linux va macOS uchun shell skripti.

Amalda qulaylik beradigan ikki tafsilot bor. Birinchisi: yangi havola faqat uning TLS sertifikati tayyor boʻlgandan keyin koʻrsatiladi. Birinchi sertifikat taxminan sakkiz soniya oladi, shuning uchun server birinchi mehmoningizni kuttirib qoʻymaslik uchun uni manzilni berishdan oldin soʻraydi. Ikkinchisi: frp binar fayllari oʻz serverimizda SHA-256 nazorat yigʻindilari qotirilgan holda nusxalangan, chunki Oʻzbekistondagi baʼzi tarmoqlarda GitHubʼdan yuklab olish osilib qolishi mumkin.

Sertifikatlar wildcard emas, har bir subdomen uchun alohida beriladi, chunki DNS provayderimizda API yoʻq.
