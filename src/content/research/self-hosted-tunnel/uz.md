---
title: "Oʻz serverimizdagi tunnel qurish"
description: "tunnel.dtwin.uzʼni frp ustida qanday qurganimiz: kirish va subdomenlarni boshqaradigan kichik gateway, havola koʻrsatilishidan oldin chiqariladigan subdomen sertifikatlari va GitHubʼdan yuklash osilib qoladigan tarmoqlarda ham oʻrnatiladigan klient."
date: 2026-11-02
kind: engineering
area: infrastructure
featured: false
source:
  - "https://tunnel.dtwin.uz"
  - "https://github.com/fatedier/frp"
  - "https://github.com/fatedier/frp/blob/dev/doc/server_plugin.md"
  - "https://caddyserver.com/docs/automatic-https#on-demand-tls"
  - "https://letsencrypt.org/docs/challenge-types/"
  - "dtwinuz/tunnel #9"
  - "dtwinuz/tunnel #10"
reproduce:
  note: "Klient skripti ochiq: u frp nazorat yigʻindilarini qanday qotirishini oʻqing va xizmatga TLS handshake vaqtini biz oʻlchaganimiz kabi oʻlchang."
  commands:
    - "curl -fsSL https://tunnel.dtwin.uz/tunnel.sh | grep -in sha256"
    - "curl -s -o /dev/null -w 'tls=%{time_appconnect}s total=%{time_total}s\\n' https://tunnel.dtwin.uz"
---

Oʻz kompyuteringizda ishlayotgan narsani (koʻrib chiqish uchun branch, webhook qabul qiluvchi, boshqa shahardagi odamga demo) ulashish odatda xosting qilingan tunnel xizmatini anglatadi. Bu xizmatlar ishlaydi, lekin har soʻrov birovning infratuzilmasidan oʻtadi, bepul tariflarda soʻrov cheklovlari va oraliq ogohlantirish sahifalari bor, manzil esa ularniki. Biz tunnel oʻzimizniki boʻlishini xohladik: oʻz domenimiz, oʻz serverimiz va nima jurnalga yozilishi haqida oʻz qoidalarimiz.

Tunnel tunnel.dtwin.uz manzilida 2026-yil 2-noyabrda ishga tushdi. Bu maqola uning ortidagi muhandislik qarorlari haqida, ularning koʻpi birinchi urinishda ishlamagan narsalardan kelib chiqqan.

```steps
Ulanish :: Klient serverga oddiy HTTPS WebSocket orqali oʻzi ulanadi, shuning uchun qatʼiy ofis firewallʼlaridan oʻtadi.
Ruxsat :: Har kirish va har yangi tunnel uchun frp gatewayʼimizdan token toʻgʻrimi va subdomen shu foydalanuvchinikimi deb soʻraydi.
Sertifikat :: Gateway yangi subdomen uchun sertifikatni darhol boshlaydi va havolani faqat TLS tayyor boʻlganda xabar qiladi.
Yoʻnaltirish :: Mehmonlar avval gatewayʼga keladi, u trafikni frpʼga uzatishdan oldin parol, IP qoidalari va jurnalni qoʻllaydi.
Tarqatish :: Klientlar frpʼni SHA-256 qotirilgan holda oʻz mirrorʼimizdan yuklaydi, zaxira sifatida GitHubʼdan.
```

## frp va qarorlarni oʻzi qabul qiladigan gateway

Biz tunnel protokolini yozmadik. Asosi frp, ishga tushganda 0.71.1 versiya, yetuk ochiq kodli teskari proksi: server jarayoni klientlardan ulanish qabul qiladi, har klient esa lokal portni subdomen ostida chiqaradi. frpʼda yoʻq narsa foydalanuvchi tushunchasi. Standart holatda umumiy server tokeniga ega har kim istalgan subdomenni egallashi mumkin.

Shuning uchun frpʼning oldida va yonida bogʻliqliklarsiz Nodeʼda yozilgan oʻzimizning kichik gateway turadi. U ikki ishni bajaradi.

**U frp savollariga javob beradi.** frp HTTP orqali server plaginlarini qoʻllaydi: tanlangan amallarda u soʻrovni URLʼga yuboradi va ruxsat yoki rad javobini kutadi. Biz gatewayʼni `Login` va `NewProxy` uchun roʻyxatdan oʻtkazdik. Har kirishda u foydalanuvchining shaxsiy tokenini tekshiradi; har yangi tunnelda subdomen shu foydalanuvchining ruxsat roʻyxatida ekanini va boshqa birovga tegishli emasligini tekshiradi. Standart holatda `alice` nomli foydalanuvchi `alice` va `alice-*` dan foydalana oladi.

**U mehmon tomonini boshqaradi.** Har tunnel uchun ochiq trafik frpʼdan oldin gatewayʼga keladi. Tunnelni pauza qilish, parol bilan qulflash yoki IP manzillar roʻyxati bilan cheklash va soʻrov jurnalini yozish aynan shu yerda boʻladi.

Shaxsiy tokenlar `tn_<user>_<random>` koʻrinishida, bir marta koʻrsatiladi va faqat SHA-256 xesh sifatida saqlanadi. Umumiy frp tokeni qoʻlda tarqatilmaydi: `tunnel login` shaxsiy tokenni gateway APIʼsi orqali unga almashtiradi. Shaxsiy token bekor qilinsa, yangi ulanishlar darhol rad etiladi, allaqachon ulangan tunnellar esa gatewayʼdan 403 ola boshlaydi.

Klient oddiy HTTPS porti orqali WebSocket bilan oʻzi ulanadi. Demak, veb-brauzerga ruxsat beradigan korporativ tarmoq tunnelga ham ruxsat beradi va foydalanuvchi tomonida hech narsa ochish kerak emas.

## Wildcardʼsiz sertifikatlar

Koʻzga tashlanadigan yechim `*.tunnel.dtwin.uz` uchun bitta wildcard sertifikat. Wildcard DNS-01 sinovini talab qiladi, yaʼni TXT yozuvlarni avtomatik yaratish kerak, bizning DNS provayderimizda esa API yoʻq. Biz edge serverning on-demand TLSʼi orqali har subdomen uchun alohida sertifikatni tanladik. Chiqarishdan oldin edge frpʼdan bu nom haqiqatan roʻyxatdan oʻtganmi deb soʻraydi, shuning uchun hech kim bizni tasodifiy nomlarga sertifikat soʻrashga majbur qila olmaydi.

On-demand chiqarishning narxi bor: birinchi mehmon uni kutadi. Edge jurnallarimizda Letʼs Encrypt yangi nom uchun “olinmoqda”dan “olindi”gacha taxminan 7,8 soniya sarfladi. Birinchi tuzatishimiz prewarm edi: frp yangi tunnelni qabul qilgandan 1,5 soniya keyin gateway oʻsha nom uchun edgeʼga TLS ulanish ochadi va bu chiqarishni hech kim kirmasdan oldin boshlaydi. Bu yetarli boʻlmadi. Havola darhol chiqarilardi va tez bosish baribir tugallanmagan sertifikatga urilardi: birinchi kirish TLS handshakeʼda 5,71 soniya sarfladi.

Ikkinchi tuzatish kutishni oʻz joyiga koʻchirdi. Gatewayʼga tayyorlik endpointʼi qoʻshildi: u foydalanuvchi ilovasiga hech qanday soʻrov yubormasdan nom uchun TLS handshake qiladi, klient esa havolani chiqarishdan oldin uni soʻrab turadi:

| | Birinchi kirish |
|---|---|
| Faqat prewarm | TLS handshake 5,71 s |
| Havola tayyorlikdan keyin (Windows klient) | havola 9,9 s da chiqdi; TLS 0.06 s, jami 0,13 s |
| Havola tayyorlikdan keyin (Linux klient) | TLS 0.16 s |

Foydalanuvchi bir marta, terminalda, kutish kutilgan joyda bir necha soniya kutadi. Mehmon hech qachon kutmaydi. Roʻyxatdan oʻtmagan nom uchun endpoint olti soniyadan keyin `ready: false` deb javob beradi, chunki edge unga sertifikat chiqarishni rad etadi.

Bilib qoʻyishga arziydigan bir yon taʼsir: har sertifikat ochiq Certificate Transparency jurnallariga tushadi va bu jurnallarni kuzatadigan skanerlar bir necha lahzada kelib, `/wp-json` va `/xmlrpc.php` kabi yoʻllarni tekshiradi. Yangi tunnel sertifikat olgan lahzadan ochiq, havolani ulashgan-ulashmaganingizdan qatʼi nazar.

## Ataylab kamroq jurnal

Gateway soʻrov jurnalini yuritadi, chunki tunnel bilan ishlab chiqishda eng koʻp beriladigan savol “webhook umuman keldimi?”. U faqat metamaʼlumotni (vaqt, metod, tozalangan yoʻl, status, davomiylik, bayt hajmlari, kontent turi, mijoz manzili va user agent) yozadi va yetti kun saqlaydi. Soʻrov va javob tanalari, cookieʼlar va avtorizatsiya sarlavhalari saqlanmaydi.

Xuddi shu vazminlik boshqa imkoniyatlarni ham shakllantiradi:

- **Parol qulfi.** `tunnel lock` tunnel oldiga HTTP basic auth qoʻyadi. Parol scrypt xeshi sifatida saqlanadi, `Authorization` sarlavhasi soʻrov ilovaga yetishidan oldin olib tashlanadi, takroriy xatolar sekinlashtiriladi.
- **IP ruxsat roʻyxati.** `tunnel allow` 50 tagacha IPv4 yoki IPv6 diapazonini qabul qiladi, `me` esa buyruqni ishga tushirgan kompyuter manzilini qoʻshadi. WebSocket upgradeʼlar ham tekshiriladi. Tekshiruv klient yuborgan manzilni emas, edgeʼimiz qoʻygan mijoz manzilini oʻqiydi.
- **Uzun soʻrovlar.** Soʻrov 600 soniyagacha davom etishi mumkin, bu xosting qilingan tunnellar koʻpincha uzib qoʻyadigan sekin buildʼlar va fayl yuklashlar uchun muhim.

Lokal soʻrov inspektori ham bor: tunnel orqali oʻtayotgan trafikni koʻrsatadigan va uni faqat foydalanuvchi kompyuteri xotirasida saqlaydigan kichik Go dasturi.

## GitHub osilib qoladigan joyda oʻrnatish

Klient Windows uchun PowerShell skripti va Linux hamda macOS uchun shell skripti, har biri bitta buyruq bilan oʻrnatiladi. Ikkalasi ham frp klient binarini yuklaydi. Uni GitHub relizʼlaridan yuklash Oʻzbekistondagi baʼzi tarmoqlardan ishonchsiz boʻlib chiqdi: yuklash boshlanardi va keyin osilib qolardi.

Biz frp reliz fayllarini oʻz serverimizda mirror qilamiz va klientlar avval mirrorʼni, keyin GitHubʼni sinaydi. Mirror bizniki boʻlgani uchun u ishonch yorligʻiga aylanib qolmasligi kerak. Har binarning SHA-256 yigʻindisi klient skriptlarida qotirilgan va mos kelmagan yuklash qayerdan kelganidan qatʼi nazar rad etiladi.

PowerShell oʻrnatuvchilarini yozadiganlar uchun yozib qoʻyishga arziydigan bitta kichik koʻchirish xatosi bor. Windows PowerShell 5 PowerShell 7 ichidan ishga tushirilganda `Get-FileHash` ni beradigan modul yuklanmasligi mumkin. Endi klient SHA-256 ni cmdletʼga tayanmasdan oʻz funksiyasi bilan hisoblaydi.

## Ikki kundan keyin

Birinchi reliz HTTP tunnellarni qamradi. 4-noyabrda gatewayʼga TCP tunnellar (foydalanuvchi boʻyicha yoqiladi; har foydalanuvchi port band qiladi va frp plagini TCP proksini faqat unga band qilingan portda qabul qiladi), tunnel boʻyicha tezlik cheklovlari, GitHub, Telegram va umumiy HMAC yuboruvchilari uchun webhook imzosini tekshirish, soʻrov va javob sarlavhalari qoidalari va bitta nom ostida bir nechta klient boʻylab yuk taqsimlash qoʻshildi. Google orqali kirish va Telegram ogohlantirishlari kodda bor, lekin sozlanmaguncha oʻchiq turadi.

## Cheklovlar

- **Subdomen boʻyicha sertifikatlar.** Har yangi nom taxminan sakkiz soniyalik bitta chiqarishga tushadi va ochiq jurnallarda koʻrinadi. Wildcard rejalashtirilgan: subdomen DNSʼini biz boshqaradigan serverga ACME-DNS bilan delegatsiya qilish orqali.
- **Egalik tasdiqlanadigan custom domenlar** rejalashtirilgan, qurilmagan.
- **Bu kichik xizmat.** U global edge tarmoqda emas, biz allaqachon yuritayotgan infratuzilmada ishlaydi va hech qanday uptime kafolati bilan kelmaydi.
