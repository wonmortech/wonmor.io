---
title: Uchta operatsion tizim uchun oʻzbekcha klaviatura
description: "bitg oʻzbekcha soʻzlarni yozish paytidayoq 2026-yilgi alifboga oʻtkazadi: Windows, Linux va macOSʼda. Qarorni bitta Rust yadrosi chiqaradi; uni qoʻllash qanchalik qiyinligini esa uchta butunlay boshqa kiritish tizimi belgilaydi."
date: 2026-11-12
kind: research
area: language
featured: false
source:
  - "https://github.com/dtwinuz/bitg"
  - "dtwinuz/bitg ARCHITECTURE.md, CHANGELOG.md"
  - "https://github.com/dtwinuz/bitg/pull/2"
  - "https://github.com/dtwinuz/bitg/pull/7"
  - "https://github.com/dtwinuz/bitg/pull/9"
  - "https://github.com/dtwinuz/bitg/pull/30"
  - "https://github.com/dtwinuz/bitg/releases"
reproduce:
  repo: "https://github.com/dtwinuz/bitg"
  commit: "2de5c94"
  note: "Birinchi buyruq aralash gapni kiritish usullari ishlatadigan yadroning oʻzi bilan oʻgiradi; ikkinchisi macOS va Linux qobiqlari dasturdan matnni faqat dvigatelga kerak boʻlganda soʻrashini isbotlaydigan testni yurgizadi."
  commands:
    - "cargo run -q --release -p bitg-cli -- \"Menga chat yozing. Menga choy yozing.\""
    - "cargo test -p bitg-ime wants_before"
    - "cargo test -p bitg-core"
---

2026-yil oktyabrida Oʻzbekiston lotin alifbosidagi toʻrtta harfni almashtiradigan qonun qabul qildi: oʻ oʻrniga ö, gʻ oʻrniga ğ, sh oʻrniga ş, ch oʻrniga ç. Klaviaturalarda bu harflar yoʻq, oʻzbekcha yozadigan koʻpchilik esa har kuni inglizcha ham yozadi, koʻpincha bitta xabarning ichida. Oddiy «top va almashtir» *check*, *shell* va *push* ni buzadi.

bitg — bizning ochiq kodli javobimiz: siz `o'zbek shahar` deb yozishda davom etasiz, probel bosilganda u `özbek şahar` ga aylanadi, qaysi dasturda boʻlishingizdan qatʼi nazar, inglizchaga esa tegilmaydi. 2026-yil 12-noyabrda bir kunda uchta reliz chiqardik: Windows uchun v0.1.0 (01:29 UTC), Linux qoʻshilgan v0.2.0 (12:02 UTC) va macOS beta qoʻshilgan v0.3.0 (14:23 UTC). Bu maqola bitta oʻgirish dvigatelini deyarli hamma narsada kelisholmaydigan uchta operatsion tizim ichida bir xil ishlatish nimaga tushgani haqida.

## Bitta yadro, bitta kichik shartnoma

Tilga oid barcha qarorlar `bitg-core` da — ish vaqtida hech qanday bogʻliqligi yoʻq Rust crateʼda. U matnni soʻzlarga ajratadi, soʻz oʻzbekcha ekanini aniqlaydi (korpus lugʻati, SCOWL inglizcha roʻyxati, brend va xorijiy nomlar roʻyxatlari, token shakli va gap konteksti) va alifbo qoidalarini qoʻllaydi. Lugʻatlar binar faylga kompilyatsiya qilinadi, ishga tushishda hech narsa tahlil qilinmaydi.

```text
$ bitg "Menga chat yozing. Menga choy yozing."
Menga chat yozing. Menga çoy yozing.
```

Platforma qatlamlari oʻzbek tili haqida hech narsa bilmaydi. Ular yadro bilan bitta chaqiruv orqali gaplashadi. Soʻz tugaganda `Session::complete_word` faqat shu soʻzga tegadigan `Edit { delete, insert }` qaytaradi. Fuzz testi xavfsizlik uchun muhim boʻlgan yagona shartni tekshiradi: `delete` hech qachon hozirgina yozilgan soʻzdan katta boʻlmaydi, shuning uchun til mantiqidagi xato foydalanuvchi oldinroq yozgan matnni yeb qoʻya olmaydi.

```steps
Tugma :: Platforma qobigʻi tugmani yoki matn oʻzgarishini koʻradi va joriy soʻzni kuzatib boradi.
Chegara :: Probel yoki tinish belgisida tugagan soʻzni Rust yadrosiga beradi.
Qaror :: Yadro koʻpi bilan shu soʻzni oʻchirib, 2026-yilgi imloni yozadigan Edit qaytaradi yoki hech narsa qaytarmaydi.
Qoʻllash :: Qobiq soʻzni joyida almashtiradi yoki dastur matnini yashirsa, preedit buferidan yozib beradi.
Qaytarish :: Almashtirishdan keyingi Backspace aslini tiklaydi va uni istisno sifatida eslab qoladi.
```

Loyihadagi barcha qiyinchilik oxirgi ikki qadamda, va u har tizimda boshqacha.

## Windows: dastur oʻzi chiqib ketmaguncha tizim ishlaydi

Windowsʼda bitg — Rustʼda yozilgan Text Services Framework matn xizmati. U klaviatura hookʼini oʻrnatmaydi. Matn oʻzgarishlarini `ITfTextEditSink` orqali kuzatadi va tugagan soʻzni TSF edit session ichida almashtiradi. Bu rasmiy va toza yoʻl: dastur oddiy tahrirni koʻradi, oʻzining undo tarixi buzilmaydi.

Bu yoʻl dastur oʻz matnini TSFʼga ochib berishini taxmin qiladi. Qt dasturlari, jumladan Telegram Desktop, bunday qilmaydi. Ular uchun bitg zaxira yoʻlga oʻtadi: soʻzni tugma hodisalaridan qayta yigʻadi va `SendInput` bilan Backspaceʼlar hamda yangi soʻzni yuboradi. Buni v0.1.0 gacha toʻgʻrilash uchun uchta alohida tuzatish kerak boʻldi:

- **Oʻz Backspaceʼlarimiz foydalanuvchinikiga oʻxshardi.** bitg oʻgirishdan keyingi Backspaceʼni «qaytarish» deb tushunadi. Qtʼda bitgʼning oʻzi yuborgan Backspaceʼlar xuddi shu yoʻl bilan qaytib kelar va bitg oʻz ishini oʻzi bekor qilardi. Yechim — qayta yozish sanagichi: bitg oʻz tugmalarini 1,5 soniya ichida qaytib kelishini kutadi va shundan keyingina yana foydalanuvchini tinglaydi.
- **Odamlar zaxira yoʻldan tezroq yozadi.** Tuzatish hali navbatda turganda bosilgan tugmalar uning oʻrtasiga tushib qolardi. Endi bitg bu tugmalarni ushlab turadi va tahrirdan keyin, bosilgan tartibida qayta yuboradi.
- **Qt belgini tashlab yuboradi.** Yuborilgan tugmalar `dwExtraInfo` da belgi olib yuradi, shunda xizmat ularni taniydi. Qt bu maydonni uzatmaydi, shuning uchun bitg oʻz tugmalarini tartibi boʻyicha taniydi.

v0.1.0 tegidagi Windows uchidan-uchiga sinovlari 59 ta tekshiruvdan oʻtdi, ular orasida Telegram bilan bir xil kiritish yoʻlidan foydalanadigan PySide6 oynasi ham bor. Keyingi ikki tuzatishni ham aytib oʻtish kerak. v0.3.1 da bitg maydonning input scopeʼini oʻqiydi (`ITfContext::GetAppProperty` bilan, uni shunday bermaydigan dasturlar uchun `GetProperty` ga qaytib) va parol, PIN hamda email maydonlarida oʻchiq turadi. Windows 11 da bitg oʻz-oʻzidan inglizcha klaviaturaga qaytib ketayotgani haqidagi xabardan keyin esa faollashtirish xatosi TSFʼga qaytarilmaydi, balki logga yoziladi: avval aynan shu sabab Windows kiritish usulini tashlab yuborardi. Bu bitgʼni tanlangan holda saqlaydi, lekin oʻsha kompyuterda faollashtirish nega muvaffaqiyatsiz boʻlganini tushuntirmaydi; issue hali ochiq.

## Linux: ikki tizim, bitta umumiy qobiq

Linux uchun yozish mantiqini Windows kodidan ajratib, `bitg-ime` ga — C ABIʼli, platformadan mustaqil crateʼga koʻchirdik. Uning ustida yupqa qobiqlar turadi: Cʼda IBus dvigateli va C++ʼda Fcitx5 qoʻshimchasi. Ikkalasi bir xil qoidaga amal qiladi. Dastur kursor atrofidagi matnni bersa, soʻz joyida almashtiriladi. Bermasa yoki «beraman» deb boʻsh qaytarsa, soʻz tagi chizilgan preedit matn sifatida ushlanadi va soʻz chegarasida oʻgirilgan holda yoziladi. Fokus boshqa joyga oʻtsa, preedit oʻgirilmasdan yoziladi, matn yoʻqolmaydi.

CI Ubuntu 22.04 da haqiqiy `ibus-daemon` ni ishga tushiradi va u orqali yozadi: sakkizta holat — toʻgʻridan-toʻgʻri oʻgirish, inglizchaga tegmaslik, kirill, Backspace bilan qaytarish va oʻrganish, Enter, preedit, fokus oʻzgarganda preedit saqlanishi va parol maydoni. Eng qiyini sinov muhitining oʻzi boʻldi. `IBus.Bus.new()` butun jarayon uchun yagona obyekt qaytaradi, shuning uchun uni daemon soketi paydo boʻlishidan oldin yaratsangiz, sinov butunlay uzilgan holda qoladi; endi sinov avval D-Bus soketini kutadi.

Fcitx5 CIʼda quriladi, paketlanadi va bogʻlanishi tekshiriladi, lekin hali haqiqiy dasturda u bilan yozib koʻrilmagan, shuning uchun «sinov» belgisi bilan chiqadi.

## macOS: toʻgʻri oʻlchov, kamroq savol

macOSʼda qobiq — Swiftʼdagi InputMethodKit kiritish usuli, xuddi shu `bitg-ime` C ABI ustida, Apple silicon va Intel uchun bitta universal `.pkg` boʻlib keladi.

Ikki tafsilot muhim boʻldi. Birinchisi — birliklar: dvigatel belgilarni Unicode skalyarlarida sanaydi, InputMethodKit diapazonlari esa UTF-16 da. Emoji yonida ikkalasi farq qiladi, shuning uchun Swift tomoni biror narsani almashtirishdan oldin oʻchiriladigan uzunlikni matnning oʻzidan qayta hisoblaydi.

Ikkinchisi — narx. macOS dasturidan kursor oldidagi matnni soʻrash jarayonlararo chaqiruv, birinchi versiya esa uni har tugmada soʻrardi. PR #9 `wants_before` ni qoʻshdi: dvigatel qobiqqa matn qachon haqiqatan kerakligini aytadi — soʻz boshida, soʻz oxirida va qaytarishda. `choy` soʻzi va undan keyingi probel uchun soʻrovlar soni beshtadan ikkitaga tushdi. Xossa testi 600 ta tasodifiy tugma ketma-ketligini uch xil dasturga qarshi yurgizadi (matn beradigan, boʻsh matn qaytaradigan va umuman bermaydigan) va natija har safar soʻragandagi bilan bir xil ekanini tekshiradi. Test buni ushlashiga ishonch hosil qilish uchun `wants_before` ni ikki xil usulda ataylab buzib ham koʻrdik. Keyinroq Linux ham shu qoidani oldi va soʻrovni oxirgi 128 belgi bilan chekladi.

## Cheklovlar

- **macOS haqiqiy dasturlarda sinalmagan.** CI soxta matn maydonini (beta qoʻshilganda 13 ta holat) yurgizadi va paketni Apple silicon hamda Intel runnerʼlarida oʻrnatadi. Ekransiz runnerʼlarda kiritish manbasini tanlash `-50` xatosini qaytaradi, shuning uchun haqiqiy InputMethodKit yoʻlini sinaydigan uchidan-uchiga test u yerda faqat kompilyatsiya qilinadi; uni Macʼda qoʻlda yurgizish kerak. Kimdir u bilan Safari, Chrome, Notes, Word va Telegramʼda yozib koʻrmaguncha Mac versiyasi beta boʻlib qoladi.
- **Fcitx5 haqiqiy dasturlarda tekshirilmagan**, yuqorida aytilganidek.
- **Windowsʼdagi Qt yoʻli — zaxira.** U soʻzlarni tugma hodisalaridan qayta tiklaydi, bu esa tabiatan TSF edit sessionʼdan moʻrtroq. Tugmalarni gʻalati usulda qayta ishlaydigan har qanday dastur uni yangi usulda buzishi mumkin.
- **Telefon klaviaturasi hali yoʻq.** Xuddi shu yadro ustidagi mobil klaviatura reja qilingan, hali chiqmagan.

Qaytadan boshlasak ham saqlab qoladigan narsamiz — chegara. Yadro bitta savolga javob beradi: «bu soʻz nimaga aylanishi kerak», har bir platforma qobigʻi esa shu javobni boshqa hech narsaga tegmasdan qoʻllay olishi bilan baholanadi.
