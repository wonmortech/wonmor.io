---
title: Deploys that never drop a download
description: Static sites on the dtwin edge now release without downtime. A 76-second download kept running straight through a deploy.
date: 2026-11-13
category: engineering
links:
  - { label: Running on, text: bitg.uz, href: "https://bitg.uz", kind: external }
  - { label: Running on, text: dtwin.uz, href: "https://dtwin.uz", kind: external }
source:
  - "dtwinuz/dtwin #335"
  - "dtwinuz/bitg #40"
---

Until this week, deploying a static site on the dtwin edge meant replacing a directory in place. For a brief moment a request could land on a half-copied folder, and a long download could be cut off.

## The new release flow

Every deploy now uploads into a directory of its own, named after the commit: `releases/<sha>`. When the upload is complete, a `current` symlink is switched to it in one atomic rename, the Caddy configuration is validated, and Caddy reloads gracefully. Files that are already being sent stay open from the old directory until their transfer finishes.

## The test

To prove it, we started a deliberately slow, 76-second download of a release package and ran a deploy in the middle of it. The download finished intact, and new requests were already being served from the new release.

## Rollback

Rolling back is the same move in reverse: point `current` at the previous release and reload. Old releases stay on disk, so there is nothing to rebuild.

One setting we deliberately avoided is Caddy's `grace_period`, which force-closes open connections after a timeout — exactly the thing that cuts off slow downloads.
