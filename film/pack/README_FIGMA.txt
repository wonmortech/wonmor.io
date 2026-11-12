wonmor - Figma to'plami
=======================

wonmor_brand_sheet.svg  - butun brend varag'i (logo, konstruksiya, lockup, ranglar, qoidalar).
                          Figma'ga sudrab tashlang: hamma narsa tahrirlanadigan vektor bo'ladi.
vectors/*.svg           - alohida logotiplar:
                          mark-w_blue / _ink / _white   - W belgisi
                          lockup_*                      - belgi + "onmor" yozuvi (belgi = w) (fon variantlari bilan)
                          badge_ink                     - doira ichida belgi
tokens.json             - ranglar, shrift, o'lcham qoidalari, motion easing.
                          Tokens Studio plagini: Import > tokens.json.
                          Plaginsiz: Local variables'ga ranglarni qo'lda qo'shing (hex'lar ichida).
film_keyframes/         - filmning asosiy kadrlari (PNG), storyboard uchun.

Qoidalar
--------
- Bitta olmos -> bitta V -> V ikkiga bo'linib W bo'ladi. Ikkita olmos yoki ikkita toj YO'Q.
- Kamalak gradient, uchqun, neon yo'q. Faqat ko'k, qora, qog'oz, oq.
- Atrofida bo'sh joy: belgi balandligining yarmi. Aylantirmang, cho'zmang, kontur qilmang.
- Belgining o'zi "w" harfi: lockup = belgi + "onmor". Yozuv hech qachon belgisiz yoki ikkinchi "w" bilan yozilmaydi.
- Shrift: Plus Jakarta Sans 700, harf oralig'i -3%.
