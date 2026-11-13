---
updated: 2026-11-13
summary: Har qanday Wonmor yoki dtwin mahsulotidagi zaiflik haqida qanday xabar berish, keyin nima boʻlishi va vijdonan qilingan tadqiqotni qanday himoya qilishimiz.
---

bitg, boshqa dtwin mahsuloti yoki shu saytda xavfsizlik muammosini topgan boʻlsangiz, rahmat. Bu sahifada uni qayerga yuborish, nimani yozish, qanchalik tez javob berishimiz va evaziga nimani vaʼda qilishimiz yozilgan.

Bu siyosat 2026-yil 13-noyabrdan amal qiladi.

## Qanday xabar berish kerak

Zaifliklar haqida ochiq issue, pull request, muhokama yoki guruh chatlarida yozmang. Quyidagi yopiq kanallardan birini ishlating:

| Muammo qayerda | Qanday xabar berish |
|---|---|
| bitg | GitHub private vulnerability reporting: [github.com/dtwinuz/bitg/security/advisories/new](https://github.com/dtwinuz/bitg/security/advisories/new) |
| [github.com/dtwinuz](https://github.com/dtwinuz) dagi boshqa har qanday ochiq repozitoriy | Repozitoriyning Security boʻlimi, keyin “Report a vulnerability”. Bu har bir ochiq repozitoriyda yoqilgan. |
| Ochiq repozitoriysi yoʻq mahsulot, jonli sayt yoki shu sayt | Telegramʼda [t.me/xnosir](https://t.me/xnosir) ga shaxsiy xabar |

Telegramʼda qisqa birinchi xabar yetarli, masalan, “dtwin.uz uchun xavfsizlik xabari”. Biz javob beramiz va tafsilotlarni xavfsiz ulashish yoʻlini kelishib olamiz. Isbot sifatida ham amaldagi login-parollarni yoki boshqa odamlarning shaxsiy maʼlumotlarini hech qachon yubormang.

Bu aloqalarning mashina oʻqiydigan versiyasi [wonmor.io/.well-known/security.txt](https://wonmor.io/.well-known/security.txt) da eʼlon qilingan.

## Xabarda nima boʻlishi kerak

Yaxshi xabar muammoni taxmin qilmasdan qayta chiqarishga imkon beradi:

- taʼsirlangan mahsulot, URL yoki repozitoriy, bilsangiz versiya yoki reliz;
- platforma: operatsion tizim, brauzer yoki ilova;
- qayta chiqarish qadamlari yoki minimal proof of concept;
- hujumchi nimaga erishishi mumkin: qaysi maʼlumot yoki qaysi huquq xavf ostida;
- muammoni boshqa birov bilan ulashganmisiz va uni eʼlon qilmoqchi boʻlgan sanangiz bormi.

Tuzatish taklif qilishingiz shart emas. Aniq tavsif uzun tavsifdan foydaliroq.

## Keyin nima boʻladi

Har bir mahsulot uchun bitg xavfsizlik siyosatidagi muddatlarni qoʻllaymiz. Repozitoriyning oʻz SECURITY.md fayli qisqaroq muddat vaʼda qilsa, qisqaroq muddat amal qiladi.

```steps
Tasdiqlash :: xabaringiz olinganini 7 kun ichida tasdiqlaymiz
Baholash :: muammoni qayta chiqaramiz va xavf darajasini (CVSS) 14 kun ichida belgilaymiz
Tuzatish :: yuqori va kritik muammolar 60 kun ichida, iloji boʻlsa tezroq tuzatilib chiqariladi
Oshkor qilish :: xavfsizlik advisoryʼsi, kerak boʻlsa CVE, tuzatilgan reliz bilan birga chiqadi
```

Tuzatish ustida ishlayotganimizda GitHubʼdagi yopiq advisoryʼda, ochiq repozitoriysi yoʻq mahsulotlar uchun esa Telegram suhbatida qatnashishingiz mumkin. Koʻproq vaqt kerak boʻlsa, buni va sababini aytamiz. Oʻrta va past darajadagi muammolar oddiy relizda tuzatiladi; qaysi biri ekanini sizga aytamiz.

Oʻz kompyuteringizga oʻrnatiladigan mahsulotlarda tuzatishlar eng soʻnggi relizga chiqadi. bitg uchun bu eng soʻnggi minor versiya, hozir 0.3.x, uning [SECURITY.md](https://github.com/dtwinuz/bitg/blob/main/SECURITY.md) faylida yozilganidek. Jonli saytlarda tuzatish saytga deploy qilinadi va siz tomondan yangilash kerak emas.

## Vijdonan qilingan tadqiqot uchun himoya (safe harbour)

Quyidagi qoidalarga amal qilgan xavfsizlik tadqiqoti uchun sizga qarshi sud ishini qoʻzgʻatmaymiz va qoʻllab-quvvatlamaymiz:

- zarar yetkazish yoki ustunlik olish uchun emas, zaiflikni topish va xabar berish uchun vijdonan harakat qilasiz;
- muammoni koʻrsatish uchun kerakli maʼlumotgagina kirasiz, boshqa odamlarning maʼlumotiga yetganingiz zahoti toʻxtaysiz va uni saqlamaysiz, nusxalamaysiz, ulashmaysiz;
- xizmatlarimiz ishini yoki boshqalarning ulardan foydalanishini yomonlashtirmaysiz;
- eʼlon qilishdan oldin yuqoridagi muddatlarga koʻra muammoni tuzatishimiz uchun yetarli vaqt berasiz;
- faqat oʻzingizga tegishli yoki foydalanishga ruxsat olgan akkauntlarda sinaysiz.

Biror narsaga ruxsat bormi-yoʻqmi, ishonchingiz komil boʻlmasa, yuqoridagi kanallar orqali avval soʻrang. Shu siyosatga amal qilgan tadqiqotingiz uchun boshqa birov sizga qarshi sud ishi qoʻzgʻatsa, ishingizga biz ruxsat berganimizni ochiq aytamiz.

## Qamrovdan tashqari

Quyidagilar bu siyosatga kirmaydi, iltimos, ularni sinab koʻrmang:

- xizmatni ishdan chiqarish (DoS) hujumlari, yuklama yoki stress sinovi va xizmatni trafik bilan toʻldiradigan har qanday harakat;
- asoschi, hissa qoʻshuvchilar yoki foydalanuvchilarga qarshi ijtimoiy muhandislik yoki fishing;
- spam, jumladan aloqa formalari, botlar yoki yordam xizmatlari orqali;
- uskunalarga jismoniy hujum;
- taʼsiri koʻrsatilmagan avtomatik skaner hisobotlari;
- biz yuritmaydigan xizmatlardagi muammolar, masalan GitHub yoki Telegram. Ular haqida egalariga xabar bering.

## Minnatdorchilik

Tuzatish chiqqach, xohlasangiz, ismingiz yoki taxallusingizni xavfsizlik advisoryʼsida, bitg uchun esa uning CHANGELOG faylida ham qayd etamiz. Anonim qolishni xohlasangiz, buni hurmat qilamiz. Pullik bug bounty dasturimiz yoʻq: Wonmor oʻz mablagʻi hisobidan ishlaydi, va bajara olmaydigan vaʼdadan koʻra hech narsa vaʼda qilmaganimiz maʼqul.

## Nimani eʼlon qilmaymiz

Foydalanuvchilar xavfsizligi uchun tuzatilmagan zaifliklar tafsilotlarini, server manzillarimizni va boshqa infratuzilma tafsilotlarini eʼlon qilmaymiz. Tuzatilgan zaifliklar advisoryʼlarda foydalanuvchilar oʻz xavfini tushunishi uchun yetarli tafsilot bilan tasvirlanadi.
