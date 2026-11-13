---
title: "Transliteratsiyani halol baholash: natijamiz nega 99,17% dan 98,87% ga tushdi"
description: "Oʻzbekcha konvertorimiz 99,17% koʻrsatardi, keyin lugʻati baholash gaplarini ham sanab qoʻygani maʼlum boʻldi. Sizib chiqishni yopish 0,30 ballga tushdi, oʻzgargan toʻqqizta gap esa sizib chiqish aslida nimani oʻrgatganini koʻrsatdi."
date: 2026-11-12
kind: research
area: language
featured: true
source:
  - "https://github.com/dtwinuz/bitg/commit/b3102bc0f4127e8ccb9f05a21a76cce20275353e"
  - "https://github.com/dtwinuz/bitg/pull/8"
  - "dtwinuz/bitg eval/README.md"
  - "dtwinuz/bitg README.md (sections Sifat, Lug'at)"
reproduce:
  repo: "https://github.com/dtwinuz/bitg"
  commit: "2de5c94"
  note: "Dastlabki uchta buyruq mainʼda 2966/3000, 2436/3000 va 2992/3000 beradi; oxirgi ikkitasi tuzatishdan oldingi lugʻatni qayta quradi va xuddi shu gaplarda 2975/3000 (99,17%) beradi."
  commands:
    - "cargo build --release -p bitg-cli"
    - "target/release/bitg eval eval/uz.tsv"
    - "target/release/bitg eval eval/uz_noapos.tsv && target/release/bitg eval eval/en.tsv"
    - "git checkout a7962ef -- crates Cargo.toml Cargo.lock"
    - "cargo build --release -p bitg-cli && target/release/bitg eval eval/uz.tsv"
---

bitg oʻzbekcha matnni yozish paytidayoq 2026-yilgi lotin alifbosiga oʻtkazadi: `o'zbek` — `özbek`, `shahar` — `şahar` boʻladi, *check* yoki *push* kabi inglizcha soʻzlarga esa tegilmaydi. Birinchi kundan har bir qoida oʻzgarishini misollar bilan emas, uchta qatʼiy test toʻplami bilan baholadik. 2026-yil 12-noyabr ertalab asosiy toʻplamdagi natija **pasaydi**: 99,17% dan 98,87% ga. Shu pasayish hozirgacha eʼlon qilgan eng foydali natijamiz boʻldi.

Bu maqolada test toʻplamlari qanday tuzilgani, sizib chiqish qanday sodir boʻlgani, oʻzgargan toʻqqizta gap nimani aytishi va raqamlar hali nimani oʻlchamasligi haqida yozamiz.

## Konvertor aldab oʻtolmaydigan uchta toʻplam

Baholash toʻplami repozitoriyning `eval/` papkasida turadi va CC BY 4.0 litsenziyasida eʼlon qilingan: istalgan odam oʻz konvertorini xuddi shu gaplarda sinab koʻrishi mumkin. Har faylda `til<TAB>kirish<TAB>kutilgan` koʻrinishidagi 3 000 qator bor.

| Toʻplam | Nimani tekshiradi | Manba |
|---|---|---|
| `uz.tsv` | kirish — aralash apostrofli eski lotin, chiqish — 2026-yilgi lotin | Leipzig `uzb_community_2017` |
| `uz_noapos.tsv` | xuddi shu vazifa, lekin oʻ/gʻ dagi apostrof tushib qolgan (`ozbek`, `togri`) | oʻsha korpus, boshqa gaplar |
| `en.tsv` | sh, ch yoki apostrof bor inglizcha gaplar; oʻzgarmasdan chiqishi kerak | Leipzig inglizcha yangiliklar 2020 (1 523) va veb 2018 (1 477) |

Oʻzbekcha toʻplamlarning hajmdan ham muhimroq bir xususiyati bor. Manba gaplar **kirill** yozuvida, kirish ham, kutilgan javob ham shu kirill matndan bir-biridan mustaqil hosil qilinadi: kirish uchun kirilldan eski lotinga, kutilgan javob uchun kirilldan 2026-yilgi lotinga. Konvertor javobning imlosini kirishda koʻrmaydi, shuning uchun `Is'hoq → Ishoq` va `Sh.Sharipov → Ş.Şaripov` ni oʻzi topishi kerak. Faqat 20 dan ortiq kirill harfi bor va bitta ham lotin harfi yoʻq gaplar olinadi, tanlov `--seed 2026` bilan qotirilgan.

```steps
Tanlash :: tools/build_eval.py har toʻplam uchun qotirilgan seed bilan 3 000 ta kirill gap oladi.
Ikki marta hosil qilish :: Kirish (eski lotin) va kutilgan javob (2026-yilgi lotin) har biri kirilldan alohida transliteratsiya qilinadi.
Chiqarib tashlash :: tools/build_lexicon.py soʻzlarni sanashdan oldin eval qatoriga mos keladigan har bir korpus gapini tashlab yuboradi.
Baholash :: bitg eval gapni faqat butun chiqish aynan mos kelsa toʻgʻri deb sanaydi.
```

Baho qatʼiy: gapning istalgan joyidagi bitta notoʻgʻri harf butun gapni xato qiladi.

## Sizib chiqish qanday kirib qoldi

bitg soʻz oʻzbekcha ekanini ochiq korpuslardan qurilgan chastota lugʻati yordamida aniqlaydi. Birinchi lugʻat soʻzlarni `uzb_community_2017-words.txt` dan sanagan edi: bu Leipzig gaplar bilan birga beradigan soʻz chastotasi fayli. Baholash gaplari ham shu korpusdan olingan. Soʻz roʻyxati oʻz sanoqlari qaysi gaplardan kelganini aytolmaydi, shuning uchun 3 000 ta test gapi jimgina oʻqitish maʼlumotining bir qismiga aylangan edi.

Tuzatish `b3102bc` commitʼida, yangi korpuslar qoʻshilgan commitʼning oʻzida keldi. Endi soʻz roʻyxati oʻrniga toʻliq gaplar fayli oʻqiladi va eval qatorining kutilgan ustuniga mos keladigan har bir manba gapi tashlab yuboriladi (`--exclude-eval eval/uz.tsv eval/uz_noapos.tsv`). `eval/README.md` ga koʻra, takrorlar bilan birga `community_2017` dan 6 002 ta, `newscrawl_2011` dan 767 ta gap chiqarib tashlandi.

Commit xabarida uchta qator yozilgan, repozitoriy READMEʼsi ularni saqlab turibdi:

| Lugʻat | `uz` | `uz_noapos` | `en` |
|---|---|---|---|
| avvalgi, eval gaplari sanoqda | 99,17% | 69,07% | 99,73% |
| oʻsha manbalar, eval chiqarilgan | 98,87% | 68,50% | 99,73% |
| koʻproq manba, eval chiqarilgan | 98,87% | 81,30% | 99,73% |

Ikkinchi qator birinchisining halol koʻrinishi. Uchinchi qator apostrofsiz matnda haqiqiy oʻsish, va unga ishonish mumkinligining sababi ikkinchi qator borligida.

Bu maqola uchun ikkala versiyani bitta kompyuterda manbadan qayta qurdik. Ota commit `a7962ef` dagi lugʻat eʼlon qilingan eval fayllarida `uz.tsv` da **2975/3000 (99,17%)**, `uz_noapos.tsv` da **2072/3000 (69,07%)** beradi. Hozirgi `main` (`2de5c94`) esa **2966/3000 (98,87%)**, **2436/3000 (81,20%)** va **2992/3000 (99,73%)** beradi. Eʼlon qilingan raqamlar aynan takrorlandi.

## Sizib chiqish nimani oʻrgatgan edi

Toʻqqizta gap kichik farq, shuning uchun ikki natijani gapma-gap solishtirdik. Oqib chiqqan lugʻat bilan oʻtgan oʻnta gap endi yiqiladi; ilgari yiqilgan bitta gap endi oʻtadi.

Oʻsha oʻnta gap koʻp narsani ochib beradi. `community_2017` korpusi foydalanuvchi izohlaridan iborat, kirill matnda imlo xatolari koʻp: `ғ` oʻrniga `г`, `қ` oʻrniga `к`. Kutilgan javob shu kirill matndan transliteratsiya qilingani uchun xatoni saqlab qoladi. Sizib chiqish bor paytda lugʻat bu xato shakllarni test gaplarining oʻzida koʻrgan, shuning uchun bitg ularga tegmagan va «kutilgan» javobga mos kelgan. Sizib chiqishsiz esa diqqatli oʻquvchi nima qilsa, shuni qiladi. Bizning oʻqishimizcha, oʻntadan oltitasida bitg manba tushirib qoldirgan harfni tiklagan:

- `girt` → `ğirt`, `kambagal` → `kambağal`, `garbga` → `ğarbga`, `yorug` → `yoruğ`, `gazabiga` → `ğazabiga`, `kopda` → `köpda`.

Qolgan toʻrttasi haqiqiy xato:

- `holdan toyadi` («charchab yiqiladi») `töyadi` («toʻyadi») boʻlib qoldi; rassom Shagal, `Şagal`, `Şağal` ga aylandi; `orka` va `kolsa` (`orqa` va `qolsa` ning xato yozuvi) `örka` va `kölsa` boʻldi.

Demak, sizib chiqish bitgʼni oʻzbek tilida yaxshiroq qilmagan. U bitgʼni bitta aniq test toʻplamidagi shovqinni takrorlashda yaxshiroq qilgan. Bunday oshirib koʻrsatishni payqash qiyin va u notoʻgʻri tomonga yetaklaydi: modelni imlo xatolari bilan rozi boʻlgani uchun mukofotlaydi.

Bu yana shuni anglatadiki, 98,87% shovqinli oʻlchov: qolgan 34 ta xatoning bir qismi korpus shovqini, bir qismi haqiqiy xato. README buni bir qatorda aytadi («farqning koʻpi kirill korpus xatosi»); bu solishtiruvdan keyin biz ehtiyotkorroq gapirgan boʻlardik, chunki yangi koʻringan oʻnta xatodan toʻrttasi haqiqiy chiqdi.

## Ataylab qilingan pasayish

Oʻzgarish raqamni ataylab tushirganda ham xuddi shu tartib amal qiladi. PR #8 da apostrofsiz yozilganda chindan ikki xil oʻqiladigan soʻzlarni taxmin qilishni toʻxtatdik. `ochmaydi` soʻzini «ochmaydi» deb ham, `oʻchmaydi` deb ham oʻqish mumkin; `otdim` esa «otdim» ham, `oʻtdim` ham boʻlishi mumkin. Eski kod koʻproq uchraydigan oʻzakni tanlab, soʻzni jimgina oʻzgartirardi.

Yangi qoida bunday soʻzni yozilganicha qoldiradi, agar ikkala oʻzak ham keng tarqalgan boʻlsa (ogʻirlik kamida 2,9, bir-biridan farqi 1,2 dan oshmaydi), apostrofsiz shakl korpusda umuman uchramasa va nomzod siyrak boʻlsa (3,0 dan past). Saytdagi konvertor uni sariq rangda belgilaydi va oʻquvchiga almashtirish imkonini beradi.

`uz_noapos.tsv` da bu natijani 2439 dan **2436** ga tushirdi. Soʻz darajasida: eval yozilganicha qolishini kutgan uchta gap (`otdim`, `oçmaydi`, `otlikka`) toʻgʻri boʻldi, oʻnta chindan ikki maʼnoli soʻz (jumladan `otmoqchi`, `oqdan`, `oqidan`) endi taxmin qilinmaydi. Chegarani tanlashdan oldin uni ham oʻlchab chiqdik: 3,0 da 2434, 3,2 da 2430, 3,6 da 2424, 4,0 da 2402. Pastroq raqamni chiqardik, chunki yozayotgan odam uchun jim notoʻgʻri taxmin koʻrinib turgan «tekshiring» belgisidan yomonroq.

## Cheklovlar

- **Bitta korpus oilasi.** Ikkala oʻzbekcha toʻplam ham Leipzig `uzb_community_2017` dan. Izohlar kundalik yozishni yaxshi aks ettiradi, lekin huquqiy, texnik yoki badiiy matnni emas. Ikkinchi soha hali yoʻq.
- **Aynan moslik boʻyicha baho.** Bitta harfi xato gap oʻnta harfi xato gap bilan bir xil sanaladi. Soʻz darajasidagi aniqlikni hali eʼlon qilmaymiz.
- **Javoblardagi shovqin.** Kutilgan chiqish kirill manbadagi imlo xatolarini saqlaydi. Toʻplamni qoʻlda tozalamaganmiz, shuning uchun ayrim «xatolar» aslida bitg haq boʻlgan joylar.
- **Inglizcha hali mukammal emas.** Sakkizta inglizcha gap oʻzgaradi. Misol: `RP'er` — `RPʼer` boʻlib chiqadi, chunki bitg apostrofni bir xil belgiga keltiradi.
- **Tezlik kompyuterga bogʻliq.** README alohida benchmark boʻyicha oʻzbekcha soʻzga 2,7 µs deb yozadi. Bu maqola uchun qayta yurgizgan kompyuterimizda `bitg eval` chiqargan tezlik qatori soʻziga 7,48 µs boʻldi; bu benchmark emas va ikkalasini solishtirmaymiz.

Biz amal qiladigan qoida: baholash toʻplami ochiq, u oʻqitishdan niyat bilan emas, kod bilan chiqarib tashlanadi, va har oʻzgarish uchta raqam bilan baholanadi — ular pasayganda ham.
