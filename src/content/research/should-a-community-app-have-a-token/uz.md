---
title: "Jamoa ilovasiga token kerakmi? (ADR-0002)"
description: "Bizdan dtwin uchun kriptoni qanday qabul qilish va oʻz tokenimizni qanday chiqarishni soʻrashdi. Qonun, platforma qoidalari, ulamolar fikri va “earn” tokenlar tajribasini koʻrib chiqib, tokendan voz kechdik. Bu qarorga qanday kelganimiz haqida."
date: 2026-11-02
kind: research
area: digital-assets
featured: false
source:
  - "dtwinuz/dtwin docs/adr/0002-no-token-contribution-points.md, accepted 2026-11-02 (private repository)"
  - "https://policy.4pillars.io/uzbekistan"
  - "https://forklog.com/en/uzbekistan-approves-framework-for-issuing-and-circulating-digital-assets/"
  - "https://telegram.org/tos/bot-developers"
  - "https://core.telegram.org/bots/payments-stars"
  - "https://www.rferl.org/a/uzbekistan-bitcoin-fatwa-cryptocurrency-gambling/32979073.html"
  - "https://depts.washington.edu/techdocs/papers/deciExtrinsicRewardsAndIntrinsicMotivation99.pdf"
---

*Bu maqola bitta mahsulot qarorini tushuntiradi. U investitsiya, huquqiy yoki diniy maslahat emas. Qaror hujjati biror faktni tasdiqlanmagan deb belgilagan boʻlsa, buni aytamiz yoki uni keltirmaymiz.*

Savol ochiq qoʻyildi: kripto toʻlovlarni qanday qabul qilamiz va oʻz tokenimizni eng maqbul yoʻl bilan qanday chiqaramiz? dtwin besh vaqt namoz atrofida qurilgan shaxsiy rejalashtirish ilovasi, uning Telegram boti va Mini Appʼi bor. Savol bir vaqtning oʻzida pul, qonun va ibodatga tegadi, shuning uchun u oʻylamasdan berilgan javobga emas, puxta javobga loyiq edi.

Bu javobni 2026-yil 2-noyabrda qabul qilingan ADR-0002 arxitektura qarori hujjati sifatida yozdik. Qisqasi: **oʻz tokenimiz yoʻq, kripto toʻlovlar yurist yozma javob berguncha muzlatilgan, buning oʻrniga qatʼiy qoidali off-chain “hissa ballari” tizimi.** Maqolaning qolgan qismi buning sababini tushuntiradi.

## Toʻrt nuqtai nazar

ADR savolni toʻrt tomondan tekshiradi. Ularning har biri tokenni yolgʻiz oʻzi toʻxtata oladi.

**1. Oʻzbekiston qonunchiligi.** ADR keltirgan siyosat sharhiga koʻra, 2023-yildan rezidentlar kripto-aktivlarni faqat NAPP litsenziyasiga ega provayderlar orqali sotib olishi va sotishi mumkin, kripto esa toʻlov vositasi emas. Rezident foydalanuvchidan obuna uchun stablecoin qabul qilish shu taqiqqa tushadi. ADR keltirgan ikkinchi manba, raqamli aktivlarni chiqarish tartibi haqida, rezidentlarga taʼminlanmagan token va stable token chiqarish taqiqlanganini, white paper esa litsenziyali kripto-depozitariy orqali oʻtishini tasvirlaydi. ADR soʻzlari bilan aytganda, “dtwin coin” chiqarib boʻlmaydi. ADRʼdagi baʼzi qoʻshimcha tafsilotlar, masalan jarima moddasining aniq raqami, tasdiqlanmagan deb belgilangan va biz ularni bu yerda takrorlamaymiz.

**2. Telegram qoidalari.** [Bot Developer Terms](https://telegram.org/tos/bot-developers) va [Stars toʻlovlari](https://core.telegram.org/bots/payments-stars) hujjati bot yoki Mini App ichidagi har narsa uchun chegarani belgilaydi. Raqamli tovarlar Stars orqali sotiladi. Mini Appʼlarda kripto faqat TON blokcheyni bilan cheklangan, boshqa tarmoq tokenlarini targʻib qilishga ruxsat yoʻq, hamyonlar TON Connect orqali ulanadi. Demak ERC-20 yoki BEP-20 tokenni Mini Appʼda umuman ishlatib boʻlmasdi. Telegramʼga mos keladigan yagona shakl TON jetton, birinchi nuqtai nazar esa aynan shu shaklni istisno qiladi.

**3. Ulamolar fikri.** dtwin diniy hukm chiqarmaydi, ADR ham bu boʻlim fiqh xulosasi emas, balki kontekst ekanini ochiq aytadi. Yakuniy javob malakali ulamolardan soʻraladi. Kontekst shundan iborat: kripto savdosi boʻyicha olimlar ixtilofda, [RFE/RL xabar berishicha](https://www.rferl.org/a/uzbekistan-bitcoin-fatwa-cryptocurrency-gambling/32979073.html), Oʻzbekiston musulmonlari idorasi 2024-yil iyunida kripto haqida fatvo eʼlon qilgan va ertasiga uni tadqiqot hali tugallanmagan deb qaytarib olgan. Narxi suzuvchi token noaniqlik (*gharar*) va tavakkal (*maysir*) masalalarini koʻtaradi. Alohida tomondan, ibodatni mukofotga bogʻlash ixlos masalasini ochadi va psixologiya ham shu tomonga ishora qiladi: [Deci, Koestner va Ryanning meta-tahlili (1999)](https://depts.washington.edu/techdocs/papers/deciExtrinsicRewardsAndIntrinsicMotivation99.pdf) kutilgan moddiy mukofot ichki motivatsiyani pasaytirishini aniqlagan.

**4. “Earn” tokenlar tajribasi.** ADR toʻrtta mashhur tap-to-earn va move-to-earn tokenni sanaydi, ularning hammasi choʻqqisidan ancha pastda. Aniq tushish raqamlari bitta yigʻma manbadan olingani uchun tasdiqlanmagan deb belgilangan, shuning uchun ularni keltirmaymiz. Sifat jihatidagi xulosa raqamlarsiz ham kuchda: bunday token foydalanuvchini sotuvchiga, ilovani esa birjaga aylantiradi.

## Uchta variant

| Mezon | A. Oʻz tokenimiz (TON jetton) | B. Off-chain hissa ballari | C. Hech qanday ragʻbat yoʻq |
|---|---|---|---|
| Qonun (rezidentlar) | Taqiqlangan | Ichki ball; kripto-aktiv yoki elektron pul emasligi haqidagi tasdiq yuristdan soʻraladi | Muammo yoʻq |
| Telegram | Faqat TON, koʻp cheklov | Taʼsir qilmaydi (pul emas, sotilmaydi) | — |
| Diniy savollar | Ixtilofli, *gharar* | Ehtiyot shartlari bilan, ulamolar tasdigʻiga qoʻyiladi | Muammo yoʻq |
| Narx barqarorligi | Bozorga bogʻliq, tarixan qulagan | Qatʼiy, bozor yoʻq | — |
| Ish hajmi | Katta, qoʻshimcha depozitariy va audit | Taxminan 5–7 kun | Yoʻq |
| Hissa qoʻshganlarga minnatdorlik | Bor, lekin spekulyativ | Bor | Yoʻq |

C varianti eng xavfsiz, lekin xato haqida xabar beradigan, tarjima qiladigan yoki boshqalarni qoʻshilishga yordam beradigan odamlarga rahmat aytish yoʻlini bermaydi. A varianti boshqa nuqtai nazarlarga yetmasdanoq qonunda yiqiladi. **Biz B ni tanladik.**

## Qaror: qatʼiy qoidali hissa ballari

ADR kelajakdagi amalga oshirish yumshata olmaydigan beshta qoidani belgilaydi:

```steps
Olish :: Ball faqat hissa uchun beriladi: qabul qilingan xato xabari yoki taklif, tarjima, intervyu yoki beta-sinov, oila aʼzosi yoki doʻstni olib kelish.
Ibodat uchun hech qachon :: Namoz, qazo, zikr, Qurʼon yoki roʻza uchun ball yoʻq; baza CHECK cheklovi ibodat belgisini doim false saqlaydi.
Pul emas :: Ballni oʻtkazib, naqdlashtirib yoki sotib boʻlmaydi, pul yoki kripto chiqaradigan sabab kodi yoʻq.
Shaxsiy :: Balans faqat egasiga koʻrinadi; reyting, nishon yoki doʻstlarga koʻrinish yoʻq.
Sarflash yoki kuyish :: Ball premium kunlarga yoki keyinchalik oʻz byudjetimizdan sadaqaga almashtiriladi va 12 oyda kuyadi.
```

Beshinchi qoida hisob-kitob haqida. Ballar PostgreSQLʼdagi ikki yoqlama ledgerda yashaydi. Har yozuv yigʻindisi nolga teng boʻlishi, koʻpi bilan bitta foydalanuvchi hisobiga tegishi va balansni hech qachon noldan pastga tushirmasligi kerak. `UPDATE` va `DELETE` huquqlari olib qoʻyilgan, tuzatishlar faqat teskari yozuvlar orqali boʻladi. Bular kelishuv emas, testlari bor baza invariantlari.

Ushbu maqola yozilgan paytda ledger **rejada, qurilmagan**. Uning issueʼsi ochiq va ataylab bloklangan: birinchi bosqich uchun hissa uchun ball berish joizmi degan savolga olimning yozma javobi va prodda Stars orqali ilova ichidagi toʻlovlar kerak.

ADR qolgan ishlarni aniq shartlar ortiga bosqichma-bosqich qoʻyadi:

| Bosqich | Ish | Shart |
|---|---|---|
| 0 | Shu ADR; Stars va billing yadrosi | Darhol |
| 1 | Ledger, premium kunlarga almashtirish, shaxsiy balans, invariant testlari | Olimning yozma javobi; prodda Stars |
| 1b | Oʻz byudjetimizdan sadaqaga almashtirish | Litsenziyali fond bilan shartnoma, soliq maslahati |
| 2 | Kripto toʻlov: faqat web, faqat xorijdagi foydalanuvchilar, bir martalik premium | Yozma yuridik xulosa, geo filtr |
| 3 | Jetton yoki istalgan on-chain narsa | Utility-token rejimi, depozitariy, fatvo va real ehtiyoj; hozir hech biri yoʻq |

## Qachon qayta ochamiz

Token masalasi faqat quyidagilarning **hammasi** bajarilganda qayta koʻriladi: rezidentlar uchun utility-token chiqarish rejimi amalda ishlaydi va yurist buni bizning holatimiz uchun yozma tasdiqlaydi; tan olingan diniy idora bu turdagi token joiz ekani haqida yozma fikr beradi; foydalanuvchilar tadqiqoti odamlarga u haqiqatan kerakligini isbotlaydi, shunchaki moda emasligini. Kripto **toʻlovlar** token chiqarish bilan bir narsa emas, ular uchun alohida, torroq shart bor: xorijdagi foydalanuvchilardan litsenziyali kanal orqali toʻlov olishga ruxsat borligi haqida yozma yuridik xulosa.

## Bu nima emas

- Bu kripto joizmi yoki yoʻqmi degan savolga hukm emas. Biz hukm chiqarmaymiz, ADR bu savolni ulamolarga yoʻllaydi.
- Bu yuridik maslahat emas. Huquqiy faktlar yuqorida keltirilgan manbalardan olingan, ADRʼning oʻzi tasdiqlay olmagan bandlarini belgilab qoʻygan.
- Bu ballar xavfsiz degan daʼvo emas. ADR narxini ochiq aytadi: ballarning tashqi qiymati yoʻq, shuning uchun ular hech kimni “investitsiya” sifatida jalb qilmaydi, ledger esa qoʻllab-quvvatlash kerak boʻlgan qoʻshimcha kod va invariant testlarini qoʻshadi.
- Sharoit oʻzgaradi. ADRʼda qayta ochish bandi bor, chunki huquqiy rejim, platforma qoidalari va ulamolar fikri oʻzgarishi mumkin.
