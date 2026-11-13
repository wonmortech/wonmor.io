---
title: Caddy bilan uzilishsiz statik deploy
description: "Ilgari deploy veb-serverni qayta ishga tushirar va oʻrnatuvchini yuklab olayotgan har kimni uzib qoʻyardi. Oʻrniga kelgan yechim kichik: reliz papkalari, bitta atomik rename, tekshirilgan config va silliq reload. Uni ishlatadigan tafsilotlar esa inodeʼlar, bind mountʼlar va ataylab qoʻymagan bitta Caddy sozlamasi haqida."
date: 2026-11-13
kind: engineering
area: infrastructure
featured: false
source:
  - "https://github.com/dtwinuz/bitg/pull/40"
  - "https://github.com/dtwinuz/bitg/commit/592b4a4"
  - "dtwinuz/bitg deploy/remote.sh, deploy/Caddyfile, deploy/docker-compose.yml"
  - "dtwinuz/dtwin #335 (private repository)"
reproduce:
  repo: "https://github.com/dtwinuz/bitg"
  commit: "592b4a4"
  note: "Birinchi buyruq sayt Caddyfileʼini deploy qanday tekshirsa, xuddi shunday — tarmoqsiz konteynerda tekshiradi; ikkinchisi symlink almashinuvini istalgan Linux kompyuterda koʻrsatadi."
  commands:
    - "docker run --rm --network none --tmpfs /var/log/caddy -v \"$PWD/deploy:/c:ro\" caddy:2-alpine caddy validate --config /c/Caddyfile --adapter caddyfile"
    - "mkdir -p www/releases/a www/releases/b && ln -sfn releases/a www/current && ln -sfn releases/b www/current.next && mv -T www/current.next www/current && readlink www/current"
    - "sed -n '1,80p' deploy/remote.sh"
---

bitg.uz — statik sayt, lekin u katta fayllarni tarqatadi: Windows oʻrnatuvchisi, Linux paketlari, macOS paketi va apt ombori. 2026-yil 12-noyabr kechqurun xuddi shu edgeʼdagi boshqa saytning deployʼi umumiy veb-konteynerni qayta yaratdi va bitg oʻrnatuvchisining yuklanishi 791 KB da toʻxtab qoldi. Tuzatish haqida qisqa xabarni allaqachon eʼlon qilganmiz. Bu uning uzun versiyasi: eski jarayonda nima notoʻgʻri edi, yangisining har bir boʻlagi nega bor, uni qanday sinadik va u hali nimani hal qilmaydi.

## Ilgari deploy nima qilardi

Eski bitg.uz deployʼi yangi saytni `site/` papkasiga ochar, oldingisini `site.prev/` sifatida saqlar va `docker compose up -d --force-recreate` ni ishga tushirardi. Oxirgi bayroq har deployʼda Caddy konteynerini qayta yaratadi. Docker eski konteynerga SIGTERM yuboradi, standart toʻxtatish vaqti — oʻn soniyadan keyin esa SIGKILL. Bundan uzoqroq davom etadigan har qanday yuklash uziladi va foydalanuvchi chala oʻrnatuvchi oladi.

Qayta yaratish dangasalikdan emas edi. Sayt `./site` ning yagona bind mountʼi edi, shuning uchun konteynerga yangi fayllarni koʻrsatishning boshqa yoʻli yoʻq edi. Demak, tuzatish faqat buyruqni emas, tuzilmani ham oʻzgartirishi kerak edi.

Koddan oldin yana bir saboq bor edi. Birinchi uzilishdan bir necha daqiqa keyin ikkinchi yuklash 861 KB da toʻxtadi. Uni ham oʻsha sababga yoʻyish oson edi. Lekin edge logi bu soʻrov uchun mijoz tomonga yozishda timeout boʻlganini koʻrsatdi, oʻz tarmogʻimizdan qilingan 22 ta sinov yuklashi esa hammasi toʻliq tugadi. Ikkinchi nosozlik deploy emas, mijozning ulanishi edi. Buni aytib oʻtamiz, chunki notoʻgʻri nosozlikka qarshi sinalgan tuzatish hech narsani isbotlamaydi.

## Yangi jarayon

Sayt endi versiyali papkalarda yashaydi, konteyner esa symlink qayerni koʻrsatsa, oʻshani tarqatadi.

```steps
Tekshirish :: Yangi Caddyfile jonli tizimda biror narsa oʻzgarishidan oldin tarmoqsiz vaqtinchalik konteynerda tekshiriladi.
Ochish :: Sayt www/releases/<sha12>-<vaqt> ga koʻchiriladi — hali birorta soʻrov koʻrmagan papkaga.
Almashtirish :: www/current yonida yangi symlink yaratiladi va bitta atomik qadamda uning ustiga rename qilinadi.
Reload :: Caddy configni joyida qayta yuklaydi; allaqachon ochiq ulanishlar oʻz fayllarini saqlab qoladi.
Tozalash :: Oxirgi uchta reliz www/history da saqlanadi, eskilari oʻchiriladi.
```

Har bir qadam aniq bir sabab bilan bor.

**Deploy — bu rename.** `ln -sfn` oʻzi atomik emas: u eski havolani oʻchirib, yangisini yaratadi, oradagi lahzada soʻrov kelib qolishi mumkin. Avval `www/current.next` ni yaratib, keyin `mv -T www/current.next www/current` ni bajarish almashtirishni bitta `rename(2)` ga aylantiradi. Har bir soʻrov yo eski relizni, yo yangisini koʻradi, hech qachon yoʻq papkani emas.

**Ochiq fayllar oʻz inodeʼini saqlaydi.** Caddy ildizi — `/www/current`, symlink esa fayl ochilganda yechiladi. Almashtirishdan oldin boshlangan yuklash eski faylga ochiq fayl deskriptorini ushlab turadi, shuning uchun u eski relizdan uzatishda davom etadi, yangi soʻrovlar esa havolani yangi relizga yechadi. Eski relizlar darhol oʻchirilmasligining sababi ham shu.

**Reliz nomida vaqt bor.** Papkalar `<commitʼning birinchi 12 hex belgisi>-<UTC vaqt>` deb nomlanadi. Shuning uchun oʻsha commitʼni qayta deploy qilish hozir tarqatilayotgan papkani ustidan yozmaydi, yangi papka yaratadi.

**Config papka sifatida ulanadi.** Caddyfile ham xuddi shunday almashtiriladi: `conf/Caddyfile.next` yoziladi va rename qilinadi. Bitta faylning bind mountʼi asl inodeʼni qotirib qoʻyadi, renameʼdan keyin konteyner eski faylni oʻqishda davom etardi. Uning oʻrniga `conf/` papkasini ulash konteynerga rename qilingan faylni koʻrish imkonini beradi.

**Almashtirishdan oldin tekshirish.** Ilgari buzuq Caddyfile saytni oʻchirib qoʻyardi. Endi deploy yangi fayl uchun `caddy validate` ni `--network none` bilan ishga tushirilgan alohida konteynerda yurgizadi va tekshiruv yiqilsa, jonli tizimga tegmasdan toʻxtaydi.

**Restart emas, reload.** `caddy reload` yangi configni Caddyʼning admin endpointʼi orqali qoʻllaydi; u faqat konteyner ichida tinglaydi va tashqariga ochilmagan. Konteyner faqat uning compose taʼrifi oʻzgarganda qayta yaratiladi. Shu holat uchun `stop_grace_period: 15s` qoʻydik, shunda qayta yaratishda ham ochiq yuklashlarga biroz vaqt beriladi.

## Ataylab qoʻymagan sozlamamiz

Caddyʼda `grace_period` degan parametr bor: server oʻchayotganda ochiq ulanishlarni qancha kutishini cheklaydi. U uzilishsiz tizimga aynan kerak narsadek eshitiladi. Biz uni ataylab qoʻymadik: Caddy uni config reloadʼda ham qoʻllaydi, shuning uchun istalgan qiymat mutlaqo oddiy deploy paytida sekin yuklashlarni majburan yopib qoʻyardi. Usiz reload eski ulanishlar oʻzi tugashini kutadi. Toʻxtatish vaqtining chegarasi esa Dockerʼning `stop_grace_period` ida turadi, u faqat haqiqiy qayta yaratishda ahamiyatga ega.

## Qanday sinadik

Prodʼdan oldin yangi jarayonni oʻsha serverda, alohida konteyner va tarmoqda, prod papkasining nusxasiga qarshi yurgizdik.

- **Koʻchish.** Eski tuzilmadan birinchi deploy `site/`, `site.prev/` va eski yuqori darajadagi Caddyfileʼni oʻchirdi, `www/current` ni yangi relizga yoʻnaltirdi va sayt javob berdi.
- **Yuklash paytida deploy.** MSI yuklashini 300 KB/s bilan cheklab boshladik, soʻng javob sarlavhasini ham oʻzgartiradigan yangi relizni deploy qildik. Yuklash 200 status va 6 303 744 bayt bilan tugadi, SHA-256 prod faylinikiga mos keldi. Yangi soʻrov yangi reliz va yangi sarlavhani oldi. Konteynerning ishga tushgan vaqti oʻzgarmadi.
- **Tozalash.** Yana uchta deployʼdan keyin aynan uchta reliz qoldi va `current` eng yangisini koʻrsatdi.

Umumiy edge alohida oʻzgarishda xuddi shunday ishlov oldi: har deploy uchun reliz papkasi, edgeʼning oʻz compose servisi bilan tekshirish, xuddi shu rename, reload va reload yiqilsa avtomatik ravishda oldingi relizga qaytish. Edge hujjatlar ildizini standart qiymatli muhit oʻzgaruvchisidan oʻqiydi — `root * {$WEB_ROOT:/srv}` — shuning uchun oʻzgaruvchi joriy relizni koʻrsatib turganda eski image tuzilmasi ham ishlayveradi. Prodʼda 76 soniya davom etgan yuklash edge deployʼi orqali toʻxtovsiz oʻtdi, mos nazorat yigʻindisi bilan tugadi, konteynerning ishga tushgan vaqti esa oʻzgarmadi.

## Cheklovlar

- **Bitta sahifa yuklanishida aralash versiyalar.** Agar almashtirish ikki soʻrov orasiga tushsa, sahifaning HTMLʼi eski relizdan, CSSʼi esa yangisidan kelishi mumkin. Assetʼlardagi `?v=<sha>` qoʻshimchasi eskirgan keshning oldini oladi, lekin yoʻl baribir `current` orqali yechiladi, shuning uchun u eski faylni qotirmaydi. Kichik oʻzgarishli statik sayt uchun buni qabul qilamiz; bu qanchalik tez-tez boʻlishini oʻlchamaganmiz.
- **Orqaga qaytish — tugma emas, buyruq.** bitg.uzʼda orqaga qaytish `current` ni oldingi relizga yoʻnaltirib, qoʻlda reload qilishni anglatadi. Faqat edge avtomatik qaytadi, va faqat reloadʼning oʻzi yiqilganda.
- **Deployʼdan keyingi sogʻliq tekshiruvi yoʻq.** Deploy configni tekshiradi, lekin almashtirishdan keyin sahifalarni olib, xato boʻlsa qaytarmaydi. Yangi tuzilmaning birinchi deployʼidan keyin qisqa URL roʻyxatini qoʻlda tekshirdik.
- **Qayta yaratishda baribir chegara bor.** Compose taʼrifi oʻzgarganda ochiq yuklashlarga cheksiz emas, 15 soniya beriladi.
- **Prodʼda bitta oʻlchov.** 76 soniyalik yuklash — bitta sinov. U mexanizm ishlashini koʻrsatadi, lekin bu foiz emas.

Oʻzgarish taxminan 66 qator shell. Qiymat skriptning oʻzida emas, qaysi amal atomik ekanini, qaysi obyekt inodeʼni ushlab turishini va qaysi doʻstona koʻrinadigan sozlama hamma ishni bekor qilishini bilishda.
