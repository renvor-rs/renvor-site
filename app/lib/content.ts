/**
 * Content for the application-surface tabs and the evaluation-lens carousel.
 *
 * Every claim here is release-labelled. `PLAN.md` in the framework repository owns the
 * roadmap; nothing on this page may promise a capability that PLAN.md does not schedule, and
 * nothing may describe a planned capability in the present tense (PLAN.md §26.6, and
 * constitution principle X — no claim exceeding measurement).
 *
 * The prototype carried each tab icon as a raw SVG string rendered through
 * `dangerouslySetInnerHTML`. That is replaced by `lucide-react` components: the icons come
 * from a maintained set instead of hand-copied markup, they inherit `currentColor` and stroke
 * width from CSS, and — the reason it matters for this site specifically — the page then
 * contains no `dangerouslySetInnerHTML` at all, so there is no HTML-injection sink to reason
 * about when reviewing the strict CSP.
 */

import { Database, Fingerprint, GalleryHorizontalEnd, Workflow } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type SolutionId = 'backend' | 'data' | 'identity' | 'delivery';

export interface Solution {
  roadmap: string;
  title: string;
  copy: string;
  list: string[];
}

export const SOLUTION_ICONS: Record<SolutionId, LucideIcon> = {
  backend: Workflow,
  data: Database,
  identity: Fingerprint,
  delivery: GalleryHorizontalEnd,
};

export const SOLUTIONS: Record<SolutionId, Solution> = {
  backend: {
    roadmap: 'Planned for Renvor 1.0',
    title: 'Typed services with visible work.',
    copy: 'The design: REST — and opt-in GraphQL in 2.0 — will enter through transport adapters, then reuse the same application services, policies, transactions, and error vocabulary. No transport adapter exists. The kernel those adapters are meant to call does.',
    list: ['OpenAPI 3.2 contract', 'Shared service layer', 'Explicit async and transactions'],
  },
  data: {
    roadmap: 'Planned for Renvor 1.0',
    title: 'Persistence chosen at the boundary.',
    copy: 'The design: SQLx or SeaORM with PostgreSQL or MySQL, where generated adapters carry migrations, fixtures, health checks, and transaction ownership. No database adapter, migration, or generator exists yet.',
    list: ['SQLx or SeaORM', 'PostgreSQL or MySQL', 'Repository capability ports'],
  },
  identity: {
    roadmap: 'Backend planned for 1.0 · screens for 3.0',
    title: 'Authentication that reaches the screen.',
    copy: 'The design: backend auth flows in 1.0, with matching frontend routes, forms, state, recovery, and verification arriving in 3.0. RBAC is a 4.0 package. Nothing generates authentication today.',
    list: ['Session or token flows', 'Argon2 credentials', 'RBAC package planned for 4.0'],
  },
  delivery: {
    roadmap: 'Planned for Renvor 3.0',
    title: 'Web, Rust UI, and desktop targets.',
    copy: 'The design: Next.js, Yew, Dioxus, or Leptos clients with CSS, SCSS, or optional Tailwind CSS, and Tauri packaging for supported static clients. No client generator exists yet.',
    list: ['Four frontend frameworks', 'Three styling systems', 'Tauri desktop target'],
  },
};

export const LENSES = [
  {
    title: 'Strong types stay visible',
    copy: 'Handlers, services, policies, ports, configuration, and errors are meant to stay ordinary Rust types with searchable ownership. The Phase 002 kernel already works this way. The generators that would produce the rest of an application do not exist.',
  },
  {
    title: 'Packages remain replaceable',
    copy: 'Mature ecosystem crates sit behind narrow framework boundaries, so an application keeps a stable contract without freezing an implementation choice. The project applies that rule to itself and departs from it only through a recorded, reviewed decision.',
  },
  {
    title: 'Operations are designed in',
    copy: 'Diagnostics, health, readiness, draining, and rollback belong to the shape of an application rather than arriving later. Liveness and readiness answer independently in the kernel today; telemetry, deployment, and recovery tooling are planned for 1.0.',
  },
];
