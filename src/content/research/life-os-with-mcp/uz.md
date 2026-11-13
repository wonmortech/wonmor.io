---
title: "MCP serverli shaxsiy hayot tizimi"
description: "dtwin kunni besh vaqt namoz atrofida rejalashtiradi va uni MCP orqali AI yordamchilarga ochadi. 10 toolli konnektor modelga hamma narsaning kalitini bermasdan qanday qilib 96 toolga yetdi."
date: 2026-10-26
kind: research
area: faith-society
featured: false
source:
  - "dtwinuz/dtwin README and backend source on main, read 2026-11-13 (private repository)"
  - "dtwinuz/dtwin PR #9 (MCP life tools, 2026-10-26), PR #26 (consent center and optional life areas, 2026-10-26), PR #36 (fail-closed area gate, 2026-10-26), PR #135 (docs from code, 2026-10-27)"
  - "https://modelcontextprotocol.io/specification"
  - "https://github.com/modelcontextprotocol/csharp-sdk"
reproduce:
  note: "dtwin repozitoriysi yopiq; inspector yordamida istalgan MCP serverga ulanib, u qaysi toollarni berishi va ularni qanday belgilashini tekshirish mumkin."
  commands:
    - "npx @modelcontextprotocol/inspector"
---

dtwin (“digital twin”, raqamli egizak) bitta gʻoyaga qurilgan shaxsiy rejalashtirish ilovasi: musulmon foydalanuvchining kuni allaqachon tuzilishga ega, bu besh vaqt namoz, demak reja ham shunga tayanishi kerak. Ishlar namozga nisbatan joylashtiriladi (“Peshindan keyin 20 daqiqa”), kun esa islomiy kun hisobiga koʻra Shomdan Shomgacha davom etadi. Shu yadro atrofida ixtiyoriy hayot sohalari bor: ibodat, tana, moliya, yaqinlar, oʻsish va ruhiy holat.

Kuch ilovaga matn terishga ketmasligi kerak. Kiritish veb-ilova, Telegram bot, ovoz, havolalar, brauzer kengaytmasi va email orqali keladi. Tahlil va rejalashtirish esa foydalanuvchi allaqachon ishlatadigan AI yordamchidan keladi, u [Model Context Protocol](https://modelcontextprotocol.io/specification) orqali ulanadi. Bu maqola oʻsha MCP server haqida: u qanday oʻsdi va juda shaxsiy maʼlumotlar uchun uni xavfsiz saqlaydigan qoidalar qanday.

## 10 tooldan 96 tagacha

MCP server asosiy .NET 10 API ichida yashaydi, rasmiy C# SDK asosida `/mcp` manzilida stateless rejimda ishlaydi. Unga ikki turdagi mijoz ulanadi. Dasturchi vositalari shaxsiy kirish tokenidan foydalanadi. claude.ai va ChatGPT kabi xostlangan yordamchilar maxsus header yubora olmaydi, shuning uchun server dinamik mijoz roʻyxatdan oʻtkazish, PKCE (S256) va refresh token rotatsiyasi bilan OAuth 2.1ʼni ham amalga oshiradi.

Toollar soni loyiha tarixini aytib beradi:

| Sana | Toollar | Nima oʻzgardi |
|---|---|---|
| 2026-10-26 | 10 | Xostlangan yordamchi bilan birinchi ulanish: 6 ta oʻqish, 4 ta yozish tooli |
| 2026-10-26 | 19 | Oʻsha kungi review odatni tahrirlash, inbox holati va eslatmalarni qoʻshdi |
| 2026-10-27 | 91 | Sakkiz hayot sohasi birlashtirildi, hujjatlar koddan qayta yozildi |
| 2026-11-13 | 96 | mainʼda 20 tool sinfi va 10 prompt; prodda keyingi deploygacha 91 ta |

Sanashning oʻzi ham kichik saboq boʻldi. Tool atributini oddiy qidirish sinf darajasidagi atributni ham topadi va sonni oshirib koʻrsatadi: haqiqiy son 91 boʻlganda u 110 ni topdi. Ishonchli sanoq tool metodlaridagi turli `Name =` qiymatlari soni. Endi shunday sanaymiz va READMEʼni kod bilan mos holda saqlaymiz.

96 tooldan 50 tasi faqat oʻqiydigan deb belgilangan. Birortasi destructive deb belgilanmagan, chunki **MCP orqali hech narsani oʻchirib boʻlmaydi**. 10 ta prompt maʼlumotga kirish emas, ish jarayonlari: ertalabki reja, haftalik review, yillik sarhisob, eʼtibordan chetda qolgan maqsadlarni topish, kechki muhasaba va shunga oʻxshashlar.

Bitta tool har suhbatning ohangini belgilaydi. `get_context` modelga “BIRINCHI buni chaqir” deb tasvirlangan. U mahalliy vaqtni, joriy dtwin kunini, asosiy diqqat nuqtasini, kechagi ballni, eskirib qolgan ishlarni, foydalanuvchi **tasdiqlagan** afzalliklarni va faqat foydalanuvchi AI bilan boʻlishadigan profil boʻlimlarini qaytaradi. Model har suhbatni boʻsh sahifadan emas, foydalanuvchining oʻz qarashidan boshlaydi.

## Darvoza: rozilik, hayot sohalari, fail-closed

Har tool sinfi ikki atributdan aynan bittasini eʼlon qilishi shart: `[CoreTools]` (doim yoqiq) yoki `[LifeArea(...)]` (bitta ixtiyoriy sohaga tegishli). Qolganini soʻrov filtri bajaradi:

```steps
Rozilik :: AI roziligi qayd etilmagan boʻlsa, hech qanday tool koʻrsatilmaydi va chaqiruv qabul qilinmaydi.
Soha :: Foydalanuvchi oʻchirgan sohaga tegishli tool tools/list dan yashiriladi va chaqirilsa rad etiladi.
Maxsus maʼlumot :: Ibodat va salomatlik yozuvlari uchun joriy maxfiylik siyosatini qabul qilish ham talab etiladi.
Yozish :: Feature servisi oʻzgarishni saqlaydi, interceptor esa oldingi va keyingi holat suratini yozadi.
Qaytarish :: Foydalanuvchi AI nimani oʻzgartirganini koʻradi va uni veb-ilovadan qaytara oladi.
```

Bu darvozaning birinchi versiyasi ochiq holatda yiqilardi. Hech qaysi atributi yoʻq tool sinfi soha oʻchirilgan boʻlsa ham doim ochiq qolardi. Tuzatish darvozani **fail-closed** qildi: ishga tushishda nol yoki ikki atributli sinf xato tashlaydi, birorta tool sinfi topilmasa server ishga tushmaydi. Unutilgan atribut prodda jimgina ochilib qolgan toolga emas, ishlab chiqish paytidagi yiqilishga aylanadi.

Bu mexanizmning sababi amaliy. Bitta backend veb-ilova, bot va MCPʼga xizmat qiladi, biznes qoidalar esa MCP qatlamida emas, feature servislarida yashaydi. Shuning uchun “AI odat yoza oladi” degani “foydalanuvchi tugmani bosdi” bilan aynan bir xil tekshiruvdan oʻtadi va funksiyalar oʻzgarganda ham shunday qoladi.

## Ibodat maʼlumotlari va maxfiylik

Namoz va salomatlik yozuvlari ilovadagi eng sezgir maʼlumotlar. Dizayn ularga shunga yarasha munosabatda boʻladi:

- **Oʻzimizdan hukm chiqarmaymiz.** dtwin diniy hukm chiqarmaydi. Namoz vaqtlari serverda eʼlon qilingan formula asosida hisoblanadi va namunaviy jadval bilan tekshiriladi. Boshqa savollar malakali ulamolarga qoldiriladi.
- **Namozlar ichki qurilgan.** Modelga besh vaqt namoz uchun hech qachon ish yaratmaslik aytilgan. U faqat namoz qanday oʻqilganini `log_prayer` orqali, joriy dtwin kuni yoki undan oldingi kun uchun qayd eta oladi. Ibodat vazifalar roʻyxatiga aylantirilmaydi.
- **Alohida rozilik.** Ibodat yoki salomatlik yozuvlarini yozish uchun foydalanuvchi maxfiylik siyosatining joriy versiyasini qabul qilgan boʻlishi kerak. Busiz tool hech narsa saqlanmaganini aytadi va foydalanuvchiga rozilikni qayerda berishni koʻrsatadi.
- **Faqat yoziladigan kundalik.** `add_journal_entry` yordamchiga foydalanuvchining oʻz soʻzlari bilan yozuv qoldirishga imkon beradi, lekin yozuvlarni MCP orqali qayta oʻqib boʻlmaydi. Kundalik va qaydlar matni hech qachon AIʼga yuborilmaydi.
- **Sohalarni AIʼdan yopish mumkin.** Foydalanuvchi butun bir hayot sohasini yoki istalgan profil boʻlimini maxfiy saqlay oladi. Yopiq sohalar faqat javoblardan emas, toollar roʻyxatidan ham yoʻqoladi.

## Ish bizga nimani oʻrgatdi

- **Halol belgilang.** Read-only va idempotent belgilari mijozlarga tasdiqni toʻgʻri joyda soʻrash imkonini beradi. Notoʻgʻri belgi umuman belgi yoʻqligidan yomonroq.
- **Toollarni dasturchilar uchun emas, model uchun tasvirlang.** Eng yaxshi natijani cheklovlarni oddiy tilda aytadigan tavsiflar berdi: “faqat bugun yoki kecha”, “kalendar oyida 2 ta muzlatish, sarflashdan oldin foydalanuvchidan soʻra”, “hech qachon voqea toʻqima”.
- **Qaytarishni maʼlumotlar qatlamiga qoʻying.** Har AI yozuvi baza interceptoridan oʻtgani uchun qaytarish barcha toollar uchun, keyin qoʻshilganlari uchun ham, har toolga alohida kod yozmasdan ishlaydi.

## Cheklovlar

- dtwin beta holatida, roʻyxatdan oʻtish taklif orqali. Eʼlon qilishga arziydigan foydalanish raqamlarimiz yoʻq.
- Prod keyingi deploygacha mainʼdan bitta tool sinfiga orqada (96 ga qarshi 91 tool).
- Baʼzi integratsiyalarning kodi tayyor, lekin prodda toʻliq sinalmagan: oʻzbek tilida ovozni matnga aylantirish sifati, kalendar sinxronizatsiyasi va foydalanuvchining oʻz API kalitidan foydalanadigan bot ichidagi yordamchi.
- Darvoza model qaysi toollardan foydalana olishini boshqaradi. Oʻqish tooli maʼlumot qaytargandan keyin xostlangan yordamchi u bilan nima qilishini boshqara olmaydi, shuning uchun oʻqish toollari qaytaradigan narsani boshidanoq cheklaymiz.
