---
title: Zero-downtime static deploys with Caddy
description: "A deploy used to restart the web server and cut off anyone downloading an installer. The replacement is small: release directories, one atomic rename, a validated config and a graceful reload. The details that make it work are about inodes, bind mounts and a Caddy setting we deliberately left out."
date: 2026-11-13
kind: engineering
area: infrastructure
featured: false
source:
  - "https://github.com/dtwinuz/bitg/pull/40"
  - "https://github.com/dtwinuz/bitg/commit/592b4a4"
  - "dtwinuz/bitg deploy/remote.sh, deploy/Caddyfile, deploy/docker-compose.yml"
  - "dtwinuz/dtwin #335 (private repository)"
reproduce:
  repo: "https://github.com/dtwinuz/bitg"
  commit: "592b4a4"
  note: "The first command validates the site's Caddyfile the same way the deploy does, in a container with no network; the second shows the symlink swap on any Linux machine."
  commands:
    - "docker run --rm --network none --tmpfs /var/log/caddy -v \"$PWD/deploy:/c:ro\" caddy:2-alpine caddy validate --config /c/Caddyfile --adapter caddyfile"
    - "mkdir -p www/releases/a www/releases/b && ln -sfn releases/a www/current && ln -sfn releases/b www/current.next && mv -T www/current.next www/current && readlink www/current"
    - "sed -n '1,80p' deploy/remote.sh"
---

bitg.uz is a static site, but it serves large files: the Windows installer, Linux packages, the macOS package and an apt repository. On the evening of 12 November 2026 a deploy of a different site on the same edge recreated the shared web container, and a download of the bitg installer stopped at 791 KB. We had already published a short note about the fix. This post is the longer version: what was wrong with the old flow, why each piece of the new one is there, how we tested it, and what it still does not handle.

## What a deploy used to do

The old bitg.uz deploy unpacked the new site into a `site/` directory, kept the previous one as `site.prev/`, and ran `docker compose up -d --force-recreate`. That last flag recreates the Caddy container on every deploy. Docker sends the old container SIGTERM and, after the default stop timeout of ten seconds, SIGKILL. Any download that needs longer than that is cut off, and the user gets a truncated installer.

Recreating was not laziness. The site was a single bind mount of `./site`, so there was no other way to make the container see the new files. The fix therefore had to change the layout, not just the command.

One more lesson came before any code. A few minutes after the first interruption, a second download stopped at 861 KB. It would have been easy to blame the same cause. The edge log for that request showed a write timeout towards the client, and 22 test downloads from our own network all completed. The second failure was the client's connection, not the deploy. We note it because a fix tested against the wrong failure proves nothing.

## The new flow

The site now lives in versioned directories, and the container serves whatever a symlink points to.

```steps
Validate :: The new Caddyfile is checked in a throwaway container with no network before anything live changes.
Unpack :: The site is moved into www/releases/<sha12>-<time>, a directory no request has seen yet.
Swap :: A new symlink is created beside www/current and renamed over it in one atomic step.
Reload :: Caddy reloads its configuration in place; connections already open keep their files.
Prune :: The last three releases are kept in www/history; older ones are deleted.
```

Each step is there for a specific reason.

**The rename is the deploy.** `ln -sfn` on its own is not atomic: it removes the old link and creates a new one, and a request can arrive in between. Creating `www/current.next` and then running `mv -T www/current.next www/current` turns the switch into a single `rename(2)`. Every request sees either the old release or the new one, never a missing directory.

**Open files keep their inode.** Caddy's root is `/www/current`, and the symlink is resolved when a file is opened. A download that started before the swap holds an open file descriptor on the old file, so it keeps streaming from the old release while new requests resolve the link to the new one. This is also why old releases are not deleted immediately.

**The release name includes a timestamp.** Directories are named `<first 12 hex of the commit>-<UTC time>`. Redeploying the same commit therefore creates a new directory instead of overwriting the one that is currently being served.

**The config is mounted as a directory.** The Caddyfile is replaced the same way, by writing `conf/Caddyfile.next` and renaming it. A bind mount of a single file pins the original inode, so after a rename the container would keep reading the old file. Mounting the `conf/` directory instead lets the container see the renamed file.

**Validate before swap.** A broken Caddyfile used to take the site down. Now the deploy runs `caddy validate` on the new file in a separate container started with `--network none`, and stops before touching anything live if validation fails.

**Reload, not restart.** `caddy reload` applies the new configuration through Caddy's admin endpoint, which listens only inside the container and is not published. The container is recreated only when its compose definition changes. For that case we set `stop_grace_period: 15s`, so even a recreate gives open downloads some time.

## The setting we left out

Caddy has a `grace_period` option that limits how long the server waits for open connections when it shuts down. It sounds like exactly what a zero-downtime setup wants. We left it unset on purpose: Caddy applies it on configuration reloads as well, so any value would force-close slow downloads at that moment during a perfectly ordinary deploy. Without it, a reload waits for old connections to finish on their own. The bound on shutdown time lives in Docker's `stop_grace_period` instead, which only matters on a real recreate.

## How we tested it

Before production we ran the new flow against a copy of the production directory in a separate container and network on the same server.

- **Migration.** The first deploy from the old layout removed `site/`, `site.prev/` and the old top-level Caddyfile, pointed `www/current` at the new release, and the site answered.
- **Deploy during a download.** We started a download of the MSI throttled to 300 KB/s, then deployed a new release that also changed a response header. The download finished with status 200 and 6,303,744 bytes, and its SHA-256 matched the production file. A new request got the new release and the new header. The container's start time did not change.
- **Pruning.** After three more deploys, exactly three releases remained and `current` pointed to the newest.

The shared edge got the same treatment in a separate change: a release directory per deploy, validation with the edge's own compose service, the same rename, a reload, and an automatic switch back to the previous release if the reload fails. The edge reads its document root from an environment variable with a default, `root * {$WEB_ROOT:/srv}`, so the old image layout keeps working while the variable points at the current release. In production, a download that took 76 seconds ran straight through an edge deploy, finished with a matching checksum, and the container's start time stayed the same.

## Limitations

- **Mixed versions within one page load.** The HTML of a page can come from the old release and its CSS from the new one, if the swap lands between the two requests. The `?v=<sha>` suffix on assets prevents stale caches, but the path still resolves through `current`, so it does not pin the old file. For a static site with small changes we accept this; we have not measured how often it happens.
- **Rollback is a command, not a button.** On bitg.uz, rolling back means pointing `current` at an earlier release and reloading, by hand. Only the edge reverts automatically, and only when the reload itself fails.
- **No post-deploy health check.** The deploy validates configuration, but it does not yet fetch pages after the swap and revert on errors. After the first deploy of the new layout we checked a short list of URLs by hand.
- **A recreate still has a limit.** When the compose definition changes, open downloads get 15 seconds, not unlimited time.
- **One production measurement.** The 76-second download is a single test. It shows the mechanism works; it is not a rate.

The change is around 66 lines of shell. The value is less in the script than in knowing which operation is atomic, which object holds an inode, and which friendly-looking setting would undo the whole thing.
