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
> never been deployed.** Four gates are open, and every one of them blocks the first commit
> to this repository — not merely the deployment.

## Status

| Gate | Blocks |
|---|---|
| **T095** | A prominent development-status notice, and every present-tense capability claim reworded to state its actual status |
| **T096** | The `renover new` / `renover add` installation commands, which reference crates nobody can install |
| **T097** | Three CTA destinations that do not resolve |
| **T098** | The **website-code licence** and the **brand-asset usage terms** |

**T098 is the one that binds this README.** Brand assets are **not** covered by the
framework's `MIT OR Apache-2.0` grant, and the terms that do cover them have not been
decided. Until they are, the mark above is used only inside this private repository.

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

**Undecided — see T098.** Neither the website code nor the brand assets in this repository
carry a licence yet. The framework's `MIT OR Apache-2.0` grant covers
[`renvor-rs/renvor`](https://github.com/renvor-rs/renvor) and does **not** extend here.
