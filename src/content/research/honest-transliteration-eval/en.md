---
title: "Honest evaluation for transliteration: why our score went down from 99.17% to 98.87%"
description: "Our Uzbek converter scored 99.17% until we found that its lexicon had counted the evaluation sentences. Removing the leak cost 0.30 points, and the nine sentences that flipped show exactly what the leak had been teaching."
date: 2026-11-12
kind: research
area: language
featured: true
source:
  - "https://github.com/dtwinuz/bitg/commit/b3102bc0f4127e8ccb9f05a21a76cce20275353e"
  - "https://github.com/dtwinuz/bitg/pull/8"
  - "dtwinuz/bitg eval/README.md"
  - "dtwinuz/bitg README.md (sections Sifat, Lug'at)"
reproduce:
  repo: "https://github.com/dtwinuz/bitg"
  commit: "2de5c94"
  note: "The first three commands give 2966/3000, 2436/3000 and 2992/3000 on main; the last two rebuild the lexicon from before the fix and give 2975/3000 (99.17%) on the same sentences."
  commands:
    - "cargo build --release -p bitg-cli"
    - "target/release/bitg eval eval/uz.tsv"
    - "target/release/bitg eval eval/uz_noapos.tsv && target/release/bitg eval eval/en.tsv"
    - "git checkout a7962ef -- crates Cargo.toml Cargo.lock"
    - "cargo build --release -p bitg-cli && target/release/bitg eval eval/uz.tsv"
---

bitg converts Uzbek text to the 2026 Latin alphabet while you type: `o'zbek` becomes `özbek`, `shahar` becomes `şahar`, and English words such as *check* or *push* are left alone. From the first day we judged every rule change by three fixed test sets rather than by examples. On the morning of 12 November 2026 the headline number on the main set went **down**, from 99.17% to 98.87%, and that drop is the most useful result we have published so far.

This post explains how the test sets are built, how the leak happened, what the nine sentences that changed tell us, and what the numbers still do not measure.

## Three sets, built so the converter cannot cheat

The evaluation lives in the repository under `eval/` and is published under CC BY 4.0, so anyone can run their own converter on the same sentences. Each file has 3,000 lines in the form `language<TAB>input<TAB>expected`.

| Set | What it checks | Source |
|---|---|---|
| `uz.tsv` | old Latin with mixed apostrophes in, 2026 Latin out | Leipzig `uzb_community_2017` |
| `uz_noapos.tsv` | the same task, but the apostrophe in oʻ/gʻ is missing (`ozbek`, `togri`) | the same corpus, different sentences |
| `en.tsv` | English sentences containing sh, ch or an apostrophe; they must come out unchanged | Leipzig English news 2020 (1,523) and web 2018 (1,477) |

The Uzbek sets have one property that matters more than size. The source sentences are **Cyrillic**, and both the input and the expected output are produced from that Cyrillic independently: Cyrillic to old Latin for the input, Cyrillic to 2026 Latin for the expected answer. The converter never sees the answer's spelling in the input, so it has to work out `Is'hoq → Ishoq` and `Sh.Sharipov → Ş.Şaripov` on its own. Only sentences with more than 20 Cyrillic letters and no Latin letters are used, and sampling is fixed with `--seed 2026`.

```steps
Sample :: tools/build_eval.py draws 3,000 Cyrillic sentences per set with a fixed seed.
Derive twice :: The input (old Latin) and the expected answer (2026 Latin) are each transliterated from the Cyrillic.
Exclude :: tools/build_lexicon.py drops every corpus sentence that matches an eval line before counting words.
Score :: bitg eval counts a sentence as correct only if the whole output matches exactly.
```

The score is strict: one wrong letter anywhere fails the sentence.

## How the leak got in

bitg decides whether a word is Uzbek with a frequency lexicon built from public corpora. The first lexicon counted words from `uzb_community_2017-words.txt`, a word-frequency file that Leipzig ships next to the sentences. The evaluation sentences were drawn from the same corpus. A word list cannot tell you which sentences its counts came from, so the 3,000 test sentences were silently part of the training data.

The fix landed in commit `b3102bc`, the same commit that added new corpora. It reads the full sentence file instead of the word list and drops every source sentence that matches the expected column of an eval line (`--exclude-eval eval/uz.tsv eval/uz_noapos.tsv`). According to `eval/README.md`, that removed 6,002 sentences from `community_2017` and 767 from `newscrawl_2011`, counting duplicates.

The commit message records three rows, and the repository README keeps them:

| Lexicon | `uz` | `uz_noapos` | `en` |
|---|---|---|---|
| before, eval sentences counted | 99.17% | 69.07% | 99.73% |
| same sources, eval excluded | 98.87% | 68.50% | 99.73% |
| more sources, eval excluded | 98.87% | 81.30% | 99.73% |

The second row is the honest version of the first. The third row is real progress on apostrophe-less text, and it is only believable because the second row exists.

For this post we rebuilt both versions from source on one machine. The lexicon from the parent commit `a7962ef`, run on the published eval files, gives **2975/3000 (99.17%)** on `uz.tsv` and **2072/3000 (69.07%)** on `uz_noapos.tsv`. Current `main` (`2de5c94`) gives **2966/3000 (98.87%)**, **2436/3000 (81.20%)** and **2992/3000 (99.73%)**. The published figures reproduce exactly.

## What the leak was teaching

Nine sentences is a small difference, so we compared the two runs sentence by sentence. Ten sentences fail now that passed with the leaky lexicon; one sentence passes now that failed before.

The ten are revealing. The `community_2017` corpus is user comments, and the Cyrillic often has typos: `г` where `ғ` belongs, `к` for `қ`. Because the expected answer is transliterated from that Cyrillic, it keeps the typo. With the leak, the lexicon had seen those misspelled forms in the test sentences themselves, so bitg left them alone and matched the "expected" answer. Without the leak, it does what a careful reader would do. Six of the ten, by our reading, are bitg restoring a letter that the source had dropped:

- `girt` → `ğirt`, `kambagal` → `kambağal`, `garbga` → `ğarbga`, `yorug` → `yoruğ`, `gazabiga` → `ğazabiga`, `kopda` → `köpda`.

The other four are genuine mistakes:

- `holdan toyadi` ("collapses from exhaustion") became `töyadi` ("gets full"); the painter Chagall, `Şagal`, became `Şağal`; `orka` and `kolsa` (typos for `orqa` and `qolsa`) became `örka` and `kölsa`.

So the leak did not make bitg better at Uzbek. It made bitg better at reproducing the noise in one particular test set. That kind of score inflation is easy to miss and it points the wrong way: it rewards a model for agreeing with typos.

It also means 98.87% is a noisy measure: some of the remaining 34 failures are corpus noise, some are real. The README says this in one line ("most of the gap is Cyrillic corpus errors"); after this comparison we would put it more carefully, because four of the ten newly visible failures were real.

## A deliberate regression

The same discipline applies when a change lowers a number on purpose. In PR #8 we stopped guessing on words that are genuinely ambiguous without an apostrophe. `ochmaydi` can be `ochmaydi` ("does not open") or `oʻchmaydi` ("does not go out"); `otdim` can be "I threw" or, as `oʻtdim`, "I passed". The old code picked the more frequent stem and changed the word silently.

The new rule leaves such a word as typed when both stems are common (weight at least 2.9, within 1.2 of each other), the apostrophe-less form never appears in the corpus, and the candidate is rare (below 3.0). The website converter marks it in yellow and lets the reader switch.

On `uz_noapos.tsv` this moved the score from 2439 to **2436**. At word level, three sentences that the eval expected to stay as typed (`otdim`, `oçmaydi`, `otlikka`) became correct, and ten truly ambiguous words (`otmoqchi`, `oqdan`, `oqidan` among them) are no longer guessed. We also swept the threshold before choosing it: 3.0 gave 2434, 3.2 gave 2430, 3.6 gave 2424, 4.0 gave 2402. We shipped a lower number because silent wrong guesses are worse for a writer than a visible "check this".

## Limitations

- **One corpus family.** Both Uzbek sets come from Leipzig `uzb_community_2017`. Comments are a fair stand-in for everyday typing, but not for legal, technical or literary text. We have no second domain yet.
- **Exact-match scoring.** A sentence with one wrong letter counts the same as a sentence with ten. We do not yet publish word-level accuracy.
- **Noise in the answers.** The expected output keeps the typos of the Cyrillic source. We have not cleaned the set by hand, so some "errors" are bitg being right.
- **English is still not perfect.** Eight English sentences change. One example: `RP'er` comes out as `RPʼer`, because bitg normalises the apostrophe.
- **Speed is machine-dependent.** The README reports 2.7 µs per Uzbek word from a separate benchmark. The speed line printed by `bitg eval` on the machine where we re-ran this post was 7.48 µs per word; it is not a benchmark and we do not compare the two.

The rule we keep: the evaluation set is published, it is excluded from training by code rather than by intention, and a change is judged by the three numbers, including when they go down.
