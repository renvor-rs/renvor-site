# Product

## Register

brand

## Users

Rust developers, full-stack teams, framework migrants, and backend organizations evaluating a complete application platform with explicit boundaries.

## Purpose

Present Renvor's **design** for connected application infrastructure, and its **actual state**, in the same view. The page exposes the interactive generator, stable core, transports, persistence, authentication, frontend and desktop delivery, package ecosystem, lifecycle, operations, security, and documentation through progressively richer product surfaces — each labelled with the release that owns it.

Every one of those surfaces is unbuilt. The page must not read as a product tour of working software.

## Personality

Expansive, exact, optimistic, and technically substantial.

## Design principles

1. Use product surfaces as the primary imagery.
2. Connect every capability to the shared application core.
3. Let motion carry the visitor through one continuous system.
4. Provide enough technical depth for a serious framework evaluation.

## Launch-state warning

This is a future production-launch concept. Production-readiness language can be published only after the matching release gates in `PLAN.md` are complete.

**Applied 2026-08-12.** The page previously announced a "Renvor 4.0 production release" and a "Renvor 4.0 stable" documentation section, and linked to `docs.renvor.dev` and `crates.io/crates/renvor` — none of which exist. Those claims are corrected, and the constraint is now enforced by three rules:

1. **A prominent development-status notice renders above the hero**, outside every GSAP timeline, so it survives reduced motion and a scripting failure.
2. **Every capability carries a release label** — `Planned for Renvor 1.0` through `4.0` — sourced from the framework's `PLAN.md`, not chosen here.
3. **No CTA points at an unresolvable destination.** Only `github.com/renvor-rs/renvor` and its in-repository documents are linked.

### When production-readiness language may return

**Production-readiness language may return only when the facts it asserts are true, and the corresponding `PLAN.md` release gates are complete.** The condition is the state of the world, not the state of a task list — closing a task does not make a crate installable.

Concretely, before this page may describe Renvor as released, available, or production-ready:

- the **artifacts are actually published** — the named crates resolve on crates.io and can be installed;
- the **installation commands actually work** — `renover` exists, is obtainable, and does what the page shows;
- the **documentation actually resolves** — `docs.renvor.dev` serves the referenced pages rather than failing to answer;
- **a real, supported release exists**, with its version, its support commitment, and its `PLAN.md` release gates complete.

Each claim is licensed by its own fact. A page may truthfully describe whatever subset is genuinely true — a published 1.0 does not license 3.0 language — and every remaining capability keeps its planned-version label until its own release ships.

**Editing this file does not lift the constraint**, and neither does closing a content task. T095 through T098 are complete and are not reopened by this section; they governed whether the page told the truth about the current state, which is a different question from whether there is a release to describe.
