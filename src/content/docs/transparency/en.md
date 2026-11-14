---
updated: 2026-11-13
summary: What Wonmor publishes, how often, what it will never publish, and how to check our numbers yourself.
---

Trust should not depend on taking our word for it. This page says what we publish about our work, when we publish it, what we will never publish, and how you can check the figures above with your own tools.

This policy applies from November 13, 2026.

## Who we are, plainly

Wonmor is a self-funded brand from Uzbekistan. It is not a company: there is no legal entity, no board and no investors, and no one outside Wonmor has a financial stake in it. The founder pays for the servers, domains, CI minutes and design tools out of their own pocket. A legal entity and an open-source fund are planned; when either becomes real, it will be announced with a date, and this page will be updated.

## What we publish

| What | Where | How often |
|---|---|---|
| Release notes | GitHub Releases for each public repository, and a CHANGELOG file where the project keeps one | With every release |
| News | [wonmor.io/news](/news/), each post dated and linked to its sources | When something ships or changes |
| OpenSSF Best Practices record for bitg | [bestpractices.dev/projects/16620](https://www.bestpractices.dev/projects/16620) | Updated by us when criteria change; the record keeps its own history |
| OpenSSF Scorecard for bitg | [scorecard.dev](https://scorecard.dev/viewer/?uri=github.com/dtwinuz/bitg) | Recomputed automatically by OpenSSF |
| Release levels (WRL) for every product | [Responsible Release Policy](/responsible-release-policy/) | When a level changes, and reviewed at least every six months |
| Numbers on the home page and the figures above | This site, each set marked with the date it was counted | Every time the site is rebuilt |
| Security advisories | The Security tab of the affected public repository | When a reported issue is fixed |
| Sponsorship report | [Sponsorship](/company/sponsorship/) | Yearly, planned; the first report will cover 2026 |

Every number on this site is labelled with the date it was counted, for example "as of November 13, 2026". A figure without a date is a mistake, and we would like to hear about it.

The sponsorship report is planned, not yet published. It will list the kinds of costs Wonmor covers, such as servers, domains, CI and design, and which products they support. It will contain real totals by category, not estimates.

## What we will never publish

Some information is kept private on purpose, and it stays private even when publishing it would make a number look better:

- **Personal data.** Names, contact details, messages or activity of anyone who uses our products.
- **Customer information.** Who uses a product commercially, and anything about their business, unless they have asked to be named.
- **Secrets.** Tokens, keys, passwords and anything that grants access.
- **Infrastructure details.** Server addresses, internal hostnames and network layout.
- **Unfixed vulnerabilities.** Security issues are disclosed only after a fix is available, through an advisory.

When a number cannot be shown without revealing one of these, we leave the number out instead.

## How to check our numbers

Most of what we claim can be checked with the GitHub CLI (`gh`) and two public APIs. One honest caveat first: some of our repositories are private. The figures above are counted by us with access to every repository in the organization, so the same commands run from your account will show only the public part and return smaller numbers. Where that is the case, the public number is a lower bound you can verify.

**Repositories in the organization:**

```bash
gh repo list dtwinuz --limit 200 --json name --jq length
```

**Merged pull requests across the organization:**

```bash
gh api "search/issues?q=org:dtwinuz+is:pr+is:merged" --jq .total_count
```

**Releases of a project, for example bitg:**

```bash
gh release list -R dtwinuz/bitg
```

**That a bitg download was built from the public source by our release workflow:**

```bash
gh attestation verify bitg-0.3.1-x64.msi -R dtwinuz/bitg
```

**The OpenSSF Best Practices level for bitg:**

```bash
curl -s https://www.bestpractices.dev/projects/16620.json | jq .badge_level
```

**The OpenSSF Scorecard result for bitg:**

```bash
curl -s https://api.securityscorecards.dev/projects/github.com/dtwinuz/bitg | jq .score
```

On November 14, 2026 these returned 26 repositories and 659 merged pull requests (counted with full access), a bitg badge level of "gold" and a Scorecard score of 8.5. The figures on the home page are recounted by us with the same commands (`tools/count-numbers.mjs` in the site repository) and carry the date of that count; between counts the organization keeps moving.

## If a number is wrong

If you find a figure on this site that you cannot reproduce, or that is out of date, tell us. Use the contacts on the [security page](/security/) or open a public issue at [github.com/dtwinuz/.github](https://github.com/dtwinuz/.github/issues). We correct mistakes in public: the corrected page gets a new updated date, and if the mistake was in a news post, the post says what was changed.
