---
title: "Claude Codeʼni Telegramdan boshqarish"
description: "Kichik Python bot telefondagi chatni stol kompyuteridagi Claude Code uchun pultga aylantiradi: har xabarga bitta headless jarayon, bildirishnoma va tasdiqlash uchun hookʼlar, parallel slotlar. Bir kunda nima qurdik va telefon oʻlchamidagi soʻrovlar haqida nimani oʻrgandik."
date: 2026-10-21
kind: engineering
area: agents
featured: false
source:
  - "claude-telegram-bot: bot.py, notify.py, perm_hook.py, commands.json (private, local project)"
  - "Internal engineering notes, 2026-10-21 to 2026-10-22"
  - "https://docs.python-telegram-bot.org/"
reproduce:
  note: "Bot yopiq lokal loyiha; bu ochiq buyruqlar u tayanadigan ikki gʻishtni koʻrsatadi: JSON oqimli headless Claude Code va Telegram bot kutubxonasi."
  commands:
    - "pip install python-telegram-bot==22.8"
    - "claude -p --output-format stream-json --verbose \"list the files in this folder\""
---

Uzoq agent sessiyalari stol ortidagi ishga gʻalati mos keladi. Vazifani boshlaysiz, u yigirma daqiqa ishlaydi, siz esa yo kuzatib oʻtirasiz, yo turib ketib, unutib qoʻyasiz. Bizga buning teskarisi kerak edi: ishni telefondan boshlash, tugaganini bilib olish, xavfli qadamni istalgan joydan tasdiqlash va keyinroq xabarga javob yozib, oʻsha sessiyani davom ettirish. 2026-yil 21-oktabrda aynan shu uchun kichik Telegram bot qurdik. U Claude Code bilan bitta Windows stol kompyuterida ishlaydi.

## Bitta xabar, bitta headless jarayon

Bot `python-telegram-bot` 22.8 asosidagi taxminan 1150 qatorli bitta Python fayl va ikkita hook skriptidan iborat. U xotirada uzoq yashaydigan agent saqlamaydi. Har kelgan xabar yangi headless Claude Code jarayonini ishga tushiradi, davomiylik esa sessiyani ID boʻyicha qayta tiklash orqali taʼminlanadi:

```bash
claude -p --output-format stream-json --verbose \
  --append-system-prompt "<phone-specific instructions>" \
  --resume <session-id>          # omitted for a new conversation
```

Prompt stdin orqali beriladi. Bot JSON hodisalar oqimini qatorma-qator oʻqiydi. Har `tool_use` hodisasi “🔧 Bash: run tests” kabi qisqa qadamga aylanadi. Chatdagi bitta holat xabari koʻpi bilan uch soniyada bir marta tahrirlanadi va oʻtgan daqiqalar hamda oxirgi sakkiz qadamni koʻrsatadi. Yakuniy `result` hodisasi javob, sessiya ID va narxni olib keladi, bot narxni kun va suhbat boʻyicha yozib boradi.

```steps
Xabar :: Ruxsat etilgan foydalanuvchi IDʼsidan chatga matn, ovozli xabar yoki fayl keladi.
Ishga tushirish :: Bot kerakli papkada headless Claude Code jarayonini ochadi va slot sessiyasini davom ettiradi.
Oqim :: JSON oqimidagi tool chaqiruvlari bitta holat xabarini jonli qadamlar bilan yangilaydi.
Javob :: Yakuniy javob va agent yuborish uchun belgilagan fayllar qaytariladi.
Davom :: Botning istalgan xabariga reply qilish oʻsha sessiyani asl papkasida davom ettiradi.
```

Buni telefonda ishlaydigan qilgan bir nechta tafsilot:

- **Ovoz.** Ovozli xabarlar CPUʼda kichik Whisper modeli bilan lokal ravishda matnga aylantiriladi. Prompt agentga transkriptda tanib olish xatolari boʻlishi mumkinligini aytadi.
- **Fayllar ikki tomonga.** Kelgan rasm va hujjatlar lokal saqlanadi, ularning toʻliq yoʻllari promptga qoʻyiladi. Faylni qaytarib yuborish uchun agent javobida `[[SEND: <absolute path>]]` qatorini yozadi, bot esa oʻsha faylni yuklaydi.
- **Telefon oʻlchamidagi javob.** Qoʻshimcha system prompt qisqa javob va keng jadvallarsiz yozishni soʻraydi, uzun javoblar Telegram xabar chegarasiga sigʻadigan boʻlaklarga boʻlinadi.

## Hookʼlar: javobni eshitish va “ha” deyish

Foydaliroq yarmi bot emas. Bu klaviatura ortida boshlangan sessiyalarni ham qamraydigan ikkita Claude Code hookʼi.

**Bildirishnomalar.** `Stop` hookʼi loyiha nomi, davomiylik va oxirgi javobning dumi bilan “tugadi” xabarini yuboradi, lekin faqat sessiya 30 soniyadan uzoq ishlagan boʻlsa, shunda tezkor savollar telefonni bezovta qilmaydi. `Notification` hookʼi Claude kiritishni kutayotgani yoki savol berayotganini bildiradi. Har yuborilgan xabar oʻz sessiya ID va ishchi papkasiga bogʻlanadi, shuning uchun **bildirishnomaga reply qilish oʻsha sessiyani telefondan davom ettiradi**. Botning oʻzi ochgan sessiyalar hookʼlarni jim qiladigan muhit oʻzgaruvchisini qoʻyadi, shunda hech narsa ikki marta xabar qilinmaydi.

**Masofadan tasdiqlash.** Bloklovchi `PermissionRequest` hookʼi kutilayotgan amalni Ruxsat va Rad tugmalari bilan chatga yuboradi: buyruq va uning tavsifi yoki tahrirlanayotgan fayl va diff. Hook tugma bosilganda bot yozadigan faylni kutadi, timeout bir soatdan sal kam. U buni faqat foydalanuvchi “uzoqda” boʻlganda qiladi. Avtomatik rejimda bu 120 soniya davomida klaviatura yoki sichqonchadan kiritish yoʻqligini anglatadi. Soʻrov kutilayotganda foydalanuvchi stolga qaytsa, xabar soʻrov terminalga oʻtgani haqida tahrirlanadi va boshqaruvni terminal soʻrovi oladi. Uzoqda rejimini chatdan majburan yoqish yoki oʻchirish ham mumkin.

## Slotlar: bitta chatdan parallel ish

Birinchi versiyada har chatga bitta suhbat bor edi va bu tor boʻgʻiz boʻlib chiqdi: uzoq refaktor tezkor savolni toʻsib qoʻyardi. Qayta yozilgan versiya **slotlar** qoʻshdi: har chatga sakkiztagacha parallel suhbat, har birining oʻz nomi, sessiya ID, papkasi va jamlangan narxi bor. Oddiy xabarlar faol slotga boradi. Reply esa javob berilayotgan xabar qaysi slotga tegishli boʻlsa, oʻshanga boradi. Tezkor buyruqlar va rejalashtirilgan ertalabki hisobot doim yangi slot ochadi. Chegara toʻlganda eng eski boʻsh slot yopiladi. Sinovda kichik modelni ishlatgan ikki parallel slot ikkalasi ham 8,2 soniyada tugadi.

Kundalik foydalanishdan yana ikki qoʻshimcha chiqdi:

- **Sessiya tanlagich.** `/resume` oʻtgan sessiyalarni oʻqiladigan sarlavhalar bilan (avval maxsus nom, keyin AI yaratgan nom, keyin birinchi prompt) har sahifada sakkiztadan koʻrsatadi, tanlanganda esa oxirgi javobni chiqaradi. Sarlavha yasash sessiya fayllarini oʻqishni talab qiladi. Yoʻl va oʻzgartirish vaqti boʻyicha kesh 186 sessiyada vaqtni sovuq holatdagi taxminan 8 soniyadan issiq holatdagi 0,02 soniyagacha qisqartirdi.
- **Tezkor buyruqlar.** Tez-tez ishlatiladigan promptlar oltita yozuvli JSON faylda turadi, yangisini qoʻshish JSONʼni tahrirlab, qayta ishga tushirishdan iborat. Ular bot buyruqlar menyusida ham roʻyxatdan oʻtadi.

## Saboqlar: eng sodda talqin yutadi

Eng muhim saboq kod haqida emas, til haqida boʻldi. Boshida “<fayl yoʻli> koʻrsat” shaklidagi xabar faylni render qilib, skrinshot oladigan 14 qadamli brauzer avtomatlashtirishiga aylandi, holbuki soʻrov shunchaki “shu faylni yubor” edi. Telefonda har ortiqcha qadam sezilib turadi. Buni ikki darajada tuzatdik. Birinchidan, toʻgʻridan-toʻgʻri yoʻl: xabar fayl yoʻli va koʻpi bilan ikki soʻzdan iborat boʻlsa, bot modelni chaqirmasdan faylning oʻzini yuboradi. U kengaytmasiz yoʻllarni va keng tarqalgan oʻzbekcha qoʻshimchali yoʻllarni ham topadi. Ikkinchidan, system promptdagi doimiy koʻrsatma: “koʻrsat” yoki “yubor” faylning oʻzini darhol yuborishni anglatadi va soʻrovni qondiradigan eng sodda harakat yutadi.

Boshqa saboqlar:

- **stderrʼni parallel oʻqing.** Birinchi versiya stderrʼni faqat stdout tugagandan keyin oʻqirdi. Koʻp gapiradigan jarayon stderr quvurini toʻldirib, qotib qolishi mumkin edi. Yechim parallel oʻquvchi boʻldi.
- **Arzon qayta ishga tushiring.** Batch sikli botni chiqib ketganidan besh soniya oʻtib qayta ishga tushiradi, rejalashtirilgan vazifa esa uni tizimga kirishda yashirin holda ochadi. Kod oʻzgargach qayta ishga tushirish jarayonni oʻldirishdan iborat.
- **Harakatsizlikni aniqlashga koʻr-koʻrona ishonmang.** Sandbox ichida harakatsizlik taymeri bir marta 47 soatni koʻrsatdi. Qoʻlda boshqariladigan uzoqda rejimi shu sabab bor.

## Cheklovlar

- **Ishonch chegarasi ruxsat roʻyxati va kompyuterning oʻzi.** Botdan kim foydalana olishini Telegram foydalanuvchi IDʼlari roʻyxati belgilaydi va bot faqat siz nazorat qiladigan shaxsiy kompyuter uchun moʻljallangan: u ishga tushirgan har narsa shu kompyuter foydalanuvchisi huquqlariga ega.
- **Uzoq ishlar barqaror emas.** Bot qayta ishga tushganda ishlab turgan jarayonlar nazoratdan chiqadi, har yugurish uchun timeout hali yoʻq.
- **Formatlash.** Xabarlar oddiy matn sifatida yuboriladi, shuning uchun modeldan kelgan Markdown xom holda koʻrinadi.
- **Bitta kompyuter.** Bot oʻzi ishlab turgan stol kompyuterini boshqaradi. Bu xostlangan xizmat emas va yuqoridagi raqamlardan tashqari foydalanishni oʻlchamaganmiz.
