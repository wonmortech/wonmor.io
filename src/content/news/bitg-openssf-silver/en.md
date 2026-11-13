---
title: bitg earns the OpenSSF Best Practices silver, then gold badge
description: bitg 0.3.1 ships with signed build provenance and SBOM attestations, and the project now meets every OpenSSF silver and gold criterion.
date: 2026-11-13
category: product
product: bitg
featured: true
links:
  - { label: Product, text: bitg, href: "https://bitg.uz", kind: external }
  - { label: Release notes, text: v0.3.1, href: "https://github.com/dtwinuz/bitg/releases/tag/v0.3.1", kind: external }
  - { label: Source, text: GitHub, href: "https://github.com/dtwinuz/bitg", kind: external }
source:
  - "https://github.com/dtwinuz/bitg/releases/tag/v0.3.1"
  - "https://github.com/dtwinuz/bitg/pull/48"
  - "https://www.bestpractices.dev/projects/16620"
---

bitg 0.3.1 was released on November 13, 2026. It is the first release in which every package can be checked against the source code that built it.

## What changed

- **Signed provenance.** Every release artifact carries a signed build-provenance attestation and an SBOM attestation, both produced in GitHub Actions. We verified them after publishing instead of trusting that they were generated.
- **Reproducible Linux packages.** Building the `.deb` packages twice from the same commit produces byte-identical files.
- **A coverage gate.** Pull requests cannot lower test coverage. On Linux, 94.81% of branches and 97.19% of lines are covered.

Reproducible MSI and macOS `.pkg` builds landed on `main` a few hours after the release and will ship with the next version.

## Silver, then gold

The project met 100% of the OpenSSF Best Practices silver criteria on the night of November 12. When this post was first written, gold stood at 57%: the remaining items were about people rather than code — two-person review, two-factor authentication for every maintainer, and more than one person able to ship a release.

**Update, November 13, 2026:** later the same morning the project record on bestpractices.dev reached the **gold** level, with every passing, silver and gold criterion met.
