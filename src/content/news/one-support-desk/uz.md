---
title: Barcha mahsulotlar uchun bitta yordam xizmati
description: dtwin uchun qurgan ilova ichidagi yordam xizmatimiz endi ekotizimdagi barcha saytlarga xizmat qiladi. U bitta script tegi bilan qoʻshiladi; barcha xabarlar bitta qutiga tushadi va istalgan murojaat kerakli repozitoriyda GitHub issueʼga aylanishi mumkin.
date: 2026-11-02
category: product
links:
  - { label: Mahsulot, text: dtwin.uz, href: "https://dtwin.uz", kind: external }
  - { label: Ishlayapti, text: shop.dtwin.uz, href: "https://shop.dtwin.uz", kind: external }
source:
  - "dtwinuz/dtwin #168"
  - "dtwinuz/dtwin #227"
---

2026-yil 30-oktabrda dtwin ilovasi ichida yordam xizmati paydo boʻldi. Foydalanuvchi muammoni yozadi va skrinshot biriktiradi; xabar Telegramʼga keladi; u yerda yozilgan javob esa uning ochiq oynasiga jonli qaytadi. Bitta tugma suhbatni rasmlar, kontekst va javoblar bilan birga GitHub issueʼga aylantiradi.

Bu shunchalik yaxshi ishladiki, uni boshqa saytlarda ham koʻrishni xohladik. Har bir loyihaga nusxa koʻchirish olti xil yordam xizmatini qoʻllab-quvvatlashni anglatardi, shuning uchun 2026-yil 2-noyabrda dtwin yordam xizmatini markaziy hubʼga aylantirdik.

## Hub qanday ishlaydi

- **Loyihalar — bu sozlama.** Har bir loyiha nom, repozitoriy va u joylashtirilishi mumkin boʻlgan veb-originʼlardan iborat bitta yozuv. Loyiha qoʻshish uchun yangi kod kerak emas.
- **Mehmonlar ham yoza oladi.** dtwin akkaunti boʻlmagan tashrif buyuruvchilar ham murojaat ochishi mumkin. Ular faqat xesh koʻrinishida saqlanadigan murojaat kalitini oladi.
- **Qatʼiy originʼlar.** Hub faqat loyiha uchun roʻyxatga kiritilgan originʼlarga javob beradi. Notanish saytdan yoki boshqa loyihaning murojaat kaliti bilan kelgan soʻrov rad etiladi.
- **Bitta quti.** Har bir murojaat oʻz loyihasi belgisi bilan bitta Telegram chatga keladi, issue tugmasi esa issueʼni aynan oʻsha loyihaning repozitoriysida ochadi.

## Bitta script tegi

Har bir sayt bitta qator qoʻshadi:

```html
<script src="https://dtwin.uz/support/widget.js" data-project="shop" defer></script>
```

Vidjet Shadow DOM ichidagi oddiy JavaScript, shuning uchun u sahifaning oʻz uslublari va skriptlari bilan toʻqnashmaydi. Telefonda tugma saytning pastki menyusini yopib qoʻymaydi, uning ustiga koʻtariladi.

2-noyabr oxiriga kelib u oltita saytda ishlayotgan edi, jumladan shop, gym, med va TeleTwin.
