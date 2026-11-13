---
title: "OpenStreetMapʼdan masjidlar: 2 285 jamoat, bitta qatlam"
description: "dtwin Oʻzbekistondagi barcha masjidlarni OpenStreetMapʼdan qanday olib kelishi va jamoat vaqtlarini namoz vaqti hisobidan alohida qatlamda saqlashi haqida."
date: 2026-10-27
kind: engineering
area: faith-society
featured: true
source:
  - "https://wiki.openstreetmap.org/wiki/Overpass_API"
  - "https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dplace_of_worship"
  - "https://www.openstreetmap.org/copyright"
  - "dtwinuz/dtwin #43"
reproduce:
  note: "dtwin ishlatadigan filtr bilan OpenStreetMap bugun Oʻzbekistonda nechta masjidni bilishini sanang; xaritachilar tahrir qilgani sari son biznikidan farq qiladi."
  commands:
    - 'curl -s https://overpass-api.de/api/interpreter --data-urlencode ''data=[out:json][timeout:150];area["ISO3166-1"="UZ"][admin_level=2]->.c;nwr["amenity"="place_of_worship"]["religion"="muslim"](area.c);out count;'''
---

dtwin namoz vaqtlarini anchadan beri hisoblaydi. Lekin odamlar aslida qachon jamoat boʻlib namoz oʻqishini bilmasdi. Masjid taxtasida azon emas, jamoat vaqti yoziladi: imom uni namoz oraligʻi ichidan tanlaydi. Hanafiy amaliyotida bomdod tong yorishganda, xufton esa kechroq oʻqiladi, shuning uchun azon bilan jamoat orasidagi farq katta boʻlishi mumkin. Bizning eslatmalarimiz va boʻsh vaqt hisobimiz azonga bogʻlangan edi va masjidda namoz oʻqiydigan odam uchun ular shunchaki notoʻgʻri edi.

2026-yil 27-oktyabrda ikki qismli yechimni chiqardik: OpenStreetMapʼdan olingan Oʻzbekistondagi barcha masjidlar katalogi va mavjud namoz vaqti hisobining ustida alohida qatlam sifatida saqlanadigan jamoat vaqtlari. Prodga birinchi importda katalogda 2 285 ta masjid boʻldi, shulardan 227 tasi Toshkentda.

Ushbu maqoladagi va mahsulotdagi xarita maʼlumotlari: © OpenStreetMap contributors, Open Database License asosida.

```steps
Soʻrov :: Bitta Overpass soʻrovi Oʻzbekiston davlat chegarasi ichidagi religion=muslim belgili barcha ibodat joylarini soʻraydi.
Tahlil :: Nuqtalar oʻz koordinatasini saqlaydi; way va relation markaziy nuqtaga keltiriladi.
Upsert :: Har masjid OSM havolasi boʻyicha kalitlanadi, shuning uchun haftalik qayta import qatorlarni koʻpaytirmaydi, yangilaydi.
Qatlam :: Jamoat qoidalari azon oraliqlaridan alohida yashaydi va har kuni ularga solishtiriladi.
Foydalanish :: Eslatmalar, Bugun koʻrinishi va boʻsh vaqt hisobi jamoat vaqti boʻlsa, oʻshani oladi.
```

## Butun davlat uchun bitta soʻrov

OpenStreetMapʼda masjid `amenity=place_of_worship` va `religion=muslim` bilan belgilanadi. Overpass API maʼmuriy hudud ichidagi barcha shunday obyektlarni bitta soʻrovda qaytara oladi, shuning uchun import bitta soʻrovdan iborat:

```text
[out:json][timeout:150];
area["ISO3166-1"="UZ"][admin_level=2]->.c;
nwr["amenity"="place_of_worship"]["religion"="muslim"](area.c);
out tags center;
```

`nwr` nuqta, way va relationʼlarni birga soʻraydi. Bu muhim: kichik mahalla masjidi koʻpincha bitta nuqta boʻlib chiziladi, katta masjid esa bino konturi (way) yoki multipoligon (relation) sifatida. `out tags center` teglarni va nuqta boʻlmagan har bir obyekt uchun markaziy nuqtani qaytaradi. Xaritaga belgi qoʻyish va masofani oʻlchash uchun shu yetarli.

Tahlil bir necha qatʼiy qoidaga tayanadi:

- **Barqaror kalit.** Har masjid `n123456` yoki `w789012` kabi havola oladi: OSM turining birinchi harfi va uning IDʼsi. Havolasi takrorlanganlar tashlab yuboriladi.
- **Avval foydalanuvchi yozuvidagi nom.** Import `name:uz`, keyin `name`, `name:uz-Latn`, `name:ru` va `name:en` ni sinaydi va birinchi toʻldirilganini oladi.
- **Manzil faqat xaritada boʻlsa.** `addr:full` boʻlsa oʻsha, boʻlmasa koʻcha, uy raqami va shahar birlashtiriladi; OpenStreetMapʼda hech narsa boʻlmasa, maydon boʻsh qoladi.
- **Oltita kasr xonasi.** Koordinatalar oltita raqamgacha yaxlitlanadi, bu taxminan oʻn santimetr: masjid belgisi uchun bundan ortigʻi kerak emas.

Yozish OSM havolasi boʻyicha upsert. Fon jarayoni har olti soatda tekshiradi va eng yangi qator yetti kunlik boʻlganda qayta import qiladi; birinchi tekshiruv ishga tushgandan ikki daqiqa keyin boʻladi. Boʻsh javob “mamlakatda masjid yoʻq” deb emas, xato deb qabul qilinadi, shuning uchun muvaffaqiyatsiz soʻrov katalogni hech qachon oʻchirib yubormaydi.

## Jamoat vaqtlari uchun alohida qatlam

Hisoblangan namoz vaqtini masjid vaqti bilan almashtirib qoʻyish oson yoʻldek koʻrinadi. Biz unday qilmadik. Azon oraliqlari ularga tayanadigan hamma narsa uchun yagona haqiqat manbai boʻlib qoladi: dtwin kuni qayerda tugashi (shomda), roʻza, qazo hisobi va namozni belgilash. Jamoat vaqtlari ularning ustida, oʻz modulida turadi.

Har bir namoz uchun jamoat qoidasi uch rejimdan biriga ega:

| Rejim | Maʼnosi |
|---|---|
| Qatʼiy | soat vaqti, masalan 05:40 |
| Azondan keyin | hisoblangan azondan keyin necha daqiqa, koʻpi bilan 120 |
| Oʻchiq | bu namoz uchun jamoat yoʻq |

Qoidalar ikki joydan keladi: masjidning umumiy jadvali va foydalanuvchining oʻz sozlamalari. Foydalanuvchining oʻz qoidasi ustun. Juma kuni peshin oʻrniga alohida juma qoidasi ishlaydi.

Har kuni har bir qoida oʻsha kunning haqiqiy oraligʻiga solishtiriladi: bomdod quyosh chiqishidan oldin, peshin asrdan oldin, xufton ertangi bomdoddan oldin boʻlishi kerak va hokazo. Oraliqdan tashqariga tushgan vaqt koʻrsatilmaydi va `outOfWindow` deb xabar qilinadi. Eskirgan jadval shu tarzda oʻzini koʻrsatadi. Shom uchun qatʼiy 18:30 qishda toʻgʻri, iyunda esa imkonsiz; azondan oldingi jamoatni koʻrsatish oʻrniga, biz uni oʻsha kun uchun olib tashlaymiz va sababini aytamiz.

Profillar xotirada saqlanadi va fon jarayoni ishga tushganda yuklanadi, shuning uchun eslatmalar va Bugun koʻrinishi har tekshiruvda bazaga murojaat qilmaydi. Boʻsh vaqt hisobi jamoat vaqtini va foydalanuvchining masjidgacha yoʻl vaqtini band qiladi.

## Foydalanuvchilar nima qoʻshadi

OpenStreetMap Oʻzbekiston shaharlarida yaxshi, boshqa joylarda siyrakroq, shuning uchun foydalanuvchilar yetishmayotgan masjidni qoʻsha oladi. Katalogni toza saqlash uchun ikki cheklov bor: mavjud masjiddan 25 metr ichidagi yangi masjid ehtimoliy takror sifatida rad etiladi va bitta foydalanuvchi kuniga koʻpi bilan 10 ta qoʻsha oladi.

Jadvallar umumiy. Masjidda namoz oʻqiydigan har qanday foydalanuvchi uning vaqtlarini kiritishi, boshqalar esa tasdiqlashi mumkin. Jadval tahrir qilinsa, tasdiqlar nolga tushadi, shuning uchun tasdiq har doim hozir koʻrsatilayotgan vaqtlarga tegishli boʻladi. AI yordamchilarga ochilgan birorta vosita umumiy jadvalni yoza olmaydi: yordamchi masjid qidira oladi va foydalanuvchining oʻz vaqtlarini qoʻya oladi, lekin hamma koʻradigan narsani oʻzgartira olmaydi.

Bitta katalog uch joyda chiqadi: Telegram botidagi `/masjid` buyrugʻi (joylashuvni yuboring va tanlash tugmalari bilan eng yaqin masjidlarni oling), Leaflet va OpenStreetMap plitalari bilan qurilgan vebdagi xarita boʻlimi va masjid topish hamda tanlash uchun yordamchi vositalari.

## Son bu bir lahzalik surat

Sarlavhadagi 2 285 prod importi 2026-yil 27-oktyabrda saqlagan son. Biz xuddi shu soʻrovni 2026-yil 13-noyabrda, oʻsha kuni ertalab UTC 05:56 holatidagi OpenStreetMap bazasiga qarshi qayta yurgizdik. U 2 289 ta obyekt qaytardi: 1 511 nuqta, 740 way va 38 relation. Ulardan 2 137 tasida `name` yoki `name:uz` tegi bor, 1 355 tasida esa kamida bitta `addr:*` tegi bor.

Oʻn yetti kunda toʻrtta yangi masjid bu shunchaki xaritachilarning ishi, va roʻyxatni muzlatib qoʻymasdan har hafta qayta import qilishning maʼnosi ham shunda. Bu yana katalog xarita qanchalik yaxshi boʻlsa, shunchalik yaxshi ekanini anglatadi. dtwinʼning masjid maʼlumotlarini yaxshilashning eng yaxshi yoʻli OpenStreetMapʼni yaxshilash, bu esa boshqa hammaga ham foyda.

## U bilan birga kelgan hisob oʻzgarishi

Vaqtlarni tekshirayotganda yangi foydalanuvchilar uchun standart hisob usulini Shimoliy Amerika konvensiyasidan (15° shafaq burchagi) islom.uz usuliga (15.5°) almashtirdik. Toshkentda islom.uz jadvaliga solishtirilganda eski standart shomni ikki-uch daqiqa erta, bomdodni esa ikki-uch daqiqa kech qoʻyardi, bu iftor va saharlik uchun aynan xato tomonga adashish. Migratsiya Toshkent va Samarqand vaqt zonalaridagi eski standartda qolgan foydalanuvchilarni koʻchirdi.

## Cheklovlar

- **Qamrov xaritaga bogʻliq.** Baʼzi masjidlar OpenStreetMapʼda yoʻq yoki nomsiz; bugungi obyektlardan 152 tasida na `name`, na `name:uz` bor.
- **Jamoat vaqtlari jamoatchilik tomonidan kiritiladi.** Ular oxirgi marta yangilagan odam qoldirgan holatda. Oraliq tekshiruvi faqat imkonsiz vaqtlarni ushlaydi, shunchaki eskirganlarini emas.
- **Eski tizimlarda TLS.** Biz ishlatadigan ochiq Overpass manzili faqat TLS 1.3 ni qabul qiladi. Ishlab chiqish paytida Windows 10ʼning oʻrnatilgan TLS steki ulana olmadi, prodʼdagi Linux konteynerlari esa ulandi, shuning uchun manzil sozlanadi va lokal testlar uni soxta serverga yoʻnaltiradi.
- **Migratsiya bir tomonlama.** Uni orqaga qaytarish koʻchirilgan foydalanuvchilarga eski hisob usulini qaytarmaydi.
