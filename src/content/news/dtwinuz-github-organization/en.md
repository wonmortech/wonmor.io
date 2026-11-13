---
title: dtwin becomes a GitHub organization
description: All dtwin repositories now live under one GitHub organization, dtwinuz, with a verified domain, shared teams and the same rules for every repository.
date: 2026-10-30
category: company
links:
  - { label: GitHub, text: github.com/dtwinuz, href: "https://github.com/dtwinuz", kind: external }
  - { label: Open source, text: dtwinuz/bitg, href: "https://github.com/dtwinuz/bitg", kind: external }
source:
  - "https://github.com/dtwinuz"
  - "dtwinuz/dtwin #184"
  - "dtwinuz/dtwin #191"
---

Until October 30, 2026, the dtwin projects lived in a personal GitHub account. That works for one person and one repository. It does not work for a family of products that share infrastructure, release processes and, increasingly, contributors. So we created the `dtwinuz` organization and moved everything into it in a single day.

## A careful move

Before and after each transfer we counted commits, issues, pull requests, releases and tags; the numbers matched for every repository. Secrets came along with the repositories. Our project boards were copied with their views and the values of every field, and container images were copied to `ghcr.io/dtwinuz` so that running services did not change. The domain dtwin.uz is verified for the organization.

## The same rules everywhere

The point of an organization is that the rules stop depending on who created a repository. Every repository now has:

- three teams — `core`, `maintainers` and `contributors` — with admin, maintain and write access;
- squash merges only, so `main` reads as one commit per change;
- a `CODEOWNERS` file and grouped Dependabot updates, which wait seven days after a release before proposing it;
- GitHub Actions pinned to full commit SHAs, which the organization now requires;
- release workflows that publish an SBOM and build provenance, and run a Trivy scan.

Two-factor authentication is enabled for every member. A template repository — a .NET 10 API, a React and Vite front end, Caddy, Docker Compose and CI — means a new product starts with all of this already in place.

Some protections, such as required reviews on private repositories, are not available on GitHub's free plan. We have noted where that applies rather than pretending otherwise.
