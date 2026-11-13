---
title: dtwin GitHub tashkilotiga aylandi
description: "dtwinʼning barcha repozitoriylari endi bitta GitHub tashkiloti — dtwinuz ostida: tasdiqlangan domen, umumiy jamoalar va har bir repozitoriy uchun bir xil qoidalar bilan."
date: 2026-10-30
category: company
links:
  - { label: GitHub, text: github.com/dtwinuz, href: "https://github.com/dtwinuz", kind: external }
  - { label: Ochiq kod, text: dtwinuz/bitg, href: "https://github.com/dtwinuz/bitg", kind: external }
source:
  - "https://github.com/dtwinuz"
  - "dtwinuz/dtwin #184"
  - "dtwinuz/dtwin #191"
---

2026-yil 30-oktabrgacha dtwin loyihalari shaxsiy GitHub akkauntida turardi. Bitta odam va bitta repozitoriy uchun bu yetarli. Lekin infratuzilma, reliz jarayonlari va tobora koʻproq hissa qoʻshuvchilari umumiy boʻlgan mahsulotlar oilasi uchun yetarli emas. Shuning uchun `dtwinuz` tashkilotini ochdik va hamma narsani bir kunda unga koʻchirdik.

## Ehtiyotkor koʻchish

Har bir koʻchirishdan oldin va keyin commitʼlar, issueʼlar, pull requestʼlar, relizlar va teglar sonini sanadik — har bir repozitoriyda raqamlar mos keldi. Secretʼlar repozitoriylar bilan birga koʻchdi. Loyiha doskalari koʻrinishlari va har bir maydon qiymati bilan nusxalandi, konteyner imageʼlari esa ishlab turgan xizmatlar oʻzgarmasligi uchun `ghcr.io/dtwinuz` ga nusxalandi. dtwin.uz domeni tashkilot uchun tasdiqlangan.

## Hamma joyda bir xil qoidalar

Tashkilotning maʼnosi shundaki, qoidalar repozitoriyni kim yaratganiga bogʻliq boʻlmay qoladi. Endi har bir repozitoriyda:

- uchta jamoa — `core`, `maintainers` va `contributors` — admin, maintain va write huquqlari bilan;
- faqat squash merge, shuning uchun `main` har bir oʻzgarish uchun bitta commit sifatida oʻqiladi;
- `CODEOWNERS` fayli va guruhlangan Dependabot yangilanishlari — ular yangi relizni taklif qilishdan oldin yetti kun kutadi;
- toʻliq commit SHA bilan qotirilgan GitHub Actions — tashkilot endi buni majburiy qiladi;
- SBOM va build provenance eʼlon qiladigan hamda Trivy skanerini yurgizadigan reliz workflowʼlari.

Barcha aʼzolarda ikki bosqichli autentifikatsiya yoqilgan. Shablon repozitoriy — .NET 10 API, React va Vite frontend, Caddy, Docker Compose va CI — yangi mahsulot bularning hammasi bilan boshlanishini taʼminlaydi.

Private repozitoriylarda majburiy review kabi baʼzi himoyalar GitHubʼning bepul tarifida mavjud emas. Bu qayerda taʼsir qilishini yashirmasdan qayd etib qoʻydik.
