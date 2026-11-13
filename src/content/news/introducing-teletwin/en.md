---
title: "TeleTwin: a company layer for Telegram"
description: TeleTwin keeps personal chats where they are and adds company chats and announcements that live on the company's own server. When an employee's access is revoked, they are signed out of the company side within seconds.
date: 2026-10-29
category: product
product: teletwin
links:
  - { label: Product, text: tele.dtwin.uz, href: "https://tele.dtwin.uz", kind: external }
  - { label: Source, text: teletwin-web, href: "https://github.com/dtwinuz/teletwin-web", kind: external }
source:
  - "https://github.com/dtwinuz/teletwin-web"
  - "https://tele.dtwin.uz"
---

For teams that work in Telegram, work chats sit right next to family and personal ones. The trouble starts when someone leaves: work conversations live in a personal account the company does not control. TeleTwin is our answer. It was started on October 29, 2026.

TeleTwin is an independent project and is not affiliated with Telegram.

## How it works

TeleTwin builds on the open-source Telegram clients. Personal chats stay on Telegram, untouched. Company chats and announcements live on a separate server that the company runs, and they appear alongside personal chats in a "Company" folder.

When an administrator revokes an employee's access, the server closes that person's connection and the client signs out of the company side. In an end-to-end test over the internet, the connection dropped about a second after the revoke. Guards in the client keep company messages from being sent to Telegram by accident — in sending, typing indicators, link previews and history.

## What shipped

- A desktop client based on Telegram Desktop; its Windows build was completed on October 29.
- A web client based on Telegram Web A, which is open source on GitHub and also packaged as a desktop app.
- A company server with files, replies, edits, deletions, reactions, pins, read receipts and typing indicators, followed the same evening by direct messages, threads, mentions, scheduled messages, polls, presence, incoming webhooks and search.

Everything is available at tele.dtwin.uz. Voice and video calls were the next stage: the server side for calls was added on November 1 and stays switched off until a media server is configured.
