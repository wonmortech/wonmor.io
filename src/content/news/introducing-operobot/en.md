---
title: "operobot: an outbound call assistant built for Uzbek rules"
description: operobot calls a list of contacts, connects interested people to a human operator and keeps to Uzbekistan's calling rules in code. A multi-tenant demo lets anyone try it in a private sandbox.
date: 2026-11-04
category: product
product: operobot
links:
  - { label: Demo, text: operobot2.dtwin.uz, href: "https://operobot2.dtwin.uz", kind: external }
  - { label: Site, text: operobot.dtwin.uz, href: "https://operobot.dtwin.uz", kind: external }
  - { label: Source, text: GitHub, href: "https://github.com/dtwinuz/operobot2", kind: external }
source:
  - "https://github.com/dtwinuz/operobot2"
  - "dtwinuz/dtwin #312"
  - "dtwinuz/dtwin #315"
---

Outbound calling looks simple: take a list, dial each number, play a message, pass interested people to a person. In Uzbekistan it comes with rules, and we wanted those rules in the code rather than in a manual. operobot was started on November 4, 2026.

## The rules, enforced

- **Working hours.** From November 1, 2026, promotional calls may only be made between 09:00 and 18:00. operobot's call queue will not dial outside that window; only the demo mode can bypass it.
- **Local caller ID.** Calls showing a +998 number but arriving over an international route are blocked, so operobot is designed to use a local telephone line only.
- **Data stays in the country.** Because of data-localisation law, the system is designed to run on servers in Uzbekistan.

## What it does

The dialer drives Asterisk through its REST interface. A contact list comes from a spreadsheet; a person who presses 1 is connected to an operator. Around that core, the same day brought an AI voice agent (speech recognition, a language model and speech synthesis in one loop), short AI summaries of each call, call transcripts, a Kanban board for leads, follow-up SMS and reminders, a report of the best hours to call, and MCP tools for AI agents.

## Try it

On November 5, 2026, a multi-tenant version went live as a demo at operobot2.dtwin.uz. Every visitor gets a private sandbox organisation that is deleted after 24 hours. Tenant data is separated by row-level security in PostgreSQL, and calls in the demo are simulated. In a real organisation the 09:00–18:00 lock applies and a connected dialer is required.

operobot has not yet run against a live telephone line. That, real voice recordings and pricing are the next steps.
