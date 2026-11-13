---
updated: 2026-11-13
summary: "Saytga kirganingizda wonmor.io nimani yigʻadi (juda oz), u qayerda va qancha muddat saqlanadi, va nimani hech qachon qilmaydi."
---

## Qisqasi

wonmor.io — statik sayt. Unda akkauntlar, formalar, izohlar va xabarnoma yoʻq, shuning uchun u sizdan hech qachon shaxsiy maʼlumot soʻramaydi. U cookie oʻrnatmaydi, analitika skriptlari yoki uchinchi tomon kuzatuvchilarini ishlatmaydi, reklama koʻrsatmaydi va boshqa serverlardan hech narsa yuklamaydi. Tashrifingizning yagona qaydi — quyida tasvirlangan, veb-server yuritadigan standart soʻrovlar logi.

Bu bildirishnoma faqat wonmor.io ga tegishli. Undan havola qilingan mahsulotlar, masalan dtwin.uz yoki bitg.uz, oʻz maxfiylik siyosatlari boʻlgan alohida saytlardir.

## Sayt nimani qilmaydi

Bular shunchaki vaʼda emas: saytning xavfsizlik siyosati (Content-Security-Policy) brauzeringizga boshqa har qanday narsani bloklashni buyuradi.

- **Cookie yoʻq.** Sayt hech qanday cookie oʻrnatmaydi.
- **Analitika va kuzatuv skriptlari yoʻq** — na bizniki, na boshqalarniki. Reklama ham, ijtimoiy tarmoq joylashtirmalari ham yoʻq.
- **Tashqi soʻrovlar yoʻq.** Skriptlar, shriftlar, rasmlar, brend filmi va qidiruv indeksi — hammasi wonmor.io ning oʻzidan beriladi. Brauzeringizga boshqa manzildan skript, stil, shrift, media yoki maʼlumot yuklamaslik buyurilgan.
- **Kamera, mikrofon va joylashuv yoʻq.** Sayt brauzerdan bu ruxsatlarni toʻgʻridan-toʻgʻri rad etishni soʻraydi.

## Brauzeringiz nimani saqlaydi

Ikkita kichik qiymat, ikkalasi ham faqat qurilmangizda. Brauzer oynasida birinchi marta sahifa ochganingizda Wonmor logotipi qisqa ochilish animatsiyasini koʻrsatadi. Uni har sahifada qayta koʻrsatmaslik uchun sayt brauzeringizning session storageʼiga `wm-intro` kalitini `1` qiymati bilan yozadi. Unda siz haqingizda hech narsa yoʻq, u qurilmangizdan chiqmaydi va oyna yopilganda oʻchadi. Brauzeringiz xotirani bloklasa, animatsiya shunchaki yana koʻrsatiladi.

Agar headerʼdagi menyudan mavzu tanlasangiz, sayt tanlovingizni brauzeringizning local storageʼiga `wm-theme` kaliti (`light`, `dark`, `ink`, `blueprint`, `cobalt`, `contrast`, `paper`, `dots` yoki `glass`) sifatida saqlaydi, shunda keyingi sahifa ham shu mavzuda ochiladi. U shu sayt maʼlumotlarini tozalamaguningizcha qoladi va hech qayerga yuborilmaydi. “Tizimga moslash” tanlansa, u oʻchiriladi; mavzu tanlamasangiz, hech narsa saqlanmaydi va sayt tizim sozlamangizga ergashadi.

## Qidiruv

Sayt boʻyicha qidiruv brauzeringizda ishlaydi. Qidiruv indeksi — wonmor.io dan yuklanadigan statik fayllar toʻplami; moslashtirish qurilmangizda bajariladi va soʻrovingiz hech qanday qidiruv xizmatiga yuborilmaydi.

Bitta tafsilot: sarlavhadagi qidiruv maydoniga yozib Enter bossangiz, brauzer qidiruv sahifasini soʻzlaringiz manzilda boʻlgan holda ochadi (masalan `/uz/search/?q=bitg`). Har qanday sahifa manzili kabi bu soʻrov ham quyida tasvirlangan server logida koʻrinadi. Qidiruv sahifasining oʻzida yozish boshqa soʻrov yubormaydi.

## Server loglari

Sayt deyarli har bir sayt kabi har bir soʻrovning texnik logini yuritadigan veb-server ortida ishlaydi. Har bir soʻrov uchun u quyidagilarni yozadi:

| Nima yoziladi | Nima uchun |
|---|---|
| IP manzilingiz | Suiisteʼmolning oldini olish va nosozliklarni topish |
| Sana va vaqt | Voqealarni tartiblash, xatolarni topish |
| Soʻralgan sahifa manzili va javob holati | Siniq havolalar va xatolarni topish |
| Brauzer yuborsa, oʻtib kelingan sahifa | Odamlar saytga qanday kelishini tushunish |
| Brauzeringizning user-agent qatori | Haqiqiy brauzerlarni botlardan ajratish |

Manzil va oʻtib kelingan sahifadagi uzun, tasodifiy koʻrinadigan qatorlar yozilishidan oldin yashiriladi, cookie va avtorizatsiya sarlavhalari esa olib tashlanadi. Log aylantirib turiladi va har bir fayl eng koʻpi bilan **30 kun** ichida oʻchiriladi.

Bu loglardan uch narsa uchun foydalanamiz: saytni xavfsiz saqlash, muammolarni tuzatish va tashriflarni umumiy holda sanash (qaysi sahifani nechta odam oʻqigani). Biz ularni sotmaymiz, sizni aniqlash uchun boshqa maʼlumotlar bilan birlashtirmaymiz va qonun talab qilmasa, hech kimga bermaymiz.

## Saytdan chiqish

Mahsulotlar, GitHub, Telegram va boshqa saytlarga havolalar sizni oʻz siyosatlariga ega xizmatlarga olib boradi. Havola orqali oʻtganingizda brauzeringiz keyingi saytga faqat wonmor.io dan kelganingizni aytadi, qaysi sahifada boʻlganingizni emas.

## Savollar va oʻzgarishlar

Maxfiylik boʻyicha har qanday savol, jumladan sizga tegishli boʻlishi mumkin boʻlgan log yozuvlari haqidagi savol bilan Telegramʼga yozing: [t.me/xnosir](https://t.me/xnosir). 30 kundan eski loglar mavjud emas, shuning uchun undan eskisini qidirib boʻlmaydi.

Bu bildirishnoma oʻzgarsa, yuqoridagi sana ham oʻzgaradi. Wonmorʼni uning asoschisi yuritadi va hali yuridik shaxsi yoʻq; u paydo boʻlganda bu bildirishnomada uning nomi koʻrsatiladi.
