---
updated: 2026-11-13
summary: "What wonmor.io collects when you visit (very little), where it is kept, for how long, and what it never does."
---

## The short version

wonmor.io is a static website. It has no accounts, no forms, no comments and no newsletter, so it never asks you for personal information. It sets no cookies, runs no analytics scripts or third-party trackers, shows no ads and loads nothing from other servers. The only record of your visit is the standard request log kept by the web server, described below.

This notice covers wonmor.io only. The products linked from it, such as dtwin.uz or bitg.uz, are separate sites with their own privacy policies.

## What the site does not do

These points are not just promises; the site's security policy (Content-Security-Policy) tells your browser to block anything else:

- **No cookies.** The site does not set any.
- **No analytics or tracking scripts**, from us or anyone else. There is no advertising and no social-media embed.
- **No external requests.** Scripts, fonts, images, the brand film and the search index are all served from wonmor.io itself. Your browser is told not to load scripts, styles, fonts, media or data from any other address.
- **No camera, microphone or location.** The site asks your browser to deny these permissions outright.

## What your browser stores

One small value. The first time you open a page in a browser tab, the Wonmor logo plays a short opening animation. To avoid replaying it on every page, the site writes the key `wm-intro` with the value `1` to your browser's session storage. It contains nothing about you, never leaves your device and is deleted when you close the tab. If your browser blocks storage, the animation simply plays again.

## Search

Site search runs in your browser. The search index is a set of static files downloaded from wonmor.io; matching happens on your device and your query is never sent to a search service.

One detail: if you type in the search box in the header and press Enter, your browser opens the search page with your words in its address (for example `/search/?q=bitg`). Like every page address, that request appears in the server log described below. Typing on the search page itself sends no further requests.

## Server logs

The site runs behind a web server that keeps a technical log of each request, as almost every website does. For each request it records:

| Recorded | Why |
|---|---|
| Your IP address | Abuse prevention and troubleshooting |
| Date and time | Ordering events, finding faults |
| The page address requested and the response status | Finding broken links and errors |
| The referring page, if your browser sends one | Understanding how people arrive |
| Your browser's user-agent string | Telling real browsers from bots |

Long random-looking strings in addresses and referrers are masked before they are written, and cookie and authorization headers are redacted. The log is rotated and each file is deleted after **30 days** at the latest.

We use these logs for three things: keeping the site secure, fixing problems, and counting visits in aggregate (how many people read which page). We do not sell them, do not combine them with other data to identify you, and do not share them with anyone, unless the law requires it.

## Leaving the site

Links to products, GitHub, Telegram and other sites take you to services with their own policies. When you follow a link, your browser tells the next site only that you came from wonmor.io, not which page you were on.

## Questions and changes

For any privacy question, including a question about log entries that might concern you, write on Telegram: [t.me/xnosir](https://t.me/xnosir). Logs older than 30 days no longer exist, so there is nothing older to look up.

If this notice changes, the date at the top changes with it. Wonmor is run by its founder and has no legal entity yet; when one exists, this notice will name it.
