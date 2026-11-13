---
updated: 2026-11-13
summary: Wonmor dtwin ekotizimini qanday yaratishi, chiqarishi va qoʻllab-quvvatlashini belgilaydigan yetti tamoyil.
---

Wonmor — Oʻzbekistondan chiqqan, oʻz mablagʻi hisobidan ishlaydigan brend. U kompaniya emas: yuridik shaxs, kengash va investorlar yoʻq. dtwin ekotizimini bitta asoschi AI agentlar bilan birga yaratadi va qoʻllab-quvvatlaydi. Har bir oʻzgarish pull request, uzluksiz integratsiya (CI) va inson tomonidan merge orqali oʻtadi.

Kichik jamoa oʻzi sezmagan holda yoʻldan chiqib ketishi mumkin. Bu nizom bizni halol tutish uchun yozilgan. U ataylab qisqa: yetti tamoyil, har birida amalda nimani anglatishi va tekshirsa boʻladigan haqiqiy ishdan misol bor. Ikki tamoyil bir-biriga zid kelsa, qaysi biri ustun kelganini va nima uchunligini qaror qabul qilingan pull request yoki postda yozamiz.

Nizom 2026-yil 13-noyabrdan amal qiladi.

## Tanigan odamlaring uchun yarat

Biz bozordan emas, haqiqiy odam va haqiqiy muammodan boshlaymiz. Agar biror imkoniyat shu hafta kimga kerakligini ayta olmasak, u kutadi. Ilk foydalanuvchilar — biz bevosita gaplasha oladigan odamlar, va ularning xabarlari oʻz rejalarimizdan ogʻirroq turadi.

Amalda bu qisqa davralarni anglatadi: sinovchi issue yozadi, biz tuzatamiz, chiqaramiz va yana soʻraymiz. Bu, shuningdek, skrinshotda chiroyli koʻrinadigan, lekin biz taniydigan hech kim soʻramagan imkoniyatlarga “yoʻq” deyish demakdir.

Misol: dtwin 2026-yil 23-oktabrda besh vaqt namoz atrofida qurilgan shaxsiy daftar sifatida boshlandi. Uning ilk beta sinovchilari qulaylik, maxsus imkoniyatlar va maxfiylik boʻyicha 28 ta issue yozishdi, va 28 tasining hammasi 27-oktabrda bitta relizda chiqdi (dtwinuz/dtwin #134).

## Ochiq holda chiqar

Sukut boʻyicha ish hamma koʻra oladigan joyda boʻladi: ochiq repozitoriylarda, sanali reliz yozuvlarida va manbalariga havola beradigan postlarda. Biror narsa ochiq boʻla olmasa, masalan, mijoz maʼlumotlari yoki server sozlamalari, biz u yoʻqdek koʻrsatmaymiz — u borligini va nega yopiq ekanini aytamiz.

Ochiq chiqarish tez-tez chiqarishni ham anglatadi. Chiqarilgan va koʻrinib turgan kichik oʻzgarish mukammal paytni kutayotgan katta oʻzgarishdan qimmatroq. Ochiq mahsulotning har bir relizida nima oʻzgargani yozilgan boʻladi.

Misol: bitg toʻliq ochiq holda github.com/dtwinuz/bitg da ishlab chiqiladi. Har oʻzgarish — squash merge qilinishidan oldin CIʼdan oʻtishi shart boʻlgan pull request. 0.1.0 dan 0.3.1 gacha boʻlgan har bir relizning ochiq reliz yozuvlari va yuklab olinadigan fayllari bor.

## Daʼvo qilishdan oldin oʻlcha

Bu saytdagi har bir raqam boshqa odam takrorlay oladigan oʻlchovdan olinishi kerak. Biror narsani oʻlchamagan boʻlsak, uni daʼvo qilmaymiz. Oʻlchov xato chiqsa, uni ochiq tuzatamiz va tuzatishni koʻrinadigan qoldiramiz.

Bu marketingga ham tegishli. Biz “deyarli mukammal” emas, “ochiq baholash toʻplamidagi soʻzlarning 98,87%” deb yozamiz. “Hozir” emas, “2026-yil 13-noyabr holatiga” deb yozamiz. Rejalar “planned” (rejada) deb belgilanadi va hech qachon boʻlib oʻtgandek yozilmaydi.

Misol: bitg avval 99,17% aniqlik haqida xabar bergan edi. Bu raqam baholash toʻplami bilan bitg qurilgan maʼlumotlar orasidagi ustma-ustlik sababli oshib ketgan edi. Ustma-ustlik olib tashlangach, halol raqam 98,87% boʻldi, va bitg 0.3 eʼlonida bu ochiq yozilgan (github.com/dtwinuz/bitg/releases/tag/v0.3.0).

## Eʼtiqod va maxfiylikni hurmat qil

Foydalanuvchilarimizning koʻpi kunini namoz atrofida tuzadi, mahsulotlarimizning koʻpi esa shaxsiy hayotga tegadi: rejalar, qaydlar, salomatlik, oila bilan vaqt. Ikkalasiga ham ehtiyotkorlik bilan munosabatda boʻlamiz. Eʼtiqodga oid imkoniyatlar foydalanuvchiga xizmat qilish uchun quriladi, uni baholash yoki koʻz-koʻz qilish uchun emas. Shaxsiy maʼlumot foydalanuvchi oʻzi ulashishni tanlamaguncha yopiq qoladi.

Amalda: sukut boʻyicha shaxsiy, ulashish esa foydalanuvchi tasdiqlaydigan alohida qadam; maʼlumotni sotish yoki ijaraga berish yoʻq; imkoniyat uchun kerakli eng kam maʼlumot. AI modeli ishtirok etganda, yoʻlni biz boshqaradigan joyda shaxsiy maʼlumot modelga yetib borishidan oldin niqoblanadi.

Misol: dtwin betasidan keyin qaydlar foydalanuvchi ulashishni tanlamaguncha shaxsiy boʻlib qoldi, ochiq “Hozir” sahifasida esa namoz sukut boʻyicha yashirin (dtwinuz/dtwin #134). AI agentlar uchun boshqaruv paneli boʻlgan Gateway shaxsiy maʼlumotni modelga yetib borishidan oldin niqoblaydi (Yangiliklar boʻlimidagi Gateway eʼloniga qarang). bitg siz yozayotgan matnni tarmoqqa hech qachon yubormaydi.

## Zerikarli, ishonchli texnologiyani tanla

Biz yaxshi tushunilgan, yaxshi hujjatlashtirilgan va besh yildan keyin ham ishlashi ehtimoli yuqori boʻlgan vositalarni tanlaymiz. Yangi texnologiya oʻz oʻrnini zerikarli variant hal qila olmaydigan muammoni hal qilib oqlashi kerak. Harakatlanuvchi qismlar qancha kam boʻlsa, kechasi tuzatadigan hech kim uygʻoq boʻlmaganda buziladigan narsalar ham shuncha kam.

Bu yangi gʻoyalarga qarshi qoida emas. Bu xavfni qayerga sarflash haqidagi qoida: quvurlarga emas, mahsulotga.

Misol: dtwin edgeʼidagi statik saytlar, jumladan shu sayt ham, konteynerlarni qayta yaratish oʻrniga yangi reliz papkasini yozish, havolani almashtirish va veb-serverni qayta yuklash orqali chiqariladi. 76 soniyalik yuklab olish deploy davomida uzilmasdan davom etdi (dtwinuz/dtwin #335).

## Topganingdan yaxshiroq hujjatlashtirib qoldir

Har safar biror tizimga tegganda, uni keyingi odam uchun tushunishga osonroq qilib qoldiramiz — kelajakdagi oʻzimiz va birga ishlaydigan AI agentlar uchun ham. README, changelog yoki qaror yozuvida nima oʻzgargani va nega oʻzgargani yozilmaguncha oʻzgarish tugallangan hisoblanmaydi.

Hujjat — bir kishilik loyihaning bir kishilik xavfga aylanib qolmasligi yoʻli hamdir. Asoschi ertaga chetga chiqsa ham, yozma qayd boshqa odamga mahsulotni ishlatib turish uchun yetarli boʻlishi kerak.

Misol: bitgʼning boshqaruv hujjati, javob muddatlari yozilgan xavfsizlik siyosati, har minor relizda qayta koʻriladigan ishonch asoslamasi (assurance case) va review, reliz, paketlar va saytni qamrab oladigan maintainer topshirish qoʻllanmasi bor (dtwinuz/bitg #59). Bu saytdagi muhandislik postlari “Buni takrorlang” boʻlimi bilan tugaydi.

## Jamiyatni birinchi oʻringa qoʻy

Mahsulotlarimizdan foydalanadigan va ularni yaxshilaydigan odamlar oʻz qulayligimizdan oldin turadi. Xabarlarga javob beriladi, yaxshi gʻoyalar muallifi qayd etiladi, oʻzbek tilida soʻzlashuvchi jamiyat esa mahsulotlarni oʻz tilida — keyinroq qoʻshiladigan narsa sifatida emas — oladi.

Amalda: issueʼlarga javob beriladi, hissa qoʻshganlar reliz yozuvlari va advisoryʼlarda qayd etiladi, saytlarimiz oʻzbek, rus va ingliz tillarida chiqadi. Ochiq manba fondi kabi rejadagi narsalar faqat haqiqatga aylanganda eʼlon qilinadi.

Misol: bir foydalanuvchi bitg ikki maʼnoli oʻzbekcha soʻzlarni va xorijiy ismlarni oʻzgartirib yuborayotganini xabar qildi (dtwinuz/bitg #5 va #6). Ikkala issue oʻsha kuniyoq tuzatildi va merge qilindi (dtwinuz/bitg #8), endi bitg haqiqatan ikki maʼnoli soʻzni taxmin qilmasdan yozilganicha qoldiradi.

## Nizom qanday oʻzgaradi

Nizom — tirik hujjat, lekin u jimgina oʻzgarmaydi.

```steps
Taklif :: istalgan odam github.com/dtwinuz/.github da ochiq issue ochishi mumkin
Muhokama :: oʻzgarish sababi issueʼda yoziladi
Pull request :: oʻzgarish CIʼdan oʻtadigan pull requestʼda qilinadi
Qaror :: asoschi merge qiladi yoki rad etadi va sababini issueʼda yozadi
Changelog :: oʻzgarish quyida sanali yozuv va yangi “yangilangan” sanasini oladi
```

Bu sayt manbasi hali ochiq emas; uni ochish rejada. Ungacha har bir oʻzgarishning ochiq qaydi — ochiq issue va shu sahifadagi sanali changelog. Eski versiyalar repozitoriy tarixida saqlanadi.

### Changelog

- 2026-11-13: birinchi versiya, yetti tamoyil.
