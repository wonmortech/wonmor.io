# wonmor

https://wonmor.io landing sahifasi — statik HTML, build yo'q.

- `site/` — sahifa fayllari (Caddy `file_server`).
- `deploy/` — `wonmor-site` konteyneri (caddy:2-alpine, `dtwin-prod_default` tarmog'i). Edge: dtwin `deploy/Caddyfile` (`{$WONMOR_ADDRESS:wonmor.io}`).
- Deploy: toza `origin/main` dan `bash deploy/deploy.sh` → `/opt/wonmor-site`.
- DNS (Namecheap BasicDNS): A `@` va A `www` → 185.191.141.233.
