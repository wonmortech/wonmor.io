---
updated: 2026-11-13
summary: Qaysi dtwin repozitoriylari ochiq, qaysi litsenziyalar ostida, nima yopiq qoladi va qanday hissa qoʻshish mumkin.
---

Wonmor imkoni boʻlgan joyda ochiq ishlaydi. Bu sahifada bugun nima ochiq ekani, nimani yopiq tutishimiz va nega, hamda qanday qatnashishingiz mumkinligi yozilgan. Barcha repozitoriylar bitta GitHub tashkilotida: [github.com/dtwinuz](https://github.com/dtwinuz).

Bu siyosat 2026-yil 13-noyabrdan amal qiladi.

## Bugungi ochiq repozitoriylar

2026-yil 13-noyabr holatiga tashkilotdagi sakkizta repozitoriy ochiq:

| Repozitoriy | Nima | Litsenziya |
|---|---|---|
| [bitg](https://github.com/dtwinuz/bitg) | 2026-yilgi lotin alifbosi uchun oʻzbekcha klaviatura: Rust yadrosi, Windows, Linux va macOS kiritish usullari | MIT OR Apache-2.0, tanlov sizda |
| [teletwin-web](https://github.com/dtwinuz/teletwin-web) | Veb, kompyuter va mobil uchun TeleTwin mijozi, kompaniya qatlami qoʻshilgan Telegram Web A forki | GPL-3.0 |
| [gym-dtwin](https://github.com/dtwinuz/gym-dtwin) | Mashgʻulot kundaligi: rejalar, setlar, dam olish taymeri va rekordlar | Litsenziya fayli hali yoʻq |
| [operobot2](https://github.com/dtwinuz/operobot2) | Chiquvchi qoʻngʻiroqlar va savdo yordamchisi | Litsenziya fayli hali yoʻq |
| [halvet](https://github.com/dtwinuz/halvet) | Hammom, sauna va basseyn quruvchisi uchun sayt | Litsenziya fayli hali yoʻq |
| [homebrew-tap](https://github.com/dtwinuz/homebrew-tap) | bitgʼni macOSʼga oʻrnatish uchun Homebrew tap | Litsenziya fayli hali yoʻq |
| [.github](https://github.com/dtwinuz/.github) | Tashkilot profili va umumiy hamjamiyat fayllari | Litsenziya fayli hali yoʻq |
| [.allstar](https://github.com/dtwinuz/.allstar) | Ochiq repozitoriylarimiz uchun OpenSSF Allstar qoidalari | Litsenziya fayli hali yoʻq |

“Litsenziya fayli hali yoʻq” haqida: bu kodni oʻqib, undan oʻrganishingiz mumkin, lekin litsenziyasiz qonun sizga uni nusxalash yoki qayta ishlatish huquqini bermaydi. Bu repozitoriylarning har biriga aniq litsenziya qoʻshish yoki u barcha huquqlar himoyalangan holda qolishini ochiq aytish rejada. Ungacha ulardagi kodni qayta ishlatishdan oldin bizdan soʻrang.

Bu roʻyxatni oʻzingiz tekshirishingiz mumkin:

```bash
gh repo list dtwinuz --visibility public --json name,licenseInfo,description
```

GitHub bitgʼni Apache-2.0 deb koʻrsatadi, chunki u bitta litsenziya faylini aniqlaydi. Aslida bitgʼda LICENSE-MIT va LICENSE-APACHE ikkalasi bor, har bir manba fayli esa CIʼda REUSE litsenziya tekshiruvidan oʻtadi.

## Sukut boʻyicha nimani ochamiz

Repozitoriy odamlar oʻrnatadigan yoki ishga tushiradigan mahsulot yoki vosita, boshqalar qayta ishlata oladigan kutubxona yoki manbasi biror narsani oʻrgatadigan sayt boʻlsa, uni ochiq qilishni afzal koʻramiz. Erta ochishning amaliy foydasi bor: kodni istalgan odam koʻrib chiqa oladi, xavfsizlik skanerlari unda bepul ishlaydi, biz toʻxtasak ham ish foydali boʻlib qoladi.

Har bir ochiq repozitoriyda bir xil asos bor: code owners fayli, tashkilotning xavfsizlik siyosati, GitHub private vulnerability reporting (yopiq zaiflik xabari) va sirlarni push qilishdan himoya. Dependabot yangilanishlari halvetʼdan tashqari hammasida yoqilgan, halvetʼga qoʻshish rejada. Yangi ochiq repozitoriylar toʻliq asos bilan boshlanadi.

## Nima yopiq qoladi va nega

Baʼzi narsalar ochiq boʻlmaydi, va buni taxmin qilishga qoldirgandan koʻra ochiq aytganimiz maʼqul:

- **Mijoz va foydalanuvchi maʼlumotlari.** Odamlar bizga ishonib topshirgan har narsa. U hech qachon repozitoriyga — ochiq yoki yopiq — tushmaydi.
- **Infratuzilma sozlamalari.** Server manzillari, deploy skriptlari, tarmoq tuzilishi va monitoring sozlamalari. Ularni chop etish hujumni osonlashtiradi va mahsulotdan foydalanishga hech kimga yordam bermaydi.
- **Sirlar.** Tokenlar, kalitlar va parollar. Ular kodda emas, sirlar omborida saqlanadi; ularni oʻz ichiga olgan commitʼlarni push himoyasi toʻsadi.
- **Chop etishga haqqimiz boʻlmagan yoki hali shakllanayotgan kod.** Bir nechta dtwin mahsulotlari, jumladan asosiy dtwin ilovasi, bugun yopiq repozitoriylarda. Mahsulot sahifasi oʻz repozitoriysiga faqat u ochiq boʻlsa havola beradi.

Yopiq repozitoriy ham ochiq repozitoriy bilan bir xil muhandislik qoidalariga boʻysunadi: pull request, CI va inson tomonidan merge.

## Qanday hissa qoʻshish mumkin

Umumiy [CONTRIBUTING.md](https://github.com/dtwinuz/.github/blob/main/CONTRIBUTING.md) har bir repozitoriyga tegishli. Repozitoriyning oʻz CONTRIBUTING fayli boʻlsa, oʻsha fayl ustun turadi.

```steps
Issue :: katta oʻzgarish uchun avval issue oching yoki mavjudini oling
Branch :: mainʼdan oching, masalan feat/qisqa-nom yoki fix/qisqa-nom
Commit :: Conventional Commits uslubida, masalan feat: yoki fix:
Pull request :: issueʼni bogʻlang, shablonni toʻldiring, bitta mavzuda boʻlsin
Review :: kamida bitta maintainer tasdigʻi va yashil CI
Merge :: squash merge; keyin branch oʻchiriladi
```

Hissa qoʻshishda [Contributor Covenant 2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) xulq-atvor qoidalariga amal qilinadi.

**Imzo va litsenziya kelishuvlari.** Hech bir dtwin repozitoriysi sizdan hissa qoʻshuvchi litsenziya kelishuvini (CLA) imzolashni soʻramaydi. bitg uning oʻrniga Developer Certificate of Origin (DCO) ishlatadi: har bir commit `Signed-off-by:` qatori bilan tugaydi (`git commit -s`), bu qator boʻlmagan pull requestʼlarni CI tekshiruvi toʻsadi. Yuborgan hissangiz repozitoriy litsenziyasi ostida tarqatiladi; bitg uchun bu MIT OR Apache-2.0. Boshqa repozitoriylar hozircha imzo talab qilmaydi.

**Boshlash uchun yaxshi joylar.** bitg lugʻat tuzatishlarini va siz aynan nima yozganingiz hamda qaysi dasturda yozganingiz koʻrsatilgan xato xabarlarini kutadi. Uning oʻz [CONTRIBUTING.md](https://github.com/dtwinuz/bitg/blob/main/CONTRIBUTING.md) va [GOVERNANCE.md](https://github.com/dtwinuz/bitg/blob/main/GOVERNANCE.md) fayllarida oʻzgarishlar qanday koʻrib chiqilishi, loyihani kim yuritishi va qanday qilib maintainer boʻlish mumkinligi yozilgan.

## Xavfsizlik xabarlari

Zaifliklar haqida ochiq issue, pull request yoki muhokamalarda yozmang. Yuqoridagi har bir ochiq repozitoriyda GitHub private vulnerability reporting yoqilgan: repozitoriyning Security boʻlimini oching va “Report a vulnerability” ni tanlang. Yopiq repozitoriylar va jonli saytlar uchun yopiq kanal, javob muddatlari va nimani yozish kerakligi [xavfsizlik siyosatimizda](/uz/security/).

## Bu siyosatdagi oʻzgarishlar

Bu sahifadagi oʻzgarishlar pull requestʼda qilinadi va yangi “yangilangan” sanasini oladi. Sahifa oʻzgarganda ochiq repozitoriylar roʻyxati qayta tekshiriladi.
