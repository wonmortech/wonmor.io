---
title: "TeleTwin: Telegram uchun korporativ qatlam"
description: TeleTwin shaxsiy chatlarni oʻz joyida qoldiradi va kompaniyaning oʻz serverida yashaydigan ish chatlari hamda eʼlonlarini qoʻshadi. Xodimning ruxsati bekor qilinsa, u bir necha soniyada kompaniya qismidan chiqariladi.
date: 2026-10-29
category: product
product: teletwin
links:
  - { label: Mahsulot, text: tele.dtwin.uz, href: "https://tele.dtwin.uz", kind: external }
  - { label: Manba kod, text: teletwin-web, href: "https://github.com/dtwinuz/teletwin-web", kind: external }
source:
  - "https://github.com/dtwinuz/teletwin-web"
  - "https://tele.dtwin.uz"
---

Telegramʼda ishlaydigan jamoalarda ish chatlari oilaviy va shaxsiy chatlar bilan yonma-yon turadi. Muammo kimdir ishdan ketganda boshlanadi: ish suhbatlari kompaniya boshqarmaydigan shaxsiy akkauntda qoladi. TeleTwin — bizning javobimiz. U 2026-yil 29-oktabrda boshlandi.

TeleTwin — mustaqil loyiha, Telegram bilan hech qanday aloqasi yoʻq.

## Qanday ishlaydi

TeleTwin ochiq kodli Telegram klientlari asosida qurilgan. Shaxsiy chatlar Telegramʼda, oʻzgarishsiz qoladi. Ish chatlari va eʼlonlar kompaniya oʻzi boshqaradigan alohida serverda yashaydi va shaxsiy chatlar yonida “Korxona” papkasida koʻrinadi.

Administrator xodimning ruxsatini bekor qilganda server oʻsha odamning ulanishini yopadi va klient kompaniya qismidan chiqadi. Internet orqali oʻtkazilgan end-to-end testda ulanish bekor qilinganidan taxminan bir soniya oʻtib uzildi. Klientdagi himoyalar ish xabarlarining tasodifan Telegramʼga ketib qolishiga yoʻl qoʻymaydi — yuborishda, yozayotganini koʻrsatishda, havola koʻrinishida va tarixda.

## Nima chiqdi

- Telegram Desktop asosidagi desktop klient; uning Windows yigʻmasi 29-oktabrda tayyor boʻldi.
- Telegram Web A asosidagi veb-klient — u GitHubʼda ochiq kodli va desktop ilova sifatida ham paketlangan.
- Fayllar, javob berish, tahrirlash, oʻchirish, reaksiyalar, qadash, oʻqilganlik belgilari va yozayotganlik koʻrsatkichi bor korporativ server; oʻsha kechqurun unga shaxsiy xabarlar, threadʼlar, eslatib oʻtishlar, rejalashtirilgan xabarlar, soʻrovnomalar, onlayn holat, kiruvchi webhookʼlar va qidiruv qoʻshildi.

Hammasi tele.dtwin.uz manzilida. Ovozli va video qoʻngʻiroqlar keyingi bosqich edi: qoʻngʻiroqlarning server qismi 1-noyabrda qoʻshildi va media server sozlanmaguncha oʻchiq turadi.
