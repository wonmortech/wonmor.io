wonmor brend filmi - After Effects to'plami
===========================================

Ichida nima bor
---------------
build_wonmor.jsx      - skript: After Effects'da 2 ta kompozitsiyani o'zi yig'adi
footage/render/...    - Blender renderlari (PNG ketma-ketlik, shaffof fon)
footage/audio/        - ovoz dizayni (wonmor_sound.wav, -16 LUFS)
footage/film/         - tayyor film (MP4) - solishtirish uchun REFERENCE
vectors/              - logotip SVG'lari (Illustrator / Figma uchun)

Qanday ochiladi (2 daqiqa)
--------------------------
1. Zip'ni oching. Papka tuzilmasini O'ZGARTIRMANG (jsx va footage yonma-yon tursin).
2. After Effects (2022 yoki yangi) ni oching.
3. Edit > Preferences > Scripting & Expressions >
   "Allow Scripts to Write Files and Access Network" ni yoqing.
4. File > Scripts > Run Script File...  -> build_wonmor.jsx ni tanlang.
5. 1-3 daqiqada "wonmor: 2 ta kompozitsiya tayyor" oynasi chiqadi.
   Project panelida: wonmor / wonmor_film_9x16 va wonmor_film_16x9.
6. File > Save As... bilan .aep qilib saqlang.

Kompozitsiya
------------
- 9x16: 1080x1920, 16x9: 1920x1080, 30 fps, 19.4 s, motion blur yoqilgan (180 daraja).
- Vaqt chizig'ida 28 ta marker: S01 ... S28 (har sahna nomi bilan).
- Har element alohida qatlam: Shape layer'lar (kalit kadrlar va easing bilan),
  Null "group" qatlamlar (parent), PNG ketma-ketliklar Time Remap bilan.
- "REFERENCE (rendered film)" - guide qatlam, o'chiq. Yoqib, Difference rejimida
  tayyor film bilan solishtirsa bo'ladi. Renderga chiqmaydi.

Nimani o'zgartirsa bo'ladi
--------------------------
- Ranglar: BG qatlamidagi Fill effekti (kalit kadrlar = sahna ranglari).
  Brend ranglari: ko'k #1F5BFF, qora #0A0B10, qog'oz #EEF2F8, oq #F7F9FC.
- Vaqt: kalit kadrlarni siljiting. Sahna chegaralari markerlarda.

Eslatma
-------
- Skript ichidagi easing (cubic-bezier) After Effects'ning speed/influence'iga
  taxminan o'girilgan; harakat MP4 bilan juda yaqin, lekin 1:1 bo'lmasligi mumkin.
  Graph Editor'da tuzatsa bo'ladi.
- Agar "Topilmadi: ..." chiqsa - footage papkasi jsx yonida emas.
- Wordmark harflari allaqachon vektor shakl - shrift o'rnatilmasa ham to'g'ri chiqadi.

Render (eksport)
----------------
Composition > Add to Render Queue (yoki Adobe Media Encoder):
H.264, 1080x1920 / 1920x1080, 30 fps, 20 Mbps, audio AAC 320.
