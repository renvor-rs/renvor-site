<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/renvor-site-readme-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset=".github/assets/renvor-site-readme-light.svg">
  <img alt="Renvor Site" src=".github/assets/renvor-site-readme-light.svg" width="100%">
</picture>

<h1 align="center">Renvor — site</h1>

<p align="center">
  The landing page for <a href="https://renvor.dev">renvor.dev</a>.
</p>

<p align="center">
  <a href="https://github.com/renvor-rs/renvor-site/actions/workflows/landing-ci.yml"><img alt="Landing CI" src="https://github.com/renvor-rs/renvor-site/actions/workflows/landing-ci.yml/badge.svg?branch=main"></a>
  <a href="https://github.com/renvor-rs/renvor-site/actions/workflows/publish-image.yml"><img alt="Publish image" src="https://github.com/renvor-rs/renvor-site/actions/workflows/publish-image.yml/badge.svg?branch=main"></a>
  <a href="package.json"><img alt="Node 24 or newer" src="https://img.shields.io/badge/Node-%E2%89%A524-339933.svg?logo=nodedotjs&amp;logoColor=white"></a>
  <a href="#licence"><img alt="License: MIT OR Apache-2.0" src="https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-blue.svg"></a>
</p>

---

> ## Deployed preview; the framework has no supported installation path
>
> **Renvor is in active development. Nothing is published, no supported installation path
> exists, and there is no release.** Neither `renvor` nor `renvor-cli` exists on crates.io.
>
> **Phases 002 through 009 are implemented and tested locally.** Phase 002 delivered the
> transport-independent kernel. Phase 003 added the `renvor` CLI and its transactional project
> generator. Phase 004 added an opt-in REST and HTTP delivery adapter. Phase 005 added the
> validation boundary, RFC 9457 problem responses, and OpenAPI 3.2 generation. Phases 006–008
> added driver-neutral persistence ports and SQLx and SeaORM adapters tested on PostgreSQL and
> MySQL. Phase 009 added authentication, sessions, authorization policies, and optional tokens.
>
> **The limits remain important.** Because nothing is published, generated projects cannot yet
> depend on the framework. Persistence and authentication are not exposed through the facade,
> and every API is explicitly unstable. Do not treat the local implementation as a usable release.

## What this repository is

A **statically exported Next.js application**, built to `out/` and served from a `scratch`
container by a single static binary. There is no server at request time: no Server Actions, no
route handlers, no middleware, no SSR, no runtime environment variables, no cookies, no
storage, and no telemetry. A page that needs any of those fails the build rather than quietly
requiring a Node process in production.

The visual system is **v40 "Rail Knot / Parallel Passage"**. The approved R and V master keeps
its exact four-layer weave, while the supporting system uses sparse parallel 30-degree routes
that never intersect. The hero extrudes the canonical logo paths in Three.js without redrawing
or morphing them. The seven lifecycle phases remain readable as text and motion:
`Load → Validate → Register → Boot → Ready → Drain → Stop`.

## Stack

| | |
|---|---|
| Framework | **Next.js 16.3.1**, App Router, `output: 'export'` |
| UI | React 19.2.8 |
| 3D | Three.js 0.185.1 — **dynamically imported**, not in the initial bundle |
| Animation | GSAP 3.15.0, gated on `prefers-reduced-motion` |
| Icons | `lucide-react` 1.31.0 — an icon package, never emoji or hand-copied SVG strings |
| Fonts | **System fonts only.** No webfont, no `@font-face`, no font CDN |
| Language | TypeScript 5.9.3, strict, with `noUncheckedIndexedAccess` |
| Runtime | **Node ≥ 24** (`engines.node`) |
| Package manager | **pnpm 11.21.0** — never npm |
| Server | static-web-server 2.44.0, in a `scratch` image |

`pnpm-lock.yaml` is **committed on purpose**. This is a deployable application rather than a
reusable library, so the exact resolved tree is part of what gets reviewed and shipped.

**The dependency tree is 114 packages.** The Docusaurus implementation it replaced resolved
roughly 1,180, and carried two unfixable HIGH advisories against `image-size` that were tracked
as Phase 001 gate **T108**. Both are gone — not re-judged, removed with the dependency.
`pnpm audit` reports no known vulnerabilities.

## Working locally

```sh
nvm use 24
pnpm install --frozen-lockfile
pnpm run typecheck      # tsc --noEmit
pnpm run build          # static export into out/
pnpm run csp            # derive the CSP from the built HTML
pnpm run serve          # serve out/ with the production headers applied
pnpm run test:a11y      # accessibility, motion, and CSP suites
```

## The Content-Security-Policy is generated, not written

```text
default-src 'none'; script-src 'self' 'sha256-…' …; style-src 'self'; img-src 'self';
font-src 'none'; connect-src 'none'; object-src 'none'; frame-src 'none'; media-src 'none';
worker-src 'none'; manifest-src 'none'; frame-ancestors 'none'; form-action 'none';
base-uri 'none'
```

No `unsafe-inline`. No `unsafe-eval`. No `unsafe-hashes`. No remote host anywhere in the
policy.

**A static export cannot use a nonce** — a nonce must be unique per response, and these
responses are files on disk. So `scripts/generate-csp.mjs` hashes every inline script in the
built HTML and emits the policy plus a `static-web-server` configuration carrying it. The image
build runs this, so **the policy and the bytes it protects come from the same `out/`** and
cannot disagree.

**It is not committed, deliberately.** One of the inline scripts is the RSC flight payload,
whose hash changes whenever any component changes; a checked-in policy would be stale after the
next copy edit, and the usual response to a stale strict policy is to weaken it. The image
carries its own, and serves it at `/_csp/policy.txt` so a running container can state the policy
it is enforcing.

The Traefik middleware in `renvor-infra` therefore does **not** set CSP. One canonical policy,
generated per build, served by the origin.

### Verified, on three engines

CI runs the negative control **first**: an inline script whose hash is absent from the policy is
injected, and the browser must both report a violation **and** refuse to execute it. Without it,
"zero violations" is indistinguishable from "no policy applied". Then Chromium, Firefox, and
WebKit each run the full suite under **Enforcement** and again under **Report-Only**.

That validation earned its place. It caught a policy that emitted **unquoted hashes** — parsed
by every browser as host sources, silently discarded, blocking every inline script on the page
while the policy string still read as strict. Static inspection could not see it; a real browser
could.

## Accessibility

Automated axe-core scans report zero WCAG 2.1 A/AA violations across the landing route before
and after scroll, all four solution tab panels, every evaluation-lens state, both themes, and
the 404 document. Separate browser tests cover keyboard operation of the tablist, carousel,
and theme toggle; a working skip link; no horizontal overflow at 320, 375, 768, 1024, or
1440 px; and usability at 200 % zoom.

**Reduced motion is enforced, not merely styled.** Under `prefers-reduced-motion: reduce` the
page creates zero ScrollTriggers and writes zero inline animation styles, and every element
rests at its authored colour. A companion test asserts that motion *does* engage when it is
allowed, so the accessibility sweep cannot go green by the animation quietly breaking.

**WebGL is optional.** If a context cannot be created — or is lost later, or the Three.js chunk
fails to load — the hero renders the exact flat V40 Rail Knot mark. The seven lifecycle stages
are present as text regardless, so nothing informational depends on the canvas.

## Container

A two-stage build with a hard boundary. The runtime is `scratch` and contains exactly three
things: `/public` (the static export), `/static-web-server` (one statically linked binary), and
`/config.toml` (generated during the build). No shell, no package manager, no interpreter, no
`node_modules`, no source. CI asserts that allow-list rather than printing it.

It runs as UID/GID 65532, non-root, read-only root filesystem, all capabilities dropped, no
tmpfs — verified by actually running it that way, not asserted.

Images are published to `ghcr.io/renvor-rs/renvor-site` by `publish-image.yml`, on trusted
pushes to `main` only, authenticated with the run's own short-lived `GITHUB_TOKEN`. **No PAT,
deploy key, or repository secret exists.** Every image is scanned before promotion, tagged by
commit SHA, signed keylessly, and carries build-provenance and SBOM attestations. A `latest`
tag is published for humans; **production references the immutable digest, never a tag.**

## Licence

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

The brand policy permits, without asking: truthful nominative references, links to the official
project, screenshots, and community discussion — including criticism. It requires permission
first for: confusingly similar branding, endorsement or official-status claims, merchandise, and
branding a fork as official Renvor.

**The archived historical branding directories are outside every repository, unpublished, and
not covered by any licence or by the brand policy.**
