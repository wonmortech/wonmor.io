---
title: "A personal life OS with an MCP server"
description: "dtwin plans the day around the five daily prayers and exposes it to AI assistants through MCP. How a 10-tool connector grew to 96 tools without giving the model the keys to everything."
date: 2026-10-26
kind: research
area: faith-society
featured: false
source:
  - "dtwinuz/dtwin README and backend source on main, read 2026-11-13 (private repository)"
  - "dtwinuz/dtwin PR #9 (MCP life tools, 2026-10-26), PR #26 (consent center and optional life areas, 2026-10-26), PR #36 (fail-closed area gate, 2026-10-26), PR #135 (docs from code, 2026-10-27)"
  - "https://modelcontextprotocol.io/specification"
  - "https://github.com/modelcontextprotocol/csharp-sdk"
reproduce:
  note: "The dtwin repository is private; the inspector lets you connect to any MCP server and check which tools it lists and how it annotates them."
  commands:
    - "npx @modelcontextprotocol/inspector"
---

dtwin ("digital twin") is a personal planning app built around one idea: a Muslim user's day already has a structure, the five daily prayers, so the plan should hang on it. Tasks are placed relative to a prayer ("20 minutes after Dhuhr"), and the day runs from Maghrib to Maghrib, following the Islamic day. Around that core sit optional life areas: worship, body, money, people, growth and mind.

Typing into the app is not where the effort should go. Input comes from the web app, a Telegram bot, voice, links, a browser extension and email. Analysis and planning come from whatever AI assistant the user already uses, connected through the [Model Context Protocol](https://modelcontextprotocol.io/specification). This post is about that MCP server: how it grew, and the rules that keep it safe for very personal data.

## From 10 tools to 96

The MCP server lives inside the main .NET 10 API, built on the official C# SDK in stateless mode at `/mcp`. Two kinds of clients connect to it. Developer tools use a personal access token. Hosted assistants such as claude.ai and ChatGPT cannot send custom headers, so the server also implements OAuth 2.1 with dynamic client registration, PKCE (S256) and refresh-token rotation.

The tool count tells the story of the project:

| Date | Tools | What changed |
|---|---|---|
| 2026-10-26 | 10 | First hosted-assistant connection: 6 read tools, 4 write tools |
| 2026-10-26 | 19 | A same-day review pass added habit edits, inbox status and reminders |
| 2026-10-27 | 91 | Eight life areas merged; the docs were regenerated from code |
| 2026-11-13 | 96 | 20 tool classes and 10 prompts on main; production runs 91 until the next deploy |

Counting turned out to be a small lesson of its own. A naive search for the tool attribute also matches the class-level attribute and overcounts: it found 110 where the real number was 91. The reliable count is the number of distinct `Name =` values on tool methods. We now count that way and keep the README in sync with the code.

Of the 96 tools, 50 are annotated read-only. None is marked destructive, because **nothing can be deleted over MCP**. The 10 prompts are workflows rather than data access: a morning plan, a weekly review, a year review, finding neglected goals, an evening self-reckoning (*muhasaba*), and similar.

One tool sets the tone for every conversation. `get_context` is described to the model as "call this FIRST". It returns local time, the current dtwin day, the main focus, yesterday's score, stale tasks, preferences the user has **confirmed**, and only those profile sections the user shares with AI. The model starts each conversation from the user's own framing, not from a blank page.

## The gate: consent, life areas, fail-closed

Every tool class must declare exactly one of two attributes: `[CoreTools]` (always on) or `[LifeArea(...)]` (belongs to one optional area). A request filter does the rest:

```steps
Consent :: No AI consent recorded means no tools are listed and no calls are accepted.
Area :: A tool from a life area the user has switched off is hidden from tools/list and refused if called.
Special data :: Writes to worship and health records also require acceptance of the current privacy policy.
Write :: The feature service saves the change, and an interceptor records before and after snapshots.
Undo :: The user can see what the AI changed and revert it from the web app.
```

The first version of this gate failed open. A tool class with neither attribute was treated as core and always shown. The fix made the gate **fail closed**: at startup, a class with zero or two attributes throws, and the server refuses to start with no tool classes found. A forgotten attribute becomes a crash in development instead of a quietly exposed tool in production.

The reason for this machinery is practical. The same backend serves the web app, the bot and MCP, and the business rules live in feature services, not in the MCP layer. So "the AI can write a habit" means exactly the same validation as "the user tapped a button", and it stays true as features change.

## Worship data and privacy

Prayer and health records are the most sensitive data in the app. The design treats them that way:

- **No rulings of our own.** dtwin does not issue religious rulings. Prayer times are calculated on the server from a published formula and checked against a reference timetable. Other questions are left to qualified scholars.
- **Prayers are built in.** The model is told never to create activities for the five daily prayers. It may only record how a prayer was performed, through `log_prayer`, for the current dtwin day or the one before. Worship is not turned into a to-do list.
- **Separate consent.** Writing worship or health records requires the user to have accepted the current privacy policy version. Without it, the tool answers that nothing was saved and tells the user where to give consent.
- **Write-only journal.** `add_journal_entry` lets the assistant write an entry in the user's own words, but entries cannot be read back over MCP. Journal and note text is never sent to AI.
- **Areas can be closed to AI.** A user can keep a whole life area, or any profile section, private. Closed areas disappear from the tool list, not just from the answers.

## What the work taught us

- **Annotate honestly.** Read-only and idempotent hints let clients ask for confirmation in the right places. Wrong hints are worse than none.
- **Describe tools for the model, not for developers.** The best results came from descriptions that state constraints in plain language: "only today or yesterday", "2 freezes per calendar month, ask the user before spending one", "never invent events".
- **Put undo in the data layer.** Because every AI write passes through a database interceptor, undo works for all tools, including ones added later, with no per-tool code.

## Limitations

- dtwin is in beta, and sign-up is by invitation. We have no usage figures that would be meaningful to publish.
- Production lags main by one tool class (91 tools against 96) until the next deploy.
- Some integrations are code-complete but not fully tested in production: voice transcription quality in Uzbek, calendar sync, and the in-bot assistant that uses the user's own API key.
- The gate controls which tools a model can use. It cannot control what a hosted assistant does with data after a read tool returns it, so we limit what read tools return in the first place.
