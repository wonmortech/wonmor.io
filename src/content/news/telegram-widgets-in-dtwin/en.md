---
title: Telegram widgets, now inside dtwin
description: The dtwin bot now sends live HTML widgets in chat, built on the widgets added in Telegram Bot API 10.4. The first two are /osmon and /tasbih.
date: 2026-11-10
category: product
product: dtwin
links:
  - { label: Product, text: dtwin.uz, href: "https://dtwin.uz", kind: external }
  - { label: Documentation, text: Telegram widgets, href: "https://core.telegram.org/bots/widgets", kind: external }
source:
  - "dtwinuz/dtwin #327"
  - "dtwinuz/dtwin #329"
  - "https://core.telegram.org/bots/widgets"
---

Telegram Bot API 10.4 lets a bot send a small HTML page as a message — a widget that draws itself in the chat and can be updated later. On November 10, 2026, the dtwin bot started sending two of them:

- **/osmon** — a view of the sky.
- **/tasbih** — a counter for dhikr that lives inside the conversation.

Both use dtwin's own colours, radii and type, so a widget looks like part of the product rather than a generic card. We confirmed in production that sending a widget and updating its data both work in private chats.

## Working inside the limits

Widgets are deliberately small. The HTML must fit in 4,096 bytes after zlib compression, the state in 1,024 bytes, and a widget has no network access, no text input and no photos.

There is one limit the documentation does not make obvious. If more than sixteen "heavy" boxes are being painted at once — anything with opacity below one, a filter or a blurred shadow, including pseudo-elements — Telegram stops the widget. Animating a list of cells from transparent is enough to trigger it. We now animate with `transform` only.

## How we test them

A browser preview is not enough. Every widget is run in Telegram's official widget sandbox before it ships, which reports whether it stopped, the peak count of heavy boxes and the final height. We also replay taps in the sandbox, because some problems only appear after an interaction.

One bug came from our own code. Short IDs shown on a card were the first eight characters of a UUIDv7 — which are the timestamp, so records created in the same minute collided and a tap could land on the wrong row. The fix, shipped the same evening, takes the last eight characters instead.
