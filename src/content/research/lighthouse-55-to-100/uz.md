---
title: "Lighthouse 55 → 100, “vau”ni yoʻqotmasdan"
description: "Halvet konsept sayti bitta relizda mobil Lighthouse unumdorlik bahosini 55 dan 100 ga qanday chiqargani, keyin WebGL hero va 3D sahnani qaytarib ham 99 da qolgani va baho nega u yerda turib qolmagani haqida."
date: 2026-11-09
kind: engineering
area: interfaces
featured: false
source:
  - "https://github.com/dtwinuz/halvet"
  - "https://halvet.dtwin.uz"
  - "https://developer.chrome.com/docs/lighthouse/performance/lighthouse-total-blocking-time"
  - "https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode"
  - "https://registry.khronos.org/webgl/extensions/KHR_parallel_shader_compile/"
reproduce:
  repo: "https://github.com/dtwinuz/halvet"
  commit: "f0739fe61c3aa8347d5bd6a78b5f80cbb418630a"
  note: "v1.1 commitʼini oling, v1 papkasini serve qiling va Lighthouseʼni mobil profilda yurgizing; lokal server va oʻz kompyuteringizdagi baholar biznikidan farq qiladi, shuning uchun oldingi va keyingi commitʼlarni bitta kompyuterda solishtiring."
  commands:
    - "git clone https://github.com/dtwinuz/halvet && cd halvet && git checkout f0739fe"
    - "npx serve v1"
    - "npx lighthouse http://localhost:3000 --only-categories=performance --form-factor=mobile"
    - "git checkout 432e50f   # v1, the 55 baseline, for comparison"
---

Halvet hammom, sauna va basseyn quruvchilari uchun konsept sayt. Uning auditoriyasi qimmat his qilinadigan narsani kutadi: sekin, kinematografik harakat, iliq tosh ustida suzib yuradigan bugʻ. Birinchi versiyada bularning hammasi bor edi va telefonda undan deyarli foydalanib boʻlmasdi. Lighthouseʼning mobil profili unga 55 unumdorlik bahosini berdi: Total Blocking Time 14,4 soniya, sahifa vazni 3,6 MB.

Bir relizdan keyin, 2026-yil 9-noyabrda, oʻsha sahifa 100 oldi: Total Blocking Time nol, sahifa 0,65 MB. Keyingi reliz WebGL tuman shaderi va three.js sahnasini qoʻshdi va baribir mobilda 99, desktopda 100 oldi. Bu maqola buning qanday boʻlgani va hikoyaning halol oxiri haqida: baho saqlab qoladigan kubok emas.

```steps
Oʻlchash :: Lighthouseʼni mobil profilda yurgizing va faqat bahoni emas, diagnostikani oʻqing.
Bitta sababni topish :: 14.4 s bloklanishning deyarli hammasi bitta toʻliq aniqlikdagi bugʻ canvasʼidan kelardi.
Arzon qilish :: Effektni aniqlik va kadr tezligining bir qismida, faqat koʻringanda va faqat yuklangandan keyin chizing.
Baytlarni kesish :: Moslashuvchan WebP, oʻzimizdagi shriftlar va oʻzgarmas kesh sahifani 3.6 MB dan 0.65 MB ga tushirdi.
Vauni dangasa qoʻshish :: Ogʻir effektlar faqat kerak boʻlganda yuklanadi, avval WebGLʼni tekshiradi va har doim arzon zaxirasi bor.
```

## Butun muammo bitta effekt edi

Hero bu ustidan bugʻ suzib oʻtadigan hammom fotosurati. v1ʼda bu bugʻ 2D canvas edi: har animatsiya kadrida qayta chiziladigan 26 ta yumshoq sprite, qurilma piksel nisbatining 1,5 baravarigacha, fotosurat ustiga `mix-blend-mode: screen` bilan qoʻshilgan.

Har bir qism oʻz-oʻzidan oqilona edi. Hammasi birga, sekinlashtirilgan oʻrta darajali telefonda, falokat edi. Ekran oʻlchamidagi toʻliq aniqlikdagi canvas sekundiga oltmish marta tozalanib qayta chizilardi, keyin har kadrda ostidagi rasm bilan aralashtirilardi va bu birinchi chizishdan boshlab asosiy oqim va kompozitorni band qilib turardi. Lighthouse birinchi chizishdan keyingi har uzun vazifani Total Blocking Timeʼga qoʻshadi, 14,4 soniyaning deyarli hammasi shu sikldan kelardi.

v1.1ʼdagi tuzatish effektni saqladi va uning narxini oʻzgartirdi:

```js
var Q = 0.35;   // draw at 35% resolution: steam is soft, nobody can see the difference
var size = function () {
  W = cv.clientWidth; H = cv.clientHeight;
  cv.width = Math.ceil(W * Q); cv.height = Math.ceil(H * Q);
  ctx.setTransform(Q, 0, 0, Q, 0, 0);
};
var tick = function (t) {
  if (!visible || document.hidden) { looping = false; return; }   // stop offscreen and in background tabs
  requestAnimationFrame(tick);
  if (t - last < 33) return;                                       // about 30 fps is plenty for steam
  last = t;
  // ... draw puffs
};
// start 400 ms after the load event, so it never competes with the first paint
window.addEventListener('load', function () { setTimeout(startSteam, 400); });
```

Blend mode butunlay olib tashlandi, sprite esa yumshoq dogʻlar toʻplami sifatida qayta chizildi, shunda oddiy alfa fotosurat ustida toʻgʻri koʻrinadi. Tor ekranlarda effekt 18 oʻrniga 9 ta bulut ishlatadi. Bugʻ tabiatan xira, shuning uchun uni 35% aniqlikda chizib choʻzish koʻzga bilinmaydi va 1× canvas piksellarining taxminan sakkizdan birini talab qiladi.

## Baytlar, shriftlar va kesh

Asosiy oqim boʻshagach, qolgan ish vazn edi:

- **Moslashuvchan WebP.** 0,3–0,8 MBʼli JPEG boʻlgan har bir fotosurat kichik skript manba rasmlardan yaratadigan 640 dan 2000 pikselgacha kenglikdagi WebP fayllar `srcset`ʼiga aylandi. Telefon 640 yoki 1024 versiyani yuklaydi.
- **Oʻzimizdagi shriftlar.** Shriftlar Google Fontsʼdan saytning oʻziga koʻchdi, birinchi ekranda ishlatiladigan ikki shrift uchun `preload` bilan; hero fotosurati ham `fetchpriority="high"` bilan oldindan yuklanadi. Bu muhim yoʻldan uchinchi tomon ulanishini olib tashladi va kontent xavfsizlik siyosatiga Googleʼni butunlay chiqarib tashlash imkonini berdi.
- **Oʻzgarmas kesh.** CSS va JavaScript `styles.css?v=<commit>` koʻrinishida chaqiriladi va uzoq oʻzgarmas kesh bilan beriladi, shuning uchun qaytgan mehmon hech narsa yuklamaydi, deploy esa baribir hammasini yangilaydi.

Qidiruv tizimi asoslari oʻsha relizga kirdi: `robots.txt`, sitemap, canonical havola va Open Graph teglari SEO toifasini 92 dan 100 ga chiqardi.

Oʻsha reliz matnni ham qisqartirdi. Hero ustidagi kicker, subtitr va bir nechta karta tavsiflarini olib tashlash unumdorlik uchun qilinmagan, lekin sahifani yuklash uchun ham, oʻqish uchun ham yengillashtirdi.

## Vauni qaytarish

“Vauni yoʻqotmasdan” qismi v1.2ʼda sinovdan oʻtdi. U WebGL shader sifatida yozilgan hero tumanini (domain warp qilingan shovqinning ikki qatlami, gumbaz tuynuklaridan tushadigan nur, tumanni suradigan kursor izi) va haqiqiy fotosurat yarim sharga proyeksiya qilingan gumbazning three.js sahnasini qoʻshdi. Baribir mobilda 99, desktopda 100 oldi. Buni uch qoida mumkin qildi.

**Ogʻir kodni faqat koʻrinish arafasida yuklang.** three.js sahnasi alohida chunk, uning boʻlimi viewportʼga 600 piksel yaqinlashganda dinamik import qilinadi:

```js
var glOk = (function () { try { var c = document.createElement('canvas');
  return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } })();
var saveData = navigator.connection && navigator.connection.saveData;
if (glOk && !saveData) {
  new IntersectionObserver(function (e, o) {
    if (!e[0].isIntersecting) return; o.disconnect();
    import('./dome.js?v=' + VER).then(function (m) { return m.mountDome(domeFig, dome, { reduce: reduce }); });
  }, { rootMargin: '600px 0px' }).observe(domeFig);
}
```

**Sarflashdan oldin tekshiring.** WebGL yoʻq boʻlsa yoki brauzerda Save-Data bayrogʻi yoqilgan boʻlsa, mehmon fotosuratni koʻradi va three.jsʼni umuman yuklamaydi.

**Har doim zaxira saqlang.** Tuman shaderi ishlamasa yoki uning WebGL konteksti yoʻqolsa, sahifa WebGL klassini olib tashlaydi va oʻrniga v1.1ʼdagi arzon 2D bugʻni ishga tushiradi. `prefers-reduced-motion` boʻlsa, tuman qotgan rasm sifatida chiziladi va bezak harakati oʻtkazib yuboriladi.

## Bitta tuzoq: CSP va inline uslublar

v1.3 har qatlamda CSS oʻzgaruvchisini inline `style="..."` atributi orqali beradigan qatlamli diagramma bilan chiqdi. U lokal serverda ishladi, jonli saytda esa buzildi, chunki prodʼdagi kontent xavfsizlik siyosatida `style-src 'self'` bor va u inline style atributlarini bloklaydi. Tuzatish qatlamlarni stylesheetʼda `:nth-child` bilan raqamlash yoki oʻzgaruvchini JavaScriptʼdan `style.setProperty` bilan berish boʻldi, CSP bunga ruxsat beradi. Endi har deploydan keyin jonli saytda brauzer konsolini ochamiz.

## Cheklovlar: 100 doimiy emas

Baho bu sahifaning bir kundagi surati, sahifa esa oʻsishda davom etdi. v1.8 tumanni kurnalardan koʻtariladigan bugʻning GPU suyuqlik simulyatsiyasi bilan almashtirdi. Uning shaderlarini kompilyatsiya qilish asosiy oqimni bloklardi, shuning uchun ishga tushirish bosqichma-bosqich: shaderlar `KHR_parallel_shader_compile` kengaytmasi orqali fonda kompilyatsiya qilinadi, simulyatsiya esa taxminan olti millisekundlik boʻlaklarda qizdiriladi, toki birorta vazifa uzoq choʻzilmasin. Shu relizdan keyin jonli sayt mobilda 92 koʻrsatdi: Largest Contentful Paint 2,8 s, Total Blocking Time 210 ms.

2026-yil 13-noyabrda biz Lighthouse 12.8.2ʼni ish stoli kompyuteridan jonli saytga qarshi standart mobil profilda yana yurgizdik. U unumdorlik 78, foydalanish qulayligi 96, eng yaxshi amaliyotlar 100 va SEO 100 ni koʻrsatdi: Largest Contentful Paint 2,9 s, Total Blocking Time 550 ms, layout siljishi yoʻq, 795 KiB uzatilgan. Laboratoriya baholari kompyuter, tarmoq va Lighthouseʼning oʻz tebranishi bilan oʻzgaradi; GPUʼga ogʻir sahifa koʻpchilikdan koʻproq tebranadi. Biz olgan saboq “100 oling” emas, balki “har effekt qanchaga tushishini biling va uning narxini faqat mehmon qarab turganda toʻlang”.

Foydalanish qulayligi ataylab 96–97 da qoladi: scroll bilan boshqariladigan bayonot oʻqiganingiz sari soʻzlarni xiradan yorqinga oʻtkazadi, xira soʻzlar esa yonmaguncha kontrast tekshiruvidan oʻtmaydi.
