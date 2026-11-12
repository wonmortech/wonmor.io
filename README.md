# wonmor

https://wonmor.io landing sahifasi — statik HTML, build yo'q.

- `site/` — sahifa fayllari (Caddy `file_server`).
- `deploy/` — `wonmor-site` konteyneri (caddy:2-alpine, `dtwin-prod_default` tarmog'i). Edge: dtwin `deploy/Caddyfile` (`{$WONMOR_ADDRESS:wonmor.io}`).
- Deploy: toza `origin/main` dan `bash deploy/deploy.sh` → `/opt/wonmor-site`.
- DNS (Namecheap BasicDNS): A `@` va A `www` → 185.191.141.233.

## Build

The site is static. `src/` (GSAP timeline, three.js stage, mark geometry) is bundled into `site/assets/` with esbuild:

```sh
npm ci
npm run build
```

The build output is committed, so deploy stays no-build. Preview any frame of the hero animation with `/?shot=<seconds>`.
