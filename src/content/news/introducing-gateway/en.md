---
title: Introducing Gateway, a control plane for AI agents
description: Gateway sits between AI agents and internal systems. Every agent gets its own token, its own list of allowed tools and a full audit trail, and personal data is masked before it reaches the model.
date: 2026-11-02
category: product
product: gateway
featured: true
links:
  - { label: Product, text: gateway.dtwin.uz, href: "https://gateway.dtwin.uz", kind: external }
  - { label: Overview, text: Gateway, href: "/products/gateway/", kind: internal }
source:
  - "https://gateway.dtwin.uz"
  - "dtwinuz/gateway"
  - "dtwinuz/dtwin #306"
---

AI agents are most useful when they can read real systems — the issue tracker, the code host, the database. They are also hardest to trust there. Gateway is the single door we put in front of those systems. It went live at gateway.dtwin.uz on November 2, 2026, and version 0.2.0 followed the same night.

## What it controls

Gateway speaks MCP over HTTP, so any agent that supports remote MCP servers can connect with one URL and a token. Behind that URL:

- **One token per agent.** Tokens are stored only as hashes, can expire, and can be limited to a list of IP addresses.
- **Allowlists.** Each agent sees only the tools it is allowed to use, and arguments can be narrowed too — an agent limited to the staging database will not even see production as an option.
- **Rate limits, pause and a kill switch.** Requests per minute are capped per agent; one agent can be paused, or every agent stopped at once.
- **Masking.** Personal data such as identity numbers, phone numbers, emails, card numbers and tokens is masked in responses — by column name or by a regular expression you can test in the settings.

## What it records

Every call is written to an audit log: the request, the masked response and any action an administrator takes. The admin panel shows calls as they happen, and in 0.2.0 it has six tabs — overview, audit, agents, connectors, a playground and settings. Rules can send alerts to Telegram.

## Reaching private systems

The first connectors read from Jira, GitLab and SQL databases, and they are read-only by design: SQL queries pass a guard and every transaction is rolled back. A connector can run inside a private network and reach Gateway through our Tunnel, so internal systems never need to be exposed to the internet.
