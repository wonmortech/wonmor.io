---
title: "Should a community app have a token? (ADR-0002)"
description: "We were asked how to accept crypto and launch our own token for dtwin. We looked at law, platform rules, religious scholarship and the record of earn-tokens, and decided against a token. This is how we reached that decision."
date: 2026-11-02
kind: research
area: digital-assets
featured: false
source:
  - "dtwinuz/dtwin docs/adr/0002-no-token-contribution-points.md, accepted 2026-11-02 (private repository)"
  - "https://policy.4pillars.io/uzbekistan"
  - "https://forklog.com/en/uzbekistan-approves-framework-for-issuing-and-circulating-digital-assets/"
  - "https://telegram.org/tos/bot-developers"
  - "https://core.telegram.org/bots/payments-stars"
  - "https://www.rferl.org/a/uzbekistan-bitcoin-fatwa-cryptocurrency-gambling/32979073.html"
  - "https://depts.washington.edu/techdocs/papers/deciExtrinsicRewardsAndIntrinsicMotivation99.pdf"
---

*This post explains one product decision. It is not investment, legal or religious advice. Where the decision record marks a fact as unconfirmed, we say so or leave it out.*

The question came in plainly: how do we accept crypto payments, and what is the best way to launch our own token? dtwin is a personal planning app built around the five daily prayers, with a Telegram bot and Mini App. The question touches money, law and worship at once, so it deserved a proper answer rather than a reflex.

We wrote that answer as an architecture decision record, ADR-0002, accepted on 2 November 2026. The short version: **no token of our own, crypto payments frozen until a lawyer answers in writing, and an off-chain "contribution points" system with fixed rules instead.** The rest of this post explains why.

## Four lenses

The ADR checks the question from four sides. Each one could block a token on its own.

**1. Law in Uzbekistan.** According to the policy summary the ADR cites, since 2023 residents may buy and sell crypto-assets only through providers licensed by NAPP, and crypto is not a means of payment. Accepting a stablecoin from a resident user for a subscription would fall under that ban. A second source the ADR cites, on the framework for issuing digital assets, describes a ban on residents issuing unbacked tokens and stable tokens, with white papers going through a licensed crypto-depository. In the ADR's words, a "dtwin coin" cannot be issued. Some further details in the ADR, such as the exact article for penalties, are marked unconfirmed, and we do not repeat them here.

**2. Telegram's rules.** The [Bot Developer Terms](https://telegram.org/tos/bot-developers) and the [Stars payments](https://core.telegram.org/bots/payments-stars) documentation set the frame for anything inside a bot or Mini App. Digital goods are sold through Stars. Crypto in Mini Apps is limited to the TON blockchain, promoting tokens from other networks is not allowed, and wallets connect through TON Connect. So an ERC-20 or BEP-20 token could not be used in the Mini App at all. A TON jetton is the only shape that fits Telegram, and that is the shape lens 1 rules out.

**3. Religious scholarship.** dtwin does not issue religious rulings, and the ADR is explicit that this section is context, not a fiqh conclusion. The final answer is to be sought from qualified scholars. The context is that scholars differ on crypto trading, and that the Muslim Board of Uzbekistan published a fatwa on crypto in June 2024 and withdrew it the next day as research not yet complete, [as RFE/RL reported](https://www.rferl.org/a/uzbekistan-bitcoin-fatwa-cryptocurrency-gambling/32979073.html). A token with a floating price raises the questions of uncertainty (*gharar*) and chance (*maysir*). Separately, tying worship to rewards raises the question of sincerity, and psychology points the same way: a [meta-analysis by Deci, Koestner and Ryan (1999)](https://depts.washington.edu/techdocs/papers/deciExtrinsicRewardsAndIntrinsicMotivation99.pdf) found that expected tangible rewards reduce intrinsic motivation.

**4. The record of "earn" tokens.** The ADR lists four well-known tap-to-earn and move-to-earn tokens, all far below their peaks. It marks the exact drawdown figures as unconfirmed, taken from a single aggregate source, so we do not quote them. The qualitative point stands without the numbers: such a token turns users into sellers and the app into an exchange.

## Three options

| Criterion | A. Own token (TON jetton) | B. Off-chain contribution points | C. No incentive at all |
|---|---|---|---|
| Law (residents) | Prohibited | Internal points; confirmation that they are not a crypto-asset or e-money to be sought from a lawyer | No issue |
| Telegram | TON only, many constraints | Not affected (not money, not sold) | — |
| Religious questions | Disputed, *gharar* | With safeguards, to be confirmed by scholars | No issue |
| Price stability | Market-driven, historically collapsed | Fixed, no market | — |
| Effort | Large, plus depository and audit | Estimated 5–7 days | None |
| Thanking contributors | Yes, but speculative | Yes | No |

Option C is the safest, but it gives no way to thank the people who report bugs, translate, or help others join. Option A fails on law before any other lens applies. **We chose B.**

## The decision: contribution points with fixed rules

The ADR sets five rules that a future implementation may not loosen:

```steps
Earn :: Points are given only for contributions: an accepted bug report or idea, a translation, an interview or beta test, bringing family or friends.
Never for worship :: No points for prayers, make-up prayers, dhikr, Quran or fasting; a database CHECK keeps the worship flag false.
Not money :: Points cannot be transferred, cashed out or sold, and no reason code pays out money or crypto.
Private :: The balance is visible only to its owner; no leaderboard, badge or friends view.
Spend or expire :: Points convert to premium days or, later, to a charity donation from our own budget, and they expire after 12 months.
```

The fifth rule is about the books. Points live in a double-entry ledger in PostgreSQL. Every entry must sum to zero, touch at most one user account, and never take a balance below zero. `UPDATE` and `DELETE` are revoked, so corrections happen only through reversing entries. These are database invariants with tests, not conventions.

As of this writing, the ledger is **planned, not built**. Its tracking issue is open and blocked by design: the first phase needs a written answer from a scholar on whether points for contributions are permissible, and in-app payments via Stars in production.

The ADR stages the rest behind explicit gates:

| Phase | Work | Gate |
|---|---|---|
| 0 | This ADR; Stars and billing core | Immediately |
| 1 | Ledger, conversion to premium days, private balance, invariant tests | Written scholarly answer; Stars in production |
| 1b | Charity conversion from our own budget | Agreement with a licensed fund, tax advice |
| 2 | Crypto payment, web only, users abroad only, one-off premium | Written legal opinion, geo filter |
| 3 | Jetton or anything on-chain | Utility-token regime, depository, fatwa and real demand; none exist today |

## When we would reopen it

A token comes back on the table only if **all** of these hold: a working regime for residents to issue utility tokens, confirmed in writing by a lawyer for our case; a written opinion from a recognised religious authority that this kind of token is permissible; and evidence from user research that people actually need it, not just that it is fashionable. Crypto **payments**, which are not the same as issuing a token, have a separate, narrower gate: a written legal opinion that accepting payment from users abroad through a licensed channel is allowed.

## What this is not

- It is not a ruling on whether crypto is permissible. We do not issue rulings. The ADR sends that question to scholars.
- It is not legal advice. The legal facts come from the sources cited above, and the ADR itself marks the items it could not confirm.
- It is not a claim that points are risk-free. The ADR names the cost: points have no outside value, so they will never attract anyone as an "investment", and the ledger adds code and invariant tests to maintain.
- Conditions change. The ADR includes a reopen clause because the legal regime, the platform rules and scholarly opinion may all move.
