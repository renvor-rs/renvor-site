<p align="center">
  <img src="static/img/renvor-mark-v7.svg" alt="Renvor" width="120">
</p>

<h1 align="center">Renvor — site</h1>

<p align="center">
  The V7 landing page for <a href="https://renvor.dev">renvor.dev</a>.
</p>

---

> ## Not deployed, and not ready to be
>
> **Renvor is in development. No crate is published, no release exists, and this site has
> never been deployed.** `renvor` and `renvor-cli` both return HTTP 404 from the crates.io
> registry index, verified 2026-08-12.

## Status

The four content and licensing gates on this repository are **complete**. The site is still
**not deployed**, and deployment is blocked by other gates listed below.

| Gate | State | Covered |
|---|---|---|
| **T095** | **Complete 2026-08-12** | A prominent development-status notice, and every present-tense capability claim reworded to state its actual status |
| **T096** | **Complete 2026-08-12** | The `renover new` / `renover add` installation commands, which reference crates nobody can install |
| **T097** | **Complete 2026-08-12** | CTA destinations that do not resolve |
| **T098** | **Complete 2026-08-12** | The **website-code licence** and the **brand-asset usage terms** — see [Licence](#licence) |

**T095, T096, and T097 closed on maintainer review of the rendered page.** Ahmed Anbar
reviewed the production build on desktop and mobile, in both light and dark themes, on
**2026-08-12**, and approved the presentation, the development-status disclosure, the
planned-version labels, the non-installable CLI demonstrations, the GitHub-only links, the
responsive layout, the accessibility behaviour, the reduced-motion behaviour, and the
animations. **The review is recorded in the framework evidence ledger at
`governance/phase-001-evidence.md` §3aq**, which holds the reviewed source-set and
build-output hashes; they are deliberately not duplicated here, so there is one place to keep
correct.

> **That approval covers the truthful presentation of the current development state, and
> nothing more.** It is **not** a release, publication, or deployment authorisation. Renvor is
> still in development: **no crate is published**, **no release exists**, the documentation
> site is **not deployed**, and this site has **never been deployed**.

**T098 is complete.** The website code is `MIT OR Apache-2.0`; the Renvor names, marks, and
brand assets are all rights reserved under [BRAND-POLICY.md](BRAND-POLICY.md). The code
licences grant no trademark or brand-identity rights.

**Deployment remains blocked** by gates outside this repository — CSP compatibility (T101),
server re-verification (T102), the backup ruling (T106), the unresolved `image-size`
advisories (T108), and the absent `CAA` record (T111). ADR-0006 remains `proposed`.

## What the page now claims

Every capability on the landing page carries the release that owns it, taken from the
framework's `PLAN.md` rather than invented here:

| Release | Scope |
|---|---|
| **1.0** | REST + OpenAPI, persistence (SQLx/SeaORM, PostgreSQL/MySQL), backend authentication, lifecycle and diagnostics |
| **2.0** | GraphQL |
| **3.0** | Frontend matrix (Next.js, Yew, Dioxus, Leptos), Tauri desktop, frontend authentication screens |
| **4.0** | Package ecosystem, including RBAC |

A claim rendered without a release label is a release-honesty defect.

## Stack

| | |
|---|---|
| Framework | Docusaurus 3.10.2 |
| Runtime | **Node ≥ 24** (`engines.node`) |
| Package manager | **pnpm 11.21.0** — never npm |
| Animation | GSAP 3.15.0 with `@gsap/react`, gated on `prefers-reduced-motion` |
| Language | TypeScript 5.9.3, strict |

The framework repository pins **Node 22** for its own documentation site. These are
different toolchains in one workspace, and running one under the other's version fails in
ways that look like unrelated bugs.

## Working locally

```sh
nvm use 24
pnpm install --frozen-lockfile
pnpm run typecheck      # tsc --noEmit
pnpm run build          # production build into build/
pnpm run serve          # preview the built site
```

`pnpm-lock.yaml` is **committed on purpose**. This is a deployable application rather than a
reusable library, so the exact resolved dependency tree is part of what gets reviewed and
shipped.

## Verified behaviour

Measured on 2026-08-12 against a production build, not asserted:

| Check | Result |
|---|---|
| Desktop 1440×900 horizontal overflow | 0 px |
| Mobile 390×844 horizontal overflow | 0 px |
| Light / dark themes | both honoured |
| Images with `alt` | 3 of 3 |
| Buttons without an accessible name | 0 |

**Reduced motion is enforced, not merely styled.** With
`prefers-reduced-motion: reduce`, GSAP's `matchMedia` gate creates **zero** ScrollTriggers
and applies **zero** inline animation styles, versus one pin-spacer and 43 animated elements
without the preference.

## Licence

**Decided 2026-08-12 (T098).** The two questions are answered separately, because they are
separate questions.

**Website source code** — licensed under either of:

- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE))
- MIT license ([LICENSE-MIT](LICENSE-MIT))

at your option. The same terms as the framework.

**Renvor names, logos, marks, and illustrations** — **all rights reserved**, governed by
[BRAND-POLICY.md](BRAND-POLICY.md).

**The code licences grant no trademark or brand-identity rights.** Apache-2.0 says so
explicitly in its section 6, and MIT is silent on trademarks rather than granting them. That
separation is deliberate and conventional: the code is free so anyone can build on it, and the
name is controlled so users can tell what is genuinely Renvor.

The brand policy permits, without asking: truthful nominative references, links to the
official project, screenshots, and community discussion — including criticism. It requires
permission first for: confusingly similar branding, endorsement or official-status claims,
merchandise, and branding a fork as official Renvor.

**The archived historical branding directories are outside every repository, unpublished, and
not covered by any licence or by the brand policy.**
