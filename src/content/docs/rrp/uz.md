---
updated: 2026-11-13
summary: Har bir mahsulot nimani isbotlaganini va undan nima kutish mumkinligini koʻrsatadigan toʻrt reliz darajasi — WRL-1 dan WRL-4 gacha.
---

dtwin ekotizimidagi har bir mahsulotning Wonmor reliz darajasi (Wonmor Release Level, WRL) bor. Daraja bitta amaliy savolga javob beradi: bugun bu mahsulotga qanchalik tayanish mumkin? Bu mahsulotda qancha imkoniyat borligi yoki u qanchalik chiroyli koʻrinishining oʻlchovi emas. Kichik vosita yuqori darajada, katta va chiroyli mahsulot esa eng past darajada turishi mumkin.

Mahsulot darajani niyat bilan emas, dalil bilan oladi. Quyidagi jadvalda har bir mahsulot va uning hozirgi darajasi keltirilgan. Jadval saytning qolgan qismi bilan bir xil mahsulot maʼlumotlaridan yasaladi, shuning uchun u mahsulot sahifalaridagi gapdan farq qilib qola olmaydi.

Bu siyosat 2026-yil 13-noyabrdan amal qiladi.

## Toʻrt daraja

| Daraja | Nomi | Bir qatorda |
|---|---|---|
| WRL-1 | Prototip | Demo. Koʻring, sinab koʻring, unga tayanmang. |
| WRL-2 | MVP | Haqiqiy foydalanish, ortida CI va zaxira bor. |
| WRL-3 | Ishlab turibdi | Kuzatiladi, orqaga qaytariladi, xavfsizlik koʻrigidan oʻtgan. |
| WRL-4 | Muhim | Istalgan odam tekshira oladigan build, ochiq xavfsizlik qaydlari. |

Har bir daraja oʻzidan pastdagi darajalarning barcha talablarini oʻz ichiga oladi.

## WRL-1: Prototip

**Taʼrif.** Gʻoyani koʻrsatadigan ishlaydigan demo. U ogohlantirishsiz qayta yozilishi, nomi oʻzgarishi yoki oʻchirilishi mumkin.

**Talab qilinadigan dalil.** Mahsulot ochiladi va mahsulot sahifasida prototip deb aniq belgilangan; u yerda koʻrsatilgan “WRL-1 · Prototip” daraja belgisi aynan shu yorliq. Yonidagi MVP yoki Preview kabi bosqich yorligʻi imkoniyatlar qanchalik tayyorligini bildiradi, mahsulotga qanchalik tayanish mumkinligini emas.

**Nima kutish mumkin.** Uni sinab koʻrib, fikringizni aytishingiz mumkin. Unda muhim narsa saqlamang va haqiqiy shaxsiy maʼlumot kiritmang. Maʼlumotlar istalgan vaqtda tozalanishi mumkin; uzluksiz ishlash yoki yordam vaʼda qilinmaydi.

## WRL-2: MVP

**Taʼrif.** Haqiqiy odamlar haqiqiy ishlar uchun foydalanadigan mahsulot. U yomon oʻzgarish ushlanadigan va yoʻqolgan maʼlumot tiklanadigan qilib qurilgan.

**Talab qilinadigan dalil.**

- Uzluksiz integratsiya (CI) har bir pull requestʼda ishlaydi, oʻzgarishlar asosiy branchʼga faqat koʻrib chiqilgan merge orqali tushadi.
- Mahsulot foydalanuvchi maʼlumotini saqlasa, u avtomatik zaxiralanadi va tiklash kamida bir marta sinab koʻrilgan.
- Muammo haqida xabar berish uchun ochiq joy bor: issue tracker, fikr formasi yoki yordam xizmati.

**Nima kutish mumkin.** Maʼlumotlaringiz zaxiralanadi. Xatolar kuzatiladi va tuzatiladi, lekin imkoniyatlar hali oʻzgarishi va qisqa uzilishlar boʻlishi mumkin. Mos kelmaydigan oʻzgarishlar reliz yozuvlarida yoki mahsulot sahifasida aytiladi.

## WRL-3: Ishlab turibdi

**Taʼrif.** Odamlar har kuni tayanishini kutadigan, infratuzilmadek ehtiyotkorlik bilan yuritiladigan mahsulot.

**Talab qilinadigan dalil.**

- Holat monitoringi mahsulotni doimiy tekshiradi, u ishlamay qolsa kimgadir xabar boradi.
- Orqaga qaytarish yoʻli yozib qoʻyilgan va ishlatilgan yoki mashq qilingan: yomon relizni oldingisiga qaytarish mumkin.
- Xavfsizlik koʻrigi oʻtkazilgan va yozib qoʻyilgan: nima notoʻgʻri ketishi mumkin, nima undan himoya qiladi va maʼlum xavf sifatida nima qoladi.
- Zaxiralar bir martagina emas, jadval boʻyicha tiklab koʻriladi.

**Nima kutish mumkin.** Uzilishlar tez sezib qolinadi va tuzatiladi yoki orqaga qaytariladi. Xavfsizlik xabarlari javob muddatlari eʼlon qilingan [xavfsizlik siyosatimiz](/uz/security/) boʻyicha koʻriladi. Sizga taʼsir qiladigan oʻzgarishlar chiqishidan oldin yoki chiqqan paytda eʼlon qilinadi.

## WRL-4: Muhim

**Taʼrif.** Odamlar oʻz kompyuteriga oʻrnatadigan yoki maxfiy kiritishni ishonib topshiradigan mahsulot. Bunda siz nimani ishga tushirayotganingizni bizga ishonmasdan tekshira olishingiz kerak.

**Talab qilinadigan dalil.**

- Takrorlanadigan build: bir xil manba bir xil reliz fayllarini beradi, buni tekshirish qadamlari hujjatlashtirilgan.
- Har bir reliz uchun imzolangan provenance va dasturiy taʼminot tarkibi roʻyxati (SBOM), standart vositalar bilan tekshiriladi.
- OpenSSF Best Practices nishoni va ochiq OpenSSF Scorecard natijasi.
- Javob muddatlari, qoʻllab-quvvatlanadigan versiyalar va yopiq xabar kanali yozilgan ochiq xavfsizlik siyosati.

**Nima kutish mumkin.** Yuklab olingan fayl ochiq manbadan bizning reliz workflowʼimiz tomonidan yigʻilganini tekshira olasiz. Zaifliklar eʼlon qilingan muddatlar boʻyicha koʻriladi va tuzatilgach xavfsizlik advisoryʼsida oshkor qilinadi.

**Hozirgi misol.** Windows, Linux va macOS uchun oʻzbekcha klaviaturamiz bitg — WRL-4 darajasida. Unda OpenSSF Best Practices oltin nishoni bor ([bestpractices.dev/projects/16620](https://www.bestpractices.dev/projects/16620)). 0.3.1 versiyasidan boshlab har bir reliz fayli imzolangan build provenance va SBOM attestationʼi bilan keladi, ularni `gh attestation verify` bilan tekshirish mumkin. Uning Windows MSI va macOS .pkg buildʼlari takrorlanadigan (dtwinuz/bitg #48), xavfsizlik siyosati esa xabarlarni 7 kun ichida tasdiqlashni vaʼda qiladi.

## Mahsulot qanday yuqoriga koʻtariladi

```steps
Dalil yigʻish :: CI ishga tushishlari, tiklash sinovlari, koʻriklar yoki attestationʼlarga havolalar
Pull request ochish :: mahsulot maʼlumotida darajani oʻzgartirish va dalilga havola berish
Koʻrib chiqish :: dalil shu siyosat bilan band-band solishtiriladi
Merge :: quyidagi jadval saytning keyingi buildʼida yangilanadi
```

Mahsulot yuqoriroq darajaning barcha talablariga javob bersa, bir darajani sakrab oʻtishi mumkin. “Beta” yoki “preview” kabi holat belgilari imkoniyatlarni tasvirlaydi va WRLʼdan alohida.

## Mahsulot qanday pastga tushadi

Daraja — biz doim tekshirib turadigan vaʼda. Mahsulotning dalili haqiqat boʻlmay qolsa, u pastga tushadi:

- talab qilinadigan tekshiruv oʻtmay qoladi va 30 kun ichida tiklanmaydi;
- zaxira yoki monitoring buzilgani aniqlanadi;
- xavfsizlik muammosi biror talab aslida bajarilmaganini koʻrsatadi.

Pastga tushirish ham yuqoriga koʻtarish kabi qilinadi: nima oʻzgarganini aytadigan pull requestʼda. Darajaning pasayishini yashirmaymiz; mahsulot toʻxtatilganda esa uning darajasi olib tashlanadi va sahifasida bu yoziladi.

## Qayta koʻrib chiqish

Darajalarni har bir mahsulot reliz chiqarganda va kamida olti oyda bir marta qayta koʻrib chiqamiz. Biror mahsulotning darajasi notoʻgʻri deb hisoblasangiz, [xavfsizlik sahifasidagi](/uz/security/) aloqa orqali bizga yozing yoki mahsulot repozitoriysida issue oching.
