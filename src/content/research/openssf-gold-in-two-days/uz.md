---
title: Noldan OpenSSF oltin darajasigacha — ikki kundan kamroq vaqtda
description: "bitg repozitoriysi 2026-yil 11-noyabr soat 17:08 UTC da yaratildi. 36 soatdan keyin loyiha OpenSSF Best Practices oltin darajasiga yetdi. Kodga oid mezonlarning koʻpi bir necha soat oldi; eng qiyinlari odamlar haqida boʻldi, bittasini esa avval notoʻgʻri belgilab, keyin tuzatdik."
date: 2026-11-13
kind: engineering
area: supply-chain
featured: false
source:
  - "https://www.bestpractices.dev/projects/16620"
  - "https://www.bestpractices.dev/projects/16620.json"
  - "https://api.securityscorecards.dev/projects/github.com/dtwinuz/bitg"
  - "https://github.com/dtwinuz/bitg/pulls?q=is%3Apr+is%3Amerged"
  - "dtwinuz/bitg GOVERNANCE.md, docs/ASSURANCE.md, CHANGELOG.md"
reproduce:
  repo: "https://github.com/dtwinuz/bitg"
  commit: "2de5c94"
  note: "Birinchi buyruq daraja va uchta vaqtni chiqaradi; ikkinchisi joriy Scorecard bahosini koʻrsatadi; uchinchisi chiqarilgan paketni imzolangan kelib chiqishi bilan tekshiradi."
  commands:
    - "curl -s https://www.bestpractices.dev/projects/16620.json | jq '.badge_level, .achieved_passing_at, .achieved_silver_at, .achieved_gold_at'"
    - "curl -s https://api.securityscorecards.dev/projects/github.com/dtwinuz/bitg | jq '.score, (.checks[] | {name, score})'"
    - "gh release download v0.3.1 -R dtwinuz/bitg -p 'bitg_0.3.1_amd64.deb' && gh attestation verify bitg_0.3.1_amd64.deb -R dtwinuz/bitg"
---

bitg — kiritish usuli. Windowsʼda u siz yozadigan har bir dastur ichiga yuklanadigan DLL, yaʼni odamlar aynan shubha bilan qarashi kerak boʻlgan dastur turi. Bizni tanimaydigan odam ham xavfsizlik amaliyotlarimizni tekshira olishini xohladik, shuning uchun OpenSSF Best Practices mezonlarini nazorat roʻyxati sifatida ishlatdik va natijani ochiq eʼlon qildik.

16620-loyihaning ochiq yozuvi vaqt chizigʻini koʻrsatadi. Yozuv 2026-yil 12-noyabr soat 17:15 UTC da yaratilgan. U 17:47 da **passing**, 20:24 da **silver** va 13-noyabr soat 05:02 da **gold** darajasiga yetdi. Repozitoriyning oʻzi bir kun oldin soat 17:08 UTC da yaratilgan edi. Bu maqolada har bir daraja bizdan aslida nimani talab qilgani, ish qayerga ketgani va nishon nimani aytmasligi haqida yozamiz.

```steps
Passing (17:47) :: Litsenziya aniqligi, xavfsizlik siyosati, CI testlari va har faylda REUSE sarlavhalari.
Silver (20:24) :: Boshqaruv hujjati, xavfsizlik asoslamasi, qamrov chegarasi va imzolangan kelib chiqishli birinchi reliz.
Gold uchun kod ishi (tunda) :: Tarmoq qamrovi, takrorlanadigan MSI va .pkg, yozma xavfsizlik tekshiruvi, SLSA Build L3.
Gold uchun odamlar ishi (05:02) :: Ikki kishilik review, majburiy 2FA, loyihadan tashqaridagi hissa qoʻshuvchilar, birdan katta bus factor.
```

## Passing va silver: asosan bor narsani yozib qoʻyish

Passing va silver ning katta qismi hujjatlar, va foydali intizom shu boʻldi: faqat repozitoriy isbotlay oladigan narsani yozish. 12-noyabr tushdan keyin bitgʼda uchta operatsion tizimda CI, baholash toʻplami va xavfsizlik siyosati allaqachon bor edi. Yozuv yaratilishidan oldingi bir soatda SBOM bilan reliz attestationʼlari, OpenSSF Scorecard workflowʼi va xulq-atvor kodeksini (PR #16), soʻng yadro uchun fuzzing, reliz bundleʼlari va SHA bilan qotirilgan konteyner imageʼlarini (#17) qoʻshdik.

REUSE muvofiqligi (#22) har bir manba faylga SPDX litsenziya sarlavhasini qoʻydi va soat 17:47 da, passing olingan daqiqaning oʻzida merge qilindi. U kunning eng ibratli xatosiga ham sabab boʻldi. Bitta PowerShell test skriptida yangi sarlavha UTF-8 BOM belgisidan yuqoriga tushib qoldi, natijada BOM fayl oʻrtasida qoldi. Windows PowerShell 5.1 skriptning `param()` blokini tahlil qila olmay qoldi va uchidan-uchiga test jimgina ishlamay qoldi, toki uni #30 da topib tuzatmagunimizcha. Muvofiqlik oʻzgarishi ham kod oʻzgarishi; uning diffʼini boshqa har qanday diff kabi koʻrib chiqing.

Silver yakka loyihalar odatda tashlab ketadigan narsalarni soʻradi: qaror qoidalari va davomiylik yozilgan boshqaruv hujjati, yoʻl xaritasi, arxitektura hujjati va xavfsizlik talablari, tahdid modeli, ishonch chegaralari hamda maʼlum kamchiliklar yozilgan xavfsizlik asoslamasi (#24). Oʻsha PR CIʼdagi satr qamrovini 91,38% ga chiqardi va 90% chegara qoʻydi, shuningdek u loyihadagi tasdiqlovchi review olgan birinchi pull request boʻldi. Silver v0.3.1 relizidan bir necha daqiqa keyin keldi: bu har bir fayli imzolangan build provenance va SBOM attestationʼiga ega birinchi reliz edi. Workflow ishlagan deb taxmin qilmasdan, ularni eʼlon qilingan fayllarda `gh attestation verify` bilan tekshirdik.

## Gold, kod qismi: bir kecha

Toʻrtta gold mezoni muhandislik ishini talab qildi va har biri oʻsha kechasi alohida pull request boʻldi:

- **Tarmoq qamrovi (#36).** Tarmoq (branch) qamrovi nightly Rustʼni talab qiladi, shuning uchun CI bittasini qotiradi va `cargo llvm-cov --branch` ni yurgizadi. Linuxʼda tarmoqlarning 94,81% (1 290 tadan 1 223 tasi) va satrlarning 97,19% qoplangan. Chegara 90% va 95%. Bitta tuzoq: testdagi `assert!(a && b)` kabi qoʻshma shart ham tarmoq sifatida sanaladi.
- **Takrorlanadigan yigʻish (#48).** `.deb` paketlar allaqachon bayt-mayt takrorlanardi; MSI va `.pkg` bir kecha vaqt belgilarini quvgandan keyin shunday boʻldi, bu haqda alohida maqolada yozganmiz.
- **Xavfsizlik tekshiruvi (#48).** Bitta commitʼdagi kodni xavfsizlik asoslamasiga qarshi yozma tekshirish: unsafe kod, FFI va COM chegaralari, fayl yozish, log chaqiruvlari va workflowʼlarni qoʻlda oʻqish orqali. 11 ta topilma qayd etildi, birortasi kritik yoki yuqori emas. Tuzatishlar oʻsha PRʼda va bir necha soatdan keyin #49 da qoʻshildi, tekshiruv `docs/ASSURANCE.md` da eʼlon qilingan.
- **SLSA Build L3 (#63).** Reliz paketlarini endi qayta ishlatiladigan workflow yigʻadi. Kod kompilyatsiya qiladigan jobʼlar imzo tokenini soʻray olmaydi; hech narsa kompilyatsiya qilmaydigan alohida job attestationʼlarni yozadi. Reliz workflowʼi har bir paket kutilgan imzolovchi workflow va teg bilan `gh attestation verify` dan oʻtgandan keyingina relizni eʼlon qiladi.

Bularning hech biri oson boʻlgani uchun tez boʻlmadi. Tez boʻldi, chunki loyiha kichik va yangi edi: bitta Rust workspace, uchta paketlash skripti va koʻchirish kerak boʻlgan eski meros yoʻq.

## Gold, odamlar qismi: sekin yarmi

Qolgan gold mezonlarini faqat kod yozib bajarib boʻlmaydi. Ular oʻzgarishlarni bir nechta odam koʻrib chiqadimi, akkauntlar himoyalanganmi, loyihadan tashqaridagi odamlar hissa qoʻshadimi va loyiha istalgan bitta odamni yoʻqotsa ham yashay oladimi, shuni soʻraydi.

**Review.** 12-noyabr kechqurungacha bitta ham pull request koʻrib chiqilmagan edi: 19:00 UTC dan oldin merge qilingan 18 tasining birortasida tasdiq yoʻq. Keyin loyihaga review qiladigan ikkinchi maintainer qoʻshildi, yangi boshqaruv hujjati reviewʼni jarayonning bir qismiga aylantirdi, `main` dagi branch ruleset esa endi oxirgi push qilgan odamdan boshqa kishining tasdiqlovchi reviewʼini talab qiladi. v0.3.1 relizi va gold nishoni orasida merge qilingan 21 ta pull requestdan 17 tasida tasdiqlovchi review bor; 21 tadan toʻrttasi bogʻliqlik yangilanishlari edi.

**Ikki bosqichli autentifikatsiya.** Bu yerda shaklda xato qildik. Avval «2FA talab qilinadi» ni bajarilgan deb belgiladik, chunki har bir faol maintainer undan foydalanardi. Mezon esa majburiylik haqida, tashkilot esa uni majburiy qilmagan edi. Javobni bajarilmagan deb tuzatdik. Keyinroq tashkilotda 2FA ni talab qiladigan va faqat xavfsiz usullarni qabul qiladigan sozlamani yoqdik. Uni majburiy qilish 2FA yoqmagan tashkilot aʼzolarini chiqarib yuborishni anglatdi. Shundan keyingina ikkala 2FA mezonini bajarilgan deb belgiladik.

**Daʼvo emas, dalil.** Ayrim mezonlarda shakl URLʼsiz «Met» javobini yetishmayotgan maʼlumot deb hisoblaydi. Javoblarimizdan beshtasi ularni isbotlaydigan fayl yoki workflow run havolalarini qoʻshmagunimizcha nomaʼlum sanaldi.

**Hissa qoʻshuvchilar va bus factor.** Oxirgi ikki mezon faqat loyihadan tashqaridagi odamlar pull request ochgandagina siljidi. Qadamma-qadam «birinchi hissa» yoʻriqnomasini yozdik va yangi kelganlar uchun issueʼlar ochdik; tashqaridan kelgan birinchi pull requestlar (#64 va #67) gold qayd etilishidan oldingi 35 daqiqada merge qilindi.

## Cheklovlar

- **Nishon jarayonni oʻlchaydi, yetuklikni emas.** Gold paytida repozitoriy 36 soatlik edi. Repozitoriyni avtomatik tekshiradigan Scorecard 13-noyabrda 10 dan 8,1 berdi; uning «Maintained» tekshiruvi 0 ball beradi, chunki loyiha 90 kundan yosh, «Signed-Releases» esa 2 ball.
- **Review tarixi qisqa.** Tasdiqlangan 17 ta pull request bitta kechada koʻrib chiqilgan, ularning koʻpi kichik hujjat va CI oʻzgarishlari. Bu nisbat review boʻlayotganini koʻrsatadi, qanchalik chuqurligini emas.
- **Ayrim javoblar bizning soʻzimizga tayanadi.** Masalan, hissa qoʻshuvchi loyihaga «bogʻliq emas»ligini shakl oʻz-oʻzini baholash sifatida qabul qiladi.
- **Gold — bir lahzalik surat.** Loyiha oʻzgargan sari mezonlar qayta tekshiriladi. Tarmoq qamrovi, ikki kishilik review va tashqi hissalar faqat olti oydan keyin ham saqlanib qolsa maʼnoga ega.

Boshqa kichik loyihaga aytadiganimiz: kodga oid mezonlar yaxshi bir dam olish kunlik ish va oʻz-oʻzidan bunga arziydi. Odamlarga oid mezonlar haqiqiy sinov, va ular bizdagidan koʻproq vaqt olishi kerak.
