---
updated: 2026-11-13
summary: Seven principles that decide how Wonmor builds, releases and looks after the dtwin ecosystem.
---

Wonmor is a self-funded brand from Uzbekistan. It is not a company: there is no legal entity, no board and no investors. One founder builds and supports the dtwin ecosystem, working with AI agents, and every change goes through a pull request, continuous integration and a human merge.

A small team can drift without noticing. This charter is how we keep ourselves honest. It is short on purpose: seven principles, each with what it means in practice and an example from work you can check. When two principles pull in different directions, we say which one won and why, in the pull request or the post where the decision was made.

The charter applies from November 13, 2026.

## Build for people you know

We start with a real person and a real problem, not a market. If we cannot name someone who needs a feature this week, it waits. Early users are people we can talk to directly, and their reports carry more weight than our own plans.

In practice this means short loops: a tester writes an issue, we fix it, we ship, we ask again. It also means saying no to features that would look good in a screenshot but that nobody we know has asked for.

Example: dtwin began on October 23, 2026, as a personal notebook built around the five daily prayers. Its first beta testers filed 28 issues about usability, accessibility and privacy, and all 28 shipped together in one release on October 27 (dtwinuz/dtwin #134).

## Ship in the open

By default, work happens where people can see it: in public repositories, in dated release notes and in posts that link to their sources. When something cannot be public, such as customer data or server configuration, we say that it exists and why it is private, instead of pretending it is not there.

Shipping in the open also means shipping often. A small change that is released and visible is worth more than a large change that waits for a perfect moment. Every release of an open product has notes that say what changed.

Example: bitg is developed entirely in public at github.com/dtwinuz/bitg. Every change is a pull request that must pass CI before a squash merge, and every release from 0.1.0 to 0.3.1 has public release notes and downloadable files.

## Measure before you claim

A number on this site must come from a measurement that someone else can repeat. If we have not measured something, we do not claim it. If a measurement turns out to be wrong, we correct it in public and keep the correction visible.

This applies to marketing too. We write "98.87% of words on a public evaluation set", not "near-perfect". We write "as of November 13, 2026", not "now". Plans are labelled "planned" and never written as if they have happened.

Example: bitg first reported 99.17% accuracy. That figure was inflated by overlap between the evaluation set and the data bitg was built from. After removing the overlap, the honest figure is 98.87%, and the bitg 0.3 announcement says so in plain words (github.com/dtwinuz/bitg/releases/tag/v0.3.0).

## Respect faith and privacy

Many of our users organise their day around prayer, and many of our products touch personal life: plans, notes, health, family time. We treat both with care. Faith features are built to serve the user, not to judge or display them. Personal data stays private unless the user chooses to share it.

In practice: private by default, sharing as a separate step the user confirms, no selling or renting of data, and the smallest amount of data a feature needs. When an AI model is involved, personal data is masked before it reaches the model wherever we control that path.

Example: after the dtwin beta, notes became private until the user chooses to share them, and prayer is hidden by default on the public "Now" page (dtwinuz/dtwin #134). Gateway, our control plane for AI agents, masks personal data before it reaches the model (see the Gateway announcement in News). bitg never sends what you type over the network.

## Prefer boring, reliable technology

We choose tools that are well understood, well documented and likely to work in five years. New technology has to earn its place by solving a problem the boring option cannot. Fewer moving parts mean fewer things that can break at night with nobody awake to fix them.

This is not a rule against new ideas. It is a rule about where to spend risk: on the product, not on the plumbing.

Example: static sites on the dtwin edge, including this one, are released by writing a new release folder, switching a link and reloading the web server, instead of recreating containers. A 76-second download kept running straight through a deploy (dtwinuz/dtwin #335).

## Leave it better documented than you found it

Every time we touch a system, we leave it easier for the next person to understand, including our future selves and the AI agents we work with. A change is not finished until the README, the changelog or the decision record says what changed and why.

Documentation is also how a one-person project avoids becoming a one-person risk. If the founder stepped away tomorrow, the written record should be enough for someone else to keep a product running.

Example: bitg has a governance document, a security policy with response times, an assurance case reviewed at every minor release, and a maintainer handover guide that covers review, releases, packages and the website (dtwinuz/bitg #59). Engineering posts on this site end with a "Reproduce this" section.

## Put the community first

The people who use and improve our products come before our own convenience. Reports are answered, good ideas are credited, and the Uzbek-speaking community gets products in its own language, not as an afterthought.

In practice: issues get a reply, contributors are credited in release notes and advisories, and our sites are published in Uzbek, Russian and English. Planned items, such as an open-source fund, will be announced only when they are real.

Example: a user reported that bitg was changing ambiguous Uzbek words and foreign names (dtwinuz/bitg #5 and #6). Both issues were fixed and merged the same day (dtwinuz/bitg #8), and bitg now leaves a genuinely ambiguous word as typed instead of guessing.

## How the charter changes

The charter is a living document, but it does not change quietly.

```steps
Proposal :: anyone can open a public issue at github.com/dtwinuz/.github
Discussion :: the reason for the change is written down in the issue
Pull request :: the change is made in a pull request that passes CI
Decision :: the founder merges or declines, and says why in the issue
Changelog :: the change gets a dated entry below and a new updated date
```

The source of this site is not public yet; publishing it is planned. Until then, the public issue and the dated changelog on this page are the public record of every change. Older versions stay in the repository history.

### Changelog

- 2026-11-13: first version, seven principles.
