---
title: dtwin.uz opens, with an MCP server for Claude
description: dtwin, a personal planner built around the day's prayers, is now live at dtwin.uz. It comes with an MCP server, so Claude can read your plans and add to them.
date: 2026-10-26
category: announcements
product: dtwin
links:
  - { label: Product, text: dtwin.uz, href: "https://dtwin.uz", kind: external }
  - { label: Overview, text: dtwin.uz/overview, href: "https://dtwin.uz/overview/", kind: external }
source:
  - "https://dtwin.uz"
  - "dtwinuz/dtwin #16"
---

On October 26, 2026, dtwin.uz went live. dtwin is a personal planner, habit tracker and notebook in which the day runs the way it does in the Islamic calendar — from Maghrib to Maghrib — and the five prayers anchor everything else. You can sign in with Google, GitHub or Telegram, and use it on the web, in the Telegram bot or as a Telegram Mini App, in Uzbek (Latin and Cyrillic), Russian or English.

## Claude can use it

dtwin has its own MCP server at `dtwin.uz/mcp`. It supports OAuth 2.1 with dynamic client registration, so it can be added to claude.ai as a connector without copying any keys; Claude Code can connect with a personal access key instead. On launch day the connector exposed six tools for reading and four for writing — enough to ask Claude what your day looks like and to have it place a task in the next free slot.

Worship data is treated as private. There are no prayer leaderboards, streak contests or feeds.

## Built in a day, in parallel

The same day, we built a large set of life-management features from a research list of 54 proposals. Eight agents worked in parallel, each in its own git worktree with its own database — habits, worship, growth, body, money, people, mind and platform — and their branches were merged in one integration pass with a single migration. It reached production that evening, after a fresh database backup.

More followed before midnight: a governor that limits how many notifications you get, a morning brief after Fajr, a summary of the day at Maghrib, goals and reviews, a health module for medications and appointments, and a place for personal documents with expiry reminders. By the next day the MCP server had grown to 91 tools.
