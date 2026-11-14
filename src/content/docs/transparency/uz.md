---
updated: 2026-11-13
summary: Wonmor nimani va qanchalik tez-tez eʼlon qiladi, nimani hech qachon eʼlon qilmaydi va raqamlarimizni oʻzingiz qanday tekshirishingiz mumkin.
---

Ishonch bizning gapimizga ishonishga bogʻliq boʻlmasligi kerak. Bu sahifada ishimiz haqida nimani eʼlon qilishimiz, qachon eʼlon qilishimiz, nimani hech qachon eʼlon qilmasligimiz va yuqoridagi raqamlarni oʻz vositalaringiz bilan qanday tekshirishingiz mumkinligi yozilgan.

Bu siyosat 2026-yil 13-noyabrdan amal qiladi.

## Biz kimmiz, ochiq aytganda

Wonmor — Oʻzbekistondan chiqqan, oʻz mablagʻi hisobidan ishlaydigan brend. U kompaniya emas: yuridik shaxs, kengash va investorlar yoʻq, Wonmordan tashqarida hech kimning unda moliyaviy ulushi yoʻq. Serverlar, domenlar, CI daqiqalari va dizayn vositalari uchun asoschi oʻz choʻntagidan toʻlaydi. Yuridik shaxs va ochiq manba fondi rejada; ulardan biri haqiqatga aylanganda sanasi bilan eʼlon qilinadi va bu sahifa yangilanadi.

## Nimani eʼlon qilamiz

| Nima | Qayerda | Qanchalik tez-tez |
|---|---|---|
| Reliz yozuvlari | Har bir ochiq repozitoriyning GitHub Releases boʻlimi, loyiha yuritsa CHANGELOG fayli | Har bir relizda |
| Yangiliklar | [wonmor.io/news](/uz/news/), har bir post sanali va manbalariga havola bilan | Biror narsa chiqqanda yoki oʻzgarganda |
| bitg uchun OpenSSF Best Practices qaydi | [bestpractices.dev/projects/16620](https://www.bestpractices.dev/projects/16620) | Mezonlar oʻzgarganda biz yangilaymiz; qayd oʻz tarixini saqlaydi |
| bitg uchun OpenSSF Scorecard | [scorecard.dev](https://scorecard.dev/viewer/?uri=github.com/dtwinuz/bitg) | OpenSSF avtomatik qayta hisoblaydi |
| Har bir mahsulotning reliz darajasi (WRL) | [Masʼuliyatli reliz siyosati](/uz/responsible-release-policy/) | Daraja oʻzgarganda, va kamida olti oyda bir marta qayta koʻriladi |
| Bosh sahifadagi raqamlar va yuqoridagi raqamlar | Shu sayt, har bir toʻplam sanalgan sanasi bilan belgilangan | Sayt har safar qayta yigʻilganda |
| Xavfsizlik advisoryʼlari | Taʼsirlangan ochiq repozitoriyning Security boʻlimi | Xabar qilingan muammo tuzatilganda |
| Homiylik hisoboti | [Homiylik](/uz/company/sponsorship/) | Har yili, rejada; birinchi hisobot 2026-yilni qamraydi |

Bu saytdagi har bir raqam sanalgan sanasi bilan belgilanadi, masalan, “2026-yil 13-noyabr holatiga”. Sanasiz raqam — xato, va bu haqda eshitishni xohlaymiz.

Homiylik hisoboti rejada, hali eʼlon qilinmagan. Unda Wonmor qoplaydigan xarajat turlari, masalan, serverlar, domenlar, CI va dizayn, hamda ular qaysi mahsulotlarni qoʻllab-quvvatlashi roʻyxat qilinadi. Unda taxminlar emas, toifalar boʻyicha haqiqiy jami summalar boʻladi.

## Nimani hech qachon eʼlon qilmaymiz

Baʼzi maʼlumotlar ataylab yopiq tutiladi, va ularni chop etish biror raqamni chiroyliroq qilsa ham, ular yopiq qoladi:

- **Shaxsiy maʼlumotlar.** Mahsulotlarimizdan foydalanadigan har qanday odamning ismi, aloqa maʼlumotlari, xabarlari yoki faoliyati.
- **Mijoz maʼlumotlari.** Mahsulotdan kim tijorat maqsadida foydalanishi va ularning biznesiga oid har qanday narsa — agar ular oʻzlari nomlanishni soʻramagan boʻlsa.
- **Sirlar.** Tokenlar, kalitlar, parollar va kirish huquqini beradigan har qanday narsa.
- **Infratuzilma tafsilotlari.** Server manzillari, ichki host nomlari va tarmoq tuzilishi.
- **Tuzatilmagan zaifliklar.** Xavfsizlik muammolari faqat tuzatish chiqqandan keyin advisory orqali oshkor qilinadi.

Biror raqamni shulardan birini oshkor qilmasdan koʻrsatib boʻlmasa, raqamni koʻrsatmaymiz.

## Raqamlarimizni qanday tekshirish mumkin

Daʼvolarimizning aksariyatini GitHub CLI (`gh`) va ikkita ochiq API bilan tekshirish mumkin. Avval bitta halol eslatma: repozitoriylarimizning bir qismi yopiq. Yuqoridagi raqamlarni biz tashkilotdagi barcha repozitoriylarga kirish huquqi bilan sanaymiz, shuning uchun xuddi shu buyruqlar sizning akkauntingizdan faqat ochiq qismini koʻrsatadi va kichikroq raqam qaytaradi. Bunday hollarda ochiq raqam — siz tekshira oladigan quyi chegara.

**Tashkilotdagi repozitoriylar:**

```bash
gh repo list dtwinuz --limit 200 --json name --jq length
```

**Tashkilot boʻyicha merge qilingan pull requestʼlar:**

```bash
gh api "search/issues?q=org:dtwinuz+is:pr+is:merged" --jq .total_count
```

**Loyiha relizlari, masalan bitg:**

```bash
gh release list -R dtwinuz/bitg
```

**Yuklab olingan bitg fayli ochiq manbadan bizning reliz workflowʼimiz tomonidan yigʻilgani:**

```bash
gh attestation verify bitg-0.3.1-x64.msi -R dtwinuz/bitg
```

**bitg uchun OpenSSF Best Practices darajasi:**

```bash
curl -s https://www.bestpractices.dev/projects/16620.json | jq .badge_level
```

**bitg uchun OpenSSF Scorecard natijasi:**

```bash
curl -s https://api.securityscorecards.dev/projects/github.com/dtwinuz/bitg | jq .score
```

2026-yil 14-noyabrda bu buyruqlar 26 ta repozitoriy va 659 ta merge qilingan pull request (toʻliq kirish huquqi bilan sanalgan), bitg uchun “gold” nishon darajasi va 8,5 Scorecard bahosini qaytardi. Bosh sahifadagi raqamlarni biz shu buyruqlar bilan qayta sanaymiz (sayt repozitoriyasidagi `tools/count-numbers.mjs`), yonida sanash sanasi turadi; sanashlar orasida tashkilot harakatda davom etadi.

## Raqam notoʻgʻri boʻlsa

Bu saytda takrorlay olmaydigan yoki eskirgan raqamni topsangiz, bizga ayting. [Xavfsizlik sahifasidagi](/uz/security/) aloqadan foydalaning yoki [github.com/dtwinuz/.github](https://github.com/dtwinuz/.github/issues) da ochiq issue oching. Xatolarni ochiq tuzatamiz: tuzatilgan sahifa yangi “yangilangan” sanasini oladi, xato yangilik postida boʻlsa, postda nima oʻzgargani yoziladi.
