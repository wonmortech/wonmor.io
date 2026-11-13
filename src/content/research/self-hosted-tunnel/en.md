---
title: "Building a self-hosted tunnel"
description: "How we built tunnel.dtwin.uz on frp: a small gateway that owns sign-in and subdomains, per-subdomain certificates issued before the link is shown, and a client that installs on networks where GitHub downloads stall."
date: 2026-11-02
kind: engineering
area: infrastructure
featured: false
source:
  - "https://tunnel.dtwin.uz"
  - "https://github.com/fatedier/frp"
  - "https://github.com/fatedier/frp/blob/dev/doc/server_plugin.md"
  - "https://caddyserver.com/docs/automatic-https#on-demand-tls"
  - "https://letsencrypt.org/docs/challenge-types/"
  - "dtwinuz/tunnel #9"
  - "dtwinuz/tunnel #10"
reproduce:
  note: "The client script is public: read how it pins the frp checksums, and time a TLS handshake against the service the same way we measured ours."
  commands:
    - "curl -fsSL https://tunnel.dtwin.uz/tunnel.sh | grep -in sha256"
    - "curl -s -o /dev/null -w 'tls=%{time_appconnect}s total=%{time_total}s\\n' https://tunnel.dtwin.uz"
---

Sharing something that runs on your own computer (a branch for review, a webhook receiver, a demo for someone in another city) usually means a hosted tunnel service. Those services work, but every request passes through someone else's infrastructure, free tiers come with request caps and interstitial pages, and the address belongs to them. We wanted the tunnel to be ours: our domain, our server and our rules about what gets logged.

Tunnel went live at tunnel.dtwin.uz on November 2, 2026. This post is about the engineering decisions behind it, most of which came from things that did not work on the first try.

```steps
Connect :: The client dials out to the server over an ordinary HTTPS WebSocket, so it passes strict office firewalls.
Authorise :: For every login and every new tunnel, frp asks our gateway whether the token is valid and the subdomain is the user's.
Certify :: The gateway triggers a certificate for the new subdomain at once and reports the link only when TLS is ready.
Route :: Visitors reach the gateway first, which applies passwords, IP rules and logging before passing traffic to frp.
Distribute :: Clients download frp from our own mirror with pinned SHA-256 checksums, and fall back to GitHub.
```

## frp, plus a gateway that owns the decisions

We did not write a tunnelling protocol. The core is frp, version 0.71.1 at launch, a mature open-source reverse proxy: a server process accepts connections from clients, and each client exposes a local port under a subdomain. What frp does not have is a notion of users. Out of the box, anyone holding the shared server token can claim any subdomain.

So in front of and beside frp sits a small gateway of our own, written in Node with no dependencies. It does two jobs.

**It answers frp's questions.** frp supports server plugins over HTTP: on selected operations it posts the request to a URL and waits for allow or deny. We register the gateway for `Login` and `NewProxy`. On every login it checks the user's personal token; on every new tunnel it checks that the subdomain is on that user's allow list and not owned by someone else. By default a user named `alice` may use `alice` and `alice-*`.

**It owns the visitor side.** Public traffic for every tunnel goes to the gateway before frp. That is where a tunnel can be paused, locked with a password or limited to a list of IP addresses, and where the request log is written.

Personal tokens look like `tn_<user>_<random>`, are shown once and are stored only as SHA-256 hashes. The shared frp token is never handed out by hand: `tunnel login` exchanges a personal token for it through the gateway's API. Revoking a personal token refuses new connections immediately, and tunnels that are already connected start getting 403 from the gateway.

The client connects out over a WebSocket on the ordinary HTTPS port. A corporate network that allows web browsing therefore allows the tunnel, with nothing to open on the user's side.

## Certificates without a wildcard

The obvious design is one wildcard certificate for `*.tunnel.dtwin.uz`. A wildcard needs a DNS-01 challenge, which means creating TXT records automatically, and our DNS provider has no API. We chose per-subdomain certificates through the edge server's on-demand TLS. Before issuing, the edge asks frp whether the name is actually registered, so nobody can make us request certificates for random names.

On-demand issuance has a cost: the first visitor waits for it. In our edge logs, Let's Encrypt took about 7.8 seconds from "obtaining" to "obtained" for a new name. Our first fix was a prewarm: 1.5 seconds after frp accepts a new tunnel, the gateway opens a TLS connection to the edge for that name, which starts issuance before anyone visits. That was not enough. The link was printed immediately, and a quick click still hit an unfinished certificate: the first visit spent 5.71 seconds in the TLS handshake.

The second fix moved the wait to where it belongs. The gateway gained a readiness endpoint that performs a TLS handshake for the name without sending any request to the user's application, and the client polls it before printing the link:

| Setup | First visit |
|---|---|
| Prewarm only | TLS handshake 5.71 s |
| Link printed after readiness (Windows client) | link shown at 9.9 s; TLS 0.06 s, total 0.13 s |
| Link printed after readiness (Linux client) | TLS 0.16 s |

The user waits a few seconds once, at the terminal, where waiting is expected. The visitor never waits. For a name that is not registered, the endpoint answers `ready: false` after six seconds, because the edge refuses to issue for it.

One side effect is worth knowing: every certificate lands in public Certificate Transparency logs, and scanners that watch those logs show up within moments, probing paths like `/wp-json` and `/xmlrpc.php`. A new tunnel is public the moment it has a certificate, whether or not you have shared the link.

## Logging less on purpose

The gateway keeps a request log, because "did the webhook even arrive?" is the most common question when developing against a tunnel. It records metadata only (time, method, a cleaned path, status, duration, byte counts, content type, client address and user agent) and keeps it for seven days. Request and response bodies, cookies and authorisation headers are not stored.

The same restraint shapes the other features:

- **Password lock.** `tunnel lock` puts HTTP basic auth in front of a tunnel. The password is stored as a scrypt hash, the `Authorization` header is stripped before the request reaches the application, and repeated failures are throttled.
- **IP allow list.** `tunnel allow` accepts up to 50 IPv4 or IPv6 ranges, and `me` adds the address of the machine running the command. WebSocket upgrades are checked too. The check reads the client address that our edge sets, never one supplied by the client.
- **Long requests.** A request may run for up to 600 seconds, which matters for slow builds and file uploads that hosted tunnels often cut off.

There is also a local request inspector, a small Go program that shows traffic passing through the tunnel and keeps it only in memory on the user's machine.

## Installing where GitHub stalls

The client is a PowerShell script for Windows and a shell script for Linux and macOS, each installed with one command. Both download the frp client binary. Downloading it from GitHub releases turned out to be unreliable from some networks in Uzbekistan: transfers would start and then stall.

We mirror the frp release files on our own server and have the clients try the mirror first and GitHub second. Because the mirror is ours, it must not become a trust shortcut. The SHA-256 of each binary is pinned in the client scripts, and a download that does not match is rejected wherever it came from.

One small portability bug is worth recording for anyone writing PowerShell installers. When Windows PowerShell 5 is started from inside PowerShell 7, the module that provides `Get-FileHash` may not load. The client now computes SHA-256 with its own function instead of relying on the cmdlet.

## Two days later

The first release covered HTTP tunnels. On November 4 the gateway gained TCP tunnels (enabled per user; each user reserves a port, and the frp plugin accepts a TCP proxy only on the port reserved for it), per-tunnel rate limits, webhook signature checks for GitHub, Telegram and generic HMAC senders, request and response header rules, and load balancing across several clients under one name. Google sign-in and Telegram alerts exist in code but stay off until they are configured.

## Limitations

- **Per-subdomain certificates.** Every new name costs one issuance of about eight seconds and appears in public logs. A wildcard is planned, through delegating the subdomain's DNS to a server we control with an ACME-DNS setup.
- **Custom domains** with ownership verification are planned, not built.
- **It is a small service.** It runs on infrastructure we already operate, not on a global edge network, and it comes with no uptime guarantee.
