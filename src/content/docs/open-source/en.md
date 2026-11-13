---
updated: 2026-11-13
summary: Which dtwin repositories are public, under which licences, what stays private and how to contribute.
---

Wonmor builds in the open where it can. This page lists what is public today, what we keep private and why, and how you can take part. All repositories live in one GitHub organization, [github.com/dtwinuz](https://github.com/dtwinuz).

This policy applies from November 13, 2026.

## Public repositories today

As of November 13, 2026, eight repositories in the organization are public:

| Repository | What it is | Licence |
|---|---|---|
| [bitg](https://github.com/dtwinuz/bitg) | Uzbek keyboard for the 2026 Latin alphabet: Rust core, Windows, Linux and macOS input methods | MIT OR Apache-2.0, your choice |
| [teletwin-web](https://github.com/dtwinuz/teletwin-web) | TeleTwin client for web, desktop and mobile, a fork of Telegram Web A with a company layer | GPL-3.0 |
| [gym-dtwin](https://github.com/dtwinuz/gym-dtwin) | Workout diary: plans, sets, rest timer and records | No licence file yet |
| [operobot2](https://github.com/dtwinuz/operobot2) | Outbound call and sales assistant | No licence file yet |
| [halvet](https://github.com/dtwinuz/halvet) | Website for a hammam, sauna and pool builder | No licence file yet |
| [homebrew-tap](https://github.com/dtwinuz/homebrew-tap) | Homebrew tap for installing bitg on macOS | No licence file yet |
| [.github](https://github.com/dtwinuz/.github) | Organization profile and shared community files | No licence file yet |
| [.allstar](https://github.com/dtwinuz/.allstar) | OpenSSF Allstar policies for our public repositories | No licence file yet |

A note on "no licence file yet": you can read and learn from that code, but without a licence the law does not give you the right to copy or reuse it. Adding a clear licence to each of these repositories, or saying plainly that it stays all rights reserved, is planned. Until then, ask us before reusing code from them.

You can check this list yourself:

```bash
gh repo list dtwinuz --visibility public --json name,licenseInfo,description
```

GitHub shows bitg as Apache-2.0 because it detects one licence file. bitg actually ships both LICENSE-MIT and LICENSE-APACHE, and every source file is checked with a REUSE licence linter in CI.

## Shared Wonmor material: wonmortech

Material that belongs to Wonmor as a whole, rather than to one product, lives in a second organization, [github.com/wonmortech](https://github.com/wonmortech). Its seven repositories went public on November 13, 2026:

| Repository | What it is | Licence |
|---|---|---|
| [research](https://github.com/wonmortech/research) | Commands, queries and scripts behind every post on this site | MIT for code, CC BY 4.0 for text |
| [uz-open-data](https://github.com/wonmortech/uz-open-data) | Mosques of Uzbekistan from OpenStreetMap as GeoJSON, and the Uzbek Cyrillic to Latin table from bitg | ODbL 1.0 for the map data, MIT for the table |
| [deploy-kit](https://github.com/wonmortech/deploy-kit) | Zero-downtime static deploys: releases, symlink swap, Caddy reload, rollback | MIT |
| [design-system](https://github.com/wonmortech/design-system) | The design tokens of this site (`@wonmor/tokens`); components are planned | MIT |
| [brand](https://github.com/wonmortech/brand) | The mark, lockups, colours and brand film | Not open-licensed, see [Brand](/brand/) |
| [open-source-fund](https://github.com/wonmortech/open-source-fund) | The planned fund: criteria and application template; not open yet | CC BY 4.0 |
| [.github](https://github.com/wonmortech/.github) | Organization profile, contributing guide, code of conduct and security policy | — |

## What we open by default

We prefer to make a repository public when it is a product or tool that people install or run, a library others can reuse, or a site whose source teaches something. Opening early has practical benefits: anyone can review the code, security scanners work on it for free, and the work stays useful even if we stop.

Every public repository has the same baseline: a code owners file, the organization's security policy, GitHub private vulnerability reporting and secret push protection. Dependabot updates are on in all of them except halvet, where adding them is planned. New public repositories start with the full baseline.

## What stays private, and why

Some things will not be public, and we would rather say so than leave you guessing:

- **Customer and user data.** Anything people trust us to keep. It never goes into a repository, public or private.
- **Infrastructure configuration.** Server addresses, deployment scripts, network layout and monitoring setup. Publishing these makes attacks easier and helps nobody use the products.
- **Secrets.** Tokens, keys and passwords. They live in secret stores, never in code, and push protection blocks commits that contain them.
- **Code we are not free to publish** or that is still being shaped. Several dtwin products, including the main dtwin app, are private repositories today. A product page links to its repository only when that repository is public.

A private repository is held to the same engineering rules as a public one: pull requests, CI and a human merge.

## How to contribute

The shared [CONTRIBUTING.md](https://github.com/dtwinuz/.github/blob/main/CONTRIBUTING.md) applies to every repository. If a repository has its own CONTRIBUTING file, that file wins.

```steps
Issue :: for a larger change, open or pick an issue first
Branch :: branch from main, for example feat/short-name or fix/short-name
Commit :: Conventional Commits style, such as feat: or fix:
Pull request :: link the issue, fill in the template, keep it to one topic
Review :: at least one maintainer approval and green CI
Merge :: squash merge; the branch is deleted afterwards
```

Contributions follow the [Contributor Covenant 2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) code of conduct.

**Sign-off and licence agreements.** No dtwin repository asks you to sign a contributor licence agreement (CLA). bitg uses the Developer Certificate of Origin instead: each commit ends with a `Signed-off-by:` line (`git commit -s`), and a CI check blocks pull requests where it is missing. What you contribute is released under the repository's licence; for bitg that is MIT OR Apache-2.0. Other repositories do not currently require sign-off.

**Good places to start.** bitg welcomes word-list fixes and bug reports with the exact text you typed and the app you typed it in. Its own [CONTRIBUTING.md](https://github.com/dtwinuz/bitg/blob/main/CONTRIBUTING.md) and [GOVERNANCE.md](https://github.com/dtwinuz/bitg/blob/main/GOVERNANCE.md) describe how changes are reviewed, who maintains the project and how someone becomes a maintainer.

## Security reports

Do not report vulnerabilities in public issues, pull requests or discussions. Every public repository listed above has GitHub private vulnerability reporting turned on: open the repository's Security tab and choose "Report a vulnerability". For private repositories and live sites, see our [security policy](/security/) for the private channel, response times and what to include.

## Changes to this policy

Changes to this page are made in a pull request and get a new updated date. The list of public repositories is re-checked whenever the page changes.
