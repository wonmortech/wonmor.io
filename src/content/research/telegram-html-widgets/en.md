---
title: "Telegram HTML widgets in production"
description: "What it took to ship two live HTML widgets in the dtwin Telegram bot: a 4 KB budget, a 1 KB state, a revision protocol between bot and chat, and a paint limit the documentation does not spell out."
date: 2026-11-10
kind: engineering
area: interfaces
featured: false
source:
  - "https://core.telegram.org/bots/widgets"
  - "https://core.telegram.org/bots/api"
  - "https://github.com/TelegramMessenger/widget-sandbox"
  - "dtwinuz/dtwin #327"
  - "dtwinuz/dtwin #329"
reproduce:
  note: "Check whether your own widget fits Telegram's budget: compress the HTML with zlib at level 9 and compare the result with 4,096 bytes."
  commands:
    - "python3 -c \"import sys,zlib;print(len(zlib.compress(open(sys.argv[1],'rb').read(),9)))\" widget.html"
    - "git clone https://github.com/TelegramMessenger/widget-sandbox"
---

Telegram Bot API 10.4 added a new kind of message: a small HTML page that a bot sends into a chat, where it draws itself, reacts to taps and can be updated later without sending a new message. On November 10, 2026, the dtwin bot started sending two of them. `/osmon` is a live sky card: the sun or moon moves along an arc, the sky changes colour with the time of day, and a countdown runs to the next prayer. `/tasbih` is a counter for dhikr that lives inside the conversation.

This post is about the engineering underneath: how to fit a useful interface into a few kilobytes, how a widget and a bot agree on state, and what we learned only by running the widgets in production.

```steps
Send :: The bot calls sendWidget with the HTML, an initial state and a plain-text caption as fallback.
Record :: The message is stored with its kind, a revision number and a hash of the state.
Ask :: When the widget becomes visible, and every 20 seconds while active, it asks the bot for fresh state.
Act :: A tap becomes a short request, which the bot applies through the same code path the app uses.
Write back :: If the state really changed, the bot answers the widget and writes the new state into the message.
```

## The budget

A widget lives under hard limits. Its HTML must fit in 4,096 bytes after zlib compression at level 9, the state attached to the message must fit in 1,024 bytes, and inside the widget there is no network access, no text input and no photos. Everything the widget shows has to be drawn from code and a kilobyte of JSON.

Both dtwin widgets are a single `<canvas>` and one script. At the time of the release the sky card compressed to 2,621 bytes and the tasbih to 1,616. Drawing on a canvas instead of building DOM elements was not just about size. It also turned out to protect us from a limit we describe below. The tasbih's 33 beads are radial gradients painted on one canvas, with depth faked by moving them along an ellipse and scaling them. Thirty-three DOM elements with transparency would have been a different story.

Each widget uses dtwin's own palette, radii and type. The tasbih, for example, is deep green with gold for the current bead and the progress ring. A widget should look like part of the product, not like a generic card dropped into a chat.

## A protocol for state

The widget cannot fetch anything itself. It can only send a short string to the bot, which answers with a short string. Telegram calls this a widget query. We kept the vocabulary tiny: `s` asks for the current state, `p:2` toggles the third prayer of the day, `z:17` adds seventeen counts to the tasbih.

Two problems appear as soon as state flows in both directions. Answers can arrive out of order, and the bot may answer many times with state that has not changed. We handle both with two fields:

- **A revision, `r`.** Every state the bot sends carries a number that only goes up: the current Unix time, or the last revision plus one if that would not be larger. The widget accepts an incoming state only if its revision is not older than the one it holds, so a slow answer can never roll the card back.
- **A hash.** The bot stores a SHA-256 hash of each state, computed with the revision zeroed out. If a new answer hashes the same as the stored one, the bot replies with the old revision and does not touch the message.

Only when the hash changes does the bot call `editMessageWidgetData`, so the state saved in the message, the one a reopened chat will show first, stays current without an edit on every poll. In outline:

```csharp
var state = data == "s" ? await widget.State(user, ct) : await widget.Apply(user, data, ct);
if (state.Hash() == row.StateHash)
    return (state with { R = row.Revision }).Json();          // nothing changed
state = state with { R = Math.Max(now, row.Revision + 1) };   // monotonic revision
// answer the widget, then editMessageWidgetData and store the new hash
```

Queries are accepted only from a private chat where the sender is the chat itself and the message belongs to that user. Anything else gets a generic failure answer. When a user has not yet given the consent dtwin requires for sensitive data, the widget gets a distinct code and can say so instead of failing silently.

## Taps that survive a bad connection

A tasbih is tapped quickly, hundreds of times, often on a phone with a patchy signal. Sending one request per tap would be wasteful and fragile. Instead the widget counts locally:

- each tap adds to a pending counter that is saved in the widget's `localStorage`, so a closed chat does not lose it;
- pending counts are flushed as one `z:<n>` request, at most 500 at a time, no more often than every five seconds while tapping and every six seconds while the widget is active;
- the pending count is subtracted only after the bot answers with a valid state; on failure it simply stays pending.

Light haptic feedback on each tap and a success pattern with a ripple at every 33rd make it feel like a physical tasbih. On the server, the batched count goes into the same dhikr log the app uses.

The sky card goes further in reusing existing code. Tapping a prayer point calls exactly the same function as ticking that prayer in the app's Today view. The widget is a new surface, not a second implementation. The day boundary is the same too: the card's date changes at maghrib, like the rest of dtwin.

## What production taught us

**Older clients need a caption.** A client that does not support widgets shows "unsupported media" plus the caption, so the caption carries the full text of the card. If `sendWidget` itself fails, the bot falls back to an ordinary message. Widgets also only work in private chats with the bot, which we confirmed in production for both sending and updating.

**There is a paint limit.** If more than sixteen "heavy" boxes are being painted at once (anything with opacity below one, a CSS filter or a blurred shadow, pseudo-elements and transitions included), Telegram stops the widget. Nothing in a desktop browser preview warns you. Animating a grid of cells in from transparent is enough to trigger it. Our rule now: animate lists and cells with `transform` only, and keep effects on a canvas.

**A browser preview is not a test.** Before release, every widget runs in Telegram's official widget sandbox, which reports whether the widget stopped, the peak number of heavy boxes and the final height. We also replay taps there, because some failures only appear after an interaction: a dimmed state that pushes the heavy-box count over the limit, or a burst of taps that exceeds the per-task canvas command budget.

**Short IDs need the random part.** Later dtwin cards put an eight-character ID for each row into their state so a tap can name the row. The first version took the first eight hex characters of a UUIDv7, which are the timestamp, so rows created within about a minute collided and a tap could land on the wrong one. The fix, shipped the same evening in #329, takes the last eight characters and refuses ambiguous matches.

## Limitations

- Widgets work only in a private chat with the bot, not in groups.
- The table that maps sent messages to their state was not cleaned up at release; old rows simply accumulate until a cleanup job exists.
- Everything a widget shows must be computed on the server and fit in 1,024 bytes of JSON, which rules out long lists and history inside the card.
