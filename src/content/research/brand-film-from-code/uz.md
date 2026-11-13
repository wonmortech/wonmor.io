---
title: "Koddan brend film yasash"
description: "19,4 soniyalik wonmor brend filmi bitta timeline faylidan qanday yaratilishi: MP4 uchun canvas renderer, generatsiya qilingan After Effects loyihasi, materiallar uchun Blender, sintez qilingan ovoz va veb uchun kodlash."
date: 2026-11-13
kind: engineering
area: interfaces
featured: false
source:
  - "https://wonmor.io"
  - "https://playwright.dev/docs/api/class-page#page-screenshot"
  - "https://ffmpeg.org/ffmpeg-formats.html#image2pipe"
  - "https://trac.ffmpeg.org/wiki/Encode/H.264"
  - "https://docs.blender.org/manual/en/latest/render/cycles/index.html"
reproduce:
  note: "Eʼlon qilingan filmni oʻzingiz tekshiring: davomiylik, kadr oʻlchami, kadr tezligi va kodeklar toʻgʻridan-toʻgʻri wonmor.ioʼdagi fayldan olinadi."
  commands:
    - "ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact https://wonmor.io/film/wonmor_16x9.mp4"
---

wonmor.ioʼning bosh qismi 19,4 soniyalik brend film. Bitta olmos kesiladi, uning pastki qismi V ga aylanadi, V esa ikkilanib belgining Wʼsiga aylanadi, keyin wordmark chiziladi. Jarayonda video muharriri yoʻq. Film har bir qatlam va keyframeʼni tasvirlaydigan bitta JavaScript faylidan yaratiladi, oʻsha fayl esa tahrirlanadigan After Effects loyihasini ham chiqaradi. Bu maqola qanday ishlashi va nega shunday qurganimiz haqida. Birinchi versiya 2026-yil 13-noyabrda chiqdi.

```steps
Timeline :: Bitta fayl har bir kadrni qatlamlar, keyframeʼlar, easingʼlar, ranglar va kirish-chiqish vaqtlari bilan tasvirlaydi.
Materiallar :: Blender shisha olmos va metall kabi jismoniy kadrlarni timeline joylashtiradigan rasm ketma-ketligi sifatida render qiladi.
Kadrlar :: Brauzer har kadrni canvasʼda motion blur bilan chizadi, Playwright esa piksellarni ffmpegʼga uzatadi.
Ovoz :: Python skripti oʻsha cue vaqtlaridan ovoz dizaynini sintez qiladi va -16 LUFS ga normallashtiradi.
Natijalar :: Oʻsha maʼlumot veb fayllar, master fayl, After Effects loyihasi va storyboard toʻplamini chiqaradi.
```

## Nega jonli animatsiya emas, film

Birinchi bosh qism jonli sahna edi: brauzerda ishlaydigan SVG shakllar va GSAP timeline, olmos uchun esa three.js sahnasi. Uni biz intilgan turdagi brend film bilan kadrma-kadr solishtirganimizda, bosh qism oldindan render qilingan video boʻlishi kerak degan xulosaga keldik. Jonli sahna yozib olinganda ham muammo berdi: dasturiy WebGLʼli headless yozishda u “arvoh” kadrlar chiqardi, ularda SVG pathʼning ikki holati bir vaqtda koʻrinardi, holbuki haqiqiy Chrome oynasida hammasi toza edi. Brend lahzasi har ekranda bir xil koʻrinishi, yozuv esa biz koʻrgan narsaga mos kelishi kerak.

Oldindan render qilingan film buni hal qiladi, lekin video muharririda yasalgan film boshqa muammo tugʻdiradi: manba faqat bitta dastur ocha oladigan loyiha fayliga aylanadi va har geometriya oʻzgarishi keyframeʼlarni qoʻlda qayta qilishni anglatadi. Biz film kod boʻlib qolishini, diffʼda koʻrib chiqilishini va bitta buyruq bilan qayta yigʻilishini xohladik, shu bilan birga motion dizaynerga haqiqiy After Effects loyihasini berishni ham.

## Bitta timeline, uchta renderer

`timeline.mjs` yagona haqiqat manbai. U qatlamlar roʻyxatini (solidʼlar, shape qatlamlar, guruhlar, rasm ketma-ketliklari, grain qatlami) keyframeʼlar va nomlangan easingʼlar bilan quradi va ikki format, 9:16 va 16:9 uchun JSON qilib yozadi. Belgi geometriyasi logotipni belgilaydigan umumiy moduldan olinadi, shuning uchun film brenddan hech qachon chetga chiqmaydi.

Timelineʼdagi kadr shunday oʻqiladi. Mana fon: har kadr chegarasida hold easing bilan rangi kesiladigan bitta qatlam:

```js
const BG = [
  [0, K.ink], [4.60, K.ink], [5.57, K.paper], [6.57, K.ink], [11.07, K.paper], [12.07, K.ink],
  [15.57, K.blue], [16.07, K.ink], [16.57, K.paper], [18.13, K.blue], [18.93, K.ink],
];
L({ type: 'solid', name: 'BG', w: Wd, h: Hd, color: kf(...BG.map(([t, c]) => [t, c, E.hold])) });
```

Bu JSONʼni uchta isteʼmolchi oʻqiydi:

- **Canvas player** (`comp/player.js`) filmning istalgan `t` lahzasini chizadi. Yozish vositasi uni Playwright orqali headless Chromiumʼda ochadi, kadrma-kadr render qiladi, har biridan PNG skrinshot oladi va master uchun ffmpegʼga (`-f image2pipe`, libx264, CRF 12) uzatadi.
- **After Effects generatori** (`tools/ae.mjs`) ikkala kompozitsiyani oʻsha maʼlumotdan qayta quradigan ExtendScript faylini yozadi: keyframe va easingʼlari bilan tahrirlanadigan shape qatlamlar, time remapʼli rasm ketma-ketliklari, plitalar, audio va kadr markerlari.
- **Figma toʻplami** filmning 28 kadrining har biridan bittadan asosiy kadr olib, ularni storyboard qilib joylaydi.

Uchalasi ham bir xil raqamlarni oʻqigani uchun timelineʼdagi easing yoki kesish vaqti oʻzgarishi MP4ʼda ham, After Effects loyihasida ham bir xil koʻrinadi.

## Motion blur va nega har kesish kadrga yopishadi

Motion blurʼsiz motion grafika ekran yozuviga oʻxshaydi. Canvasʼda zatvor yoʻq, shuning uchun player uni taqlid qiladi: har chiqish kadri uchun yarim kadr oraligʻida (180° zatvor) bir nechta sub-kadr chizadi va piksellarni oʻrtachalaydi.

```js
// average sub-frames over a 180 degree shutter (half a frame interval)
for (let s = 0; s < samples; s++) {
  draw(octx, t + (s / samples) * (0.5 / timeline.fps));
  const d = octx.getImageData(0, 0, off.width, off.height).data;
  for (let i = 0; i < d.length; i++) acc[i] += d[i];
}
```

Toʻrtta namuna bilan filmning 582 kadri (30 fpsʼda 19,4 s) 2 328 toʻliq chizishni anglatadi. Bu sekin, lekin oflayn render uchun maqbul.

Bu yozib qoʻyishga arziydigan bitta xato tugʻdirdi. Agar kesish ikki kadr boshi orasiga tushsa, kadrning baʼzi sub-namunalari chiqib ketayotgan kadrdan, baʼzilari kirib kelayotganidan olinadi va oʻrtacha ikki bogʻliq boʻlmagan tasvirni arvohli kadrga aralashtiradi. Tuzatish rendererʼda emas, timelineʼda. JSON yozilishidan oldin har qatlamning kirish va chiqish vaqtlari hamda har keyframe kadr boshiga yaxlitlanadi:

```js
const q = (t) => Math.round(t * FPS) / FPS;
```

Shundan keyin sub-namunalar har doim bitta kadr ichiga tushadi.

## Materiallar Blenderʼdan, ovoz Pythonʼdan

Baʼzi kadrlarga haqiqiy materiallar kerak: kichik koʻk shisha olmos, metall belgi, bir nechta 3D sahna. Ular skript bilan yozilgan sahna faylidan Blenderʼda, CPUʼdagi Cycles bilan, kadrma-kadr, kadrga qarab 48 dan 128 gacha namuna bilan render qilinadi. Natija timeline boshqa qatlamlar kabi joylashtiradigan rasm ketma-ketliklari. Masalan, olmos 31 kadrlik choksiz aylanish, shuning uchun kadr qancha talab qilsa, shuncha takrorlanishi mumkin. Toʻliq Blender oʻtishi CPUʼda taxminan yigirma daqiqa oladi. Qolgan hamma narsa vektor va brauzerda render qilinadi.

Ovoz ham namunalarsiz sintez qilinadi. NumPyʼli Python skripti timelineʼga mos cue vaqtlaridan 48 kHz stereo trek quradi, ffmpegʼning loudness filtri esa uni -16 LUFS ga normallashtiradi. Kesish siljisa, ovoz qayta tahrir qilinmaydi, qayta generatsiya qilinadi.

## Veb uchun kodlash

Yakunlovchi skript ovozni birlashtiradi va uch narsa chiqaradi: 320 kbps AACʼli yuqori sifatli master, har tomonlar nisbati uchun veb fayllar va 11,5-soniyada olingan poster kadr. Veb fayl x264, CRF 24, `-tune film`, adaptiv kvantlash rejimi 3, Lanczos masshtablash va `+faststart` bilan kodlanadi, shunda ijro fayl toʻliq yuklanmasdan boshlanadi. Ovoz 128 kbpsʼda saqlanadi: ishga tushganda sahifa filmni standart holatda ovozsiz oʻynatardi, ovoz tugmasi va pauza tugmasi bilan.

Bugun eʼlon qilingan 16:9 fayl 2 656 349 bayt: 1920×1080, 30 fps, AACʼli H.264, aniq 19,4 soniya.

## Cheklovlar

- **Render oflayn va sekin.** Bitta easingʼni oʻzgartirish har kadrni motion blur bilan qayta render qilishni anglatadi, material kadri oʻzgarsa Blender ham. Bu jonli koʻrik emas, paketli ish.
- **After Effects loyihasi aniq, lekin toʻliq native emas.** Vektor qatlamlar haqiqiy keyframeʼli tahrirlanadigan shakllar boʻlib keladi, Blender kadrlari esa rasm ketma-ketligi boʻlib. Olmosni oʻzgartirish uchun Blenderʼga qaytish kerak.
- **Film javob bera olmaydi.** Jonli sahna kursor va scrollʼga javob bera oladi, film esa yoʻq. Brend lahzasi uchun bu almashuvni qabul qilamiz.
- **Reliz fayllari repozitoriyda yoʻq.** Master va After Effects hamda Figma arxivlari build natijasi boʻlib, git ularni eʼtiborsiz qoldiradi, shuning uchun topshirish uchun ularni qayta generatsiya qilish yoki boshqa joyda saqlash kerak.
