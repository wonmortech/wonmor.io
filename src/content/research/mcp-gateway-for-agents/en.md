---
title: "An MCP gateway for AI agents: tokens, masking, audit, kill-switch"
description: "We put one gateway between coding agents and internal systems. Each agent gets its own token and allowlist, every result is masked before it leaves, every call is audited, and one button stops everything."
date: 2026-11-02
kind: research
area: agents
featured: true
source:
  - "dtwinuz/gateway: README, gateway/server.mjs, connector/connector.mjs (private repository)"
  - "dtwinuz/gateway git history: v0.1.0 to v0.2.0 and alerts, 2026-11-02 to 2026-11-03"
  - "https://modelcontextprotocol.io/specification"
reproduce:
  note: "The gateway repository is private; these public tools let you inspect any MCP server, including one you place behind your own gateway."
  commands:
    - "npx @modelcontextprotocol/inspector"
    - "claude mcp add --transport http my-gateway https://example.com/mcp --header \"Authorization: Bearer <agent-token>\""
---

Coding agents become far more useful when they can read the systems a team actually works in: an issue tracker, a git server, a SQL database. The usual way to get there is to paste credentials into each agent's configuration. That works until you ask four questions. Which agent read what? Did a phone number or a national ID end up in a model's context? Can one agent be stopped without stopping all of them? Where do the database passwords live?

We built a small gateway to answer those questions in one place. It speaks the [Model Context Protocol](https://modelcontextprotocol.io/specification) to agents on one side and to "connectors" on the other. This post describes its design as of version 0.2.0, which we shipped on 2 November 2026, and what we learned building it.

## Shape of the system

There are three parts:

- **The gateway**: one Node.js process, about 950 lines, with no npm dependencies (only `node:http`, `node:fs` and `node:crypto`). It exposes a single MCP endpoint, keeps the agent registry, applies policy and masking, and writes the audit log.
- **Connectors**: small MCP servers that sit next to the systems they reach. A connector holds that system's credentials, listens only on localhost, and is published to the gateway through a reverse tunnel. It accepts a request only if the bearer secret matches, using a constant-time comparison.
- **An admin panel**: a web page fed by server-sent events. It shows calls as they happen, the agent list, connector health, and the kill-switch.

The key property is that **the gateway holds no secrets of the connected systems**. If the gateway host were compromised, the attacker would get agent token hashes and an audit log, not database passwords. The connectors aggregate tools under a prefix, so an agent sees `<connector>-sql_query` rather than a raw database.

```steps
Request :: The agent calls a tool on the gateway with its personal token.
Policy :: The gateway checks kill-switch, pause, allowlist, argument rules and rate limit, in that order.
Connector :: The call goes through the tunnel to a connector that holds the real credentials.
Mask :: Personal data in the result is masked before anything leaves the gateway.
Audit :: The masked request and response are written to the log and pushed to the live panel.
```

## Identity and policy per agent

Every agent gets a personal token of the form `ag_<name>_<32 random characters>`. It is shown once, and the server stores only its SHA-256 hash. Twenty failed attempts from one address block that address for ten minutes, for agents and for the admin login alike.

Policy is attached to the agent, not to the connector:

- **Tool allowlist** with wildcards (`*`, `<connector>-*`, or one exact tool). A tool that is not allowed is removed from `tools/list`, so the model never sees it, and it is refused if called anyway.
- **Rate limit** in calls per minute (default 30, adjustable from 1 to 600).
- **Expiry date** and an optional **IP allowlist**.
- **Argument allowlist**. For example, a database argument can be limited to one named database. The gateway also narrows the tool's JSON schema in `tools/list` to that enum, so the model does not waste a call guessing.
- **Pause** for one agent, **disable** for one connector, and the global **kill-switch**.

The order of checks matters, because each refusal is logged with a status code (`killed`, `paused`, `unknown`, `denied`, `arg`, `rate`, `expired`, `ip`). The simplified flow from `callTool` looks like this:

```js
if (state.killed) return deny("kill-switch", "killed");
if (agent.paused) return deny("agent paused", "paused");
const hit = catalog().find((t) => t.full === name);
if (!hit) return deny("unknown tool", "unknown");
if (!toolAllowed(agent, name)) return deny("not allowed", "denied");
if (argViolation(agent, hit.tool, args)) return deny("argument not allowed", "arg");
if (overRate(agent.name, agent.rpm || 30)) return deny("rate limit", "rate");
const result = scrubResult(await connector.call(hit.tool.name, args));
```

Every tool the gateway re-exports is marked `readOnlyHint: true`. That hint is only advisory in MCP, so it is backed by the connectors: the SQL tool accepts only one `SELECT` or `WITH` statement, rejects `INTO`, `EXEC`, system procedures, `OPENROWSET`, `WAITFOR` and statement separators, runs inside a `READ UNCOMMITTED` transaction with a lock timeout, and **always rolls back**. It returns at most 200 rows with a 30-second timeout. For the most sensitive environments, the connector also uses a database login that is read-only at the database level. A keyword guard alone is never enough, so the transaction and the login are separate layers.

## Masking: regex is not enough

Results are masked before they reach the agent: national ID numbers, passport numbers, phone numbers, email addresses, card numbers, and anything that looks like a secret (JWTs, common token prefixes, `password=` pairs). The rules run with secrets first, so a token is not half-eaten by a digit rule. Each rule keeps a small, useful part of the value. A card keeps its last four digits, and an email keeps its first letter and domain.

The first version used only regular expressions, and we hit their limit quickly. A phone number stored as nine bare digits looks exactly like a nine-digit company tax ID. No regex can tell them apart, and masking every nine-digit number would destroy useful data. The fix was **column-aware masking**. The SQL connector returns Markdown tables, so the gateway reads the header row. A value under a column named like `Phone`, `MobilePhone`, `Email`, `Passport` or `Password` is masked whatever its shape.

Administrators can add their own masks, either as a regex or as a column-name pattern. Two validations proved necessary. Patterns with nested quantifiers such as `(a+)+` are rejected because of catastrophic backtracking. Patterns that match the empty string are also rejected, because they would mask everything.

Masking can be switched off per category, for example while debugging. When it is off, every audit entry records which categories were off at that moment, so a later reader can tell a masked log from an unmasked one.

## Audit, live view and alerts

Version 0.1.0 logged who called what and how long it took, but not what came back. That turned out to be the wrong trade-off: when a result looked wrong, there was nothing to inspect. Version 0.2.0, the same day, stores up to 16 KB of request arguments and up to 64 KB of the response exactly as the agent saw it, already masked. The log is JSONL, one file per day, kept for 30 days. An in-memory ring holds the last 5,000 entries for the panel.

The panel shows each call as a "start" and "end" event, so a slow query is visible while it runs. Admin actions such as pausing an agent, changing masks or pressing the kill-switch are logged too, as `type: admin`. Each MCP session ID is stored with the call, so one agent conversation can be filtered out of a busy log.

Alerts go to a chat channel: kill-switch on and off, masks switched off, a connector going down or coming back, failed logins, bursts of calls and unusually large result sets. Two details keep them useful. A connector is reported down only after **two failed health checks in a row**, so one network blip stays quiet. And each alert key is throttled to once per **10 minutes**.

## What we learned

- **Put the policy where the identity is.** Tying rules to agents rather than to systems made "this agent can read the tracker but not the database" a single setting.
- **Hide what is not allowed.** Removing disallowed tools from `tools/list`, and narrowing argument enums, cut wasted calls more than error messages did. A model cannot misuse a tool it has never seen.
- **Log what the agent saw, not what the system returned.** Storing the masked response means the audit log does not become a second copy of the personal data.
- **Make the stop button boring.** The kill-switch is one boolean checked before everything else. It empties `tools/list` and refuses calls with a clear reason, so agents stop politely instead of retrying.

## Limitations

- Masking is pattern-based. Personal names are not detected, and the README says so plainly. Free-text fields can still carry personal data in forms no rule anticipates.
- Read-only is the only mode. There is no write path, and adding one would need a different approval model.
- A connector that runs on a workstation is only available while that machine is on.
- The rate limit and failure counters live in memory, so they reset when the process restarts. That is acceptable for one instance, but not for a cluster.
- We have not measured masking precision and recall on a labelled dataset, so we cannot quote an accuracy figure.
