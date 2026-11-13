---
title: "Multi-agent orchestration in practice"
description: "One orchestrator, three narrow roles, and isolated worktrees. What worked when eight agents built eight modules on one branch, and the failure modes we hit on the way."
date: 2026-10-26
kind: research
area: agents
featured: false
source:
  - "Agent role definitions in ~/.claude/agents (deep-reasoner, fast-worker, critic), 2026-07"
  - "dtwinuz/dtwin PR #16 (eight modules, merged 2026-10-26) and PR #38 (callback prefix fix, 2026-10-26)"
  - "dtwinuz/med-dtwin issues #57 to #99 (closed as not planned, 2026-11-02)"
  - "Internal engineering notes, 2026-07 to 2026-11"
reproduce:
  note: "The repositories are private; these commands set up the same isolation pattern (one worktree and branch per agent) in any git repository."
  commands:
    - "git worktree add ../app-habits -b life/habits"
    - "git worktree list"
    - "mkdir -p ~/.claude/agents"
---

Running several coding agents at once is easy to start and hard to finish. Speed is rarely the problem. The problem is what happens when their work meets: two agents edit the same file, one agent's script overwrites another's, or a resumed agent runs twice. This post covers the setup we settled on between July and November 2026, one concrete run where eight agents built eight modules of a personal app on one branch, and the failure modes we documented along the way.

## Three roles, not a swarm

We do not run a free-for-all of peer agents. One session is the **orchestrator**. It plans, decomposes, does the hard reasoning itself, and writes the risky code. Subagents exist for two reasons only: to keep the orchestrator's context small, and to get a view that is not anchored on its own. Each role is a short Markdown file with a tool list and a model setting.

| Role | Model | Tools | Contract |
|---|---|---|---|
| Deep reasoner | same as the session | read-only (Read, Grep, Glob, Bash) | Return **Verdict**, **Evidence** with `file:line`, **Risks/unknowns**, **Rejected alternatives**. Conclusions, not file dumps. |
| Fast worker | small, cheap model | full edit tools | Follow instructions literally. If anything is ambiguous or a precondition fails, **stop and report** instead of improving. |
| Critic | same as the session | read-only | Try to refute the artifact. Report only blocking or major findings, **at most five**, each with a concrete breaking scenario. If there are none, say so plainly. |

Two design choices came from experience. First, the deep reasoner runs on the same model as the orchestrator. The usual advice is to delegate thinking to a stronger model, but here the orchestrator is already the strongest one. The value of delegation is **context isolation and an independent second opinion**, not extra intelligence. Second, the critic's limits are part of its job description. An unbounded critic produces a long list of style comments that hide the one real bug, and "no significant findings" has to be a valid answer, or the critic will invent something.

## Case: eight agents, one branch

On 26 October 2026 we built a large batch of features for a personal life-planning app in one go. The features split into eight areas: habits, worship, growth, body, money, people, mind, and platform. The sequence:

```steps
Foundation :: The orchestrator commits shared contracts first: interfaces, registration by assembly scan, stub modules.
Isolate :: Each agent gets its own git worktree, branch, API and web port, and database.
Build :: Agents work in parallel against a written contract and are not allowed to create migrations.
Integrate :: The orchestrator merges the eight branches, fixes the seams, and generates one migration.
Ship :: One pull request, one review, one deploy, with a database backup taken first.
```

The **foundation commit** did most of the work of making parallelism safe. Before any agent started, the orchestrator added the extension points every module would need: interfaces for bot commands, text, media and button callbacks; one notifier that every reminder goes through; and MCP tool registration by scanning the assembly, so a new tool class needs no central edit. Each area also got a stub module. With that in place, an agent could add a whole feature without touching a file another agent owned.

The **contract** was a short shared document listing ports, database names, run scripts and the rules. One rule was decisive: agents do not create database migrations. Eight agents each generating a migration against the same model snapshot would conflict on merge. Instead, the orchestrator merged all eight branches, wrote one integration commit, and generated a single migration from the combined model. The result shipped as one pull request with all eight areas in its title, and it was merged and deployed the same day.

## What still broke

The seams broke where the contract was silent. The bot routes button presses by a short prefix in the callback data. Two agents, working in separate worktrees, both picked the prefix `md`: one for medication buttons, one for mood buttons. Each module passed its own tests. Together, one module silently swallowed the other's buttons. The fix, also on 26 October, renamed one prefix and added a test that fails if two modules register the same prefix. The general lesson: **every shared namespace needs a registry and a uniqueness test**. That covers callback prefixes, route paths, tool names and settings keys. A sentence in the contract is not enough.

We also skipped a full end-to-end run of the eight combined suites before that deploy. The prefix collision is exactly the class of bug such a run catches. We now treat integration tests on merged code as part of the merge, not as optional polish.

## Failure modes we documented

These are the ones that cost real time, each with the rule that came out of it.

- **Shared scratch space.** Subagents in one session share a scratch directory. One agent imported a helper script by a generic name, but another agent had already replaced that file with its own version, which pointed at a different repository. The result was 43 duplicate issues in the wrong repository. All were closed as "not planned" rather than deleted, so the history stays honest. *Rule:* each agent works in a subfolder named after its project, scripts carry a project prefix, and any script that writes to an external system takes the target as an explicit argument.
- **Ghost resumes.** After a restart, the interface reported that several agents "did not finish". We resumed them. In fact the original session was still alive, and each agent was now running twice in the same worktree. One agent noticed edits it had not made and stopped to ask. *Rule:* before resuming, check for a live peer session and recent file changes. Every brief also says: if git shows edits you did not make, do not touch them; report them.
- **Process-wide stop commands.** An agent's "stop the API" step killed every running .NET process, including other agents' servers. *Rule:* stop processes by port, never by name.
- **Resource ceilings.** Each local API took roughly 1 to 2 GB of memory, so eight APIs and eight browsers at once was not realistic on one workstation. *Rule:* at most one API and one headless browser running at a time, scheduled by the orchestrator.
- **Too many small pull requests.** In one repository, a single request produced 12 pull requests in one day. Each one triggered a full CI run with end-to-end jobs. On a limited CI budget, that is expensive. *Rule:* one request, one branch, separate commits, one pull request, one CI run, one deploy, and fewer pushes.

## What goes into every brief now

A subagent knows only what its brief says, so the brief is where most of these rules live:

1. The goal, and what has already been ruled out.
2. The exact files, worktree, port and database it owns, and what it must not touch.
3. The output contract: verdict and evidence for analysis, or an exact change list and test results for execution.
4. The stop conditions: ambiguity, unexpected edits, a failing precondition.
5. For external writes, the target system named explicitly, never inferred from shared files.

## What we don't know yet

- We have no controlled comparison of the same work done by one agent and by eight, so we cannot quote a speed-up.
- The critic's limit of five findings is a judgement call. We have not measured how often it hides a sixth finding that matters.
- Our evidence comes from one workstation and a handful of private repositories. Shared-state problems may look different on remote, sandboxed runners.
