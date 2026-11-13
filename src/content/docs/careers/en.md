---
updated: 2026-11-13
summary: "Wonmor is not hiring today. Here is how to contribute now, and which roles we expect to open later."
---

## Not hiring today

Wonmor is not hiring. There are no open positions, and this page does not pretend otherwise: you will not find an "Apply now" button here. Wonmor is a self-funded brand run by one founder, and it will only advertise a role when it can pay for it properly.

What you can do today is work on the open-source projects. Everything below is real and open right now.

## Open contribution tracks

Status as of 13 November 2026.

| Project | What you would work on | Languages | Where to start |
|---|---|---|---|
| [bitg](https://github.com/dtwinuz/bitg) | The Uzbek keyboard: the Rust conversion core, input methods for Windows, Linux and macOS, and the Uzbek word, brand and foreign-name lists | Rust, language data | Six open issues labelled [good first issue](https://github.com/dtwinuz/bitg/issues?q=is%3Aopen+label%3A%22good+first+issue%22): brand-name exceptions, a README section, a CLI option, a C ABI test and a small code clean-up |
| [gym-dtwin](https://github.com/dtwinuz/gym-dtwin) | An open-source workout diary that runs in the browser without an account | TypeScript, React | No starter issues yet. The [open issues](https://github.com/dtwinuz/gym-dtwin/issues) are larger roadmap items (sync, reminders, mobile) |
| [teletwin-web](https://github.com/dtwinuz/teletwin-web) | The TeleTwin web client, built on the Telegram Web A codebase | TypeScript | No starter issues yet. The [open issues](https://github.com/dtwinuz/teletwin-web/issues) are roadmap and release items |
| [operobot2](https://github.com/dtwinuz/operobot2) | The operobot calling assistant: integrations, translations, reminders | TypeScript | No labels yet. The [open issues](https://github.com/dtwinuz/operobot2/issues) are unlabelled feature tasks; ask in one before you start |
| [halvet](https://github.com/dtwinuz/halvet) | A concept website with three.js scenes and WebGL shaders | JavaScript | No open issues. Read the code and [open an issue](https://github.com/dtwinuz/halvet/issues) if you find something to fix |

A note on licences: bitg is dual-licensed MIT or Apache-2.0, and teletwin-web is GPL-3.0. gym-dtwin, operobot2 and halvet are public but do not have a licence file yet, so please ask in an issue before reusing their code elsewhere.

## How a contribution works

```steps
Pick an issue :: Comment on it first, so two people do not work on the same thing.
Fork and branch :: Work in your own fork and keep the change small and focused.
Run the checks :: Run the project's tests locally; CI runs them again on your pull request.
Open a pull request :: Say which issue it closes. A maintainer reviews it and may ask for changes.
Merge :: Accepted pull requests are squash-merged, so the history stays one commit per change.
```

bitg asks for a Developer Certificate of Origin sign-off on each commit (`git commit -s`); its CONTRIBUTING file walks you through the first pull request step by step.

## How we work

- **In writing, asynchronously.** Decisions happen in issues and pull requests, not in meetings. You can contribute from any time zone.
- **Uzbek, Russian or English.** Write issues and pull requests in whichever of the three you are most comfortable with.
- **Small changes.** A short pull request that does one thing is reviewed faster than a large one.
- **Measured claims.** If a change makes something faster or more accurate, show the number and how you got it.

## Fellowship and internship (planned, 2027)

Planned for 2027: a fellowship or internship for students and early-career engineers in Uzbekistan. It is not open, and there is no application form yet. When it opens, it will be announced on the news page with dates and conditions.

## Future roles we expect to open

These are the roles we expect to need as the products grow. **None of them is open yet.**

| Role | What it would involve | Status |
|---|---|---|
| Frontend engineer, 3D and WebGL | three.js scenes and interfaces that stay fast on ordinary phones | Not open yet |
| .NET backend engineer | The .NET services behind dtwin and TeleTwin | Not open yet |
| Rust and language technology | bitg's core, Uzbek lexicons and evaluation sets | Not open yet |
| DevOps engineer | Servers, zero-downtime deploys, backups and monitoring | Not open yet |

## Get in touch

The fastest way to reach the founder is Telegram: [t.me/xnosir](https://t.me/xnosir). For anything about code, a comment on an issue or a pull request is better, because others can see and learn from it.

## Questions

**Are contributors paid?** No. There is no paid contribution programme today. If that changes, it will be announced here.

**I am a beginner. Can I still help?** Yes. Start with one of bitg's good first issues; some of them are documentation or word-list changes that need no Rust at all.

**Do I need to speak Uzbek?** No. Uzbek helps with bitg's language data, but code, tests and documentation can be done in English or Russian.

**Can I mention my contributions on my CV?** Yes. Merged pull requests are public on GitHub under your name.

**Is there an interview or a test?** Not today, because there is no hiring process. Your pull requests are the only thing anyone will look at.
