---
updated: 2026-11-13
summary: How to report a vulnerability in any Wonmor or dtwin product, what happens next, and how we protect good-faith research.
---

If you have found a security problem in bitg, any other dtwin product or this site, thank you. This page tells you where to send it, what to include, how quickly we respond and what we promise in return.

This policy applies from November 13, 2026.

## How to report

Please do not report vulnerabilities in public issues, pull requests, discussions or group chats. Use one of these private channels:

| Where the problem is | How to report |
|---|---|
| bitg | GitHub private vulnerability reporting: [github.com/dtwinuz/bitg/security/advisories/new](https://github.com/dtwinuz/bitg/security/advisories/new) |
| Any other public repository in [github.com/dtwinuz](https://github.com/dtwinuz) | The repository's Security tab, then "Report a vulnerability". It is turned on for every public repository. |
| A product without a public repository, a live site, or this site | A private message on Telegram to [t.me/xnosir](https://t.me/xnosir) |

On Telegram, a short first message is enough, for example "Security report for dtwin.uz". We will reply and agree on how to share the details safely. Never send live credentials or other people's personal data, even as proof.

A machine-readable version of these contacts is published at [wonmor.io/.well-known/security.txt](https://wonmor.io/.well-known/security.txt).

## What to include

A good report lets us reproduce the problem without guessing:

- the affected product, URL or repository, and the version or release, if you know it;
- the platform: operating system, browser or app;
- the steps to reproduce, or a minimal proof of concept;
- what an attacker could gain: which data or which permission is at risk;
- whether you have shared the issue with anyone else, and any date by which you plan to publish.

You do not need to have a fix. A clear description is more useful than a long one.

## What happens next

We use the timeline from the bitg security policy for every product. Where a repository's own SECURITY.md promises a shorter time, the shorter time applies.

```steps
Acknowledge :: we confirm we received your report, within 7 days
Assess :: we reproduce it and rate its severity (CVSS), within 14 days
Fix :: high and critical issues are fixed and released within 60 days, sooner where possible
Disclose :: a security advisory, and a CVE where needed, ships with the fixed release
```

While we work on a fix, you are welcome to take part in the private advisory on GitHub, or in the Telegram conversation for products without a public repository. We will tell you if we need more time and why. Medium and low severity issues are fixed in a normal release; we will tell you which one.

For products installed on your own machine, fixes go to the latest release. For bitg, that means the latest minor version, currently 0.3.x, as described in its [SECURITY.md](https://github.com/dtwinuz/bitg/blob/main/SECURITY.md). For live sites, the fix is deployed to the site and no update is needed on your side.

## Safe harbour for good-faith research

We will not pursue or support legal action against you for security research that follows these rules:

- you act in good faith to find and report a vulnerability, not to cause harm or gain an advantage;
- you access only the data you need to show the problem, stop as soon as you reach other people's data, and do not keep, copy or share it;
- you do not degrade our services or anyone else's use of them;
- you give us reasonable time to fix the issue before you publish, following the timeline above;
- you test only against accounts you own or have permission to use.

If you are unsure whether something is allowed, ask us first through the channels above. If someone else takes legal action against you for research that followed this policy, we will say publicly that your work was authorised by us.

## Out of scope

These are not covered by this policy, and please do not attempt them:

- denial-of-service attacks, load or stress testing, and anything that floods a service with traffic;
- social engineering or phishing of the founder, contributors or users;
- spam, including through contact forms, bots or support desks;
- physical attacks on equipment;
- reports from automated scanners with no demonstrated impact;
- problems in services we do not run, such as GitHub or Telegram. Please report those to their owners.

## Credit

Once a fix is released, we credit you by name or handle in the security advisory and, for bitg, in its CHANGELOG, if you would like that. If you prefer to stay anonymous, we respect that. We do not run a paid bug bounty: Wonmor is self-funded and we would rather make no promise than one we cannot keep.

## What we do not publish

To keep users safe, we do not publish details of unfixed vulnerabilities, our server addresses or other infrastructure details. Fixed vulnerabilities are described in advisories with enough detail for users to understand their risk.
