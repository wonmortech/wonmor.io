---
title: One support desk for every product
description: The in-app help desk we built for dtwin now serves every site in the ecosystem. One script tag adds it; every message reaches the same inbox, and any ticket can become a GitHub issue in the right repository.
date: 2026-11-02
category: product
links:
  - { label: Product, text: dtwin.uz, href: "https://dtwin.uz", kind: external }
  - { label: Running on, text: shop.dtwin.uz, href: "https://shop.dtwin.uz", kind: external }
source:
  - "dtwinuz/dtwin #168"
  - "dtwinuz/dtwin #227"
---

On October 30, 2026, dtwin got a help desk inside the app. A person describes a problem and attaches screenshots; the message arrives in Telegram; the reply typed there goes straight back to their open window, live. One button turns the conversation into a GitHub issue, with the images, the context and the replies attached.

It worked well enough that we wanted it on every other site too. Copying it into each project would have meant six help desks to maintain, so on November 2, 2026, we turned dtwin's support into a hub instead.

## How the hub works

- **Projects are configuration.** Each project is one entry with a name, a repository and the web origins it may be embedded on. Adding a project does not need new code.
- **Guests can write in.** Visitors without a dtwin account can open a ticket. They get a ticket key that is stored only as a hash.
- **Strict origins.** The hub answers only the origins listed for a project. A request from an unknown site, or with another project's ticket key, is refused.
- **One inbox.** Every ticket arrives in the same Telegram chat, labelled with its project, and the issue button opens the issue in that project's own repository.

## One script tag

Each site adds a single line:

```html
<script src="https://dtwin.uz/support/widget.js" data-project="shop" defer></script>
```

The widget is plain JavaScript inside a Shadow DOM, so it cannot clash with the host page's styles or scripts. On phones the launcher moves above the site's tab bar instead of covering it.

By the end of November 2, it was running on six sites, including shop, gym, med and TeleTwin.
