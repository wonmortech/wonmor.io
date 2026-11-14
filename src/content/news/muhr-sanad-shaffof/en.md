---
title: "Muhr, Sanad and Shaffof: three planned proof tools, no tokens"
description: We published the plans, research and home pages of three open tools that prove when a file existed, whether a certificate is genuine and whether a charity report was changed. None is released yet; each has a working demo in the browser.
date: 2026-11-13
category: research
links:
  - { label: Muhr, text: muhr.wonmor.io, href: "https://muhr.wonmor.io", kind: external }
  - { label: Sanad, text: sanad.wonmor.io, href: "https://sanad.wonmor.io", kind: external }
  - { label: Shaffof, text: shaffof.wonmor.io, href: "https://shaffof.wonmor.io", kind: external }
source:
  - "https://github.com/wonmortech/muhr"
  - "https://github.com/wonmortech/sanad"
  - "https://github.com/wonmortech/shaffof"
---

Our research on digital assets asked whether a community app should have a token. The answer stayed no. What we did keep from that technology is narrower and more useful: a way to prove something about a file without trusting one website. On November 13, 2026 we opened three repositories built on that idea, under the Apache-2.0 licence, in the [wonmortech](https://github.com/wonmortech) organization.

**All three are planned. No product is released yet.** Each repository holds the research, a written plan and a home page with a demo that runs in your browser. The `v0.1.0` releases are signed, reproducible archives of those home pages, not of a product.

## Muhr: when did this file exist?

Muhr (Uzbek for “seal”) will bind the SHA-256 hash of a file — an EIMZO-signed document, a software release, an article — to Bitcoin through OpenTimestamps and to an open, append-only log. Only the hash leaves your device, and anyone can check the receipt offline, even if Muhr's server disappears. A proof shows that these exact bytes existed no later than a date. It does not show who wrote the file or whether it is true. The demo today hashes a file in the browser.

## Sanad: is this certificate genuine?

Forgers in Uzbekistan have already pointed fake QR codes at a lookalike "verification site". Sanad will issue course certificates and badges as W3C Verifiable Credentials 2.0, signed with the issuer's own key, so a check fails if one letter changes, wherever it runs. Verification will work offline, on a web page or through a Telegram bot. Sanad is for private issuers such as training centres. It does not replace or imitate state diplomas. The demo today signs and verifies in the browser.

## Shaffof: was this charity report changed?

Shaffof (“transparent”) will seal a fund's monthly income and spending into a Merkle root and timestamp it, so anyone can check that a published report was not edited later, and a donor can check that their own gift is included. It never collects or moves money, publishes no donor names and gives no religious rulings. Its zakat calculator will not be released until qualified scholars have reviewed its methods in writing.

## What none of them do

None of the three issues, sells, holds or sends crypto-assets, and none will ask for money, keys or seed phrases. Each repository has a public plan, a security policy and an OpenSSF Best Practices passing badge.
