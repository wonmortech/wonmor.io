---
title: Introducing Tunnel
description: Tunnel puts a service running on your own machine on a public HTTPS address under tunnel.dtwin.uz, on infrastructure we run ourselves.
date: 2026-11-02
category: product
product: tunnel
links:
  - { label: Product, text: tunnel.dtwin.uz, href: "https://tunnel.dtwin.uz", kind: external }
  - { label: Overview, text: Tunnel, href: "/products/tunnel/", kind: internal }
source:
  - "https://tunnel.dtwin.uz"
  - "dtwinuz/tunnel #10"
  - "dtwinuz/dtwin #303"
---

Sharing something that runs on your own computer — a branch for review, a webhook receiver, a demo — usually means a third-party tunnel service that sees all of your traffic. We wanted our own. Tunnel went live at tunnel.dtwin.uz on November 2, 2026.

## Two ways to use it

- **Persistent tunnels.** `tunnel add` and `tunnel up` register a named subdomain and keep it connected in the background.
- **One-off tunnels.** `tunnel http <port>` opens a temporary address until you press Ctrl+C, and `tunnel serve` publishes a folder.

Each person signs in with a personal access key, and the server refuses any client that connects without one. A tunnel can be limited to a list of IP addresses, can rewrite the Host header for apps that expect a particular name, and can be locked or paused. `tunnel doctor` checks the setup and `tunnel myip` shows the address the server sees. A small local inspector, written in Go, shows requests as they pass through and keeps them only in memory.

## How it is built

Tunnel is built on frp, with a gateway of our own in front of it that handles sign-in, ownership of subdomains, pauses and logs. Clients are a PowerShell script for Windows and a shell script for Linux and macOS.

Two details make it pleasant in practice. First, a new link is shown only once its TLS certificate is ready; the first certificate takes around eight seconds, so the server requests it before handing you the address instead of letting your first visitor wait. Second, the frp binaries are mirrored on our own server with pinned SHA-256 checksums, because downloads from GitHub can stall on some networks in Uzbekistan.

Certificates are issued per subdomain rather than as a wildcard, because our DNS provider does not offer an API.
