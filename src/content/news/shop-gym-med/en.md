---
title: "Three new experiments: shop, gym and med"
description: Three front-end prototypes went live on dtwin subdomains on the same day — a marketplace for Instagram clothing stores, a workout tracker and a study aid for general medicine.
date: 2026-10-30
category: product
links:
  - { label: Try, text: shop.dtwin.uz, href: "https://shop.dtwin.uz", kind: external }
  - { label: Try, text: gym.dtwin.uz, href: "https://gym.dtwin.uz", kind: external }
  - { label: Try, text: med.dtwin.uz, href: "https://med.dtwin.uz", kind: external }
source:
  - "https://github.com/dtwinuz/gym-dtwin"
  - "dtwinuz/dtwin #163"
---

On October 30, 2026, three new sites appeared next to dtwin.uz. They are experiments, not finished products: each is a front end built with React 19 and TypeScript, running on mock data stored in the browser, with no back end yet. We put them online to see whether the ideas hold up in front of real people before building more.

## The three

- **shop.dtwin.uz** — a marketplace prototype for clothing stores that sell through Instagram, with three.js scenes in the interface.
- **gym.dtwin.uz** — a workout tracker. It has four starter plans, a library of 29 exercises, set logging with a 90-second rest timer, personal records, a training heatmap, an estimated one-rep maximum using the Epley formula, and bodyweight tracking. Its structure follows the open-source openGym project; none of openGym's code or media was copied.
- **med.dtwin.uz** — a study aid for general medicine: 11 topics across five specialties, clinical standards, a pharmacology section that deliberately leaves out dosages, practice exams and search. The content is demonstration material, not medical advice.

gym and med are available in Uzbek, Russian and English.

## What comes with each

Each site has two short presentations linked from its home page: one with the research behind the idea and one with the concept, both ending in a 3D scene. They are there so that anyone looking at a prototype can see why it exists and where it might go.

The gym project is public on GitHub. All three sites run as small static containers on the same edge as dtwin.uz.
