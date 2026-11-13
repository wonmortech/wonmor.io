---
title: Introducing Fam, self-hosted bug capture
description: Fam records what happened in the browser before a bug report — clicks, network, console — and keeps it on a server you control. It is live at fam.dtwin.uz.
date: 2026-11-11
category: product
product: fam
links:
  - { label: Product, text: fam.dtwin.uz, href: "https://fam.dtwin.uz", kind: external }
  - { label: Overview, text: Fam, href: "/products/fam/", kind: internal }
source:
  - "dtwinuz/fam"
  - "dtwinuz/dtwin #330"
---

A good bug report shows what the user did, what the page sent and what the console said in the moments before something broke. Hosted bug-capture tools do this well, but they keep the recordings on someone else's servers and connect only to cloud issue trackers. We needed one that runs on our own server and talks to self-managed Jira and GitLab. Fam started on November 11, 2026, and went live at fam.dtwin.uz the same day.

## How it captures

- **A rolling buffer.** Capture is built on rrweb and keeps only the last stretch of the session in memory. Nothing is uploaded until someone files a report.
- **Two ways in.** A JavaScript SDK (about 51 KB gzipped) can be added to any web app, and a Manifest V3 browser extension works on sites you cannot change.
- **Masking first.** Personal data is masked in the browser before it leaves the page, using presets for things like phone numbers and identity documents.

Reports open in a web viewer that lines up the replay with network requests and console output.

## Where reports go

The server is a single Node 24 process with no npm dependencies, storing data in the built-in SQLite module. A report can become an issue in Jira Server or Data Center, or in self-managed GitLab, be posted to Telegram, or be sent to any URL as a webhook signed with HMAC.

Fam also exposes an MCP endpoint with eight tools, so an AI agent working on a bug can read the report, the replay events and the failing requests directly instead of a screenshot.

## Still being checked

Tab video recording in the extension and screen recording in the SDK need a real browser session to test, and are still being verified by hand.
