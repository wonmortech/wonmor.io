---
title: Introducing wonmor.io
description: Wonmor now has a home of its own — a studio site in three languages for our products, research and news, opened by a short brand film.
date: 2026-11-13
category: company
featured: true
links:
  - { label: Site, text: wonmor.io, href: "https://wonmor.io", kind: external }
  - { label: Products, text: All products, href: "/products/", kind: internal }
source:
  - "https://wonmor.io"
  - "dtwinuz/wonmor #4"
---

Wonmor is an independent, self-funded studio from Uzbekistan. It builds and supports the dtwin ecosystem: dtwin.uz, bitg, TeleTwin, Gateway, Tunnel, Fam and a handful of smaller experiments. Until November 13, 2026, those products lived on their own subdomains with nothing tying them together. wonmor.io is that missing place.

## What is on the site

- **News** — dated posts like this one. Every post lists its sources, and anything that has not happened yet is labelled as planned.
- **Products** — one page per product, with links to the live service and, where the code is public, the repository.
- **Research and engineering** — longer write-ups of what we learn while building.

The site is static, built with Astro, and available in English, Uzbek and Russian. It is deployed to the same edge as our other sites, using the release-and-switch flow that keeps downloads running through a deploy.

## The film

The homepage opens with a 19.4-second brand film. Its story is the mark itself: one diamond becomes a V, and the V splits in two to become a W.

The film is rendered ahead of time rather than animated live in the browser. A single timeline file is the source of truth: it drives the browser capture, the After Effects export and the Blender scenes, so the three never drift apart. Every cut is snapped to a frame boundary — without that, motion-blur sub-frames mixed two neighbouring scenes into one.

We will keep adding to wonmor.io as the work continues. New posts will appear here first.
