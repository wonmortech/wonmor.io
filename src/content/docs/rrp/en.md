---
updated: 2026-11-13
summary: Four release levels, WRL-1 to WRL-4, that say what each product has proven and what you can expect from it.
---

Every product in the dtwin ecosystem carries a Wonmor Release Level, or WRL. The level answers one practical question: how much can you rely on this product today? It is not a measure of how many features a product has or how polished it looks. A small tool can sit at a high level, and a large, beautiful product can sit at the lowest one.

A product earns a level by showing evidence, not by intention. The table below lists every product with its current level. It is generated from the same product data as the rest of the site, so it cannot drift from what the product pages say.

This policy applies from November 13, 2026.

## The four levels

| Level | Name | In one line |
|---|---|---|
| WRL-1 | Prototype | A demo. Look, try, do not depend on it. |
| WRL-2 | MVP | Real use, with CI and backups behind it. |
| WRL-3 | Production | Monitored, reversible and reviewed for security. |
| WRL-4 | Critical | Builds anyone can verify, with public security records. |

Each level includes everything required by the levels below it.

## WRL-1: Prototype

**Definition.** A working demo that shows an idea. It may be rebuilt, renamed or switched off without notice.

**Required evidence.** The product is reachable and clearly labelled as a prototype, concept or experiment on its product page.

**What you can expect.** You can try it and tell us what you think. You should not store anything important in it or enter real personal data. Data may be reset at any time, and there is no promise of uptime or support.

## WRL-2: MVP

**Definition.** A product that real people use for real tasks, built so that a bad change is caught and lost data can be restored.

**Required evidence.**

- Continuous integration runs on every pull request, and changes reach the main branch only through a reviewed merge.
- If the product stores user data, it is backed up automatically, and a restore has been tested at least once.
- There is a public place to report problems: an issue tracker, a feedback form or a support desk.

**What you can expect.** Your data is backed up. Bugs are tracked and fixed, but features may still change and short outages can happen. Breaking changes are mentioned in release notes or on the product page.

## WRL-3: Production

**Definition.** A product we expect people to depend on every day, run with the same care as infrastructure.

**Required evidence.**

- Status monitoring checks the product continuously, and someone is alerted when it is down.
- A rollback path is written down and has been used or rehearsed: a bad release can be reverted to the previous one.
- A security review has been done and recorded: what could go wrong, what protects against it, and what is left as known risk.
- Backups are restored on a schedule, not only once.

**What you can expect.** Outages are noticed quickly and fixed or rolled back. Security reports are handled under our [security policy](/security/), with published response times. Changes that affect you are announced before or when they ship.

## WRL-4: Critical

**Definition.** A product that people install on their own machines or trust with sensitive input, where you should be able to check what you are running without trusting us.

**Required evidence.**

- Reproducible builds: the same source produces the same release files, and the steps to check this are documented.
- Signed provenance and a software bill of materials for every release, verifiable with standard tools.
- An OpenSSF Best Practices badge and a public OpenSSF Scorecard result.
- A public security policy with response times, supported versions and a private reporting channel.

**What you can expect.** You can verify that a downloaded file was built from the public source by our release workflow. Vulnerabilities are handled on a published timeline and disclosed in a security advisory once fixed.

**Current example.** bitg, our Uzbek keyboard for Windows, Linux and macOS, is at WRL-4. It holds the OpenSSF Best Practices gold badge ([bestpractices.dev/projects/16620](https://www.bestpractices.dev/projects/16620)). Since version 0.3.1 every release file comes with signed build provenance and an SBOM attestation that you can check with `gh attestation verify`. Its Windows MSI and macOS .pkg builds are reproducible (dtwinuz/bitg #48), and its security policy commits to acknowledging reports within 7 days.

## How a product moves up

```steps
Gather evidence :: links to CI runs, restore tests, reviews or attestations
Open a pull request :: change the level in the product data and link the evidence
Review :: the evidence is checked against this policy, item by item
Merge :: the table below updates on the next site build
```

A product can skip a level if it meets every requirement of the higher one. Status labels such as "beta" or "preview" describe features and are separate from the WRL.

## How a product moves down

A level is a promise we keep checking. A product moves down when its evidence stops being true:

- a required check stops passing and is not restored within 30 days;
- backups or monitoring are found to be broken;
- a security issue shows that a requirement was not really met.

Moving down is done the same way as moving up: in a pull request that says what changed. We do not hide a downgrade, and when a product is retired its level is removed and its page says so.

## Review

We review the levels whenever a product ships a release and at least once every six months. If you think a product's level is wrong, tell us through the contacts on the [security page](/security/) or open an issue in the product's repository.
