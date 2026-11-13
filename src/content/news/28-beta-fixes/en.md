---
title: 28 beta fixes in one release
description: The first beta testers of dtwin filed 28 issues about usability, accessibility and privacy. All 28 shipped together on October 27, 2026, with one database migration.
date: 2026-10-27
category: product
product: dtwin
links:
  - { label: Product, text: dtwin.uz, href: "https://dtwin.uz", kind: external }
  - { label: Overview, text: dtwin, href: "/products/dtwin/", kind: internal }
source:
  - "dtwinuz/dtwin #134"
---

dtwin's first beta testers filed 28 issues — numbers #55 to #82. Some were small, like a sign-in button that sat below the fold on phones. Others were about trust: notes were shared by default, and the numbers on the money and statistics pages did not agree with each other. We fixed all 28 in one pull request and shipped it on October 27, 2026.

## Private by default

- Notes are now private unless you choose to share them, and sharing is a separate, confirmed action with a preview.
- On the public "Now" page, worship is hidden by default, and each field has its own audience.
- Notification previews can hide their content.
- Body and wellbeing entries start out private, and insights from them are worded with care.

## Easier for everyone

- Animated counters announce their final value to screen readers.
- 3D charts and heatmaps have a text table next to them, states are marked with more than colour, and the camera stops moving when reduced motion is on.
- Inbox, notes and lists gained visible labels, named actions, undo after deleting and draft recovery.

## Numbers you can trust

- The review and money pages now take prayer counts and envelope status from one calculation, and show the period they cover.
- Choosing 7, 30 or 90 days on the statistics page now changes every chart and figure, and thin data is marked as such.
- Debts show when they are overdue, and a partial payment can be undone.
- The zakat calculator shows where its gold and silver prices come from and on what date, which nisab it uses, and a disclaimer.

The release needed a single migration, which only adds columns.
