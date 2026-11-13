---
title: "Prodda Telegram HTML widgetlari"
description: "dtwin Telegram botida ikkita jonli HTML widgetni chiqarish uchun nima kerak boʻldi: 4 KB byudjet, 1 KB holat, bot va chat oʻrtasidagi reviziya protokoli va hujjatda ochiq yozilmagan chizish limiti."
date: 2026-11-10
kind: engineering
area: interfaces
featured: false
source:
  - "https://core.telegram.org/bots/widgets"
  - "https://core.telegram.org/bots/api"
  - "https://github.com/TelegramMessenger/widget-sandbox"
  - "dtwinuz/dtwin #327"
  - "dtwinuz/dtwin #329"
reproduce:
  note: "Oʻz widgetingiz Telegram byudjetiga sigʻishini tekshiring: HTMLʼni zlib 9-darajada siqing va natijani 4 096 bayt bilan solishtiring."
  commands:
    - "python3 -c \"import sys,zlib;print(len(zlib.compress(open(sys.argv[1],'rb').read(),9)))\" widget.html"
    - "git clone https://github.com/TelegramMessenger/widget-sandbox"
---

Telegram Bot API 10.4 yangi turdagi xabar qoʻshdi: bot chatga yuboradigan kichik HTML sahifa. U oʻzini chizadi, bosishlarga javob beradi va yangi xabar yubormasdan keyin yangilanishi mumkin. 2026-yil 10-noyabrda dtwin boti shulardan ikkitasini yubora boshladi. `/osmon` jonli osmon kartasi: quyosh yoki oy yoy boʻylab yuradi, osmon rangi kun vaqtiga qarab oʻzgaradi va keyingi namozgacha sanoq ketadi. `/tasbih` suhbat ichida yashaydigan zikr sanagichi.

Bu maqola ularning ostidagi muhandislik haqida: foydali interfeysni bir necha kilobaytga qanday sigʻdirish, widget va bot holat boʻyicha qanday kelishishi va faqat widgetlarni prodda yurgizib oʻrgangan narsalarimiz.

```steps
Yuborish :: Bot sendWidgetʼni HTML, boshlangʻich holat va zaxira sifatida oddiy matnli caption bilan chaqiradi.
Yozish :: Xabar turi, reviziya raqami va holat xeshi bilan saqlanadi.
Soʻrash :: Widget koʻringanda va faol paytda har 20 soniyada botdan yangi holatni soʻraydi.
Amal :: Bosish qisqa soʻrovga aylanadi, bot uni ilova ishlatadigan oʻsha kod yoʻli orqali bajaradi.
Qaytarib yozish :: Holat haqiqatan oʻzgargan boʻlsa, bot widgetga javob beradi va yangi holatni xabarga yozadi.
```

## Byudjet

Widget qatʼiy cheklovlar ostida yashaydi. Uning HTMLʼi zlib 9-darajali siqishdan keyin 4 096 baytga sigʻishi, xabarga biriktirilgan holat 1 024 baytga sigʻishi kerak, widget ichida esa tarmoqqa kirish, matn kiritish va foto yoʻq. Widget koʻrsatadigan hamma narsa koddan va bir kilobayt JSONʼdan chizilishi kerak.

Ikkala dtwin widgeti bitta `<canvas>` va bitta skriptdan iborat. Chiqarilgan paytda osmon kartasi 2 621 baytga, tasbih esa 1 616 baytga siqilgan edi. DOM elementlari qurish oʻrniga canvasʼda chizish faqat hajm haqida emas edi. Bu bizni pastda tasvirlangan bir limitdan ham himoya qilib chiqdi. Tasbihning 33 donasi bitta canvasʼda chizilgan radial gradientlar, chuqurlik esa ularni ellips boʻylab siljitish va kattalashtirish bilan koʻrsatiladi. Shaffoflikli 33 ta DOM elementi butunlay boshqa hikoya boʻlardi.

Har widget dtwinʼning oʻz palitrasi, radiuslari va shriftidan foydalanadi. Masalan, tasbih toʻq yashil, joriy dona va progress halqasi esa oltin rangda. Widget chatga tashlangan umumiy karta emas, mahsulotning bir qismi boʻlib koʻrinishi kerak.

## Holat protokoli

Widget oʻzi hech narsa yuklab ololmaydi. U botga faqat qisqa satr yubora oladi, bot esa qisqa satr bilan javob beradi. Telegram buni widget query deb ataydi. Biz lugʻatni juda kichik qildik: `s` joriy holatni soʻraydi, `p:2` kunning uchinchi namozini belgilaydi yoki belgini olib tashlaydi, `z:17` tasbihga oʻn yetti sanoq qoʻshadi.

Holat ikki tomonga oqa boshlashi bilan ikki muammo chiqadi. Javoblar tartibsiz kelishi mumkin, bot esa oʻzgarmagan holat bilan koʻp marta javob berishi mumkin. Ikkalasini ikki maydon bilan hal qilamiz:

- **Reviziya, `r`.** Bot yuboradigan har holat faqat oʻsadigan raqamga ega: joriy Unix vaqti yoki, u kattaroq boʻlmasa, oxirgi reviziya plyus bir. Widget kelgan holatni faqat uning reviziyasi oʻzidagidan eski boʻlmasa qabul qiladi, shuning uchun sekin javob kartani hech qachon orqaga qaytarmaydi.
- **Xesh.** Bot har holatning SHA-256 xeshini saqlaydi, u reviziya nolga tenglangan holda hisoblanadi. Yangi javob xeshi saqlangani bilan bir xil boʻlsa, bot eski reviziya bilan javob beradi va xabarga tegmaydi.

Bot `editMessageWidgetData` ni faqat xesh oʻzgarganda chaqiradi, shuning uchun xabarda saqlangan holat (qayta ochilgan chat birinchi koʻrsatadigani) har soʻrovda tahrir qilmasdan dolzarb qoladi. Qisqacha:

```csharp
var state = data == "s" ? await widget.State(user, ct) : await widget.Apply(user, data, ct);
if (state.Hash() == row.StateHash)
    return (state with { R = row.Revision }).Json();          // nothing changed
state = state with { R = Math.Max(now, row.Revision + 1) };   // monotonic revision
// answer the widget, then editMessageWidgetData and store the new hash
```

Soʻrovlar faqat shaxsiy chatdan, yuboruvchi chatning oʻzi boʻlsa va xabar oʻsha foydalanuvchiga tegishli boʻlsa qabul qilinadi. Qolgan hammasi umumiy xato javobini oladi. Foydalanuvchi dtwin maxfiy maʼlumotlar uchun talab qiladigan roziligini hali bermagan boʻlsa, widget alohida kod oladi va jimgina xato bermasdan buni ayta oladi.

## Yomon aloqadan omon chiqadigan bosishlar

Tasbih tez, yuzlab marta bosiladi, koʻpincha signal yomon telefonda. Har bosishga bitta soʻrov yuborish isrof ham, moʻrt ham boʻlardi. Buning oʻrniga widget lokal sanaydi:

- har bosish kutilayotgan hisoblagichga qoʻshiladi, u widgetning `localStorage`ʼida saqlanadi, shuning uchun chat yopilsa ham yoʻqolmaydi;
- kutilayotgan sanoqlar bitta `z:<n>` soʻrov bilan yuboriladi, bir martada koʻpi bilan 500 ta, bosish paytida besh soniyada bir martadan, widget faol paytda olti soniyada bir martadan koʻp emas;
- kutilayotgan son faqat bot toʻgʻri holat bilan javob bergandan keyin ayiriladi; xatoda u shunchaki kutishda qoladi.

Har bosishda yengil tebranish va har 33-sida toʻlqin bilan muvaffaqiyat signali uni haqiqiy tasbihdek his qildiradi. Serverda yigʻilgan sanoq ilova ishlatadigan oʻsha zikr jurnaliga tushadi.

Osmon kartasi mavjud kodni qayta ishlatishda yana ham uzoqqa boradi. Namoz nuqtasini bosish ilovaning Bugun koʻrinishida oʻsha namozni belgilash bilan aynan bir xil funksiyani chaqiradi. Widget yangi sirt, ikkinchi implementatsiya emas. Kun chegarasi ham bir xil: kartadagi sana dtwinʼning qolgan qismi kabi shomda almashadi.

## Prod bizga nimani oʻrgatdi

**Eski klientlarga caption kerak.** Widgetni qoʻllamaydigan klient “unsupported media” va captionʼni koʻrsatadi, shuning uchun caption kartaning toʻliq matnini olib yuradi. `sendWidget`ʼning oʻzi xato bersa, bot oddiy xabarga oʻtadi. Widgetlar faqat bot bilan shaxsiy chatda ishlaydi; buni prodda yuborish va yangilash uchun tasdiqladik.

**Chizish limiti bor.** Bir vaqtda oʻn oltitadan ortiq “ogʻir” quti chizilayotgan boʻlsa (shaffofligi birdan kichik, CSS filter yoki xiralashgan soyali har narsa, psevdo-elementlar va transitionʼlar ham shunga kiradi), Telegram widgetni toʻxtatadi. Kompyuter brauzeridagi koʻrik bu haqda hech narsa demaydi. Kataklar toʻrini shaffoflikdan paydo qilib animatsiya qilishning oʻzi yetarli. Endi qoidamiz: roʻyxat va kataklarni faqat `transform` bilan animatsiya qilish, effektlarni esa canvasʼda saqlash.

**Brauzer koʻrigi test emas.** Chiqarishdan oldin har widget Telegramʼning rasmiy widget sandboxʼida yurgiziladi; u widget toʻxtadimi, ogʻir qutilar choʻqqisi va yakuniy balandlikni koʻrsatadi. U yerda bosishlarni ham qayta oʻynatamiz, chunki baʼzi nosozliklar faqat oʻzaro taʼsirdan keyin chiqadi: ogʻir qutilar sonini limitdan oshiradigan xiralashgan holat yoki bitta vazifa uchun canvas buyruqlari byudjetidan oshib ketadigan ketma-ket bosishlar.

**Qisqa IDʼga tasodifiy qism kerak.** Keyingi dtwin kartalari har qator uchun sakkiz belgili IDʼni holatga qoʻyadi, toki bosish qatorni nomlay olsin. Birinchi versiya UUIDv7ʼning birinchi sakkiz hex belgisini olardi, ular esa vaqt belgisi, shuning uchun taxminan bir daqiqa ichida yaratilgan qatorlar toʻqnashardi va bosish notoʻgʻri qatorga tushishi mumkin edi. Oʻsha kechasi #329ʼda chiqqan tuzatish oxirgi sakkiz belgini oladi va noaniq moslikni rad etadi.

## Cheklovlar

- Widgetlar faqat bot bilan shaxsiy chatda ishlaydi, guruhlarda emas.
- Yuborilgan xabarlarni ularning holati bilan bogʻlaydigan jadval chiqarilgan paytda tozalanmasdi; tozalash vazifasi paydo boʻlguncha eski qatorlar shunchaki yigʻiladi.
- Widget koʻrsatadigan hamma narsa serverda hisoblanib, 1 024 bayt JSONʼga sigʻishi kerak, bu kartaga uzun roʻyxat va tarixni sigʻdirmaydi.
