# wonmor.io

Wonmor studiyasining sayti — https://wonmor.io. Astro (statik), uch til: en `/`, uz `/uz/`, ru `/ru/`.

## Tuzilma

| Yo'l | Nima |
|---|---|
| `src/i18n/` | Barcha matn: `ui.ts` (interfeys), `pages.ts` (sahifalar, navigatsiya, footer), `home.ts` (bosh sahifa) |
| `src/content/news/<slug>/{en,uz,ru}.md` | Yangiliklar. Har postda `source` (manba) majburiy |
| `src/components/` | Header (logo animatsiyasi), MenuOverlay, Footer, NewsCard, SectionPage, Collage |
| `src/styles/` | `tokens.css` (rang, shrift, grid), `base.css` (tipografiya, tugmalar) |
| `brand/source/wonmor_b.json` | Logo geometriyasining yagona manbasi |
| `tools/gen-brand.mjs` | Logo → `src/brand/geometry.json`, favicon, ikonlar, OG rasm |
| `tools/check-site.mjs` | Build'dan keyingi tekshiruv: CSP, ichki havolalar, maxfiy ma'lumot (IP, token, ichki host) |
| `site/` | Build natijasi (commit qilinadi — deploy build qilmaydi) |
| `deploy/` | `wonmor-site` konteyneri (caddy:2-alpine) va deploy skripti |

Brend ranglari (`--wm-blue`, `--wm-ink`) va logo shrifti faqat logoda ishlatiladi; sayt interfeysi o'z neytral palitrasida.

## Ishlash

```sh
npm ci
npm run assets   # logo/ikon/shriftlarni qayta yaratish (manba o'zgarganda)
npm run dev      # http://localhost:4321
npm run build    # site/ + Pagefind qidiruv indeksi + check-site
```

## Deploy

Faqat toza `origin/main` dan: `bash deploy/deploy.sh dtwin` → `/opt/wonmor-site`, keyin `https://wonmor.io/version.txt` commit SHA ni qaytarishi tekshiriladi. Edge: dtwin `deploy/Caddyfile` (`{$WONMOR_ADDRESS:wonmor.io}`).
