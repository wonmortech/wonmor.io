---
title: From zero to OpenSSF gold in under two days
description: "bitg's repository was created on 11 November 2026 at 17:08 UTC. The project reached the OpenSSF Best Practices gold level 36 hours later. Most of the code-side criteria took hours; the hardest ones were about people, and one we marked wrongly before correcting it."
date: 2026-11-13
kind: engineering
area: supply-chain
featured: false
source:
  - "https://www.bestpractices.dev/projects/16620"
  - "https://www.bestpractices.dev/projects/16620.json"
  - "https://api.securityscorecards.dev/projects/github.com/dtwinuz/bitg"
  - "https://github.com/dtwinuz/bitg/pulls?q=is%3Apr+is%3Amerged"
  - "dtwinuz/bitg GOVERNANCE.md, docs/ASSURANCE.md, CHANGELOG.md"
reproduce:
  repo: "https://github.com/dtwinuz/bitg"
  commit: "2de5c94"
  note: "The first command prints the badge level and the three timestamps; the second prints the current Scorecard score; the third verifies a released package against its signed provenance."
  commands:
    - "curl -s https://www.bestpractices.dev/projects/16620.json | jq '.badge_level, .achieved_passing_at, .achieved_silver_at, .achieved_gold_at'"
    - "curl -s https://api.securityscorecards.dev/projects/github.com/dtwinuz/bitg | jq '.score, (.checks[] | {name, score})'"
    - "gh release download v0.3.1 -R dtwinuz/bitg -p 'bitg_0.3.1_amd64.deb' && gh attestation verify bitg_0.3.1_amd64.deb -R dtwinuz/bitg"
---

bitg is an input method. On Windows it is a DLL loaded into every application where you type, which makes it exactly the kind of software people should be suspicious of. We wanted a way to make our security practices checkable by someone who does not know us, so we used the OpenSSF Best Practices criteria as a checklist and published the result.

The public record for project 16620 shows the timeline. The entry was created on 12 November 2026 at 17:15 UTC. It reached **passing** at 17:47, **silver** at 20:24, and **gold** on 13 November at 05:02. The repository itself had been created at 17:08 UTC the day before. This post walks through what each level actually required of us, where the work went, and what the badge does not tell you.

```steps
Passing (17:47) :: Licence clarity, a security policy, CI tests, and REUSE headers on every file.
Silver (20:24) :: Governance, an assurance case, a coverage gate, and the first release with signed provenance.
Code work for gold (overnight) :: Branch coverage, reproducible MSI and .pkg, a written security review, SLSA Build L3.
People work for gold (05:02) :: Two-person review, enforced 2FA, contributors from outside the project, a bus factor above one.
```

## Passing and silver: mostly writing down what was true

Much of passing and silver is documentation, and the useful discipline was to write only what the repository could prove. By the afternoon of 12 November bitg already had CI on three operating systems, an evaluation set, and a security policy. In the hour before the entry was created we merged release attestations with an SBOM, the OpenSSF Scorecard workflow and a code of conduct (PR #16), then fuzzing for the core, release bundles and SHA-pinned container images (#17).

REUSE compliance (#22) put an SPDX licence header in every source file and was merged at 17:47, the same minute passing was reached. It also caused the most instructive bug of the day. In one PowerShell test script the new header ended up above the UTF-8 byte-order mark, so the mark now sat in the middle of the file. Windows PowerShell 5.1 then failed to parse the script's `param()` block, and the end-to-end test silently stopped working until we found and fixed it in #30. A compliance change is still a code change; review its diff as you would any other.

Silver asked for things a solo project usually skips: a governance document with decision rules and continuity, a roadmap, an architecture document, and an assurance case that states security requirements, a threat model, trust boundaries and known gaps (#24). That PR also raised line coverage in CI to 91.38% with a gate at 90%, and it was the first pull request in the project with an approving review. Silver itself came a few minutes after the v0.3.1 release, the first one whose every file carried signed build provenance and SBOM attestations. We verified those with `gh attestation verify` on the published files rather than assuming the workflow had worked.

## Gold, the code part: one night

Four gold criteria needed engineering, and each became a pull request that night:

- **Branch coverage (#36).** Branch coverage needs a nightly Rust toolchain, so CI pins one and runs `cargo llvm-cov --branch`. On Linux it measured 94.81% of branches (1,223 of 1,290) and 97.19% of lines. The gate is 90% and 95%. One trap: a compound `assert!(a && b)` in a test counts as branches too.
- **Reproducible builds (#48).** The `.deb` packages were already byte-for-byte reproducible; the MSI and `.pkg` became so after a night of chasing timestamps, which we describe in a separate post.
- **Security review (#48).** A written review of the code at one commit against the assurance case, by manual reading of unsafe code, FFI and COM boundaries, file writes, log calls and workflows. It recorded 11 findings, none critical or high. The fixes landed in the same PR and in #49 a few hours later, and the review is published in `docs/ASSURANCE.md`.
- **SLSA Build L3 (#63).** Release packages are now built by a reusable workflow. The jobs that compile code have no permission to request a signing token; a separate job that compiles nothing writes the attestations. The release workflow publishes only after every package passes `gh attestation verify` with the expected signer workflow and tag.

None of this was fast because it was easy. It was fast because the project was small and new: one Rust workspace, three packaging scripts, and no legacy to migrate.

## Gold, the people part: the slow half

The remaining gold criteria cannot be met by writing code alone. They ask whether more than one person reviews changes, whether accounts are protected, whether people outside the project contribute, and whether the project survives losing any one person.

**Review.** Until the evening of 12 November no pull request had been reviewed: of the 18 merged before 19:00 UTC, none had an approval. The project then gained a second reviewing maintainer, the new governance document made review part of the process, and the branch ruleset on `main` now requires an approving review from someone other than the last pusher. Of the 21 pull requests merged between the v0.3.1 release and the gold badge, 17 had an approving review; four of the 21 were dependency updates.

**Two-factor authentication.** Here we made a mistake in the form. We first marked "2FA required" as met, because every active maintainer used it. The criterion is about enforcement, and the organisation did not enforce it. We corrected the answer to unmet. Later we turned on the organisation setting that requires 2FA and accepts only secure methods. Enforcing it meant removing organisation members who had not enabled 2FA. Only then did we mark both 2FA criteria as met.

**Evidence, not assertions.** The form treats a "Met" answer without a URL as missing information for some criteria. Five of our answers counted as unknown until we added links to the files or workflow runs that proved them.

**Contributors and bus factor.** The last two criteria moved only when people outside the project opened pull requests. We wrote a step-by-step "first contribution" guide and opened newcomer issues; the first outside pull requests (#64 and #67) were merged in the 35 minutes before gold was recorded.

## Limitations

- **A badge measures process, not maturity.** At gold the repository was 36 hours old. Scorecard, which checks the repository automatically, gave 8.1 out of 10 on 13 November; its "Maintained" check scores 0 because the project is less than 90 days old, and "Signed-Releases" scores 2.
- **The review history is short.** The 17 approved pull requests were reviewed within a single night, many of them small documentation and CI changes. The ratio shows that review happens; it does not show how deep it is.
- **Some answers rest on our word.** Whether a contributor is "unassociated" with the project, for example, is something the form accepts as a self-assessment.
- **Gold is a snapshot.** The criteria are re-checked as the project changes. Branch coverage, two-person review and outside contributions are only meaningful if they still hold in six months.

What we would tell another small project: the code criteria are a good weekend of work and worth it on their own. The people criteria are the real test, and they should take longer than ours did.
