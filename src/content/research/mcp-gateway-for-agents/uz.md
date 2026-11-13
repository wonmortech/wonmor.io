---
title: "AI agentlar uchun MCP gateway: tokenlar, niqoblash, audit, kill-switch"
description: "Kod yozuvchi agentlar va ichki tizimlar orasiga bitta gateway qoʻydik. Har agentning oʻz tokeni va ruxsatlar roʻyxati bor, har natija chiqishdan oldin niqoblanadi, har chaqiruv auditga yoziladi, bitta tugma esa hammasini toʻxtatadi."
date: 2026-11-02
kind: research
area: agents
featured: true
source:
  - "dtwinuz/gateway: README, gateway/server.mjs, connector/connector.mjs (private repository)"
  - "dtwinuz/gateway git history: v0.1.0 to v0.2.0 and alerts, 2026-11-02 to 2026-11-03"
  - "https://modelcontextprotocol.io/specification"
reproduce:
  note: "Gateway repozitoriysi yopiq; bu ochiq vositalar bilan istalgan MCP serverni, jumladan oʻz gatewayingiz ortidagisini ham tekshirish mumkin."
  commands:
    - "npx @modelcontextprotocol/inspector"
    - "claude mcp add --transport http my-gateway https://example.com/mcp --header \"Authorization: Bearer <agent-token>\""
---

Kod yozuvchi agentlar jamoa haqiqatan ishlaydigan tizimlarni oʻqiy olsa, ancha foydali boʻladi: vazifalar trekeri, git server, SQL bazasi. Odatiy yoʻl esa har agent sozlamasiga login va parollarni qoʻyib chiqish. Bu toʻrtta savol tugʻilguncha ishlaydi. Qaysi agent nimani oʻqidi? Telefon raqami yoki shaxsiy identifikatsiya raqami model kontekstiga tushib qoldimi? Bitta agentni hammasini toʻxtatmasdan toʻxtatsa boʻladimi? Baza parollari qayerda turibdi?

Shu savollarga bir joyda javob berish uchun kichik gateway qurdik. U bir tomondan agentlar bilan, ikkinchi tomondan “konnektorlar” bilan [Model Context Protocol](https://modelcontextprotocol.io/specification) tilida gaplashadi. Bu maqola uning 2026-yil 2-noyabrda chiqargan 0.2.0 versiyasidagi dizaynini va qurish jarayonida nimalarni oʻrganganimizni tasvirlaydi.

## Tizim tuzilishi

Uchta qism bor:

- **Gateway**: bitta Node.js jarayoni, taxminan 950 qator, npm bogʻliqliklarisiz (faqat `node:http`, `node:fs` va `node:crypto`). U bitta MCP endpoint ochadi, agentlar roʻyxatini saqlaydi, siyosat va niqoblashni qoʻllaydi, audit jurnalini yozadi.
- **Konnektorlar**: oʻzi ulanadigan tizim yonida turadigan kichik MCP serverlar. Konnektor oʻsha tizimning maxfiy kalitlarini saqlaydi, faqat localhostʼda tinglaydi va gatewayga teskari tunnel orqali chiqariladi. Soʻrovni faqat bearer secret mos kelsa qabul qiladi, solishtirish doimiy vaqtda bajariladi.
- **Admin panel**: server-sent events bilan oziqlanadigan veb-sahifa. Unda chaqiruvlar real vaqtda, agentlar roʻyxati, konnektorlar holati va kill-switch koʻrinadi.

Asosiy xususiyat: **gateway ulangan tizimlarning birorta maxfiy kalitini saqlamaydi**. Gateway xosti buzilgan taqdirda ham hujumchi baza parollarini emas, agent token xeshlari va audit jurnalini oladi. Konnektorlar toollarni prefiks ostida beradi, shuning uchun agent xom bazani emas, `<connector>-sql_query` toolini koʻradi.

```steps
Soʻrov :: Agent oʻz shaxsiy tokeni bilan gatewaydagi toolni chaqiradi.
Siyosat :: Gateway shu tartibda tekshiradi: kill-switch, pauza, ruxsatlar roʻyxati, argument qoidalari, limit.
Konnektor :: Chaqiruv tunnel orqali haqiqiy kalitlarni saqlovchi konnektorga boradi.
Niqob :: Natijadagi shaxsiy maʼlumotlar gatewaydan chiqishdan oldin niqoblanadi.
Audit :: Niqoblangan soʻrov va javob jurnalga yoziladi va jonli panelga uzatiladi.
```

## Har agent uchun alohida identifikatsiya va siyosat

Har agent `ag_<nom>_<32 tasodifiy belgi>` koʻrinishidagi shaxsiy token oladi. U faqat bir marta koʻrsatiladi, serverda esa faqat SHA-256 xeshi saqlanadi. Bitta manzildan yigirma marta notoʻgʻri urinish boʻlsa, oʻsha manzil oʻn daqiqaga bloklanadi. Bu qoida agentlarga ham, admin loginiga ham amal qiladi.

Siyosat konnektorga emas, agentga bogʻlanadi:

- **Toollar ruxsat roʻyxati** wildcard bilan (`*`, `<connector>-*` yoki aniq bitta tool). Ruxsat etilmagan tool `tools/list` dan olib tashlanadi, model uni umuman koʻrmaydi. Baribir chaqirilsa, rad etiladi.
- **Limit**: daqiqasiga chaqiruvlar soni (odatiy 30, 1 dan 600 gacha sozlanadi).
- **Amal qilish muddati** va ixtiyoriy **IP ruxsat roʻyxati**.
- **Argumentlar ruxsat roʻyxati**. Masalan, baza argumentini bitta nomli baza bilan cheklash mumkin. Gateway `tools/list` dagi tool JSON sxemasini ham shu enumgacha toraytiradi, model taxmin qilib chaqiruvni behuda sarflamaydi.
- Bitta agent uchun **pauza**, bitta konnektor uchun **oʻchirish** va umumiy **kill-switch**.

Tekshiruvlar tartibi muhim, chunki har rad etish status kodi bilan yoziladi (`killed`, `paused`, `unknown`, `denied`, `arg`, `rate`, `expired`, `ip`). `callTool` dagi soddalashtirilgan oqim:

```js
if (state.killed) return deny("kill-switch", "killed");
if (agent.paused) return deny("agent paused", "paused");
const hit = catalog().find((t) => t.full === name);
if (!hit) return deny("unknown tool", "unknown");
if (!toolAllowed(agent, name)) return deny("not allowed", "denied");
if (argViolation(agent, hit.tool, args)) return deny("argument not allowed", "arg");
if (overRate(agent.name, agent.rpm || 30)) return deny("rate limit", "rate");
const result = scrubResult(await connector.call(hit.tool.name, args));
```

Gateway qayta eksport qiladigan har tool `readOnlyHint: true` deb belgilanadi. MCPʼda bu belgi faqat maslahat xarakterida, shuning uchun uni konnektorlar taʼminlaydi. SQL tool faqat bitta `SELECT` yoki `WITH` ifodasini qabul qiladi. `INTO`, `EXEC`, tizim protseduralari, `OPENROWSET`, `WAITFOR` va ifoda ajratgichlarini rad etadi. Soʻrov lock timeout bilan `READ UNCOMMITTED` tranzaksiyada yuradi va **har doim ROLLBACK qilinadi**. Natija koʻpi bilan 200 qator, timeout 30 soniya. Eng sezgir muhitlar uchun konnektor baza darajasida faqat oʻqiydigan login ham ishlatadi. Kalit soʻz filtrining oʻzi hech qachon yetarli emas, shuning uchun tranzaksiya va login alohida qatlamlar.

## Niqoblash: regex yetmaydi

Natijalar agentga yetguncha niqoblanadi: shaxsiy identifikatsiya raqamlari, pasport raqamlari, telefon raqamlari, email manzillar, karta raqamlari va maxfiy kalitga oʻxshagan har narsa (JWT, keng tarqalgan token prefikslari, `password=` juftliklari). Qoidalar maxfiy kalitlardan boshlanadi, shunda token raqam qoidasi tomonidan yarmigacha “yeb qoʻyilmaydi”. Har qoida qiymatning kichik, foydali qismini qoldiradi. Karta oxirgi toʻrt raqamini, email esa birinchi harfi va domenini saqlaydi.

Birinchi versiya faqat regular expressionʼlardan foydalangan va ularning chegarasiga tez yetdik. Toʻqqizta yalangʻoch raqam koʻrinishida saqlangan telefon raqami toʻqqiz xonali korxona soliq raqamidan farq qilmaydi. Hech qanday regex ularni ajrata olmaydi, har toʻqqiz xonali sonni niqoblash esa foydali maʼlumotni yoʻq qiladi. Yechim **ustun nomiga qarab niqoblash** boʻldi. SQL konnektori Markdown jadval qaytaradi, gateway sarlavha qatorini oʻqiydi. `Phone`, `MobilePhone`, `Email`, `Passport` yoki `Password` kabi nomli ustun ostidagi qiymat shaklidan qatʼi nazar niqoblanadi.

Administratorlar oʻz niqoblarini regex yoki ustun nomi naqshi sifatida qoʻsha oladi. Ikki tekshiruv zarur boʻlib chiqdi. `(a+)+` kabi ichma-ich takrorlovchili naqshlar halokatli backtracking sabab rad etiladi. Boʻsh satrga mos keladigan naqshlar ham rad etiladi, chunki ular hamma narsani niqoblab yuboradi.

Niqoblashni toifa boʻyicha oʻchirish mumkin, masalan, nosozlikni tekshirish paytida. Oʻchirilgan paytda har audit yozuvi oʻsha lahzada qaysi toifalar oʻchiq boʻlganini qayd etadi, shunda keyin oʻqigan odam niqoblangan jurnalni niqoblanmaganidan ajrata oladi.

## Audit, jonli koʻrinish va ogohlantirishlar

0.1.0 versiya kim nimani chaqirgani va qancha vaqt ketganini yozardi, lekin nima qaytganini yozmasdi. Bu notoʻgʻri murosa boʻlib chiqdi: natija gʻalati koʻrinsa, tekshirishga hech narsa yoʻq edi. Oʻsha kuni chiqqan 0.2.0 versiya soʻrov argumentlarining 16 KB gachasini va javobning 64 KB gachasini agent koʻrgan holida, yaʼni allaqachon niqoblangan holda saqlaydi. Jurnal JSONL formatida, har kunga bitta fayl, 30 kun saqlanadi. Xotiradagi halqa panel uchun oxirgi 5000 yozuvni ushlab turadi.

Panel har chaqiruvni “start” va “end” hodisasi sifatida koʻrsatadi, shuning uchun sekin soʻrov ishlayotgan paytdayoq koʻrinadi. Agentni pauza qilish, niqoblarni oʻzgartirish yoki kill-switchni bosish kabi admin harakatlari ham `type: admin` sifatida yoziladi. Har MCP sessiya identifikatori chaqiruv bilan saqlanadi, shuning uchun gavjum jurnaldan bitta agent suhbatini ajratib olish mumkin.

Ogohlantirishlar chat kanaliga boradi: kill-switch yoqilishi va oʻchirilishi, niqoblar oʻchirilishi, konnektor tushib qolishi yoki qaytishi, muvaffaqiyatsiz loginlar, chaqiruvlar toʻlqini va gʻayrioddiy katta natijalar. Ularni foydali saqlaydigan ikki tafsilot bor. Konnektor faqat **ketma-ket ikki marta** health tekshiruvidan oʻtmasa tushgan deb hisoblanadi, shunda bir martalik tarmoq uzilishi jim qoladi. Har ogohlantirish kaliti esa **10 daqiqada** bir martadan koʻp yuborilmaydi.

## Nimalarni oʻrgandik

- **Siyosatni identifikatsiya turgan joyga qoʻying.** Qoidalarni tizimlarga emas, agentlarga bogʻlash “bu agent trekerni oʻqiy oladi, bazani emas” degan qoidani bitta sozlamaga aylantirdi.
- **Ruxsat etilmaganini yashiring.** Taqiqlangan toollarni `tools/list` dan olib tashlash va argument enumlarini toraytirish behuda chaqiruvlarni xato xabarlaridan koʻra koʻproq kamaytirdi. Model hech qachon koʻrmagan toolni notoʻgʻri ishlata olmaydi.
- **Tizim qaytarganini emas, agent koʻrganini yozing.** Niqoblangan javobni saqlash audit jurnali shaxsiy maʼlumotlarning ikkinchi nusxasiga aylanmasligini taʼminlaydi.
- **Toʻxtatish tugmasi zerikarli boʻlsin.** Kill-switch boshqa hamma narsadan oldin tekshiriladigan bitta mantiqiy qiymat. U `tools/list` ni boʻshatadi va chaqiruvlarni aniq sabab bilan rad etadi, shunda agentlar qayta-qayta urinmasdan, odob bilan toʻxtaydi.

## Cheklovlar

- Niqoblash naqshlarga asoslangan. Ism-familiyalar aniqlanmaydi va README buni ochiq aytadi. Erkin matnli maydonlarda shaxsiy maʼlumot hech bir qoida kutmagan shaklda kelishi mumkin.
- Yagona rejim faqat oʻqish. Yozish yoʻli yoʻq, uni qoʻshish uchun boshqa tasdiqlash modeli kerak boʻladi.
- Ish stantsiyasida ishlaydigan konnektor faqat oʻsha kompyuter yoqiq paytda mavjud.
- Limit va xato hisoblagichlari xotirada turadi, jarayon qayta ishga tushganda nolga qaytadi. Bitta nusxa uchun bu maqbul, klaster uchun emas.
- Niqoblashning aniqligi va toʻliqligini belgilangan maʼlumotlar toʻplamida oʻlchamaganmiz, shuning uchun aniqlik raqamini keltira olmaymiz.
