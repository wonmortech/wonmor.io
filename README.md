# wonmor.io

[![CI](https://github.com/wonmortech/wonmor.io/actions/workflows/ci.yml/badge.svg)](https://github.com/wonmortech/wonmor.io/actions/workflows/ci.yml)
[![Deploy](https://github.com/wonmortech/wonmor.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/wonmortech/wonmor.io/actions/workflows/deploy.yml)

Source of [wonmor.io](https://wonmor.io), the site of Wonmor, an independent studio from Uzbekistan. Static [Astro](https://astro.build) site in three languages: English at `/`, Uzbek at `/uz/`, Russian at `/ru/`.

## Layout

| Path | What it holds |
|---|---|
| `src/i18n/` | All interface text: `ui.ts`, `pages.ts` (pages, navigation, footer), `home.ts`, `changelog.ts` |
| `src/content/news/<slug>/{en,uz,ru}.md` | News. Every post is a dated fact with at least one `source` |
| `src/content/research/<slug>/{en,uz,ru}.md` | Research and engineering posts (`kind` decides the URL) |
| `src/content/docs/<page>/{en,uz,ru}.md` | Policy and company pages |
| `src/data/` | Products, research areas, company facts |
| `src/components/` | Page building blocks: `Plate` (illustrations), news, research, carousels, filters |
| `public/admin/` | Sveltia CMS editor at [/admin](https://wonmor.io/admin/) |
| `tools/` | Brand generation, the CMS copy step and the post-build checks |
| `deploy/` | Caddy container, the server-side `receive` script and admin tools |

## Working on it

```sh
npm ci
npm run dev      # http://localhost:4321
npm run build    # site/ + Pagefind index + check-site (CSP, privacy scan) + check-links
npm run assets   # regenerate logo, icons and fonts when brand/source changes
```

`site/` is build output and is not committed.

## Editing content

Open [wonmor.io/admin](https://wonmor.io/admin/) and choose **Sign In Using Access Token**. Use a fine-grained GitHub token limited to this repository with *Contents: read and write*. Each language is its own collection, and every save is a commit to `main` that the Deploy workflow builds and publishes. A commit that fails the build is never deployed.

## Deploys

| When | What happens |
|---|---|
| Pull request | `CI` builds the site and runs every check. It must pass before merge. |
| Merge to `main` | `Deploy` builds, ships `site/` and the Caddyfile to the server, checks that `/version.txt` returns the commit, runs a smoke test, and rolls back automatically if any of it fails. |

On the server a release is unpacked to `releases/<sha>` and `releases/current` is swapped atomically, so no request is dropped. The CI key can only run `deploy/receive.sh` (forced command), not open a shell. A changed Caddyfile is validated before it is loaded. The last five releases are kept.

Admin tools, over an ordinary SSH login:

```sh
bash deploy/deploy.sh status     # live commit
bash deploy/deploy.sh rollback   # back to the previous release
bash deploy/deploy.sh ship       # build clean origin/main locally and publish (if Actions is down)
bash deploy/deploy.sh bootstrap  # install or update server-managed files and the container
```

## Contributing and security

See the organisation's [contributing guide](https://github.com/wonmortech/.github/blob/main/CONTRIBUTING.md). Report vulnerabilities privately via [Security → Report a vulnerability](https://github.com/wonmortech/wonmor.io/security/advisories/new) or the [security policy](https://wonmor.io/security/), never in a public issue.
