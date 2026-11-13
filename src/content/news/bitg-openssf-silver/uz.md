---
title: bitg OpenSSF Best Practices kumush, keyin oltin nishonini oldi
description: bitg 0.3.1 imzolangan build kelib chiqishi va SBOM attestatsiyalari bilan chiqdi, loyiha OpenSSF kumush va oltin darajalarining barcha talablariga javob beradi.
date: 2026-11-13
category: product
product: bitg
featured: true
links:
  - { label: Mahsulot, text: bitg, href: "https://bitg.uz", kind: external }
  - { label: Reliz qaydlari, text: v0.3.1, href: "https://github.com/dtwinuz/bitg/releases/tag/v0.3.1", kind: external }
  - { label: Manba kod, text: GitHub, href: "https://github.com/dtwinuz/bitg", kind: external }
source:
  - "https://github.com/dtwinuz/bitg/releases/tag/v0.3.1"
  - "https://github.com/dtwinuz/bitg/pull/48"
  - "https://www.bestpractices.dev/projects/16620"
---

bitg 0.3.1 2026-yil 13-noyabrda chiqdi. Bu — har bir paketni uni yigʻgan manba kodga solishtirib tekshirish mumkin boʻlgan birinchi reliz.

## Nima oʻzgardi

- **Imzolangan kelib chiqish maʼlumoti.** Har bir reliz faylida GitHub Actionsʼda yaratilgan imzolangan build-provenance va SBOM attestatsiyasi bor. Ular yaratilganiga ishonib qoʻyilmadi — eʼlondan keyin tekshirildi.
- **Qayta yigʻiladigan Linux paketlari.** `.deb` paketlarini bitta commitʼdan ikki marta yigʻsangiz, baytma-bayt bir xil fayllar chiqadi.
- **Qamrov chegarasi.** Pull request testlar qamrovini pasaytira olmaydi. Linuxʼda shoxlarning 94,81% va qatorlarning 97,19% testlar bilan qoplangan.

MSI va macOS `.pkg` paketlarini qayta yigʻish reliz chiqqandan bir necha soat oʻtib `main`ga qoʻshildi va keyingi versiyada chiqadi.

## Avval kumush, keyin oltin

Loyiha 12-noyabr kechasi OpenSSF Best Practices kumush darajasi talablarining 100% ini bajardi. Bu post ilk yozilganda oltin darajasi 57% edi: qolgan talablar koddan koʻra odamlarga bogʻliq edi — ikki kishilik koʻrib chiqish, barcha maintainerʼlarda ikki bosqichli autentifikatsiya va relizni chiqara oladigan bir nechta odam.

**Yangilanish, 2026-yil 13-noyabr:** oʻsha kuni ertalab bestpractices.dev dagi loyiha yozuvi **oltin** darajaga yetdi — boshlangʻich, kumush va oltin talablarining barchasi bajarilgan.
